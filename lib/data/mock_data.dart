import '../models/models.dart';

class MockData {
  // ==================== RESTAURANTS ====================
  static const List<Restaurant> restaurants = [
    Restaurant(id: "mamas", name: "Mama's Corner", cuisine: "Homestyle • Comfort", rating: 4.6, eta: "18 min", priceFor2: 180, img: "🍝", tags: ["Budget", "Mess-style"], offer: "50% OFF up to ₹100", open24: true),
    Restaurant(id: "green", name: "Green Leaf Deli", cuisine: "Healthy • Salads • Bowls", rating: 4.4, eta: "22 min", priceFor2: 220, img: "🥗", tags: ["Healthy", "Veg"], offer: "Free delivery"),
    Restaurant(id: "ramen", name: "Sektor Ramen House", cuisine: "Asian • Noodles", rating: 4.7, eta: "28 min", priceFor2: 260, img: "🍜", tags: ["Trending"], offer: "₹75 OFF above ₹199", open24: true),
    Restaurant(id: "smoke", name: "Smokehouse 21", cuisine: "BBQ • Grills", rating: 4.5, eta: "32 min", priceFor2: 320, img: "🥩", tags: ["Non-veg"]),
    Restaurant(id: "mamas2", name: "Hostel Hub Tiffins", cuisine: "Thali • North Indian", rating: 4.3, eta: "15 min", priceFor2: 120, img: "🍛", tags: ["Budget", "Veg"], offer: "Flat ₹40 OFF"),
    Restaurant(id: "green2", name: "Protein Pantry", cuisine: "Healthy • High-protein", rating: 4.6, eta: "24 min", priceFor2: 280, img: "🥗", tags: ["Healthy"]),
    Restaurant(id: "biryani", name: "Biryani Blues", cuisine: "Hyderabadi • Dum", rating: 4.5, eta: "25 min", priceFor2: 240, img: "🍚", tags: ["Non-veg", "Spicy"], offer: "20% OFF"),
    Restaurant(id: "pizza", name: "Campus Pizza", cuisine: "Italian • Fast Food", rating: 4.2, eta: "20 min", priceFor2: 200, img: "🍕", tags: ["Veg", "Non-veg"], offer: "Buy 1 Get 1"),
    Restaurant(id: "dosa", name: "Dosa Plaza", cuisine: "South Indian", rating: 4.4, eta: "12 min", priceFor2: 100, img: "🥞", tags: ["Veg", "Breakfast"], offer: "Free drink"),
    Restaurant(id: "chicken", name: "Chicken Republic", cuisine: "Fried Chicken", rating: 4.3, eta: "30 min", priceFor2: 280, img: "🍗", tags: ["Non-veg"], open24: true),
    Restaurant(id: "chaat", name: "Chaat Corner", cuisine: "Street Food", rating: 4.1, eta: "10 min", priceFor2: 80, img: "🥙", tags: ["Veg", "Snacks"], open24: true),
    Restaurant(id: "rolls", name: "Kathi Roll Company", cuisine: "Rolls • Wraps", rating: 4.0, eta: "18 min", priceFor2: 150, img: "🌯", tags: ["Non-veg", "Veg"], offer: "₹50 OFF"),
    Restaurant(id: "andhra1", name: "Rayalaseema Ruchulu", cuisine: "Andhra • Spicy", rating: 4.7, eta: "25 min", priceFor2: 250, img: "🍲", tags: ["Non-veg", "Spicy", "Andhra"], offer: "15% OFF"),
    Restaurant(id: "andhra2", name: "Vizag Beach Biryani", cuisine: "Andhra • Biryani", rating: 4.6, eta: "30 min", priceFor2: 280, img: "🍛", tags: ["Non-veg", "Andhra", "Biryani"], open24: true),
    Restaurant(id: "andhra3", name: "Bamboo Chicken Hub", cuisine: "Tribal • Andhra", rating: 4.5, eta: "35 min", priceFor2: 300, img: "🍗", tags: ["Non-veg", "Andhra", "Special"], offer: "₹50 OFF"),
    Restaurant(id: "andhra4", name: "Bongulo Kitchen", cuisine: "Traditional Andhra", rating: 4.4, eta: "28 min", priceFor2: 220, img: "🍲", tags: ["Veg", "Non-veg", "Andhra"], offer: "Free drink"),
  ];

  // ==================== MENU ====================
  static const List<MenuItem> menu = [
    MenuItem(id: "m1", name: "Classic Mac & Cheese", desc: "Three cheese, smoked paprika, golden crust", price: 149, veg: true, bestseller: true, img: "🧀", category: "Mains"),
    MenuItem(id: "m2", name: "Buddha Bowl", desc: "Quinoa, roasted veg, tahini, chickpeas", price: 169, veg: true, img: "🥗", category: "Mains"),
    MenuItem(id: "m3", name: "Tonkotsu Ramen", desc: "12-hour pork broth, soft egg, scallions", price: 219, veg: false, bestseller: true, img: "🍜", category: "Mains"),
    MenuItem(id: "m4", name: "Smoked Brisket Plate", desc: "House-rub brisket, slaw, cornbread", price: 289, veg: false, img: "🥩", category: "Mains"),
    MenuItem(id: "m5", name: "Paneer Tikka Bowl", desc: "Smoky paneer, jeera rice, mint chutney", price: 139, veg: true, img: "🍛", category: "Bowls"),
    MenuItem(id: "m6", name: "Spicy Chicken Ramen", desc: "Chili oil, corn, soft egg", price: 199, veg: false, img: "🍜", category: "Bowls"),
    MenuItem(id: "a1", name: "Gongura Mutton", desc: "Tender mutton cooked with sorrel leaves, Andhra style", price: 299, veg: false, bestseller: true, img: "🍖", category: "Andhra Specials"),
    MenuItem(id: "a2", name: "Bamboo Chicken", desc: "Marinated chicken cooked in bamboo shoot (Araaku Valley special)", price: 349, veg: false, bestseller: true, img: "🎋", category: "Andhra Specials"),
    MenuItem(id: "a3", name: "Bongulo Chicken Curry", desc: "Traditional village-style chicken curry", price: 279, veg: false, img: "🍛", category: "Andhra Specials"),
    MenuItem(id: "a4", name: "Fish Pulusu", desc: "Tangy tamarind fish curry, coastal Andhra style", price: 259, veg: false, img: "🐟", category: "Andhra Specials"),
    MenuItem(id: "a5", name: "Pesarattu (Green Gram Dosa)", desc: "Protein-rich dosa with ginger, cumin", price: 89, veg: true, bestseller: true, img: "🥞", category: "Breakfast"),
    MenuItem(id: "a6", name: "Upma Pesarattu", desc: "Pesarattu stuffed with upma - classic combo", price: 99, veg: true, img: "🥞", category: "Breakfast"),
    MenuItem(id: "a7", name: "Ragi Sangati", desc: "Finger millet balls served with spicy curry", price: 119, veg: true, img: "🫘", category: "Andhra Specials"),
    MenuItem(id: "a8", name: "Avakai Biryani", desc: "Famous Andhra pickle biryani", price: 249, veg: false, bestseller: true, img: "🍚", category: "Biryani"),
    MenuItem(id: "a9", name: "Curd Rice", desc: "Tempered curd rice with pomegranate", price: 79, veg: true, img: "🍚", category: "Rice"),
    MenuItem(id: "a10", name: "Bobbatlu (Puran Poli)", desc: "Sweet stuffed flatbread with jaggery", price: 99, veg: true, img: "🫓", category: "Desserts"),
  ];

  // ==================== AI PICKS ====================
  static const List<AIPick> aiPicks = [
    AIPick(title: "Best under ₹150 near you", subtitle: "AI matched 6 meals to your budget", iconName: "local_fire_department", iconColor: "orange", tone: "primary"),
    AIPick(title: "High-protein post-gym", subtitle: "≥30g protein, ready in 20 min", iconName: "fitness_center", iconColor: "green", tone: "accent"),
    AIPick(title: "Late-night cravings", subtitle: "Open now, delivers to Block C", iconName: "nightlight_round", iconColor: "yellow", tone: "dark"),
    AIPick(title: "Group friendly thalis", subtitle: "Split easy with 4 friends", iconName: "restaurant", iconColor: "amber", tone: "primary"),
  ];

  // ==================== CATEGORIES ====================
  static const List<FoodCategory> categories = [
    FoodCategory(name: "Budget Eats", iconName: "account_balance_wallet", color: "green"),
    FoodCategory(name: "Fast Food", iconName: "lunch_dining", color: "orange"),
    FoodCategory(name: "Healthy", iconName: "eco", color: "lightGreen"),
    FoodCategory(name: "Biryani", iconName: "rice_bowl", color: "amber"),
    FoodCategory(name: "Desserts", iconName: "icecream", color: "pink"),
    FoodCategory(name: "Beverages", iconName: "local_cafe", color: "lightBlue"),
    FoodCategory(name: "Late Night", iconName: "bedtime", color: "indigo"),
    FoodCategory(name: "Grills", iconName: "outdoor_grill", color: "red"),
  ];

  static Restaurant getRestaurantById(String id) {
    return restaurants.firstWhere((r) => r.id == id, orElse: () => restaurants[0]);
  }

  static List<MenuItem> getMenuByCategory(String category) {
    return menu.where((m) => m.category == category).toList();
  }

  static Map<String, List<MenuItem>> getGroupedMenu() {
    final Map<String, List<MenuItem>> grouped = {};
    for (final item in menu) {
      grouped.putIfAbsent(item.category, () => []).add(item);
    }
    return grouped;
  }

  static Restaurant getRestaurantByName(String name) {
    return restaurants.firstWhere((r) => r.name == name, orElse: () => restaurants[0]);
  }

  static const List<String> filterChips = [
    "Filter", "Sort by", "Fast Delivery", "Rating 4.0+", "Pure Veg", "Offers", "₹100–300"
  ];

  static const List<String> coupons = ["HOSTEL50", "STUDENT15", "FREESHIP"];
}
