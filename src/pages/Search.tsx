import { Search as SearchIcon, Filter, Leaf, Flame, Star, MapPin, Globe, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { restaurants, Restaurant } from "@/data/mock";
import { RestaurantCard } from "@/components/RestaurantCard";
import { cn } from "@/lib/utils";
import { RestaurantMap } from "@/components/RestaurantMap";

type Filters = {
  veg: boolean;
  nonVeg: boolean;
  rating4: boolean;
  under200: boolean;
  under300: boolean;
};

// Add coordinates to restaurants for map
const restaurantsWithCoords = restaurants.map((r) => ({
  ...r,
  lat: 17.6868 + (Math.random() - 0.5) * 0.08,
  lng: 83.2185 + (Math.random() - 0.5) * 0.08,
}));

export default function Search() {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Filters>({
    veg: false,
    nonVeg: false,
    rating4: false,
    under200: false,
    under300: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const filtered = useMemo(() => {
    return restaurantsWithCoords.filter((r) => {
      if (!q.trim()) return true;

      const matchesQuery =
        r.name.toLowerCase().includes(q.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(q.toLowerCase()) ||
        r.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()));

      if (!matchesQuery) return false;
      if (filters.veg && !r.tags.includes("Veg")) return false;
      if (filters.nonVeg && !r.tags.includes("Non-veg")) return false;
      if (filters.rating4 && r.rating < 4.0) return false;
      if (filters.under200 && r.priceFor2 > 200) return false;
      if (filters.under300 && r.priceFor2 > 300) return false;

      return true;
    });
  }, [q, filters]);

  function toggleFilter<K extends keyof Filters>(key: K) {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function clearFilters() {
    setFilters({ veg: false, nonVeg: false, rating4: false, under200: false, under300: false });
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Search</p>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Find your next bite 🔎</h1>
        </div>
        <div className="flex gap-2">
          <Button variant={view === "list" ? "default" : "outline"} size="sm" className="rounded-full" onClick={() => setView("list")}>
            List
          </Button>
          <Button variant={view === "map" ? "default" : "outline"} size="sm" className="rounded-full" onClick={() => setView("map")}>
            <MapPin className="mr-1.5 h-4 w-4" /> Map
          </Button>
        </div>
      </header>

      {/* Search input */}
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          placeholder="Try 'biryani', 'pizza', 'veg'..."
          className="h-12 rounded-full border-border bg-card pl-11"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {q && (
          <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant={activeFilterCount > 0 ? "default" : "outline"} size="sm" className={cn("rounded-full", activeFilterCount > 0 && "bg-gradient-primary")} onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-1.5 h-4 w-4" /> Filters {activeFilterCount > 0 && <span className="ml-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary-foreground px-1 text-[10px] font-bold">{activeFilterCount}</span>}
          </Button>
          {activeFilterCount > 0 && <Button variant="ghost" size="sm" className="text-xs" onClick={clearFilters}>Clear all</Button>}
        </div>
        <p className="text-sm text-muted-foreground">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Filter chips */}
      {showFilters && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => toggleFilter("veg")} className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium", filters.veg ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary")}>
              <Leaf className="h-3.5 w-3.5" /> Veg
            </button>
            <button onClick={() => toggleFilter("nonVeg")} className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium", filters.nonVeg ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary")}>
              <Flame className="h-3.5 w-3.5" /> Non-veg
            </button>
            <button onClick={() => toggleFilter("rating4")} className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium", filters.rating4 ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary")}>
              <Star className="h-3.5 w-3.5" /> 4.0+
            </button>
            <button onClick={() => toggleFilter("under200")} className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium", filters.under200 ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary")}>
              Under ₹200
            </button>
            <button onClick={() => toggleFilter("under300")} className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium", filters.under300 ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary")}>
              Under ₹300
            </button>
          </div>
        </div>
      )}

      {/* Map View */}
      {view === "map" && filtered.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <RestaurantMap restaurants={filtered} />
        </section>
      )}

      {view === "map" && filtered.length === 0 && (
        <div className="grid h-[300px] place-items-center rounded-2xl border border-border bg-card">
          <p className="text-muted-foreground">No restaurants match your search</p>
        </div>
      )}

      {/* List Results */}
      {view === "list" && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <RestaurantCard key={r.id} r={r as Restaurant} />
          ))}
        </div>
      )}

      {view === "list" && filtered.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-lg font-semibold">No restaurants found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try different keywords or clear filters</p>
          {q && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Search online instead:</p>
              <div className="mt-2 flex justify-center gap-2">
                <a href={`https://www.zomato.com/vizag/restaurants?q=${encodeURIComponent(q)}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="rounded-full"><Globe className="mr-1.5 h-4 w-4" /> Zomato</Button>
                </a>
                <a href={`https://www.swiggy.com/search?query=${encodeURIComponent(q)}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="rounded-full"><Globe className="mr-1.5 h-4 w-4" /> Swiggy</Button>
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
