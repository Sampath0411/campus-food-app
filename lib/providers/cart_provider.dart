import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../data/mock_data.dart';

class CartProvider extends ChangeNotifier {
  final Map<String, int> _items = {'m1': 1, 'm3': 2};

  Map<String, int> get items => Map.unmodifiable(_items);

  List<CartLine> get lines {
    return _items.entries
        .where((e) => e.value > 0)
        .map((e) {
          final item = MockData.menu.where((m) => m.id == e.key).firstOrNull;
          if (item == null) return null;
          return CartLine(item: item, qty: e.value);
        })
        .whereType<CartLine>()
        .toList();
  }

  int get count => _items.values.fold(0, (sum, q) => sum + q);

  int get subtotal =>
      lines.fold(0, (sum, l) => sum + l.total);

  void add(String itemId) {
    _items[itemId] = (_items[itemId] ?? 0) + 1;
    notifyListeners();
  }

  void remove(String itemId) {
    final q = (_items[itemId] ?? 0) - 1;
    if (q <= 0) {
      _items.remove(itemId);
    } else {
      _items[itemId] = q;
    }
    notifyListeners();
  }

  int getQty(String itemId) => _items[itemId] ?? 0;

  void clear() {
    _items.clear();
    notifyListeners();
  }
}
