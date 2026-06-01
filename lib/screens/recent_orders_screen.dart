import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/order_provider.dart';
import '../theme.dart';

class RecentOrdersScreen extends StatelessWidget {
  const RecentOrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final orders = context.watch<OrderProvider>().recentOrders;

    return Scaffold(
      appBar: AppBar(
        title: Text('Recent Orders', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: orders.isEmpty
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.receipt_long, size: 64, color: AppTheme.textMutedDark),
                  const SizedBox(height: 16),
                  Text('No orders yet', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  Text('Order something delicious to see it here!', style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textMutedDark)),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: orders.length,
              itemBuilder: (_, i) {
                final o = orders[i];
                final daysAgo = DateTime.now().difference(o.date).inDays;
                final dateStr = daysAgo == 0 ? 'Today' : daysAgo == 1 ? 'Yesterday' : '$daysAgo days ago';

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
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
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(child: Text(o.restaurantName, style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w700))),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(color: AppTheme.veil(AppTheme.success, 0.1), borderRadius: BorderRadius.circular(100)),
                            child: Text('Delivered', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w600, color: AppTheme.success)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text('${o.items.length} item${o.items.length > 1 ? 's' : ''} · ₹${o.total} · $dateStr', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondaryDark)),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 6,
                        children: o.items.take(3).map((it) => Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(color: AppTheme.surfaceDark, borderRadius: BorderRadius.circular(6)),
                              child: Text(it.name, style: GoogleFonts.inter(fontSize: 10)),
                            )).toList(),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton.icon(
                        onPressed: () {},
                        icon: const Icon(Icons.replay, size: 16),
                        label: Text('Reorder', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
