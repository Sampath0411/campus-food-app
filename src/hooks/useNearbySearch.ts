import { useState, useEffect, useMemo, useCallback } from "react";
import { useGeolocation, haversineKm, GeoCoord } from "./useGeolocation";
import { restaurants, Restaurant, menu, MenuItem } from "@/data/mock";

type SearchFilters = {
  veg: boolean;
  nonVeg: boolean;
  rating4: boolean;
  under200: boolean;
  under300: boolean;
};

type SearchResult = {
  restaurant: Restaurant & { lat: number; lng: number; distance: number; eta: number };
  matchedDishes: MenuItem[];
  matchScore: number;
  labels: string[];
};

const VIZAG_CENTER: GeoCoord = { lat: 17.6868, lng: 83.2185 };
const SEARCH_RADIUS_KM = 5;

// Pre-compute restaurant coordinates around Vizag
const restaurantsWithCoords = restaurants.map((r, i) => ({
  ...r,
  lat: VIZAG_CENTER.lat + (Math.random() - 0.5) * 0.08,
  lng: VIZAG_CENTER.lng + (Math.random() - 0.5) * 0.08,
  deliveryTime: `${10 + Math.floor(Math.random() * 25)} min`,
}));

// Map menu items to restaurants
const menuByRestaurant: Record<string, MenuItem[]> = {
  mamas: menu.filter((m) => ["m1", "m5"].includes(m.id)),
  green: menu.filter((m) => ["m2", "m6"].includes(m.id)),
  ramen: menu.filter((m) => ["m3"].includes(m.id)),
  smoke: menu.filter((m) => ["m4"].includes(m.id)),
  biryani: menu.filter((m) => ["a10"].includes(m.id)),
  dosa: menu.filter((m) => ["a5", "a6"].includes(m.id)),
  andhra1: menu.filter((m) => ["a1", "a7"].includes(m.id)),
  andhra2: menu.filter((m) => ["a10"].includes(m.id)),
  andhra3: menu.filter((m) => ["a2"].includes(m.id)),
  andhra4: menu.filter((m) => ["a3"].includes(m.id)),
  andhra5: menu.filter((m) => ["a5", "a12"].includes(m.id)),
  andhra6: menu.filter((m) => ["a4", "a9"].includes(m.id)),
  andhra7: menu.filter((m) => ["a5"].includes(m.id)),
  andhra8: menu.filter((m) => ["a6", "a11"].includes(m.id)),
};

function normalizeText(str: string): string {
  return str.toLowerCase().replace(/\s+/g, " ").trim();
}

function calculateMatchScore(
  restaurant: Restaurant,
  dishes: MenuItem[],
  query: string
): number {
  const q = normalizeText(query);
  let score = 0;

  // Name match (highest priority)
  if (normalizeText(restaurant.name).includes(q)) score += 100;

  // Cuisine match
  if (normalizeText(restaurant.cuisine).includes(q)) score += 50;

  // Tags match
  restaurant.tags.forEach((tag) => {
    if (normalizeText(tag).includes(q)) score += 30;
  });

  // Dish name/description match
  dishes.forEach((dish) => {
    if (normalizeText(dish.name).includes(q)) score += 40;
    if (normalizeText(dish.desc).includes(q)) score += 20;
    if (normalizeText(dish.category).includes(q)) score += 15;
  });

  return score;
}

function generateLabels(
  restaurant: Restaurant & { distance: number; eta: number }
): string[] {
  const labels: string[] = [];

  if (restaurant.distance < 1.5) {
    labels.push("Near You 📍");
  }
  if (restaurant.priceFor2 <= 150) {
    labels.push("Under ₹150 💸");
  } else if (restaurant.priceFor2 <= 200) {
    labels.push("Budget Pick 💰");
  }
  if (restaurant.eta.replace(/\D/g, "") <= "20") {
    labels.push("Fast Delivery ⚡");
  }
  if (restaurant.rating >= 4.5) {
    labels.push("Top Rated ⭐");
  }
  if (restaurant.offer) {
    labels.push("Offers 🎁");
  }
  if (restaurant.tags.includes("Veg")) {
    labels.push("Pure Veg 🌿");
  }

  return labels;
}

export function useNearbySearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    veg: false,
    nonVeg: false,
    rating4: false,
    under200: false,
    under300: false,
  });
  const [sortBy, setSortBy] = useState<"distance" | "rating" | "price" | "eta">("distance");

  const geo = useGeolocation();
  const userLocation = geo.coords || VIZAG_CENTER;

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Filter and rank restaurants
  const results: SearchResult[] = useMemo(() => {
    return restaurantsWithCoords
      .map((restaurant) => {
        const distance = haversineKm(userLocation, { lat: restaurant.lat, lng: restaurant.lng });
        const eta = etaMinutes(distance);
        const dishes = menuByRestaurant[restaurant.id] || [];
        const matchScore = debouncedQuery
          ? calculateMatchScore(restaurant, dishes, debouncedQuery)
          : 100; // All restaurants match when no query
        const labels = generateLabels({ ...restaurant, distance, eta });

        return {
          restaurant: { ...restaurant, distance, eta },
          matchedDishes: dishes,
          matchScore,
          labels,
        };
      })
      .filter((result) => {
        // Filter by distance (within radius)
        if (result.restaurant.distance > SEARCH_RADIUS_KM) return false;

        // Filter by search query match
        if (debouncedQuery && result.matchScore < 10) return false;

        // Apply filters
        const r = result.restaurant;
        if (filters.veg && !r.tags.includes("Veg")) return false;
        if (filters.nonVeg && !r.tags.includes("Non-veg")) return false;
        if (filters.rating4 && r.rating < 4.0) return false;
        if (filters.under200 && r.priceFor2 > 200) return false;
        if (filters.under300 && r.priceFor2 > 300) return false;

        return true;
      })
      .sort((a, b) => {
        // Sort by match score first (relevance), then by selected sort
        if (debouncedQuery && a.matchScore !== b.matchScore) {
          return b.matchScore - a.matchScore;
        }
        switch (sortBy) {
          case "distance":
            return a.restaurant.distance - b.restaurant.distance;
          case "rating":
            return b.restaurant.rating - a.restaurant.rating;
          case "price":
            return a.restaurant.priceFor2 - b.restaurant.priceFor2;
          case "eta":
            return parseInt(a.restaurant.eta) - parseInt(b.restaurant.eta);
          default:
            return 0;
        }
      });
  }, [userLocation, debouncedQuery, filters, sortBy]);

  const toggleFilter = useCallback(<K extends keyof SearchFilters>(key: K) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      veg: false,
      nonVeg: false,
      rating4: false,
      under200: false,
      under300: false,
    });
  }, []);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return {
    query,
    setQuery,
    debouncedQuery,
    results,
    filters,
    toggleFilter,
    clearFilters,
    activeFilterCount,
    sortBy,
    setSortBy,
    userLocation,
    geo,
    totalResults: results.length,
  };
}
