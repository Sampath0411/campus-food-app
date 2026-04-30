import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Smartphone, Building, CheckCircle, Loader2, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/CartContext";
import { initiateUPIPayment, openUPIIntent } from "@/lib/payments";
import { useAuth } from "@/hooks/useAuth";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: "",
    address: "",
    landmark: "",
    pincode: "",
  });

  const deliveryFee = total > 300 ? 0 : 30;
  const platformFee = 5;
  const grandTotal = total + deliveryFee + platformFee;

  const handlePayment = async () => {
    // Validate form
    if (!formData.name || !formData.phone || !formData.address || !formData.pincode) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // For demo: use UPI intent or Razorpay
      const paymentResult = await initiateUPIPayment({
        amount: grandTotal * 100, // Convert to paise
        name: "QuickBite Order",
        description: `Food order for ${formData.name}`,
        prefill: {
          name: formData.name,
          contact: formData.phone,
        },
      });

      if (paymentResult.success) {
        // Save order to Supabase
        // TODO: Add order saving logic here

        clearCart();
        navigate("/order-success", {
          state: {
            orderId: paymentResult.razorpay_payment_id,
            amount: grandTotal,
          },
        });
      } else {
        alert(paymentResult.error || "Payment failed");
      }
    } catch (err: any) {
      console.error("[Checkout] Payment error:", err);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDirectUPI = () => {
    // Direct UPI intent for mobile users
    openUPIIntent({
      upiId: "quickbite@ybl", // Your merchant UPI ID
      amount: grandTotal,
      name: "QuickBite",
      note: `Order from ${formData.name}`,
    });
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold">Your cart is empty</p>
        <Button onClick={() => navigate("/search")}>Browse Restaurants</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 pb-28 md:px-8">
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground">Checkout</p>
        <h1 className="font-display text-2xl font-bold">Complete your order</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Order Summary */}
        <div className="rounded-2xl border border-border bg-card p-4 md:col-span-2">
          <h2 className="mb-4 font-semibold">Order Summary</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.quantity}x</span>
                  <span>{item.name}</span>
                </div>
                <span className="text-muted-foreground">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-border pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Fee</span>
              <span>₹{platformFee}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold">
              <span>To Pay</span>
              <span>₹{grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-4 font-semibold">Delivery Details</h2>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Full Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="mt-1 h-9"
              />
            </div>
            <div>
              <Label className="text-xs">Phone Number *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9876543210"
                type="tel"
                className="mt-1 h-9"
              />
            </div>
            <div>
              <Label className="text-xs">Delivery Address *</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Flat no, Building name"
                className="mt-1 h-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Landmark</Label>
                <Input
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="Near XYZ"
                  className="mt-1 h-9"
                />
              </div>
              <div>
                <Label className="text-xs">Pincode *</Label>
                <Input
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="530001"
                  className="mt-1 h-9"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-4 font-semibold">Payment Method</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <button
            onClick={() => setPaymentMethod("upi")}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
              paymentMethod === "upi"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary"
            }`}
          >
            <Smartphone className="h-6 w-6" />
            <span className="text-sm font-medium">UPI</span>
            <span className="text-xs text-muted-foreground">GPay, PhonePe, Paytm</span>
          </button>
          <button
            onClick={() => setPaymentMethod("card")}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
              paymentMethod === "card"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary"
            }`}
          >
            <CreditCard className="h-6 w-6" />
            <span className="text-sm font-medium">Card</span>
            <span className="text-xs text-muted-foreground">Debit/Credit</span>
          </button>
          <button
            onClick={() => setPaymentMethod("netbanking")}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
              paymentMethod === "netbanking"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary"
            }`}
          >
            <Building className="h-6 w-6" />
            <span className="text-sm font-medium">Net Banking</span>
            <span className="text-xs text-muted-foreground">All Banks</span>
          </button>
        </div>

        {paymentMethod === "upi" && (
          <div className="mt-4 flex items-center justify-between rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Pay via UPI App</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleDirectUPI} className="rounded-full">
              Open UPI App
            </Button>
          </div>
        )}
      </div>

      {/* Pay Button */}
      <div className="sticky bottom-20 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-lg md:bottom-6">
        <div>
          <p className="text-sm text-muted-foreground">Total Amount</p>
          <p className="text-2xl font-bold">₹{grandTotal}</p>
        </div>
        <Button
          onClick={handlePayment}
          disabled={loading}
          className="min-w-[150px] rounded-full bg-gradient-primary text-primary-foreground"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Pay ₹{grandTotal}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
