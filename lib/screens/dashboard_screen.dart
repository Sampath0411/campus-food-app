import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/models.dart';
import '../data/mock_data.dart';
import '../providers/cart_provider.dart';
import '../theme.dart';
import 'search_screen.dart';
import 'cart_screen.dart';
import 'profile_screen.dart';
import 'recent_orders_screen.dart';
import '../widgets/restaurant_card.dart';

class DashboardScreen extends StatefulWidget {
  final int tabIndex;
  const DashboardScreen({super.key, this.tabIndex = 0});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentTab = 0;
  String? _activeCategory;
  double _budget = 200;

  @override
  void initState() {
    super.initState();
    _currentTab = widget.tabIndex;
  }

  void _switchTab(int index) {
    if (index == 0 || index == 1 || index == 4) {
      setState(() => _currentTab = index);
    } else {
      // For orders, cart, profile — push as pages
      if (index == 2) {
        Navigator.push(context, MaterialPageRoute(builder: (_) => const RecentOrdersScreen()));
      } else if (index == 3) {
        Navigator.push(context, MaterialPageRoute(builder: (_) => const CartScreen()));
      } else if (index == 5) {
        Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileScreen()));
      }
    }
  }

  List<Restaurant> get _filteredRestaurants {
    var list = MockData.restaurants;
    if (_activeCategory != null) {
      list = list.where((r) => r.tags.contains(_activeCategory)).toList();
    }
    list = list.where((r) => r.priceFor2 <= _budget * 2.5).toList();
    return list;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentTab,
        children: [
          _buildHome(),
          const SearchScreen(),
          _buildPlaceholder(' Orders', Icons.receipt_long),
          _buildPlaceholder(' Cart', Icons.shopping_cart_outlined),
          _buildPlaceholder(' Profile', Icons.person_outline),
        ],
      ),
      bottomNavigationBar: _bottomNav(),
    );
  }

  Widget _bottomNav() {
    final items = [
      {'icon': Icons.home_rounded, 'label': 'Home'},
      {'icon': Icons.search_rounded, 'label': 'Search'},
      {'icon': Icons.receipt_long_rounded, 'label': 'Orders'},
      {'icon': Icons.shopping_cart_rounded, 'label': 'Cart'},
      {'icon': Icons.person_rounded, 'label': 'Profile'},
    ];
    final cart = context.watch<CartProvider>();

    return BottomNavigationBar(
      currentIndex: _currentTab > 4 ? 0 : _currentTab,
      onTap: _switchTab,
      type: BottomNavigationBarType.fixed,
      selectedItemColor: AppTheme.primary,
      unselectedItemColor: AppTheme.textMutedDark,
      backgroundColor: AppTheme.surfaceDark,
      elevation: 8,
      selectedLabelStyle: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600),
      unselectedLabelStyle: GoogleFonts.inter(fontSize: 11),
      items: List.generate(items.length, (i) {
        final item = items[i];
        return BottomNavigationBarItem(
          icon: i == 3
              ? Badge(backgroundColor: AppTheme.primary, label: Text('${cart.count}', style: const TextStyle(fontSize: 10, color: Colors.white)), child: Icon(item['icon'] as IconData))
              : Icon(item['icon'] as IconData),
          label: item['label'] as String,
        );
      }),
    );
  }

  Widget _buildPlaceholder(String title, IconData icon) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 64, color: AppTheme.textMutedDark),
          const SizedBox(height: 16),
          Text(title, style: GoogleFonts.inter(fontSize: 20, color: AppTheme.textMutedDark)),
        ],
      ),
    );
  }

  Widget _buildHome() {
    final hour = DateTime.now().hour;
    final greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    final isLateNight = hour >= 22 || hour < 5;
    final lateNightSpots = MockData.restaurants.where((r) => r.open24).toList();

    return SafeArea(
      child: CustomScrollView(
        slivers: [
          // App Bar
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
              child: Row(
                children: [
                  Text('🍽️', style: const TextStyle(fontSize: 28)),
                  const SizedBox(width: 10),
                  Text('QuickBite', style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w800)),
                  const Spacer(),
                  IconButton(
                    onPressed: () => context.read<CartProvider>().clear(),
                    icon: const Icon(Icons.brightness_6_outlined),
                    color: AppTheme.primary,
                  ),
                  Stack(
                    children: [
                      IconButton(
                        onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CartScreen())),
                        icon: const Icon(Icons.shopping_cart_outlined),
                      ),
                      if (context.watch<CartProvider>().count > 0)
                        Positioned(
                          right: 6,
                          top: 6,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(color: AppTheme.primary, shape: BoxShape.circle),
                            child: Text('${context.watch<CartProvider>().count}', style: const TextStyle(fontSize: 9, color: Colors.white, fontWeight: FontWeight.bold)),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Greeting
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('$greeting 👋', style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondaryDark)),
                  const SizedBox(height: 4),
                  Text('What are you craving?', style: GoogleFonts.inter(fontSize: 24, fontWeight: FontWeight.w800)),
                ],
              ),
            ),
          ),

          // Late night banner
          if (isLateNight)
            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.cardDark,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.borderDark),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.nightlight_round, color: AppTheme.warning, size: 32),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Late-night cravings?', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
                          Text('Open now: ${lateNightSpots.take(3).map((r) => r.name).join(', ')}', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondaryDark)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // AI Picks Carousel
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.only(top: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('✨ AI Picks for You', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700)),
                        Text('See all', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.primary, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 140,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: MockData.aiPicks.length,
                      itemBuilder: (_, i) {
                        final pick = MockData.aiPicks[i];
                        final colors = pick.tone == 'primary'
                            ? [AppTheme.primary, AppTheme.secondary]
                            : pick.tone == 'accent'
                                ? [AppTheme.secondary, AppTheme.accent]
                                : [AppTheme.cardDark, AppTheme.textMutedDark];
                        return Container(
                          width: 240,
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(colors: colors),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 8),
                              Text(pick.title, style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: Colors.white)),
                              const SizedBox(height: 4),
                              Text(pick.subtitle, style: GoogleFonts.inter(fontSize: 11, color: Colors.white70)),
                              const Spacer(),
                              ElevatedButton(
                                onPressed: () {},
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.white24,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                  minimumSize: Size.zero,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                                ),
                                child: Text('Show meals', style: GoogleFonts.inter(fontSize: 11)),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Categories
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.only(top: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Text('Categories', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700)),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 80,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: MockData.categories.length,
                      itemBuilder: (_, i) {
                        final cat = MockData.categories[i];
                        final isActive = _activeCategory == cat.name;
                        return GestureDetector(
                          onTap: () => setState(() => _activeCategory = isActive ? null : cat.name),
                          child: Container(
                            width: 72,
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            child: Column(
                              children: [
                                Container(
                                  width: 48,
                                  height: 48,
                                  decoration: BoxDecoration(
                                    color: isActive ? AppTheme.primary : AppTheme.cardDark,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: isActive ? AppTheme.primary : AppTheme.borderDark),
                                  ),
                                  child: Icon(_catIcon(cat.iconName), size: 24, color: isActive ? Colors.white : AppTheme.textSecondaryDark),
                                ),
                                const SizedBox(height: 6),
                                Text(cat.name, textAlign: TextAlign.center, style: GoogleFonts.inter(fontSize: 10, fontWeight: isActive ? FontWeight.w700 : FontWeight.w500, color: isActive ? AppTheme.primary : AppTheme.textSecondaryDark)),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Budget Filter
          SliverToBoxAdapter(
            child: Container(
              margin: const EdgeInsets.fromLTRB(20, 16, 20, 0),
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
                      Text('Budget filter', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600)),
                      Text('Up to ₹${_budget.round()}', style: GoogleFonts.inter(fontSize: 13, color: AppTheme.primary, fontWeight: FontWeight.w600)),
                    ],
                  ),
                  Slider(
                    value: _budget,
                    min: 50,
                    max: 500,
                    divisions: 45,
                    activeColor: AppTheme.primary,
                    onChanged: (v) => setState(() => _budget = v),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: MockData.filterChips.map((f) {
                      return ActionChip(
                        label: Text(f, style: GoogleFonts.inter(fontSize: 11)),
                        onPressed: () {},
                        backgroundColor: AppTheme.surfaceDark,
                        side: const BorderSide(color: AppTheme.borderDark),
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
          ),

          // Restaurant Grid
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
              child: Text('${_filteredRestaurants.length} restaurants near you', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700)),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, childAspectRatio: 0.68, crossAxisSpacing: 12, mainAxisSpacing: 12),
              delegate: SliverChildBuilderDelegate(
                (_, i) {
                  final r = _filteredRestaurants[i];
                  return RestaurantCard(r: r);
                },
                childCount: _filteredRestaurants.length,
              ),
            ),
          ),
        ],
      ),
    );
  }

  IconData _catIcon(String name) {
    const map = {
      'account_balance_wallet': Icons.account_balance_wallet,
      'lunch_dining': Icons.lunch_dining,
      'eco': Icons.eco,
      'rice_bowl': Icons.rice_bowl,
      'icecream': Icons.icecream,
      'local_cafe': Icons.local_cafe,
      'bedtime': Icons.bedtime,
      'outdoor_grill': Icons.outdoor_grill,
    };
    return map[name] ?? Icons.restaurant;
  }
}


