// ==================== RESTAURANT ====================
class Restaurant {
  final String id;
  final String name;
  final String cuisine;
  final double rating;
  final String eta;
  final int priceFor2;
  final String img;
  final List<String> tags;
  final String? offer;
  final bool open24;

  const Restaurant({
    required this.id,
    required this.name,
    required this.cuisine,
    required this.rating,
    required this.eta,
    required this.priceFor2,
    required this.img,
    required this.tags,
    this.offer,
    this.open24 = false,
  });
}

// ==================== MENU ITEM ====================
class MenuItem {
  final String id;
  final String name;
  final String desc;
  final int price;
  final bool veg;
  final bool bestseller;
  final String img;
  final String category;

  const MenuItem({
    required this.id,
    required this.name,
    required this.desc,
    required this.price,
    required this.veg,
    this.bestseller = false,
    required this.img,
    required this.category,
  });
}

// ==================== CART LINE ====================
class CartLine {
  final MenuItem item;
  int qty;

  CartLine({required this.item, this.qty = 1});

  int get total => item.price * qty;
}

// ==================== AI PICK ====================
class AIPick {
  final String title;
  final String subtitle;
  final String iconName;
  final String iconColor;
  final String tone;

  const AIPick({
    required this.title,
    required this.subtitle,
    required this.iconName,
    required this.iconColor,
    required this.tone,
  });
}

// ==================== CATEGORY ====================
class FoodCategory {
  final String name;
  final String iconName;
  final String color;

  const FoodCategory({
    required this.name,
    required this.iconName,
    required this.color,
  });
}

// ==================== ORDER ====================
class OrderItem {
  final String name;
  final int price;
  final int qty;

  OrderItem({required this.name, required this.price, required this.qty});

  Map<String, dynamic> toJson() => {'name': name, 'price': price, 'qty': qty};

  factory OrderItem.fromJson(Map<String, dynamic> json) => OrderItem(
        name: json['name'] ?? '',
        price: json['price'] ?? 0,
        qty: json['qty'] ?? 0,
      );
}

class Order {
  final String id;
  final String restaurantName;
  final List<OrderItem> items;
  final int total;
  final String payment;
  final DateTime date;
  final String status;

  Order({
    required this.id,
    required this.restaurantName,
    required this.items,
    required this.total,
    required this.payment,
    DateTime? date,
    this.status = 'delivered',
  }) : date = date ?? DateTime.now();

  Map<String, dynamic> toJson() => {
        'id': id,
        'restaurantName': restaurantName,
        'items': items.map((e) => e.toJson()).toList(),
        'total': total,
        'payment': payment,
        'date': date.millisecondsSinceEpoch,
        'status': status,
      };

  factory Order.fromJson(Map<String, dynamic> json) => Order(
        id: json['id'] ?? '',
        restaurantName: json['restaurantName'] ?? '',
        items: (json['items'] as List?)?.map((e) => OrderItem.fromJson(e)).toList() ?? [],
        total: json['total'] ?? 0,
        payment: json['payment'] ?? '',
        date: DateTime.fromMillisecondsSinceEpoch(json['date'] ?? DateTime.now().millisecondsSinceEpoch),
        status: json['status'] ?? 'delivered',
      );
}

// ==================== USER ====================
class AppUser {
  final String name;
  final String email;
  final String phone;

  AppUser({required this.name, required this.email, required this.phone});
}
