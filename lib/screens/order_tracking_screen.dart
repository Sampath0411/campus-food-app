import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme.dart';

class OrderTrackingScreen extends StatefulWidget {
  const OrderTrackingScreen({super.key});

  @override
  State<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends State<OrderTrackingScreen> {
  final _stages = ['Order Placed', 'Preparing', 'Out for Delivery', 'Delivered'];
  final _stageIcons = [Icons.check, Icons.soup_kitchen, Icons.delivery_dining, Icons.verified];
  int _currentStage = 0;
  int _etaSeconds = 600;

  @override
  void initState() {
    super.initState();
    _simulateProgress();
  }

  void _simulateProgress() async {
    for (var i = 0; i < 4; i++) {
      await Future.delayed(const Duration(seconds: 3));
      if (mounted) {
        setState(() {
          _currentStage = i;
          _etaSeconds = (3 - i) * 180;
        });
      }
    }
  }

  String _fmtDuration(int s) {
    if (s <= 0) return 'now';
    final m = s ~/ 60;
    final sec = s % 60;
    return m > 0 ? '${m}m ${sec}s' : '${sec}s';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Order Tracking', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order ID
            Row(
              children: [
                Text('ORD Live', style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondaryDark)),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(color: AppTheme.veil(AppTheme.success, 0.1), borderRadius: BorderRadius.circular(100)),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(color: AppTheme.success, shape: BoxShape.circle),
                      ).animate(onPlay: (c) => c.repeat()).scaleXY(duration: 1000.ms, begin: 1, end: 1.5),
                      const SizedBox(width: 4),
                      Text('Live', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w600, color: AppTheme.success)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text("Mama's Corner is on it 👨‍🍳", style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            Text(
              _currentStage == 3 ? 'Delivered · enjoy!' : 'Arriving in ~${_fmtDuration(_etaSeconds)}',
              style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondaryDark),
            ),

            const SizedBox(height: 24),

            // Step indicator
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppTheme.cardDark,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.borderDark),
              ),
              child: Column(
                children: List.generate(_stages.length, (i) {
                  final done = i <= _currentStage;
                  final active = i == _currentStage && _currentStage < 3;
                  return Row(
                    children: [
                      Column(
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: done ? AppTheme.primary : AppTheme.surfaceDark,
                              shape: BoxShape.circle,
                              boxShadow: active ? [BoxShadow(color: AppTheme.veil(AppTheme.primary, 0.4), blurRadius: 12)] : null,
                            ),
                            child: Icon(
                              _stageIcons[i],
                              size: 18,
                              color: done ? Colors.white : AppTheme.textMutedDark,
                            ),
                          ),
                          if (i < _stages.length - 1)
                            Container(
                              width: 2,
                              height: 32,
                              color: i < _currentStage ? AppTheme.primary : AppTheme.borderDark,
                            ),
                        ],
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _stages[i],
                              style: GoogleFonts.inter(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: done ? AppTheme.textPrimaryDark : AppTheme.textMutedDark,
                              ),
                            ),
                            Text(
                              done ? '${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}' : '—',
                              style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textMutedDark),
                            ),
                            const SizedBox(height: 16),
                          ],
                        ),
                      ),
                    ],
                  );
                }),
              ),
            ),

            const SizedBox(height: 24),

            // Delivery partner
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
                  Text('Delivery partner', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textMutedDark, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [AppTheme.secondary, AppTheme.accent]),
                          shape: BoxShape.circle,
                        ),
                        child: Center(child: Text('R', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white))),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [Text('Rahul Kumar', style: GoogleFonts.inter(fontWeight: FontWeight.w700))],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.phone, size: 16),
                          label: Text('Call', style: GoogleFonts.inter(fontSize: 12)),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppTheme.borderDark),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.chat, size: 16),
                          label: Text('Chat', style: GoogleFonts.inter(fontSize: 12)),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ElevatedButton(
            onPressed: () => Navigator.popUntil(context, (r) => r.isFirst),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: Text('Back to Home', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700)),
          ),
        ),
      ),
    );
  }
}
