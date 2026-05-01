// Groq AI Integration for QuickBite
// Fast LLM inference for food recommendations and smart search

import { restaurants, menu, MenuItem, Restaurant } from "@/data/mock";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile"; // Updated from llama-3.1 (decommissioned)

// System prompt for AI food recommendations
const SYSTEM_PROMPT = `You are QuickBite's AI Food Concierge - a friendly, helpful assistant for college students ordering food.

Your role:
1. Recommend restaurants and dishes based on user preferences
2. Consider budget, cravings, dietary restrictions (veg/non-veg), and time of day
3. Be conversational, fun, and use emojis sparingly
4. Keep responses concise (2-3 sentences max)
5. Always mention specific dish names and prices from the menu
6. If user mentions location, factor in delivery time

Available restaurants in Vizag/Andhra area:
- Budget options under ₹150: Mama's Corner, Dosa Plaza, Chaat Corner
- Biryani: Biryani Blues, Vizag Beach Biryani
- Andhra Specials: Rayalaseema Ruchulu, Bamboo Chicken Hub, Gongura Point
- Healthy: Green Leaf Deli, Protein Pantry
- Late night: Most places deliver till 11pm

Always ground your recommendations in the actual menu data provided.`;

export interface AIRecommendation {
  restaurantId?: string;
  dishId?: string;
  message: string;
  confidence: number;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

// Build context from menu data
function buildMenuContext(): string {
  const context = restaurants.map(r =>
    `${r.name} (${r.cuisine}): ₹${r.priceFor2}/2 person, ${r.rating}⭐, ${r.eta} - ${r.tags.join(", ")}`
  ).join("\n");

  const menuContext = menu.slice(0, 30).map(m =>
    `${m.name} - ₹${m.price} (${m.veg ? "Veg" : "Non-veg"})${m.bestseller ? " ⭐ Bestseller" : ""}`
  ).join("\n");

  return `RESTAURANTS:\n${context}\n\nPOPULAR DISHES:\n${menuContext}`;
}

export async function getAIRecommendation(
  userQuery: string,
  userPrefs?: {
    budget?: number;
    vegOnly?: boolean;
    location?: string;
  }
): Promise<AIRecommendation> {
  const context = buildMenuContext();

  const prompt = `${context}\n\nUser query: "${userQuery}"\n${userPrefs?.budget ? `Budget: Under ₹${userPrefs.budget}` : ""}\n${userPrefs?.vegOnly ? "Preference: Vegetarian only" : ""}\n\nProvide a specific restaurant and dish recommendation.`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Groq API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "Hmm, try something like 'spicy biryani under 200'!";

    // Extract restaurant/dish from response (simple keyword matching)
    const lowerResponse = aiResponse.toLowerCase();
    const matchedRestaurant = restaurants.find(r =>
      lowerResponse.includes(r.name.toLowerCase())
    );
    const matchedDish = menu.find(m =>
      lowerResponse.includes(m.name.toLowerCase())
    );

    return {
      restaurantId: matchedRestaurant?.id,
      dishId: matchedDish?.id,
      message: aiResponse,
      confidence: matchedRestaurant || matchedDish ? 0.9 : 0.6,
    };
  } catch (err) {
    console.error("[Groq AI] Error:", err);
    return {
      message: "Having trouble connecting right now. Try 'biryani under 200' or 'veg thali near me'!",
      confidence: 0,
    };
  }
}

// Smart search with AI - interprets natural language queries
export async function smartSearch(query: string): Promise<{
  restaurants: Restaurant[];
  dishes: MenuItem[];
}> {
  const prompt = `Analyze this food search query and return ONLY JSON:

Query: "${query}"

Return format:
{
  "cuisine": "", // extracted cuisine type
  "maxPrice": 0, // extracted budget or 0
  "veg": false, // if veg mentioned
  "nonVeg": false, // if non-veg mentioned
  "dishType": "", // specific dish like "biryani", "pizza"
  "keywords": [] // other relevant keywords
}`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: "You are a search query parser. Return ONLY valid JSON, no explanations." },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 150,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Smart Search] Groq error:", errorData);
      throw new Error("AI search failed");
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0]?.message?.content || "{}");

    // Filter based on AI-extracted intent
    let filteredRestaurants = [...restaurants];
    let filteredDishes = [...menu];

    if (parsed.cuisine) {
      filteredRestaurants = filteredRestaurants.filter(r =>
        r.cuisine.toLowerCase().includes(parsed.cuisine.toLowerCase())
      );
    }

    if (parsed.maxPrice > 0) {
      filteredRestaurants = filteredRestaurants.filter(r => r.priceFor2 <= parsed.maxPrice);
      filteredDishes = filteredDishes.filter(d => d.price <= parsed.maxPrice);
    }

    if (parsed.veg) {
      filteredRestaurants = filteredRestaurants.filter(r => r.tags.includes("Veg"));
      filteredDishes = filteredDishes.filter(d => d.veg);
    }

    if (parsed.dishType) {
      const keyword = parsed.dishType.toLowerCase();
      filteredDishes = filteredDishes.filter(d =>
        d.name.toLowerCase().includes(keyword) ||
        d.category.toLowerCase().includes(keyword)
      );
    }

    return {
      restaurants: filteredRestaurants.slice(0, 10),
      dishes: filteredDishes.slice(0, 10),
    };
  } catch (err) {
    console.error("[Smart Search] Error:", err);
    // Fallback to basic text search
    const q = query.toLowerCase();
    return {
      restaurants: restaurants.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q)
      ).slice(0, 10),
      dishes: menu.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.desc.toLowerCase().includes(q)
      ).slice(0, 10),
    };
  }
}

// Chat conversation with memory
export async function chatWithAI(
  messages: ChatMessage[]
): Promise<string> {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-10)
        ],
        temperature: 0.7,
        max_tokens: 300,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[AI Chat] Groq error:", errorData);
      throw new Error("Chat failed");
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "I'm here to help! What are you craving?";
  } catch (err) {
    console.error("[AI Chat] Error:", err);
    return "I'm having trouble responding right now. Try asking about food recommendations!";
  }
}

// Generate restaurant description
export async function generateRestaurantDescription(
  name: string,
  cuisine: string,
  tags: string[]
): Promise<string> {
  const prompt = `Write a catchy 2-sentence description for a restaurant:
Name: ${name}
Cuisine: ${cuisine}
Tags: ${tags.join(", ")}

Make it appealing to college students, mention taste and value.`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 100,
        stream: false,
      }),
    });

    if (!response.ok) throw new Error("Generation failed");

    const data = await response.json();
    return data.choices[0]?.message?.content || `${name} serves delicious ${cuisine} perfect for every craving.`;
  } catch (err) {
    console.error("[AI Generate] Error:", err);
    return `${name} - Authentic ${cuisine} loved by students.`;
  }
}
