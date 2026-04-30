import { Search as SearchIcon, Filter, Leaf, Flame, Star, MapPin, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { restaurants } from "@/data/mock";
import { RestaurantCard } from "@/components/RestaurantCard";
import { cn } from "@/lib/utils";
import { RestaurantMap } from "@/components/RestaurantMap";

type Filters = {
  veg: boolean;
  nonVeg: boolean;
  rating4: boolean;
  fastDelivery: boolean;
  under200: boolean;
  under300: boolean;
};

// Mock data with coordinates for map
const restaurantsWithCoords = restaurants.map((r, i) => ({
  ...r,
  lat: 17.6868 + (Math.random() - 0.5) * 0.1,
  lng: 83.2185 + (Math.random() - 0.5) * 0.1,
}));

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
  const [view, setView] = useState<"list" | "map">("list");

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const filtered = useMemo(() => {
    return restaurantsWithCoords.filter((r) => {
      const matchesQuery = q
        ? r.name.toLowerCase().includes(q.toLowerCase()) ||
          r.cuisine.toLowerCase().includes(q.toLowerCase()) ||
          r.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()))
        : true;

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
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Search</p>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Find your next bite 🔎</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setView("list")}
          >
            List
          </Button>
          <Button
            variant={view === "map" ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setView("map")}
          >
            <MapPin className="mr-1.5 h-4 w-4" /> Map
          </Button>
        </div>
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
        {q && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            Press Enter to search online
          </div>
        )}
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

      {/* Map View */}
      {view === "map" && (
        <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <RestaurantMap restaurants={filtered} />
        </section>
      )}

      {/* Results */}
      {view === "list" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <RestaurantCard key={r.id} r={r} />
          ))}
        </div>
      )}

      {/* Online search suggestion */}
      {q.length > 2 && (
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Looking for "{q}"? Try these nearby options above, or search on:
          </p>
          <div className="mt-3 flex justify-center gap-2">
            <a
              href={`https://www.zomato.com/vizag/restaurants?q=${encodeURIComponent(q)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="rounded-full">
                <Globe className="mr-1.5 h-4 w-4" /> Search on Zomato
              </Button>
            </a>
            <a
              href={`https://www.swiggy.com/search?query=${encodeURIComponent(q)}&sortBy=RELEVANCE&page=1&offset=0&latitude=17.686815&longitude=83.2184757`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="rounded-full">
                <Globe className="mr-1.5 h-4 w-4" /> Search on Swiggy
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
