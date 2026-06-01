import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/models.dart';
import '../data/mock_data.dart';
import '../providers/cart_provider.dart';
import '../theme.dart';
import 'cart_screen.dart';

class RestaurantScreen extends StatefulWidget {
  final Restaurant restaurant;
  const RestaurantScreen({super.key, required this.restaurant});

  @override
  State<RestaurantScreen> createState() => _RestaurantScreenState();
}

class _RestaurantScreenState extends State<RestaurantScreen> with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  String _activeTab = 'Menu';

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final r = widget.restaurant;
    final cart = context.watch<CartProvider>();
    final grouped = MockData.getGroupedMenu();

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Banner
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [AppTheme.veil(AppTheme.primary, 0.4), AppTheme.veil(AppTheme.accent, 0.3)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                    child: Center(child: Text(r.img, style: const TextStyle(fontSize: 80))),
                  ),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(colors: [Colors.transparent, Colors.black.withValues(alpha: 0.7)], begin: Alignment.topCenter, end: Alignment.bottomCenter),
                    ),
                  ),
                  Positioned(
                    left: 16,
                    right: 16,
                    bottom: 16,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(r.name, style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white)),
                        Text(r.cuisine, style: GoogleFonts.inter(fontSize: 12, color: Colors.white70)),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            const Icon(Icons.star, size: 14, color: Colors.amber),
                            const SizedBox(width: 2),
                            Text('${r.rating}', style: GoogleFonts.inter(fontSize: 12, color: Colors.white, fontWeight: FontWeight.w600)),
                            const SizedBox(width: 12),
                            const Icon(Icons.access_time, size: 14, color: Colors.white70),
                            const SizedBox(width: 2),
                            Text(r.eta, style: GoogleFonts.inter(fontSize: 12, color: Colors.white70)),
                            const SizedBox(width: 12),
                            const Icon(Icons.location_on, size: 14, color: Colors.white70),
                            Text('1.2 km', style: GoogleFonts.inter(fontSize: 12, color: Colors.white70)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Offer strip
          if (r.offer != null)
            SliverToBoxAdapter(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                color: AppTheme.veil(AppTheme.primary, 0.1),
                child: Row(
                  children: [
                    const Icon(Icons.local_offer, size: 16, color: AppTheme.primary),
                    const SizedBox(width: 8),
                    Text(r.offer!, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.primary)),
                  ],
                ),
              ),
            ),

          // Tabs
          SliverToBoxAdapter(
            child: TabBar(
              controller: _tabCtrl,
              labelColor: AppTheme.primary,
              unselectedLabelColor: AppTheme.textMutedDark,
              indicatorColor: AppTheme.primary,
              labelStyle: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13),
              tabs: const [Tab(text: 'Menu'), Tab(text: 'Reviews'), Tab(text: 'Info')],
              onTap: (i) => setState(() => _activeTab = ['Menu', 'Reviews', 'Info'][i]),
            ),
          ),

          // Content
          if (_activeTab == 'Menu')
            ...grouped.entries.expand((entry) {
              return [
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 20, 12, 8),
                    child: Text('${entry.key} · ${entry.value.length}', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700)),
                  ),
                ),
                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (_, i) => _MenuItemCard(item: entry.value[i]),
                    childCount: entry.value.length,
                  ),
                ),
              ];
            })
          else if (_activeTab == 'Reviews')
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Loved by hostelers', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 16),
                    ...[
                      {'who': 'Aarav · Block B', 'text': 'Mac & cheese is unreal. Reliable 18-min delivery every time.'},
                      {'who': 'Priya · Block D', 'text': 'Portion sizes feel honest. Great for splitting.'},
                      {'who': 'Karan · Block A', 'text': 'Their veg combo under ₹120 is the play before exams.'},
                    ].map((rev) => Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppTheme.surfaceDark,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppTheme.borderDark),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  ...List.generate(5, (_) => const Icon(Icons.star, size: 14, color: Colors.amber)),
                                  const SizedBox(width: 8),
                                  Text(rev['who']!, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(rev['text']!, style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondaryDark)),
                            ],
                          ),
                        )),
                  ],
                ),
              ),
            )
          else
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    _infoRow('Address', '21, Food Street, Vellore'),
                    _infoRow('Hours', '11:00 – 23:30'),
                    _infoRow('Cuisines', r.cuisine),
                    _infoRow('Avg. cost', '₹${r.priceFor2} for two'),
                  ],
                ),
              ),
            ),

          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),

      // Floating cart button
      floatingActionButton: cart.count > 0
          ? FloatingActionButton.extended(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CartScreen())),
              backgroundColor: AppTheme.primary,
              icon: const Icon(Icons.shopping_cart, color: Colors.white),
              label: Text('${cart.count} items · ₹${cart.subtotal}', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
            )
          : null,
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 100, child: Text(label, style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textMutedDark))),
          Expanded(child: Text(value, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600))),
        ],
      ),
    );
  }
}

class _MenuItemCard extends StatelessWidget {
  final MenuItem item;
  const _MenuItemCard({required this.item});

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final qty = cart.getQty(item.id);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.cardDark,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.borderDark),
      ),
      child: Row(
        children: [
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 16,
                      height: 16,
                      decoration: BoxDecoration(
                        border: Border.all(color: item.veg ? AppTheme.success : AppTheme.error, width: 1.5),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Center(
                        child: Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: item.veg ? AppTheme.success : AppTheme.error,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ),
                    if (item.bestseller) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(color: AppTheme.veil(AppTheme.warning, 0.15), borderRadius: BorderRadius.circular(4)),
                        child: Text('★ Bestseller', style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w700, color: AppTheme.warning)),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 6),
                Text(item.name, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text('₹${item.price}', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text(item.desc, style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textMutedDark), maxLines: 2, overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
          const SizedBox(width: 12),
          // Image + Add button
          Column(
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppTheme.surfaceDark,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(child: Text(item.img, style: const TextStyle(fontSize: 36))),
              ),
              const SizedBox(height: 8),
              if (qty == 0)
                ElevatedButton(
                  onPressed: () => context.read<CartProvider>().add(item.id),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                    minimumSize: const Size(80, 32),
                    padding: EdgeInsets.zero,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: Text('ADD', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700)),
                )
              else
                Container(
                  height: 32,
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  decoration: BoxDecoration(
                    color: AppTheme.primary,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      GestureDetector(
                        onTap: () => context.read<CartProvider>().remove(item.id),
                        child: const Icon(Icons.remove, size: 16, color: Colors.white),
                      ),
                      const SizedBox(width: 8),
                      Text('$qty', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white)),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: () => context.read<CartProvider>().add(item.id),
                        child: const Icon(Icons.add, size: 16, color: Colors.white),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
