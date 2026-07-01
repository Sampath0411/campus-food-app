// Groq AI Integration for QuickBite
// Fast LLM inference for food recommendations and smart search

import { restaurants, menu, MenuItem, Restaurant } from "@/data/mock";

// Frontend must not expose private AI API keys. These helpers now provide
// instant mock AI responses in-browser; move real LLM calls to an Edge Function.

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
    const q = userQuery.toLowerCase();
    const max = userPrefs?.budget ?? (q.match(/(?:under|below|₹)\s*(\d+)/)?.[1] ? Number(q.match(/(?:under|below|₹)\s*(\d+)/)?.[1]) : 220);
    const dishes = menu.filter((m) => m.price <= max && (!userPrefs?.vegOnly || m.veg));
    const picked = dishes.find((m) => q.includes(m.category.toLowerCase()) || q.includes(m.name.toLowerCase().split(" ")[0])) || dishes[0] || menu[0];
    const matchedRestaurant = restaurants.find((r) => r.id === picked.restaurantId) || restaurants[0];
    const aiResponse = `${matchedRestaurant.name} is a smart pick: try ${picked.name} for ₹${picked.price}. It fits your budget and should reach in about ${matchedRestaurant.eta}.`;

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
  try {
    const q = query.toLowerCase();
    const parsed = {
      cuisine: ["andhra", "pizza", "biryani", "healthy", "dosa"].find((x) => q.includes(x)) || "",
      maxPrice: Number(q.match(/(?:under|below|₹)\s*(\d+)/)?.[1] || 0),
      veg: /\bveg\b|vegetarian|paneer|dosa|idli/.test(q),
      dishType: ["biryani", "pizza", "dosa", "thali", "wrap", "maggi"].find((x) => q.includes(x)) || "",
    };

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
  const last = messages[messages.length - 1]?.content || "";
  const rec = await getAIRecommendation(last);
  return rec.message;
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

  return `${name} serves flavorful ${cuisine} with student-friendly prices, quick delivery, and reliable favorites like ${tags.slice(0, 2).join(" and ")}.`;
}
