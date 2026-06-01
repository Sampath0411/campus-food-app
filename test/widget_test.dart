import 'package:flutter_test/flutter_test.dart';
import 'package:campus_grub_hub/main.dart';

void main() {
  testWidgets('App loads', (WidgetTester tester) async {
    await tester.pumpWidget(const QuickBiteApp());
    await tester.pumpAndSettle();
  });
}
