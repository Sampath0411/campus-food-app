import { Search as SearchIcon, Filter, Leaf, Flame, Star, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { restaurants } from "@/data/mock";
import { RestaurantCard } from "@/components/RestaurantCard";
import { cn } from "@/lib/utils";

type Filters = {
  veg: boolean;
  nonVeg: boolean;
  rating4: boolean;
  fastDelivery: boolean;
  under200: boolean;
  under300: boolean;
};

export default function Search() {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Filters>({
    veg: false,
    nonVeg: false,
    rating4: false,
    fastDelivery: false,
    under200: false,
    under300: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      // Search query match
      const matchesQuery = q
        ? r.name.toLowerCase().includes(q.toLowerCase()) ||
          r.cuisine.toLowerCase().includes(q.toLowerCase()) ||
          r.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()))
        : true;

      // Filter matches
      if (filters.veg && !r.tags.includes("Veg")) return false;
      if (filters.nonVeg && !r.tags.includes("Non-veg")) return false;
      if (filters.rating4 && r.rating < 4.0) return false;
      if (filters.fastDelivery && !r.fastDelivery) return false;
      if (filters.under200 && r.priceRange > 200) return false;
      if (filters.under300 && r.priceRange > 300) return false;

      return matchesQuery;
    });
  }, [q, filters]);

  function toggleFilter<K extends keyof Filters>(key: K) {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function clearFilters() {
    setFilters({
      veg: false,
      nonVeg: false,
      rating4: false,
      fastDelivery: false,
      under200: false,
      under300: false,
    });
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">Search</p>
        <h1 className="font-display text-2xl font-bold md:text-3xl">Find your next bite 🔎</h1>
      </header>

      {/* Search input */}
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          placeholder="Search restaurants, dishes, cuisines…"
          className="h-12 rounded-full border-border bg-card pl-11"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* Filter toggle + clear */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={activeFilterCount > 0 ? "default" : "outline"}
            size="sm"
            className={cn(
              "rounded-full",
              activeFilterCount > 0 && "bg-gradient-primary"
            )}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-1.5 h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary-foreground px-1 text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs" onClick={clearFilters}>
              Clear all
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* Filter chips */}
      {showFilters && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => toggleFilter("veg")}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filters.veg
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:border-primary"
              )}
            >
              <Leaf className="h-3.5 w-3.5" /> Veg
            </button>
            <button
              onClick={() => toggleFilter("nonVeg")}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filters.nonVeg
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:border-primary"
              )}
            >
              <Flame className="h-3.5 w-3.5" /> Non-veg
            </button>
            <button
              onClick={() => toggleFilter("rating4")}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filters.rating4
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:border-primary"
              )}
            >
              <Star className="h-3.5 w-3.5" /> 4.0+
            </button>
            <button
              onClick={() => toggleFilter("fastDelivery")}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filters.fastDelivery
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:border-primary"
              )}
            >
              Fast Delivery
            </button>
            <button
              onClick={() => toggleFilter("under200")}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filters.under200
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:border-primary"
              )}
            >
              Under ₹200
            </button>
            <button
              onClick={() => toggleFilter("under300")}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filters.under300
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:border-primary"
              )}
            >
              Under ₹300
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          <RestaurantCard key={r.id} r={r} />
        ))}
      </div>
    </div>
  );
}
