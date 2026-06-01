import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/models.dart';
import '../theme.dart';
import '../screens/restaurant_screen.dart';

class RestaurantCard extends StatelessWidget {
  final Restaurant r;
  const RestaurantCard({super.key, required this.r});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => RestaurantScreen(restaurant: r))),
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.cardDark,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.borderDark),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: 5,
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppTheme.primary.withValues(alpha: 0.2), AppTheme.accent.withValues(alpha: 0.1)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Center(child: Text(r.img, style: const TextStyle(fontSize: 48))),
              ),
            ),
            Expanded(
              flex: 4,
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(r.name, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700), maxLines: 1, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 2),
                    Text(r.cuisine, style: GoogleFonts.inter(fontSize: 10, color: AppTheme.textSecondaryDark), maxLines: 1, overflow: TextOverflow.ellipsis),
                    const Spacer(),
                    Row(
                      children: [
                        Icon(Icons.star, size: 12, color: Colors.amber[400]),
                        const SizedBox(width: 2),
                        Text('${r.rating}', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600)),
                        const SizedBox(width: 8),
                        Icon(Icons.access_time, size: 12, color: AppTheme.textMutedDark),
                        const SizedBox(width: 2),
                        Text(r.eta, style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textMutedDark)),
                        const Spacer(),
                        Text('₹${r.priceFor2}', style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textSecondaryDark)),
                      ],
                    ),
                    if (r.offer != null) ...[
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppTheme.success.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(r.offer!, style: GoogleFonts.inter(fontSize: 9, color: AppTheme.success, fontWeight: FontWeight.w600), maxLines: 1, overflow: TextOverflow.ellipsis),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
