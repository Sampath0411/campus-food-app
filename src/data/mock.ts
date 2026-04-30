import foodMac from "@/assets/food-mac.jpg";
import foodBowl from "@/assets/food-bowl.jpg";
import foodBrisket from "@/assets/food-brisket.jpg";
import foodRamen from "@/assets/food-ramen.jpg";

export const FOOD_IMG = { mac: foodMac, bowl: foodBowl, brisket: foodBrisket, ramen: foodRamen };

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  eta: string;
  priceFor2: number;
  img: string;
  tags: string[];
  offer?: string;
};

export const restaurants: Restaurant[] = [
  { id: "mamas", name: "Mama's Corner", cuisine: "Homestyle • Comfort", rating: 4.6, eta: "18 min", priceFor2: 180, img: foodMac, tags: ["Budget", "Mess-style"], offer: "50% OFF up to ₹100" },
  { id: "green", name: "Green Leaf Deli", cuisine: "Healthy • Salads • Bowls", rating: 4.4, eta: "22 min", priceFor2: 220, img: foodBowl, tags: ["Healthy", "Veg"], offer: "Free delivery" },
  { id: "ramen", name: "Sektor Ramen House", cuisine: "Asian • Noodles", rating: 4.7, eta: "28 min", priceFor2: 260, img: foodRamen, tags: ["Trending"], offer: "₹75 OFF above ₹199" },
  { id: "smoke", name: "Smokehouse 21", cuisine: "BBQ • Grills", rating: 4.5, eta: "32 min", priceFor2: 320, img: foodBrisket, tags: ["Non-veg"] },
  { id: "mamas2", name: "Hostel Hub Tiffins", cuisine: "Thali • North Indian", rating: 4.3, eta: "15 min", priceFor2: 120, img: foodMac, tags: ["Budget", "Veg"], offer: "Flat ₹40 OFF" },
  { id: "green2", name: "Protein Pantry", cuisine: "Healthy • High-protein", rating: 4.6, eta: "24 min", priceFor2: 280, img: foodBowl, tags: ["Healthy"] },
  { id: "biryani", name: "Biryani Blues", cuisine: "Hyderabadi • Dum", rating: 4.5, eta: "25 min", priceFor2: 240, img: foodMac, tags: ["Non-veg", "Spicy"], offer: "20% OFF" },
  { id: "pizza", name: "Campus Pizza", cuisine: "Italian • Fast Food", rating: 4.2, eta: "20 min", priceFor2: 200, img: foodMac, tags: ["Veg", "Non-veg"], offer: "Buy 1 Get 1" },
  { id: "dosa", name: "Dosa Plaza", cuisine: "South Indian", rating: 4.4, eta: "12 min", priceFor2: 100, img: foodBowl, tags: ["Veg", "Breakfast"], offer: "Free drink" },
  { id: "chicken", name: "Chicken Republic", cuisine: "Fried Chicken", rating: 4.3, eta: "30 min", priceFor2: 280, img: foodBrisket, tags: ["Non-veg"], offer: null },
  { id: "chaat", name: "Chaat Corner", cuisine: "Street Food", rating: 4.1, eta: "10 min", priceFor2: 80, img: foodBowl, tags: ["Veg", "Snacks"], offer: null },
  { id: "rolls", name: "Kathi Roll Company", cuisine: "Rolls • Wraps", rating: 4.0, eta: "18 min", priceFor2: 150, img: foodMac, tags: ["Non-veg", "Veg"], offer: "₹50 OFF" },
];

export type MenuItem = {
  id: string;
  name: string;
  desc: string;
  price: number;
  veg: boolean;
  bestseller?: boolean;
  img: string;
  category: string;
};

export const menu: MenuItem[] = [
  { id: "m1", name: "Classic Mac & Cheese", desc: "Three cheese, smoked paprika, golden crust", price: 149, veg: true, bestseller: true, img: foodMac, category: "Mains" },
  { id: "m2", name: "Buddha Bowl", desc: "Quinoa, roasted veg, tahini, chickpeas", price: 169, veg: true, img: foodBowl, category: "Mains" },
  { id: "m3", name: "Tonkotsu Ramen", desc: "12-hour pork broth, soft egg, scallions", price: 219, veg: false, bestseller: true, img: foodRamen, category: "Mains" },
  { id: "m4", name: "Smoked Brisket Plate", desc: "House-rub brisket, slaw, cornbread", price: 289, veg: false, img: foodBrisket, category: "Mains" },
  { id: "m5", name: "Paneer Tikka Bowl", desc: "Smoky paneer, jeera rice, mint chutney", price: 139, veg: true, img: foodBowl, category: "Bowls" },
  { id: "m6", name: "Spicy Chicken Ramen", desc: "Chili oil, corn, soft egg", price: 199, veg: false, img: foodRamen, category: "Bowls" },
];

export const aiPicks = [
  { title: "Best under ₹150 near you", subtitle: "AI matched 6 meals to your budget", emoji: "🔥", tone: "primary" as const },
  { title: "High-protein post-gym", subtitle: "≥30g protein, ready in 20 min", emoji: "💪", tone: "accent" as const },
  { title: "Late-night cravings", subtitle: "Open now, delivers to Block C", emoji: "🌙", tone: "dark" as const },
  { title: "Group friendly thalis", subtitle: "Split easy with 4 friends", emoji: "🍽️", tone: "primary" as const },
];

export const categories = [
  { name: "Budget Eats", emoji: "💸" },
  { name: "Fast Food", emoji: "🍔" },
  { name: "Healthy", emoji: "🥗" },
  { name: "Biryani", emoji: "🍛" },
  { name: "Desserts", emoji: "🍰" },
  { name: "Beverages", emoji: "🥤" },
  { name: "Late Night", emoji: "🌙" },
];
