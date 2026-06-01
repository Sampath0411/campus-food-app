import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/auth_provider.dart';
import '../theme.dart';
import 'dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isSignup = false;
  bool _loading = false;
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passCtrl = TextEditingController();

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    final auth = context.read<AuthProvider>();
    try {
      if (_isSignup) {
        await auth.signUp(_nameCtrl.text.trim(), _emailCtrl.text.trim(), _phoneCtrl.text.trim(), _passCtrl.text);
      } else {
        await auth.signIn(_emailCtrl.text.trim(), _passCtrl.text);
      }
      if (mounted) {
        Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const DashboardScreen()));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: AppTheme.error),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Logo
                    Center(
                      child: Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [AppTheme.primary, AppTheme.accent]),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Center(child: Text('🍽️', style: TextStyle(fontSize: 40))),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'QuickBite',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(fontSize: 28, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _isSignup ? 'Create your account' : 'Sign in to continue',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondaryDark),
                    ),
                    const SizedBox(height: 32),

                    // Name (signup only)
                    if (_isSignup) ...[
                      _buildField(label: 'Full Name', ctrl: _nameCtrl, icon: Icons.person_outline, placeholder: 'Sampath Satya Saran'),
                      const SizedBox(height: 16),
                    ],

                    // Email
                    _buildField(label: 'Email', ctrl: _emailCtrl, icon: Icons.mail_outline, placeholder: 'sampath@example.com', keyboard: TextInputType.emailAddress),
                    const SizedBox(height: 16),

                    // Phone (signup only)
                    if (_isSignup) ...[
                      _buildField(label: 'Phone Number', ctrl: _phoneCtrl, icon: Icons.phone_outlined, placeholder: '9291493225', keyboard: TextInputType.phone),
                      const SizedBox(height: 16),
                    ],

                    // Password
                    _buildField(label: 'Password', ctrl: _passCtrl, icon: Icons.lock_outline, placeholder: '••••••••', obscure: true),
                    const SizedBox(height: 24),

                    // Submit
                    ElevatedButton(
                      onPressed: _loading ? null : _submit,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: _loading
                          ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : Text(_isSignup ? 'Create Account' : 'Sign In', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                    ),
                    const SizedBox(height: 16),

                    // Toggle
                    TextButton(
                      onPressed: _loading ? null : () => setState(() => _isSignup = !_isSignup),
                      child: Text(
                        _isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up",
                        style: GoogleFonts.inter(color: AppTheme.primary, fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildField({
    required String label,
    required TextEditingController ctrl,
    required IconData icon,
    required String placeholder,
    bool obscure = false,
    TextInputType? keyboard,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.textSecondaryDark)),
        const SizedBox(height: 6),
        TextFormField(
          controller: ctrl,
          obscureText: obscure,
          keyboardType: keyboard,
          style: GoogleFonts.inter(fontSize: 15),
          decoration: InputDecoration(
            hintText: placeholder,
            hintStyle: GoogleFonts.inter(color: AppTheme.textMutedDark),
            prefixIcon: Icon(icon, size: 20, color: AppTheme.textMutedDark),
            filled: true,
            fillColor: AppTheme.surfaceDark,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.borderDark)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.borderDark)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.primary, width: 2)),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          ),
          validator: (val) => (val == null || val.trim().isEmpty) ? 'Required' : null,
        ),
      ],
    );
  }
}
