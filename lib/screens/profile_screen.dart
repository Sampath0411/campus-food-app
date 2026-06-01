import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/auth_provider.dart';
import '../theme.dart';
import 'login_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    return Scaffold(
      appBar: AppBar(
        title: Text('Profile', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Avatar
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [AppTheme.secondary, AppTheme.accent]),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  user?.name.isNotEmpty == true ? user!.name[0].toUpperCase() : 'U',
                  style: GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.w800, color: Colors.white),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(user?.name ?? 'User', style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w700)),
            Text(user?.email ?? '', style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondaryDark)),
            const SizedBox(height: 32),

            // Menu items
            _MenuItem(icon: Icons.person_outline, title: 'Edit Profile', onTap: () {}),
            _MenuItem(icon: Icons.location_on_outlined, title: 'Delivery Addresses', onTap: () {}),
            _MenuItem(icon: Icons.account_balance_wallet_outlined, title: 'Payment Methods', onTap: () {}),
            _MenuItem(icon: Icons.notifications_outlined, title: 'Notifications', onTap: () {}),
            _MenuItem(icon: Icons.help_outline, title: 'Help & Support', onTap: () {}),
            _MenuItem(icon: Icons.info_outline, title: 'About QuickBite', onTap: () {}),

            const SizedBox(height: 24),

            // Sign out
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () {
                  auth.signOut();
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                    (r) => false,
                  );
                },
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppTheme.error),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: Text('Sign Out', style: GoogleFonts.inter(color: AppTheme.error, fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;
  const _MenuItem({required this.icon, required this.title, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, size: 22, color: AppTheme.textSecondaryDark),
      title: Text(title, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500)),
      trailing: const Icon(Icons.chevron_right, size: 20, color: AppTheme.textMutedDark),
      onTap: onTap,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    );
  }
}
