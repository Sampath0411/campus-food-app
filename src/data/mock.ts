import { Flame, Dumbbell, Moon, UtensilsCrossed, Wallet, Pizza, Salad, Beef, IceCream, CupSoda, type LucideIcon } from "lucide-react";
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
  open24?: boolean;
};

export const restaurants: Restaurant[] = [
  { id: "mamas", name: "Mama's Corner", cuisine: "Homestyle • Comfort", rating: 4.6, eta: "18 min", priceFor2: 180, img: foodMac, tags: ["Budget", "Mess-style"], offer: "50% OFF up to ₹100", open24: true },
  { id: "green", name: "Green Leaf Deli", cuisine: "Healthy • Salads • Bowls", rating: 4.4, eta: "22 min", priceFor2: 220, img: foodBowl, tags: ["Healthy", "Veg"], offer: "Free delivery" },
  { id: "ramen", name: "Sektor Ramen House", cuisine: "Asian • Noodles", rating: 4.7, eta: "28 min", priceFor2: 260, img: foodRamen, tags: ["Trending"], offer: "₹75 OFF above ₹199", open24: true },
  { id: "smoke", name: "Smokehouse 21", cuisine: "BBQ • Grills", rating: 4.5, eta: "32 min", priceFor2: 320, img: foodBrisket, tags: ["Non-veg"] },
  { id: "mamas2", name: "Hostel Hub Tiffins", cuisine: "Thali • North Indian", rating: 4.3, eta: "15 min", priceFor2: 120, img: foodMac, tags: ["Budget", "Veg"], offer: "Flat ₹40 OFF" },
  { id: "green2", name: "Protein Pantry", cuisine: "Healthy • High-protein", rating: 4.6, eta: "24 min", priceFor2: 280, img: foodBowl, tags: ["Healthy"] },
  { id: "biryani", name: "Biryani Blues", cuisine: "Hyderabadi • Dum", rating: 4.5, eta: "25 min", priceFor2: 240, img: foodMac, tags: ["Non-veg", "Spicy"], offer: "20% OFF" },
  { id: "pizza", name: "Campus Pizza", cuisine: "Italian • Fast Food", rating: 4.2, eta: "20 min", priceFor2: 200, img: foodMac, tags: ["Veg", "Non-veg"], offer: "Buy 1 Get 1" },
  { id: "dosa", name: "Dosa Plaza", cuisine: "South Indian", rating: 4.4, eta: "12 min", priceFor2: 100, img: foodBowl, tags: ["Veg", "Breakfast"], offer: "Free drink" },
  { id: "chicken", name: "Chicken Republic", cuisine: "Fried Chicken", rating: 4.3, eta: "30 min", priceFor2: 280, img: foodBrisket, tags: ["Non-veg"], offer: null, open24: true },
  { id: "chaat", name: "Chaat Corner", cuisine: "Street Food", rating: 4.1, eta: "10 min", priceFor2: 80, img: foodBowl, tags: ["Veg", "Snacks"], offer: null, open24: true },
  { id: "rolls", name: "Kathi Roll Company", cuisine: "Rolls • Wraps", rating: 4.0, eta: "18 min", priceFor2: 150, img: foodMac, tags: ["Non-veg", "Veg"], offer: "₹50 OFF" },
  { id: "andhra1", name: "Rayalaseema Ruchulu", cuisine: "Andhra • Spicy", rating: 4.7, eta: "25 min", priceFor2: 250, img: foodBowl, tags: ["Non-veg", "Spicy", "Andhra"], offer: "15% OFF" },
  { id: "andhra2", name: "Vizag Beach Biryani", cuisine: "Andhra • Biryani", rating: 4.6, eta: "30 min", priceFor2: 280, img: foodMac, tags: ["Non-veg", "Andhra", "Biryani"], offer: null, open24: true },
  { id: "andhra3", name: "Bamboo Chicken Hub", cuisine: "Tribal • Andhra", rating: 4.5, eta: "35 min", priceFor2: 300, img: foodBrisket, tags: ["Non-veg", "Andhra", "Special"], offer: "₹50 OFF" },
  { id: "andhra4", name: "Bongulo Kitchen", cuisine: "Traditional Andhra", rating: 4.4, eta: "28 min", priceFor2: 220, img: foodBowl, tags: ["Veg", "Non-veg", "Andhra"], offer: "Free drink" },
  { id: "andhra5", name: "Gongura Point", cuisine: "Andhra • Veg", rating: 4.3, eta: "20 min", priceFor2: 180, img: foodBowl, tags: ["Veg", "Andhra", "Spicy"], offer: null },
  { id: "andhra6", name: "Fish Curry Corner", cuisine: "Coastal Andhra • Seafood", rating: 4.8, eta: "32 min", priceFor2: 350, img: foodBrisket, tags: ["Non-veg", "Seafood", "Andhra"], offer: "20% OFF" },
  { id: "andhra7", name: "Pesarattu Palace", cuisine: "Breakfast • Andhra", rating: 4.5, eta: "15 min", priceFor2: 120, img: foodBowl, tags: ["Veg", "Breakfast", "Andhra"], offer: "Flat ₹30 OFF" },
  { id: "andhra8", name: "Upma & Idli House", cuisine: "Tiffins • Andhra", rating: 4.2, eta: "12 min", priceFor2: 100, img: foodBowl, tags: ["Veg", "Breakfast", "Andhra"], offer: null },
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
  { id: "a1", name: "Gongura Mutton", desc: "Tender mutton cooked with sorrel leaves, Andhra style", price: 299, veg: false, bestseller: true, img: foodBrisket, category: "Andhra Specials" },
  { id: "a2", name: "Bamboo Chicken", desc: "Marinated chicken cooked in bamboo shoot (Araaku Valley special)", price: 349, veg: false, bestseller: true, img: foodBrisket, category: "Andhra Specials" },
  { id: "a3", name: "Bongulo Chicken Curry", desc: "Traditional village-style chicken curry with country spices", price: 279, veg: false, img: foodBrisket, category: "Andhra Specials" },
  { id: "a4", name: "Fish Pulusu", desc: "Tangy tamarind fish curry, coastal Andhra style", price: 259, veg: false, img: foodBrisket, category: "Andhra Specials" },
  { id: "a5", name: "Pesarattu (Green Gram Dosa)", desc: "Protein-rich dosa with ginger, cumin", price: 89, veg: true, bestseller: true, img: foodBowl, category: "Breakfast" },
  { id: "a6", name: "Upma Pesarattu", desc: "Pesarattu stuffed with upma - classic combo", price: 99, veg: true, img: foodBowl, category: "Breakfast" },
  { id: "a7", name: "Ragi Sangati", desc: "Finger millet balls served with spicy curry", price: 119, veg: true, img: foodBowl, category: "Andhra Specials" },
  { id: "a8", name: "Natukodi Pulusu", desc: "Country chicken curry with traditional spices", price: 289, veg: false, img: foodBrisket, category: "Andhra Specials" },
  { id: "a9", name: "Royyala Vepudu", desc: "Prawn fry with Andhra spices", price: 329, veg: false, img: foodBrisket, category: "Andhra Specials" },
  { id: "a10", name: "Avakai Biryani", desc: "Famous Andhra pickle biryani", price: 249, veg: false, bestseller: true, img: foodMac, category: "Biryani" },
  { id: "a11", name: "Curd Rice", desc: "Tempered curd rice with pomegranate", price: 79, veg: true, img: foodBowl, category: "Rice" },
  { id: "a12", name: "Gongura Pachadi", desc: "Tangy sorrel leaves chutney", price: 59, veg: true, img: foodBowl, category: "Sides" },
  { id: "a13", name: "Bobbatlu (Puran Poli)", desc: "Sweet stuffed flatbread with jaggery", price: 99, veg: true, img: foodBowl, category: "Desserts" },
  { id: "a14", name: "Ariselu", desc: "Traditional Andhra sweet with rice flour, jaggery", price: 89, veg: true, img: foodBowl, category: "Desserts" },
];

export type AIPick = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  tone: "primary" | "accent" | "dark";
};

export const aiPicks: AIPick[] = [
  { title: "Best under ₹150 near you", subtitle: "AI matched 6 meals to your budget", icon: Flame, iconColor: "text-orange-400", tone: "primary" },
  { title: "High-protein post-gym", subtitle: "≥30g protein, ready in 20 min", icon: Dumbbell, iconColor: "text-emerald-400", tone: "accent" },
  { title: "Late-night cravings", subtitle: "Open now, delivers to Block C", icon: Moon, iconColor: "text-yellow-300", tone: "dark" },
  { title: "Group friendly thalis", subtitle: "Split easy with 4 friends", icon: UtensilsCrossed, iconColor: "text-amber-300", tone: "primary" },
];

export type Category = { name: string; icon: LucideIcon; color: string };

export const categories: Category[] = [
  { name: "Budget Eats", icon: Wallet, color: "text-emerald-500" },
  { name: "Fast Food", icon: Pizza, color: "text-orange-500" },
  { name: "Healthy", icon: Salad, color: "text-green-500" },
  { name: "Biryani", icon: UtensilsCrossed, color: "text-amber-500" },
  { name: "Desserts", icon: IceCream, color: "text-pink-400" },
  { name: "Beverages", icon: CupSoda, color: "text-sky-400" },
  { name: "Late Night", icon: Moon, color: "text-indigo-400" },
  { name: "Grills", icon: Beef, color: "text-red-500" },
];
