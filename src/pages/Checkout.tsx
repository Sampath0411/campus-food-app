import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Smartphone, CheckCircle, Loader2, QrCode, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/CartContext";
import { buildUPILink, openUPIIntent, isMobile } from "@/lib/payments";
import { useAuth } from "@/hooks/useAuth";
import { addSpend } from "@/lib/budget";
import { toast } from "@/hooks/use-toast";

const MERCHANT_UPI = "quickbite@ybl";
const MERCHANT_NAME = "QuickBite";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const cart = useCart();
  const items = cart.lines;
  const total = cart.subtotal;

  const [loading, setLoading] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const txnRef = useMemo(() => `QB${Date.now()}`, [qrOpen]);
  const upiLink = buildUPILink({
    upiId: MERCHANT_UPI,
    amount: grandTotal,
    name: MERCHANT_NAME,
    note: `Order ${txnRef}`,
    txnRef,
  });

  function validate() {
    if (!formData.name || !formData.phone || !formData.address || !formData.pincode) {
      toast({ title: "Missing details", description: "Please fill all required fields." });
      return false;
    }
    return true;
  }

  function recordOrder() {
    addSpend(grandTotal, `Order ${txnRef}`);
    navigate("/orders", { state: { orderId: txnRef, amount: grandTotal } });
  }

  function handleMobilePay() {
    if (!validate()) return;
    setLoading(true);
    openUPIIntent({
      upiId: MERCHANT_UPI,
      amount: grandTotal,
      name: MERCHANT_NAME,
      note: `Order ${txnRef}`,
      txnRef,
    });
    // Visibility-change confirms the user came back from the UPI app.
    const onReturn = () => {
      if (document.visibilityState === "visible") {
        document.removeEventListener("visibilitychange", onReturn);
        setLoading(false);
        recordOrder();
      }
    };
    document.addEventListener("visibilitychange", onReturn);
    // Safety fallback in case visibility doesn't trigger
    setTimeout(() => setLoading(false), 15000);
  }

  function handleDesktopPay() {
    if (!validate()) return;
    setQrOpen(true);
  }

  function copyUpi() {
    navigator.clipboard.writeText(MERCHANT_UPI);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

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
      <div>
        <p className="text-sm text-muted-foreground">Checkout</p>
        <h1 className="font-display text-2xl font-bold">Complete your order</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Order Summary */}
        <div className="rounded-2xl border border-border bg-card p-4 md:col-span-2">
          <h2 className="mb-4 font-semibold">Order Summary</h2>
          <div className="space-y-3">
            {items.map(({ item, qty }) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{qty}x</span>
                  <span>{item.name}</span>
                </div>
                <span className="text-muted-foreground">₹{item.price * qty}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-border pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{total}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery Fee</span><span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Platform Fee</span><span>₹{platformFee}</span></div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold"><span>To Pay</span><span>₹{grandTotal}</span></div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-4 font-semibold">Delivery Details</h2>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Full Name *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" className="mt-1 h-9" />
            </div>
            <div>
              <Label className="text-xs">Phone Number *</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="9876543210" type="tel" className="mt-1 h-9" />
            </div>
            <div>
              <Label className="text-xs">Delivery Address *</Label>
              <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Flat no, Building name" className="mt-1 h-9" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Landmark</Label>
                <Input value={formData.landmark} onChange={(e) => setFormData({ ...formData, landmark: e.target.value })} placeholder="Near XYZ" className="mt-1 h-9" />
              </div>
              <div>
                <Label className="text-xs">Pincode *</Label>
                <Input value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} placeholder="530001" className="mt-1 h-9" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-3 font-semibold">Payment Method</h2>
        <div className="flex items-center gap-3 text-sm">
          <Smartphone className="h-5 w-5 text-primary" />
          <span>Pay via UPI — GPay, PhonePe, Paytm, BHIM, Amazon Pay</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {isMobile()
            ? "📱 Your UPI app will open automatically when you tap Pay."
            : "💻 On desktop? Tap Pay to scan a UPI QR code with any UPI app on your phone."}
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2 text-xs">
          <span className="text-muted-foreground">Pay to:</span>
          <span className="font-mono font-semibold">{MERCHANT_UPI}</span>
          <button onClick={copyUpi} className="ml-auto text-primary hover:opacity-70" aria-label="Copy UPI ID">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Pay Button */}
      <div className="sticky bottom-20 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-lg md:bottom-6">
        <div>
          <p className="text-sm text-muted-foreground">Total Amount</p>
          <p className="text-2xl font-bold">₹{grandTotal}</p>
        </div>
        <Button
          onClick={isMobile() ? handleMobilePay : handleDesktopPay}
          disabled={loading}
          className="min-w-[150px] rounded-full bg-gradient-primary text-primary-foreground"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Opening UPI…</>
          ) : isMobile() ? (
            <><CheckCircle className="mr-2 h-4 w-4" />Pay ₹{grandTotal}</>
          ) : (
            <><QrCode className="mr-2 h-4 w-4" />Show UPI QR</>
          )}
        </Button>
      </div>

      {/* Desktop QR overlay */}
      {qrOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/70 p-4 backdrop-blur-sm"
          onClick={() => setQrOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl font-bold">Scan to pay ₹{grandTotal}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Open any UPI app (GPay, PhonePe, Paytm…) and scan this code.
            </p>
            <div className="mt-4 grid place-items-center rounded-2xl bg-background p-4">
              <QRCodeSVG value={upiLink} size={220} includeMargin />
            </div>
            <div className="mt-4 space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">UPI ID</span><span className="font-mono">{MERCHANT_UPI}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Reference</span><span className="font-mono">{txnRef}</span></div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => setQrOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-full bg-gradient-primary"
                onClick={() => { setQrOpen(false); recordOrder(); }}
              >
                I've paid
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
