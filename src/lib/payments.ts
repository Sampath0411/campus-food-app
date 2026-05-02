// Real UPI Payments — direct UPI intent on mobile, scannable UPI QR on desktop.
// No third-party gateway, no Razorpay. Works with GPay, PhonePe, Paytm, BHIM, etc.

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface UPIPaymentOptions {
  upiId: string;
  amount: number;
  name: string;
  note?: string;
  txnRef?: string;
}

// Build a standards-compliant UPI deep link (NPCI spec).
// Works as a QR payload AND as an `upi://` deep link.
export function buildUPILink(opts: UPIPaymentOptions): string {
  const params = new URLSearchParams({
    pa: opts.upiId,
    pn: opts.name,
    am: opts.amount.toFixed(2),
    cu: "INR",
  });
  if (opts.note) params.set("tn", opts.note);
  if (opts.txnRef) params.set("tr", opts.txnRef);
  return `upi://pay?${params.toString()}`;
}

// Open the UPI intent on the user's device. Mobile: launches the user's
// UPI app picker. Desktop browsers will typically ignore this scheme — the
// caller should fall back to showing the QR via `buildUPILink`.
export function openUPIIntent(options: UPIPaymentOptions): void {
  const link = buildUPILink(options);
  window.location.href = link;
}

export function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
}

// Backward-compat alias used elsewhere in the codebase.
export function isUPIAvailable(): boolean {
  return isMobile();
}
