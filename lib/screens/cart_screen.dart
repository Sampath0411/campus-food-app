import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/cart_provider.dart';
import '../providers/order_provider.dart';
import '../data/mock_data.dart';
import '../theme.dart';
import 'order_tracking_screen.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  String _payMethod = 'upi';
  String _coupon = '';
  bool _couponApplied = false;

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final lines = cart.lines;
    final subtotal = cart.subtotal;
    final delivery = subtotal > 199 ? 0 : 25;
    final taxes = (subtotal * 0.05).round();
    final discount = _couponApplied ? 50 : 0;
    final total = subtotal + delivery + taxes - discount;

    return Scaffold(
      appBar: AppBar(
        title: Text('Your Cart (${cart.count})', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        automaticallyImplyLeading: true,
      ),
      body: lines.isEmpty
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.shopping_cart_outlined, size: 64, color: AppTheme.textMutedDark),
                  const SizedBox(height: 16),
                  Text('Your cart is empty', style: GoogleFonts.inter(fontSize: 16, color: AppTheme.textMutedDark)),
                  const SizedBox(height: 8),
                  Text('Add some delicious food!', style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textMutedDark)),
                ],
              ),
            )
          : Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Cart items
                        ...lines.map((l) => Container(
                              margin: const EdgeInsets.only(bottom: 10),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppTheme.cardDark,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: AppTheme.borderDark),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    width: 48,
                                    height: 48,
                                    decoration: BoxDecoration(color: AppTheme.surfaceDark, borderRadius: BorderRadius.circular(12)),
                                    child: Center(child: Text(l.item.img, style: const TextStyle(fontSize: 24))),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(l.item.name, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600)),
                                        Text('₹${l.item.price}', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondaryDark)),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: AppTheme.veil(AppTheme.primary, 0.1),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: AppTheme.primary),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        GestureDetector(onTap: () => cart.remove(l.item.id), child: const Icon(Icons.remove, size: 16, color: AppTheme.primary)),
                                        Padding(padding: const EdgeInsets.symmetric(horizontal: 8), child: Text('${l.qty}', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: AppTheme.primary))),
                                        GestureDetector(onTap: () => cart.add(l.item.id), child: const Icon(Icons.add, size: 16, color: AppTheme.primary)),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text('₹${l.total}', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700)),
                                ],
                              ),
                            )),

                        const SizedBox(height: 16),

                        // Coupon
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppTheme.cardDark,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppTheme.borderDark),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: const [Icon(Icons.local_offer, size: 18, color: AppTheme.primary), SizedBox(width: 8), Text('Apply coupon', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14))],
                              ),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  Expanded(
                                    child: TextField(
                                      decoration: InputDecoration(
                                        hintText: 'Enter code (try HOSTEL50)',
                                        hintStyle: GoogleFonts.inter(fontSize: 13, color: AppTheme.textMutedDark),
                                        filled: true,
                                        fillColor: AppTheme.surfaceDark,
                                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.borderDark)),
                                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                      ),
                                      onChanged: (v) => setState(() => _coupon = v),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  ElevatedButton(
                                    onPressed: _coupon.trim().isNotEmpty ? () => setState(() => _couponApplied = true) : null,
                                    style: ElevatedButton.styleFrom(
                                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    ),
                                    child: Text('Apply', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                                  ),
                                ],
                              ),
                              if (_couponApplied)
                                Padding(
                                  padding: const EdgeInsets.only(top: 8),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.check, size: 14, color: AppTheme.success),
                                      const SizedBox(width: 4),
                                      Text('HOSTEL50 applied — ₹50 off', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.success, fontWeight: FontWeight.w600)),
                                    ],
                                  ),
                                ),
                              const SizedBox(height: 8),
                              Wrap(
                                spacing: 8,
                                children: MockData.coupons.map((c) => ActionChip(
                                      label: Text(c, style: GoogleFonts.inter(fontSize: 11)),
                                      onPressed: () {
                                        setState(() {
                                          _coupon = c;
                                          _couponApplied = true;
                                        });
                                      },
                                      backgroundColor: AppTheme.surfaceDark,
                                      side: const BorderSide(color: AppTheme.borderDark),
                                    )).toList(),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Payment
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppTheme.cardDark,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppTheme.borderDark),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Payment method', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600)),
                              const SizedBox(height: 12),
                              ...[
                                {'id': 'upi', 'name': 'UPI', 'sub': 'GPay · PhonePe · Paytm', 'icon': Icons.smartphone},
                                {'id': 'card', 'name': 'Credit/Debit', 'sub': 'Visa · Mastercard · Rupay', 'icon': Icons.credit_card},
                                {'id': 'wallet', 'name': 'QuickBite Wallet', 'sub': 'Balance ₹240', 'icon': Icons.account_balance_wallet},
                                {'id': 'cod', 'name': 'Cash on Delivery', 'sub': 'Pay with exact change', 'icon': Icons.payments},
                              ].map((m) => GestureDetector(
                                    onTap: () => setState(() => _payMethod = m['id'] as String),
                                    child: Container(
                                      margin: const EdgeInsets.only(bottom: 8),
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                        color: _payMethod == m['id'] ? AppTheme.veil(AppTheme.primary, 0.1) : AppTheme.surfaceDark,
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(color: _payMethod == m['id'] ? AppTheme.primary : AppTheme.borderDark),
                                      ),
                                      child: Row(
                                        children: [
                                          Container(
                                            width: 40,
                                            height: 40,
                                            decoration: BoxDecoration(
                                              color: _payMethod == m['id'] ? AppTheme.primary : AppTheme.cardDark,
                                              borderRadius: BorderRadius.circular(10),
                                            ),
                                            child: Icon(m['icon'] as IconData, size: 20, color: _payMethod == m['id'] ? Colors.white : AppTheme.textMutedDark),
                                          ),
                                          const SizedBox(width: 12),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(m['name'] as String, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600)),
                                                Text(m['sub'] as String, style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textMutedDark)),
                                              ],
                                            ),
                                          ),
                                          if (_payMethod == m['id']) const Icon(Icons.check_circle, size: 18, color: AppTheme.primary),
                                        ],
                                      ),
                                    ),
                                  )),
                            ],
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Bill summary
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppTheme.cardDark,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppTheme.borderDark),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Bill details', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700)),
                              const SizedBox(height: 12),
                              _billRow('Item subtotal', '₹$subtotal'),
                              _billRow('Delivery fee', delivery == 0 ? 'FREE' : '₹$delivery', free: delivery == 0),
                              _billRow('Taxes & charges', '₹$taxes'),
                              if (discount > 0) _billRow('Coupon discount', '- ₹$discount', discount: true),
                              const Divider(height: 20, color: AppTheme.borderDark),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text('To pay', style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w700)),
                                  Text('₹$total', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w800)),
                                ],
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 80),
                      ],
                    ),
                  ),
                ),

                // Bottom CTA
                Container(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
                  decoration: BoxDecoration(
                    color: AppTheme.surfaceDark,
                    border: Border(top: BorderSide(color: AppTheme.borderDark)),
                  ),
                  child: SafeArea(
                    top: false,
                    child: ElevatedButton(
                      onPressed: () {
                        final orderProvider = context.read<OrderProvider>();
                        orderProvider.placeOrder("Mama's Corner", lines, _payMethod);
                        cart.clear();
                        Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const OrderTrackingScreen()));
                      },
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text('Place order · ₹$total', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700)),
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _billRow(String label, String value, {bool free = false, bool discount = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondaryDark)),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: free ? AppTheme.success : discount ? AppTheme.success : AppTheme.textPrimaryDark,
            ),
          ),
        ],
      ),
    );
  }
}
