import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color primary = Color(0xFF6366F1);
  static const Color secondary = Color(0xFFA855F7);
  static const Color accent = Color(0xFFEC4899);
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);

  static const Color bgDark = Color(0xFF0A0A0F);
  static const Color surfaceDark = Color(0xFF111118);
  static const Color cardDark = Color(0xFF141420);
  static const Color borderDark = Color(0xFF2A2A3A);
  static const Color textPrimaryDark = Color(0xFFF0F0F5);
  static const Color textSecondaryDark = Color(0xFFA0A0B8);
  static const Color textMutedDark = Color(0xFF6B6B80);

  static const Color bgLight = Color(0xFFF8F9FC);
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color cardLight = Color(0xFFFFFFFF);
  static const Color borderLight = Color(0xFFE2E8F0);
  static const Color textPrimaryLight = Color(0xFF1A1A2E);
  static const Color textSecondaryLight = Color(0xFF64748B);
  static const Color textMutedLight = Color(0xFF94A3B8);

  static final Shader primaryGradient = const LinearGradient(
    colors: [primary, secondary, accent],
  ).createShader(const Rect.fromLTWH(0, 0, 200, 20));

  static TextStyle get headingFont => GoogleFonts.inter(
        fontWeight: FontWeight.w800,
        letterSpacing: -0.5,
      );

  static TextStyle get bodyFont => GoogleFonts.inter();

  static Color veil(Color base, double opacity) => base.withValues(alpha: opacity);

  static ThemeData darkTheme = ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: bgDark,
    primaryColor: primary,
    colorScheme: const ColorScheme.dark(
      primary: primary,
      secondary: accent,
      surface: surfaceDark,
      error: error,
    ),
    textTheme: GoogleFonts.interTextTheme(const TextTheme(
      headlineLarge: TextStyle(color: textPrimaryDark, fontWeight: FontWeight.w800),
      headlineMedium: TextStyle(color: textPrimaryDark, fontWeight: FontWeight.w700),
      headlineSmall: TextStyle(color: textPrimaryDark, fontWeight: FontWeight.w700),
      titleLarge: TextStyle(color: textPrimaryDark, fontWeight: FontWeight.w700),
      titleMedium: TextStyle(color: textPrimaryDark, fontWeight: FontWeight.w600),
      titleSmall: TextStyle(color: textPrimaryDark, fontWeight: FontWeight.w600),
      bodyLarge: TextStyle(color: textPrimaryDark),
      bodyMedium: TextStyle(color: textSecondaryDark),
      bodySmall: TextStyle(color: textMutedDark),
    )),
    appBarTheme: const AppBarTheme(
      backgroundColor: bgDark,
      elevation: 0,
      iconTheme: IconThemeData(color: textPrimaryDark),
      titleTextStyle: TextStyle(color: textPrimaryDark, fontSize: 20, fontWeight: FontWeight.w700),
    ),
    cardTheme: const CardThemeData(
      color: cardDark,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(16)),
        side: BorderSide(color: borderDark, width: 1),
      ),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: surfaceDark,
      selectedItemColor: primary,
      unselectedItemColor: textMutedDark,
      type: BottomNavigationBarType.fixed,
      elevation: 8,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: surfaceDark,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: borderDark),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: borderDark),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: primary, width: 2),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primary,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        elevation: 4,
        shadowColor: veil(primary, 0.4),
      ),
    ),
    useMaterial3: true,
  );

  static ThemeData lightTheme = ThemeData(
    brightness: Brightness.light,
    scaffoldBackgroundColor: bgLight,
    primaryColor: primary,
    colorScheme: const ColorScheme.light(
      primary: primary,
      secondary: accent,
      surface: surfaceLight,
      error: error,
    ),
    textTheme: GoogleFonts.interTextTheme(const TextTheme(
      headlineLarge: TextStyle(color: textPrimaryLight, fontWeight: FontWeight.w800),
      headlineMedium: TextStyle(color: textPrimaryLight, fontWeight: FontWeight.w700),
      headlineSmall: TextStyle(color: textPrimaryLight, fontWeight: FontWeight.w700),
      titleLarge: TextStyle(color: textPrimaryLight, fontWeight: FontWeight.w700),
      titleMedium: TextStyle(color: textPrimaryLight, fontWeight: FontWeight.w600),
      titleSmall: TextStyle(color: textPrimaryLight, fontWeight: FontWeight.w600),
      bodyLarge: TextStyle(color: textPrimaryLight),
      bodyMedium: TextStyle(color: textSecondaryLight),
      bodySmall: TextStyle(color: textMutedLight),
    )),
    appBarTheme: const AppBarTheme(
      backgroundColor: bgLight,
      elevation: 0,
      iconTheme: IconThemeData(color: textPrimaryLight),
      titleTextStyle: TextStyle(color: textPrimaryLight, fontSize: 20, fontWeight: FontWeight.w700),
    ),
    cardTheme: const CardThemeData(
      color: cardLight,
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(16)),
        side: BorderSide(color: borderLight, width: 1),
      ),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: surfaceLight,
      selectedItemColor: primary,
      unselectedItemColor: textMutedLight,
      type: BottomNavigationBarType.fixed,
      elevation: 8,
    ),
    useMaterial3: true,
  );
}
