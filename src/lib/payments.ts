// UPI Payment - Direct UPI Intent (No Razorpay)
// Works on mobile: Opens GPay, PhonePe, Paytm, BHIM apps directly

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

// Direct UPI Intent for mobile
export function openUPIIntent(options: {
  upiId: string;
  amount: number;
  name: string;
  note?: string;
}): void {
  const upiLink = `upi://pay?pa=${options.upiId}&pn=${encodeURIComponent(options.name)}&am=${options.amount}&cu=INR${options.note ? `&tn=${encodeURIComponent(options.note)}` : ""}`;
  window.location.href = upiLink;
}

// Check if UPI apps are available (Android only)
export function isUPIAvailable(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes("android") && (ua.includes("chrome") || ua.includes("firefox"));
}

// Simulate payment for demo (no real payment gateway)
export async function simulatePayment(options: {
  amount: number;
  name: string;
}): Promise<PaymentResult> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // For demo: always succeed
  // In production, integrate with actual payment gateway
  return {
    success: true,
    transactionId: `TXN${Date.now()}`,
  };
}
