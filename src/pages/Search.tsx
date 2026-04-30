import { Search as SearchIcon, Filter, Leaf, Flame, Star, MapPin, Globe, X, Sliders, Clock, IndianRupee } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Restaurant } from "@/data/mock";
import { RestaurantCard } from "@/components/RestaurantCard";
import { cn } from "@/lib/utils";
import { RestaurantMap } from "@/components/RestaurantMap";
import { useNearbySearch } from "@/hooks/useNearbySearch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Search() {
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");

  const {
    query,
    setQuery,
    results,
    filters,
    toggleFilter,
    clearFilters,
    activeFilterCount,
    sortBy,
    setSortBy,
    userLocation,
    geo,
    totalResults,
    loading,
  } = useNearbySearch();

  const handleLocationRequest = () => {
    geo.request();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Location banner */}
      {!geo.coords && (
        <div className="rounded-xl border border-border bg-muted/50 p-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm">Enable location for better results</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                See restaurants that deliver to your exact location with accurate ETAs
              </p>
            </div>
            <Button size="sm" onClick={handleLocationRequest} className="rounded-full">
              Enable
            </Button>
          </div>
        </div>
      )}

      {/* Search input with location indicator */}
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search food or restaurants near you…"
          className="h-12 rounded-full border-border bg-card pl-11 pr-12 cursor-text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {geo.coords && (
          <div className="absolute -bottom-6 left-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 text-accent" />
            <span>Showing results near {geo.address?.split(',')[0] || 'your location'}</span>
          </div>
        )}
      </div>

      {/* Sort and Filter controls */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={activeFilterCount > 0 ? "default" : "outline"}
          size="sm"
          className={cn("rounded-full", activeFilterCount > 0 && "bg-gradient-primary")}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="mr-1.5 h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary-foreground px-1 text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {/* Sort dropdown */}
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5">
          <Sliders className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-transparent text-xs font-medium outline-none cursor-pointer"
          >
            <option value="distance">Nearest First</option>
            <option value="rating">Top Rated</option>
            <option value="price">Price: Low to High</option>
            <option value="eta">Fastest Delivery</option>
          </select>
        </div>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" className="text-xs" onClick={clearFilters}>
            Clear all
          </Button>
        )}

        <p className="ml-auto text-sm text-muted-foreground">
          {totalResults} result{totalResults !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filter chips */}
      {showFilters && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => toggleFilter("veg")}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
                filters.veg
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary"
              )}
            >
              <Leaf className="h-3.5 w-3.5" /> Veg
            </button>
            <button
              onClick={() => toggleFilter("nonVeg")}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
                filters.nonVeg
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary"
              )}
            >
              <Flame className="h-3.5 w-3.5" /> Non-veg
            </button>
            <button
              onClick={() => toggleFilter("rating4")}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
                filters.rating4
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary"
              )}
            >
              <Star className="h-3.5 w-3.5" /> 4.0+
            </button>
            <button
              onClick={() => toggleFilter("under200")}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
                filters.under200
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary"
              )}
            >
              <IndianRupee className="h-3.5 w-3.5" /> Under ₹200
            </button>
            <button
              onClick={() => toggleFilter("under300")}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
                filters.under300
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary"
              )}
            >
              <IndianRupee className="h-3.5 w-3.5" /> Under ₹300
            </button>
          </div>
        </div>
      )}

      {/* Map View */}
      {view === "map" && totalResults > 0 && (
        <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <RestaurantMap restaurants={results.map((r) => r.restaurant)} />
        </section>
      )}

      {view === "map" && totalResults === 0 && (
        <div className="grid h-[300px] place-items-center rounded-2xl border border-border bg-card">
          <p className="text-muted-foreground">No restaurants match your search</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4">
              <Skeleton className="h-32 w-full rounded-xl mb-3" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <div className="flex gap-2 mt-3">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List Results with Smart Labels */}
      {!loading && view === "list" && totalResults > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((result) => (
            <div key={result.restaurant.id} className="group">
              <RestaurantCard r={result.restaurant as Restaurant} />
              {/* Smart labels overlay */}
              {result.labels.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {result.labels.slice(0, 4).map((label, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="text-[10px] font-medium bg-muted/80 hover:bg-muted"
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
              {/* Distance and ETA */}
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {result.restaurant.distance.toFixed(1)} km
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {result.restaurant.eta} min
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {view === "list" && totalResults === 0 && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted grid place-items-center mb-4">
            <SearchIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold">No restaurants found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {query
              ? `No matches for "${query}". Try different keywords or clear filters.`
              : "Try adjusting your filters or expand the search radius."}
          </p>
          {query && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Search online instead:</p>
              <div className="mt-2 flex justify-center gap-2">
                <a
                  href={`https://www.zomato.com/vizag/restaurants?q=${encodeURIComponent(query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Globe className="mr-1.5 h-4 w-4" /> Zomato
                  </Button>
                </a>
                <a
                  href={`https://www.swiggy.com/search?query=${encodeURIComponent(query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Globe className="mr-1.5 h-4 w-4" /> Swiggy
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
