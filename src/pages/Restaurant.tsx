import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Clock, MapPin, Plus, Minus, Leaf, Flame, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { restaurants, menu } from "@/data/mock";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

const tabs = ["Menu", "Reviews", "Info"] as const;

export default function Restaurant() {
  const { id } = useParams();
  const navigate = useNavigate();
  const r = restaurants.find((x) => x.id === id) ?? restaurants[0];
  const [tab, setTab] = useState<(typeof tabs)[number]>("Menu");
  const { lines, add, remove, count, subtotal } = useCart();

  const grouped = menu.reduce<Record<string, typeof menu>>((acc, m) => {
    (acc[m.category] ||= []).push(m);
    return acc;
  }, {});

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr,340px]">
      <div className="min-w-0 space-y-6">
        {/* Banner */}
        <section className="overflow-hidden rounded-2xl bg-card shadow-card">
          <div className="relative aspect-[21/9]">
            <img src={r.img} alt={r.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <h1 className="font-display text-2xl font-bold md:text-3xl">{r.name}</h1>
              <p className="text-sm opacity-90">{r.cuisine}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                <span className="flex items-center gap-1 rounded-md bg-accent px-2 py-1 font-bold">
                  <Star className="h-3 w-3 fill-current" /> {r.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {r.eta}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> 1.2 km · Hostel Block C
                </span>
              </div>
            </div>
          </div>
          {r.offer && (
            <div className="border-t border-dashed border-border bg-primary-soft px-5 py-3 text-sm font-semibold text-primary">
              🎟️ {r.offer} — auto-applied at checkout
            </div>
          )}
        </section>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "relative px-4 py-2.5 text-sm font-semibold transition-colors",
                tab === t ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
              {tab === t && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>

        {tab === "Menu" && (
          <div className="space-y-8">
            {Object.entries(grouped).map(([cat, items]) => (
              <section key={cat}>
                <h2 className="mb-3 font-display text-lg font-semibold">
                  {cat} <span className="text-muted-foreground">· {items.length}</span>
                </h2>
                <div className="space-y-3">
                  {items.map((m) => {
                    const qty = lines.find((l) => l.item.id === m.id)?.qty ?? 0;
                    return (
                      <article
                        key={m.id}
                        className="flex gap-4 rounded-2xl border border-border bg-card p-3 shadow-soft transition-shadow hover:shadow-card"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "grid h-4 w-4 place-items-center border",
                                m.veg ? "border-accent" : "border-destructive",
                              )}
                            >
                              <span
                                className={cn(
                                  "h-2 w-2 rounded-full",
                                  m.veg ? "bg-accent" : "bg-destructive",
                                )}
                              />
                            </span>
                            {m.bestseller && (
                              <span className="rounded-md bg-highlight px-1.5 py-0.5 text-[10px] font-bold uppercase text-highlight-foreground">
                                ★ Bestseller
                              </span>
                            )}
                          </div>
                          <h3 className="mt-1.5 font-display font-semibold">{m.name}</h3>
                          <p className="text-sm font-semibold">₹{m.price}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{m.desc}</p>
                        </div>
                        <div className="relative w-28 shrink-0 sm:w-32">
                          <img
                            src={m.img}
                            alt={m.name}
                            className="aspect-square w-full rounded-xl object-cover"
                          />
                          {qty === 0 ? (
                            <Button
                              size="sm"
                              onClick={() => add(m.id)}
                              className="absolute -bottom-2 left-1/2 h-8 -translate-x-1/2 rounded-lg bg-card px-4 text-xs font-bold text-primary shadow-float ring-1 ring-border hover:bg-primary hover:text-primary-foreground"
                              variant="ghost"
                            >
                              <Plus className="mr-0.5 h-3.5 w-3.5" /> ADD
                            </Button>
                          ) : (
                            <div className="absolute -bottom-2 left-1/2 flex h-8 -translate-x-1/2 items-center gap-2 rounded-lg bg-primary px-2 text-primary-foreground shadow-float">
                              <button onClick={() => remove(m.id)} className="grid h-6 w-6 place-items-center">
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-xs font-bold">{qty}</span>
                              <button onClick={() => add(m.id)} className="grid h-6 w-6 place-items-center">
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {tab === "Reviews" && (
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            <p className="font-display text-lg font-semibold text-foreground">Loved by hostelers</p>
            <ul className="mt-4 space-y-3">
              {[
                { who: "Aarav · Block B", text: "Mac & cheese is unreal. Reliable 18-min delivery every time." },
                { who: "Priya · Block D", text: "Portion sizes feel honest. Great for splitting." },
                { who: "Karan · Block A", text: "Their veg combo under ₹120 is the play before exams." },
              ].map((rev) => (
                <li key={rev.who} className="rounded-xl bg-muted p-3">
                  <div className="flex items-center gap-1 text-xs">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-highlight text-highlight" />
                    ))}
                    <span className="ml-2 font-semibold text-foreground">{rev.who}</span>
                  </div>
                  <p className="mt-1.5 text-foreground">{rev.text}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "Info" && (
          <div className="grid gap-3 rounded-2xl border border-border bg-card p-6 text-sm sm:grid-cols-2">
            <div><p className="text-muted-foreground">Address</p><p className="font-semibold">21, Food Street, Vellore</p></div>
            <div><p className="text-muted-foreground">Hours</p><p className="font-semibold">11:00 – 23:30</p></div>
            <div><p className="text-muted-foreground">Cuisines</p><p className="font-semibold">{r.cuisine}</p></div>
            <div><p className="text-muted-foreground">Avg. cost</p><p className="font-semibold">₹{r.priceFor2} for two</p></div>
          </div>
        )}
      </div>

      {/* Sticky cart panel — desktop */}
      <aside className="hidden lg:block">
        <div className="sticky top-20 rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-primary" />
            <h3 className="font-display font-semibold">Your Cart</h3>
            <span className="ml-auto text-xs text-muted-foreground">{count} items</span>
          </div>
          {lines.length === 0 ? (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Add items to start your order.
            </p>
          ) : (
            <>
              <ul className="mt-4 space-y-3">
                {lines.map((l) => (
                  <li key={l.item.id} className="flex items-start gap-3 text-sm">
                    {l.item.veg ? (
                      <Leaf className="mt-0.5 h-3.5 w-3.5 text-accent" />
                    ) : (
                      <Flame className="mt-0.5 h-3.5 w-3.5 text-destructive" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{l.item.name}</p>
                      <div className="mt-1 inline-flex items-center gap-2 rounded-md border border-border px-1.5 py-0.5 text-xs">
                        <button onClick={() => remove(l.item.id)}><Minus className="h-3 w-3" /></button>
                        <span className="font-bold">{l.qty}</span>
                        <button onClick={() => add(l.item.id)}><Plus className="h-3 w-3" /></button>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">₹{l.qty * l.item.price}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-dashed border-border pt-3 text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-display text-lg font-bold">₹{subtotal}</span>
              </div>
              <Button
                onClick={() => navigate("/cart")}
                className="mt-4 h-11 w-full rounded-xl bg-gradient-primary text-base font-semibold shadow-pop"
              >
                Checkout →
              </Button>
            </>
          )}
        </div>
      </aside>

      {/* Mobile floating view cart */}
      {count > 0 && (
        <button
          onClick={() => navigate("/cart")}
          className="fixed inset-x-4 bottom-20 z-30 flex items-center justify-between rounded-2xl bg-gradient-primary px-5 py-3.5 text-primary-foreground shadow-pop lg:hidden"
        >
          <div className="text-left">
            <p className="text-xs opacity-90">{count} items</p>
            <p className="font-display font-bold">₹{subtotal}</p>
          </div>
          <span className="font-semibold">View Cart →</span>
        </button>
      )}
    </div>
  );
}
