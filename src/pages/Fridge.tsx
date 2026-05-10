import { useState } from "react";
import { Refrigerator, Sparkles, Plus, X, ChefHat, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const COMMON = ["Rice", "Dal", "Bread", "Eggs", "Maggi", "Onion", "Tomato", "Curd", "Milk", "Paneer", "Atta", "Potato"];

type Suggestion = {
  dish: string;
  needs: string[];
  addOn: { name: string; price: number };
  steps: string[];
  time: string;
};

const RULES: { ifAny: string[]; out: Suggestion }[] = [
  { ifAny: ["rice", "dal"], out: { dish: "Comforting Dal Khichdi", needs: ["Rice", "Dal", "Ghee", "Cumin"], addOn: { name: "Papad + Pickle Combo", price: 49 }, time: "20 min", steps: ["Wash 1 cup rice + 1/2 cup dal", "Pressure cook with turmeric + salt (3 whistles)", "Temper ghee with cumin + hing, pour over"] } },
  { ifAny: ["maggi"], out: { dish: "Loaded Veg Masala Maggi", needs: ["Maggi", "Onion", "Capsicum", "Cheese"], addOn: { name: "Cheese Slice + Cold Coffee", price: 79 }, time: "10 min", steps: ["Boil 1.5 cups water with veggies", "Add Maggi + tastemaker, cook 2 min", "Top with grated cheese + chilli flakes"] } },
  { ifAny: ["bread", "eggs"], out: { dish: "Bombay Bread Omelette", needs: ["Bread", "Eggs", "Onion", "Green Chili"], addOn: { name: "Masala Chai (250ml)", price: 39 }, time: "8 min", steps: ["Whisk 2 eggs with chopped onion + chilli + salt", "Pour on hot tava, place bread on top", "Flip and toast both sides golden"] } },
  { ifAny: ["paneer"], out: { dish: "Quick Paneer Bhurji Wrap", needs: ["Paneer", "Onion", "Tomato", "Roti/Wrap"], addOn: { name: "Mint Chutney + Lassi", price: 89 }, time: "15 min", steps: ["Sauté onion-tomato with garam masala", "Crumble paneer in, cook 3 min", "Roll in warm roti with chutney"] } },
  { ifAny: ["atta"], out: { dish: "Aloo Paratha Stack", needs: ["Atta", "Potato", "Onion", "Coriander"], addOn: { name: "Curd + Pickle Tray", price: 59 }, time: "25 min", steps: ["Mash boiled aloo with masala", "Stuff in atta dough, roll gently", "Cook on tava with ghee till golden"] } },
  { ifAny: ["curd", "rice"], out: { dish: "South-style Curd Rice", needs: ["Rice", "Curd", "Mustard seeds", "Curry leaves"], addOn: { name: "Gongura Pickle Jar", price: 69 }, time: "12 min", steps: ["Mix cooled rice with chilled curd + salt", "Temper mustard, urad dal, curry leaves", "Mix in and chill 5 min"] } },
];

const FALLBACK: Suggestion = {
  dish: "Hostel Special Veg Pulao",
  needs: ["Rice", "Mixed Veggies", "Ghee", "Whole Spices"],
  addOn: { name: "Boondi Raita + Papad", price: 65 },
  time: "20 min",
  steps: ["Sauté whole spices in ghee", "Add chopped veggies + 1 cup rice", "Pour 2 cups water, cook covered 12 min"],
};

export default function Fridge() {
  const navigate = useNavigate();
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Suggestion | null>(null);

  function addItem(v: string) {
    const x = v.trim();
    if (!x || items.includes(x)) return;
    setItems([...items, x]);
    setInput("");
  }

  function generate() {
    if (items.length === 0) {
      toast({ title: "Add ingredients first", description: "Tap the chips or type what's in your room." });
      return;
    }
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const lower = items.map((i) => i.toLowerCase());
      const matched = RULES.find((r) => r.ifAny.every((k) => lower.some((l) => l.includes(k))));
      const partial = !matched && RULES.find((r) => r.ifAny.some((k) => lower.some((l) => l.includes(k))));
      setResult(matched?.out || partial?.out || FALLBACK);
      setLoading(false);
    }, 900);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <p className="text-sm text-muted-foreground">AI in your room</p>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Refrigerator className="h-6 w-6 text-sky-400" /> Fridge AI
        </h1>
        <p className="text-sm text-muted-foreground">Tell me what's in your hostel room — I'll suggest a dish + what to order.</p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">QUICK ADD</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {COMMON.map((c) => {
              const on = items.includes(c);
              return (
                <button key={c} onClick={() => (on ? setItems(items.filter((i) => i !== c)) : addItem(c))}
                  className={cn("rounded-full border px-3 py-1 text-xs font-semibold transition-all",
                    on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary")}>
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground">CUSTOM</p>
          <div className="mt-2 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addItem(input); }}
              placeholder="e.g. leftover biryani, peanut butter…"
            />
            <Button onClick={() => addItem(input)} variant="outline" className="rounded-xl"><Plus className="h-4 w-4" /></Button>
          </div>
        </div>

        {items.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground">YOUR FRIDGE ({items.length})</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {items.map((i) => (
                <span key={i} className="flex items-center gap-1 rounded-full bg-accent/15 text-accent px-3 py-1 text-xs font-semibold">
                  {i}
                  <button onClick={() => setItems(items.filter((x) => x !== i))}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          </div>
        )}

        <Button onClick={generate} disabled={loading} className="w-full rounded-full bg-gradient-primary">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cooking up ideas…</> : <><Sparkles className="mr-2 h-4 w-4" />Suggest a dish</>}
        </Button>
      </section>

      {result && (
        <section className="rounded-2xl border border-accent/40 bg-card p-5 space-y-4 animate-fade-in shadow-pop">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-accent/15 text-accent"><ChefHat className="h-6 w-6" /></div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase text-accent">AI suggests</p>
              <h2 className="font-display text-xl font-bold">{result.dish}</h2>
              <p className="text-xs text-muted-foreground">~{result.time} · uses what you have</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground">YOU'LL NEED</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.needs.map((n) => (
                <span key={n} className="rounded-full bg-muted px-3 py-1 text-xs">{n}</span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground">QUICK STEPS</p>
            <ol className="mt-2 space-y-1.5 text-sm">
              {result.steps.map((s, i) => (
                <li key={i} className="flex gap-2"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{i + 1}</span>{s}</li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl border border-border bg-background p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Missing the perfect side? Order:</p>
              <p className="font-semibold">{result.addOn.name} — ₹{result.addOn.price}</p>
            </div>
            <Button onClick={() => navigate("/search")} size="sm" className="rounded-full bg-gradient-accent">Order</Button>
          </div>
        </section>
      )}
    </div>
  );
}
