import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';

class OrderProvider extends ChangeNotifier {
  List<Order> _recentOrders = [];

  List<Order> get recentOrders => List.unmodifiable(_recentOrders);

  OrderProvider() {
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('recent_orders');
    if (raw != null) {
      try {
        final list = jsonDecode(raw) as List;
        _recentOrders = list.map((e) => Order.fromJson(e)).toList();
        notifyListeners();
      } catch (_) {}
    }
  }

  Future<void> saveOrders() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('recent_orders', jsonEncode(_recentOrders.map((e) => e.toJson()).toList()));
  }

  String placeOrder(String restaurantName, List<CartLine> lines, String payment) {
    final id = 'ORD-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
    final orderItems = lines.map((l) => OrderItem(name: l.item.name, price: l.item.price, qty: l.qty)).toList();
    int total = orderItems.fold(0, (sum, i) => sum + i.price * i.qty);
    const delivery = 25;
    final taxes = (total * 0.05).round();
    total += delivery + taxes;

    final order = Order(
      id: id,
      restaurantName: restaurantName,
      items: orderItems,
      total: total,
      payment: payment.toUpperCase(),
    );

    _recentOrders.insert(0, order);
    if (_recentOrders.length > 10) _recentOrders = _recentOrders.sublist(0, 10);
    saveOrders();
    notifyListeners();
    return id;
  }

  void removeOrder(String id) {
    _recentOrders.removeWhere((o) => o.id == id);
    saveOrders();
    notifyListeners();
  }
}
