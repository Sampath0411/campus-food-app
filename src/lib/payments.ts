// UPI Payment Integration using Razorpay
// Supports: GPay, PhonePe, Paytm, BHIM, Any UPI App

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentOptions {
  amount: number; // in paise (₹100 = 10000 paise)
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

export interface PaymentResult {
  success: boolean;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  error?: string;
}

// Load Razorpay script dynamically
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Create order using Supabase Edge Function
async function createOrder(amount: number): Promise<{ order_id: string }> | null {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${supabaseUrl}/functions/v1/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) throw new Error(`Order creation failed: ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error("[Payment] Order creation failed:", err);
    return null;
  }
}

// Verify payment using Supabase Edge Function
async function verifyPayment(
  paymentId: string,
  orderId: string,
  signature: string
): Promise<boolean> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${supabaseUrl}/functions/v1/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ payment_id: paymentId, order_id: orderId, signature }),
    });

    const data = await response.json();
    return data.verified === true;
  } catch (err) {
    console.error("[Payment] Verification failed:", err);
    return false;
  }
}

export async function initiateUPIPayment(options: PaymentOptions): Promise<PaymentResult> {
  // Load Razorpay SDK
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    return { success: false, error: "Payment gateway failed to load" };
  }

  // Create order
  const order = await createOrder(options.amount);
  if (!order) {
    return { success: false, error: "Failed to create payment order" };
  }

  return new Promise((resolve) => {
    const razorpayOptions = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use environment variable
      amount: options.amount,
      currency: "INR",
      name: options.name,
      description: options.description,
      order_id: order.order_id,
      prefill: options.prefill,
      theme: {
        color: "#6366f1", // Your brand color
      },
      method: {
        upi: true,
        card: false,
        netbanking: false,
        wallet: false,
      },
      handler: async (response: any) => {
        // Payment successful
        const verified = await verifyPayment(
          response.razorpay_payment_id,
          response.razorpay_order_id,
          response.razorpay_signature
        );

        if (verified) {
          resolve({
            success: true,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
        } else {
          resolve({ success: false, error: "Payment verification failed" });
        }
      },
      modal: {
        ondismiss: () => {
          resolve({ success: false, error: "Payment cancelled by user" });
        },
      },
    };

    try {
      const paymentObject = new window.Razorpay(razorpayOptions);
      paymentObject.open();
    } catch (err: any) {
      resolve({ success: false, error: err.message || "Payment failed" });
    }
  });
}

// Direct UPI Intent (fallback for mobile)
export function openUPIIntent(options: {
  upiId: string;
  amount: number;
  name: string;
  note?: string;
}): void {
  const upiLink = `upi://pay?pa=${options.upiId}&pn=${encodeURIComponent(options.name)}&am=${options.amount}&cu=INR${options.note ? `&tn=${encodeURIComponent(options.note)}` : ""}`;

  // Try to open UPI app
  window.location.href = upiLink;
}

// Check if UPI apps are available (Android only)
export function isUPIAvailable(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes("android") && (ua.includes("chrome") || ua.includes("firefox"));
}
