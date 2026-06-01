import 'package:flutter/material.dart';
import '../models/models.dart';

class AuthProvider extends ChangeNotifier {
  AppUser? _user;
  bool _isLoggedIn = false;

  AppUser? get user => _user;
  bool get isLoggedIn => _isLoggedIn;

  String get displayName => _user?.name.split(' ').first ?? 'there';

  Future<bool> signIn(String email, String password) async {
    // Simulate auth
    await Future.delayed(const Duration(milliseconds: 800));
    _user = AppUser(name: 'Sampath', email: email, phone: '');
    _isLoggedIn = true;
    notifyListeners();
    return true;
  }

  Future<bool> signUp(String name, String email, String phone, String password) async {
    await Future.delayed(const Duration(milliseconds: 800));
    _user = AppUser(name: name, email: email, phone: phone);
    _isLoggedIn = true;
    notifyListeners();
    return true;
  }

  void signOut() {
    _user = null;
    _isLoggedIn = false;
    notifyListeners();
  }
}
