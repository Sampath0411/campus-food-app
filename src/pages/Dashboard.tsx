import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Flame, Leaf, Star, Moon } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { aiPicks, categories, restaurants } from "@/data/mock";
import { RestaurantCard } from "@/components/RestaurantCard";
import { RestaurantCardSkeleton } from "@/components/RestaurantCardSkeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";

const filterChips = ["Filter", "Sort by", "Fast Delivery", "Rating 4.0+", "Pure Veg", "Offers", "₹100–300"];

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [budget, setBudget] = useState([200]);
  const [active, setActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const userName = user?.name?.split(' ')[0] || 'there';

  // Skeleton on mount
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Late-night detection (>= 22:00 or < 5:00)
  const hour = new Date().getHours();
  const isLateNight = hour >= 22 || hour < 5;
  const lateNightSpots = restaurants.filter((r) => r.open24);

  const greeting =
    hour < 12 ? t("dash.greetingMorning") : hour < 17 ? t("dash.greetingAfternoon") : t("dash.greetingEvening");

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Greeting */}
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <h1 className="font-display text-3xl font-bold md:text-4xl flex items-center gap-2">
            {userName} <Sparkles className="h-7 w-7 text-yellow-400 animate-soft-pulse" />
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("dash.tagline")}</p>
        </div>
        <Button className="rounded-full bg-gradient-primary text-primary-foreground shadow-pop">
          <Sparkles className="mr-1.5 h-4 w-4" /> {t("dash.reorder")}
        </Button>
      </section>

      {/* Late-night banner */}
      {isLateNight && (
        <section className="overflow-hidden rounded-2xl border border-border bg-foreground p-5 text-background shadow-card animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-highlight/20 text-highlight">
              <Moon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-lg font-bold">{t("dash.lateNight")}</h2>
              <p className="mt-1 text-sm opacity-80">{t("dash.lateNightDesc")}</p>
              <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 hide-scrollbar">
                {lateNightSpots.slice(0, 5).map((r) => (
                  <span
                    key={r.id}
                    className="shrink-0 rounded-full border border-background/20 bg-background/10 px-3 py-1 text-xs font-medium"
                  >
                    {r.name} • {r.eta}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* AI carousel */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">{t("dash.aiPicks")}</h2>
          <button className="flex items-center gap-1 text-xs font-semibold text-primary">
            {t("dash.seeAll")} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar md:mx-0 md:px-0">
          {aiPicks.map((p, i) => {
            const Icon = p.icon;
            return (
              <article
                key={i}
                className={cn(
                  "min-w-[260px] shrink-0 rounded-2xl p-4 shadow-card transition-transform hover:-translate-y-1 md:min-w-[280px]",
                  p.tone === "primary" && "bg-gradient-primary text-primary-foreground",
                  p.tone === "accent" && "bg-gradient-accent text-accent-foreground",
                  p.tone === "dark" && "bg-foreground text-background",
                )}
              >
                <div className="grid h-10 w-10 place-items-center rounded-full bg-background/15 backdrop-blur">
                  <Icon className={cn("h-5 w-5", p.iconColor)} />
                </div>
                <h3 className="mt-3 font-display text-base font-bold leading-tight">{p.title}</h3>
                <p className="mt-1 text-xs opacity-90">{p.subtitle}</p>
                <Button size="sm" variant="secondary" className="mt-3 h-8 rounded-full text-xs">
                  Show meals
                </Button>
              </article>
            );
          })}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">{t("dash.categories")}</h2>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 hide-scrollbar md:mx-0 md:flex-wrap md:px-0">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.name}
                onClick={() => setActive(active === c.name ? null : c.name)}
                className={cn(
                  "flex shrink-0 flex-col items-center gap-1.5 rounded-2xl border bg-card px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-card",
                  active === c.name ? "border-primary ring-2 ring-primary/30" : "border-border",
                )}
              >
                <Icon className={cn("h-6 w-6", c.color)} />
                <span className="text-xs font-semibold">{c.name}</span>
              </button>
            );
          })}
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
              <span className="font-semibold">{t("dash.budget")}</span>
              <span className="text-primary">{t("dash.upTo")} ₹{budget[0]}</span>
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
          <h2 className="font-display text-xl font-semibold">{restaurants.length} {t("dash.nearYou")}</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <RestaurantCardSkeleton key={i} />)
            : restaurants.map((r) => <RestaurantCard key={r.id} r={r} />)}
        </div>
      </section>
    </div>
  );
}
