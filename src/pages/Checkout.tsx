import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Smartphone, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/CartContext";
import { openUPIIntent, simulatePayment, isUPIAvailable } from "@/lib/payments";
import { useAuth } from "@/hooks/useAuth";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const cart = useCart();
  const items = cart.lines;
  const total = cart.subtotal;
  const clearCart = () => { /* no-op: cart clearing not implemented */ };

  const [loading, setLoading] = useState(false);
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
      // On mobile: open UPI app directly
      // On desktop: simulate payment (demo mode)
      if (isUPIAvailable()) {
        openUPIIntent({
          upiId: "quickbite@ybl",
          amount: grandTotal,
          name: "QuickBite",
          note: `Order from ${formData.name}`,
        });
        // After UPI payment, user comes back - mark as success
        setTimeout(() => {
          clearCart();
          navigate("/order-success", {
            state: { orderId: `UPI${Date.now()}`, amount: grandTotal },
          });
        }, 3000);
      } else {
        // Desktop demo mode
        const result = await simulatePayment({
          amount: grandTotal,
          name: formData.name,
        });

        if (result.success) {
          clearCart();
          navigate("/order-success", {
            state: { orderId: result.transactionId, amount: grandTotal },
          });
        } else {
          alert(result.error || "Payment failed");
        }
      }
    } catch (err: any) {
      console.error("[Checkout] Payment error:", err);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
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

      {/* Payment Info */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-4 font-semibold">Payment Method</h2>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Smartphone className="h-5 w-5" />
          <span>Pay via UPI (GPay, PhonePe, Paytm, BHIM)</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {isUPIAvailable()
            ? "👍 You're on mobile - UPI app will open automatically"
            : "💻 On desktop? Payment will be simulated for demo"}
        </p>
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
