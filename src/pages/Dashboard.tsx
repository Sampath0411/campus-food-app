import { useState } from "react";
import { Sparkles, ArrowRight, Flame, Leaf, Star } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { aiPicks, categories, restaurants } from "@/data/mock";
import { RestaurantCard } from "@/components/RestaurantCard";
import { cn } from "@/lib/utils";

const filterChips = ["Filter", "Sort by", "Fast Delivery", "Rating 4.0+", "Pure Veg", "Offers", "₹100–300"];

export default function Dashboard() {
  const [budget, setBudget] = useState([200]);
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Good evening</p>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Sampath <span className="inline-block animate-soft-pulse">👋</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            What's the move tonight? Your AI picked 6 meals under ₹150.
          </p>
        </div>
        <Button className="rounded-full bg-gradient-primary text-primary-foreground shadow-pop">
          <Sparkles className="mr-1.5 h-4 w-4" /> Reorder usual
        </Button>
      </section>

      {/* AI carousel */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">AI Picks for you</h2>
          <button className="flex items-center gap-1 text-xs font-semibold text-primary">
            See all <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar md:mx-0 md:px-0">
          {aiPicks.map((p, i) => (
            <article
              key={i}
              className={cn(
                "min-w-[260px] shrink-0 rounded-2xl p-4 shadow-card md:min-w-[280px]",
                p.tone === "primary" && "bg-gradient-primary text-primary-foreground",
                p.tone === "accent" && "bg-gradient-accent text-accent-foreground",
                p.tone === "dark" && "bg-foreground text-background",
              )}
            >
              <div className="text-2xl">{p.emoji}</div>
              <h3 className="mt-2 font-display text-base font-bold leading-tight">{p.title}</h3>
              <p className="mt-1 text-xs opacity-90">{p.subtitle}</p>
              <Button size="sm" variant="secondary" className="mt-3 h-8 rounded-full text-xs">
                Show meals
              </Button>
            </article>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">What's on your mind?</h2>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 hide-scrollbar md:mx-0 md:flex-wrap md:px-0">
          {categories.map((c) => (
            <button
              key={c.name}
              onClick={() => setActive(active === c.name ? null : c.name)}
              className={cn(
                "flex shrink-0 flex-col items-center gap-1.5 rounded-2xl border bg-card px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-card",
                active === c.name ? "border-primary ring-2 ring-primary/30" : "border-border",
              )}
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-xs font-semibold">{c.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          {filterChips.map((f) => (
            <button
              key={f}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary"
            >
              {f}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold">Budget</span>
              <span className="text-primary">Up to ₹{budget[0]}</span>
            </div>
            <Slider value={budget} onValueChange={setBudget} max={500} min={50} step={10} />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2 text-xs font-semibold hover:border-accent hover:text-accent">
              <Leaf className="h-3.5 w-3.5" /> Veg
            </button>
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2 text-xs font-semibold hover:border-primary hover:text-primary">
              <Flame className="h-3.5 w-3.5" /> Non-veg
            </button>
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2 text-xs font-semibold hover:border-highlight hover:text-highlight-foreground">
              <Star className="h-3.5 w-3.5" /> 4.0+
            </button>
          </div>
        </div>
      </section>

      {/* Restaurant grid */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">{restaurants.length} restaurants near you</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} r={r} />
          ))}
        </div>
      </section>
    </div>
  );
}
