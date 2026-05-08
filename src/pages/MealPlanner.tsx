import { useState } from "react";
import { Sparkles, Loader2, Wallet, Flame, Leaf, RefreshCw, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { menu, MenuItem } from "@/data/mock";
import { useCart } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";

type Diet = "any" | "veg" | "high-protein";
type DayPlan = {
  day: string;
  breakfast: MenuItem;
  lunch: MenuItem;
  dinner: MenuItem;
  total: number;
  calories: number;
  protein: number;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Mock calorie/protein tags — deterministic from price + veg flag.
function nutrition(item: MenuItem) {
  const base = Math.round(item.price * 1.6);
  const protein = item.veg ? Math.round(item.price * 0.08) : Math.round(item.price * 0.13);
  return { calories: base, protein };
}

function pickFor(budget: number, diet: Diet): DayPlan[] {
  let pool = [...menu];
  if (diet === "veg") pool = pool.filter((m) => m.veg);
  if (diet === "high-protein") pool = pool.filter((m) => !m.veg || m.name.toLowerCase().includes("paneer"));

  const perDay = budget / 7;
  const plans: DayPlan[] = [];

  for (let i = 0; i < 7; i++) {
    // Try a few times to land under perDay, otherwise pick the cheapest combo.
    let best: { combo: MenuItem[]; total: number } | null = null;
    for (let attempt = 0; attempt < 30; attempt++) {
      const b = pool[Math.floor(Math.random() * pool.length)];
      const l = pool[Math.floor(Math.random() * pool.length)];
      const d = pool[Math.floor(Math.random() * pool.length)];
      const total = b.price + l.price + d.price;
      if (total <= perDay) { best = { combo: [b, l, d], total }; break; }
      if (!best || total < best.total) best = { combo: [b, l, d], total };
    }
    const [breakfast, lunch, dinner] = best!.combo;
    const nb = nutrition(breakfast), nl = nutrition(lunch), nd = nutrition(dinner);
    plans.push({
      day: DAYS[i],
      breakfast, lunch, dinner,
      total: best!.total,
      calories: nb.calories + nl.calories + nd.calories,
      protein: nb.protein + nl.protein + nd.protein,
    });
  }
  return plans;
}

export default function MealPlanner() {
  const [budget, setBudget] = useState<number>(1500);
  const [diet, setDiet] = useState<Diet>("any");
  const [plan, setPlan] = useState<DayPlan[] | null>(null);
  const [loading, setLoading] = useState(false);
  const cart = useCart();

  function generate() {
    setLoading(true);
    setPlan(null);
    // Simulate AI thinking
    setTimeout(() => {
      setPlan(pickFor(budget, diet));
      setLoading(false);
    }, 900);
  }

  const grandTotal = plan?.reduce((s, p) => s + p.total, 0) ?? 0;
  const avgCalories = plan ? Math.round(plan.reduce((s, p) => s + p.calories, 0) / 7) : 0;
  const avgProtein = plan ? Math.round(plan.reduce((s, p) => s + p.protein, 0) / 7) : 0;
  const overBudget = grandTotal > budget;

  function addDayToCart(d: DayPlan) {
    [d.breakfast, d.lunch, d.dinner].forEach((it) => cart.add(it.id));
    toast({ title: `${d.day} added to cart`, description: `3 meals · ₹${d.total}` });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Meal Planner
        </p>
        <h1 className="font-display text-2xl font-bold md:text-3xl">Plan your week, on a budget</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell me your budget and diet — I'll plan 21 balanced meals across 7 days.
        </p>
      </header>

      {/* Controls */}
      <section className="rounded-2xl border border-border bg-gradient-hero p-5 shadow-soft">
        <div className="grid gap-4 md:grid-cols-[1fr,auto,auto] md:items-end">
          <div>
            <Label htmlFor="bud" className="text-xs">Weekly budget (₹)</Label>
            <div className="mt-1 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              <Input
                id="bud"
                type="number"
                value={budget}
                min={500}
                max={10000}
                step={100}
                onChange={(e) => setBudget(Number(e.target.value) || 0)}
                className="h-10 rounded-xl bg-background text-foreground placeholder:text-muted-foreground border-border"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[1000, 1500, 2000, 3000].map((b) => (
                <button
                  key={b}
                  onClick={() => setBudget(b)}
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-all ${
                    budget === b
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary hover:bg-muted"
                  }`}
                >
                  ₹{b}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs">Diet</Label>
            <ToggleGroup
              type="single"
              value={diet}
              onValueChange={(v) => v && setDiet(v as Diet)}
              size="sm"
              className="mt-1"
            >
              <ToggleGroupItem value="any" className="text-xs">Any</ToggleGroupItem>
              <ToggleGroupItem value="veg" className="text-xs">Veg</ToggleGroupItem>
              <ToggleGroupItem value="high-protein" className="text-xs">High-protein</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <Button
            onClick={generate}
            disabled={loading || !budget}
            className="h-10 rounded-xl bg-gradient-primary shadow-pop"
          >
            {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
            {plan ? "Re-plan" : "Generate plan"}
          </Button>
        </div>
      </section>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-border bg-muted/40" />
          ))}
        </div>
      )}

      {/* Results */}
      {plan && !loading && (
        <>
          {/* Summary banner */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="grid gap-3 md:grid-cols-4">
              <Stat label="Weekly total" value={`₹${grandTotal}`} highlight={overBudget ? "bad" : "good"} />
              <Stat label="Budget" value={`₹${budget}`} />
              <Stat label="Avg calories/day" value={`${avgCalories} kcal`} icon={<Flame className="h-3.5 w-3.5" />} />
              <Stat label="Avg protein/day" value={`${avgProtein} g`} icon={<Leaf className="h-3.5 w-3.5" />} />
            </div>
            {overBudget && (
              <p className="mt-3 text-xs text-destructive">
                Slightly over budget — try a higher budget or switch to "Veg" for cheaper picks.
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="rounded-full" onClick={generate}>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Shuffle
              </Button>
              <Button
                size="sm"
                className="rounded-full bg-gradient-accent text-accent-foreground"
                onClick={() => {
                  plan.forEach((d) => [d.breakfast, d.lunch, d.dinner].forEach((it) => cart.add(it.id)));
                  toast({ title: "Whole week added", description: `21 meals · ₹${grandTotal}` });
                }}
              >
                <ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> Add full week to cart
              </Button>
            </div>
          </section>

          {/* Day cards */}
          <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {plan.map((d) => (
              <article
                key={d.day}
                className="rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
              >
                <header className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold">{d.day}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">₹{d.total}</span>
                </header>
                <ul className="mt-3 space-y-2 text-sm">
                  <Meal label="Breakfast" item={d.breakfast} />
                  <Meal label="Lunch" item={d.lunch} />
                  <Meal label="Dinner" item={d.dinner} />
                </ul>
                <div className="mt-3 flex items-center justify-between border-t border-dashed border-border pt-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Flame className="h-3 w-3" /> {d.calories} kcal</span>
                  <span className="flex items-center gap-1"><Leaf className="h-3 w-3" /> {d.protein}g protein</span>
                </div>
                <Button size="sm" variant="outline" className="mt-3 w-full rounded-xl" onClick={() => addDayToCart(d)}>
                  Add {d.day} to cart
                </Button>
              </article>
            ))}
          </section>
        </>
      )}

      {!plan && !loading && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 font-display font-semibold">Set your budget and tap Generate plan</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Mock AI picks 21 meals balanced across calories, protein and price.
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({
  label, value, icon, highlight,
}: { label: string; value: string; icon?: React.ReactNode; highlight?: "good" | "bad" }) {
  return (
    <div className="rounded-xl bg-muted/40 p-3">
      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">{icon}{label}</p>
      <p className={`mt-1 font-display text-lg font-bold ${
        highlight === "bad" ? "text-destructive" : highlight === "good" ? "text-accent" : ""
      }`}>{value}</p>
    </div>
  );
}

function Meal({ label, item }: { label: string; item: MenuItem }) {
  return (
    <li className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate font-medium">{item.name}</p>
      </div>
      <span className="shrink-0 text-xs font-semibold">₹{item.price}</span>
    </li>
  );
}
