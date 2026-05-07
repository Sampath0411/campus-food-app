import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Minus, Tag, Wallet, CreditCard, Smartphone, Banknote, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { addToOrderHistory } from "@/pages/RecentOrders";
import { restaurants } from "@/data/mock";
import { orderStore } from "@/lib/orderStore";
import { addSpend } from "@/lib/budget";

function placeOrderToStore(lines: any[], total: number, payMethod: string, restaurantName: string) {
  const id = "ORD-" + Math.floor(100000 + Math.random() * 899999);
  orderStore.set({
    id,
    restaurant: restaurantName,
    items: lines.map((l) => ({ name: l.item.name, price: l.item.price, qty: l.qty })),
    total,
    payment: payMethod.toUpperCase(),
  });
  addSpend(total, `Order ${id}`);
  addToOrderHistory({
    id,
    restaurantId: "mamas",
    restaurantName,
    items: lines.map((l) => ({ name: l.item.name, price: l.item.price, qty: l.qty })),
    total,
  });
  return id;
}

const methods = [
  { id: "upi",    name: "UPI",            sub: "GPay · PhonePe · Paytm", icon: Smartphone },
  { id: "card",   name: "Credit/Debit",   sub: "Visa · Mastercard · Rupay", icon: CreditCard },
  { id: "wallet", name: "Bytebites Wallet", sub: "Balance ₹240",          icon: Wallet },
  { id: "cod",    name: "Cash on Delivery", sub: "Pay with exact change",  icon: Banknote },
];

export default function Cart() {
  const { lines, add, remove, subtotal, count } = useCart();
  const [pay, setPay] = useState("upi");
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(false);
  const navigate = useNavigate();

  const discount = applied ? 50 : 0;
  const delivery = subtotal > 199 ? 0 : 25;
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + taxes - discount;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
      <div className="min-w-0 space-y-5">
        <header>
          <p className="text-sm text-muted-foreground">Checkout</p>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Your cart ({count})</h1>
        </header>

        {/* Items */}
        <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          {lines.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Your cart is empty. Add some food!</p>
          ) : (
            <ul className="divide-y divide-border">
              {lines.map((l) => (
                <li key={l.item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <img src={l.item.img} alt={l.item.name} className="h-16 w-16 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-semibold leading-tight">{l.item.name}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{l.item.desc}</p>
                    <p className="mt-1 text-sm font-semibold">₹{l.item.price}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <div className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary-soft px-2 py-1 text-primary">
                      <button onClick={() => remove(l.item.id)}><Minus className="h-3.5 w-3.5" /></button>
                      <span className="text-sm font-bold">{l.qty}</span>
                      <button onClick={() => add(l.item.id)}><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <p className="text-sm font-bold">₹{l.qty * l.item.price}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Coupons */}
        <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <h2 className="font-display font-semibold">Apply coupon</h2>
          </div>
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Enter code (try HOSTEL50)"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              className="rounded-xl"
            />
            <Button
              onClick={() => setApplied(true)}
              className="rounded-xl bg-gradient-primary"
              disabled={coupon.trim().length === 0}
            >
              Apply
            </Button>
          </div>
          {applied && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-accent">
              <Check className="h-3.5 w-3.5" /> HOSTEL50 applied — ₹50 off
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {["HOSTEL50", "STUDENT15", "FREESHIP"].map((c) => (
              <button
                key={c}
                onClick={() => { setCoupon(c); setApplied(true); }}
                className="rounded-full border border-dashed border-primary/50 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary-soft"
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        {/* Payment */}
        <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <h2 className="font-display font-semibold">Payment method</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {methods.map((m) => (
              <button
                key={m.id}
                onClick={() => setPay(m.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                  pay === m.id ? "border-primary bg-primary-soft" : "border-border hover:bg-muted",
                )}
              >
                <div className={cn(
                  "grid h-10 w-10 place-items-center rounded-lg",
                  pay === m.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}>
                  <m.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{m.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{m.sub}</p>
                </div>
                {pay === m.id && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Summary */}
      <aside>
        <div className="sticky top-20 rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-display text-lg font-semibold">Bill details</h3>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Item subtotal</dt><dd>₹{subtotal}</dd></div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery fee</dt>
              <dd>{delivery === 0 ? <span className="text-accent">FREE</span> : `₹${delivery}`}</dd>
            </div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Taxes & charges</dt><dd>₹{taxes}</dd></div>
            {discount > 0 && (
              <div className="flex justify-between text-accent"><dt>Coupon discount</dt><dd>− ₹{discount}</dd></div>
            )}
            <div className="flex justify-between border-t border-dashed border-border pt-3 text-base">
              <dt className="font-display font-semibold">To pay</dt>
              <dd className="font-display text-xl font-bold">₹{total}</dd>
            </div>
          </dl>
          <Button
            onClick={() => {
              const restaurant = restaurants[0];
              placeOrderToStore(lines, total, pay, restaurant?.name || "QuickBite");
              navigate("/orders");
            }}
            className="mt-5 h-12 w-full rounded-xl bg-gradient-primary text-base font-semibold shadow-pop"
            disabled={count === 0}
          >
            Place order · ₹{total}
          </Button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            By placing order, you agree to our terms & cancellation policy.
          </p>
        </div>
      </aside>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-surface/95 p-3 backdrop-blur-md lg:hidden">
        <Button
          onClick={() => {
            const restaurant = restaurants[0];
            placeOrderToStore(lines, total, pay, restaurant?.name || "QuickBite");
            navigate("/orders");
          }}
          className="h-12 w-full rounded-xl bg-gradient-primary text-base font-semibold shadow-pop"
          disabled={count === 0}
        >
          Place order · ₹{total}
        </Button>
      </div>
    </div>
  );
}
