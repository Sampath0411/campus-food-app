import { useState, useEffect, useMemo, useCallback } from "react";
import { useGeolocation, haversineKm, etaMinutes, GeoCoord } from "./useGeolocation";
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

// OSM Place from Overpass API
interface OSMPlace {
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    cuisine?: string;
    amenity?: string;
    opening_hours?: string;
    phone?: string;
    website?: string;
  };
}

const VIZAG_CENTER: GeoCoord = { lat: 17.6868, lng: 83.2185 };
const SEARCH_RADIUS_KM = 5;

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

  if (normalizeText(restaurant.name).includes(q)) score += 100;
  if (normalizeText(restaurant.cuisine).includes(q)) score += 50;
  restaurant.tags.forEach((tag) => {
    if (normalizeText(tag).includes(q)) score += 30;
  });
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

  if (restaurant.distance < 1.5) labels.push("Near You 📍");
  if (restaurant.priceFor2 <= 150) labels.push("Under ₹150 💸");
  else if (restaurant.priceFor2 <= 200) labels.push("Budget Pick 💰");
  if (restaurant.eta <= 20) labels.push("Fast Delivery ⚡");
  if (restaurant.rating >= 4.5) labels.push("Top Rated ⭐");
  if (restaurant.offer) labels.push("Offers 🎁");
  if (restaurant.tags.includes("Veg")) labels.push("Pure Veg 🌿");

  return labels;
}

// Convert OSM place to our Restaurant type
function osmToRestaurant(place: OSMPlace, index: number): Restaurant & { lat: number; lng: number } {
  const cuisineMap: Record<string, string> = {
    italian: "Italian • Pizza",
    chinese: "Chinese • Asian",
    indian: "Indian • North Indian",
    mexican: "Mexican • Fast Food",
    pizza: "Italian • Pizza",
    burger: "American • Burgers",
    chicken: "Chicken • Fast Food",
    biryani: "Hyderabadi • Biryani",
    south_indian: "South Indian • Tiffins",
  };

  const cuisineKey = (place.tags.cuisine || "").toLowerCase().replace(/[^a-z_]/g, "");
  const cuisine = cuisineMap[cuisineKey] || "Multi-cuisine • Fast Food";

  const name = place.tags.name || "Unknown";

  // Deterministic but varied data based on name hash
  const hash = name.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0) >>> 0;
  const rating = 3.5 + ((hash % 15) / 10); // 3.5 to 5.0
  const priceFor2 = 100 + (hash % 250); // 100 to 350

  const tags: string[] = [];
  if (place.tags.cuisine?.toLowerCase().includes("veg") || cuisine.includes("South Indian")) {
    tags.push("Veg");
  }
  if (place.tags.cuisine?.toLowerCase().includes("chicken") || place.tags.cuisine?.toLowerCase().includes("biryani")) {
    tags.push("Non-veg");
  }
  if (priceFor2 <= 150) tags.push("Budget");
  if (rating >= 4.0) tags.push("Popular");

  return {
    id: `osm_${place.id}`,
    name: name,
    cuisine: cuisine,
    rating: Math.round(rating * 10) / 10,
    eta: `${10 + (hash % 25)} min`,
    priceFor2,
    img: "/quickbite-logo.png",
    tags,
    offer: (hash % 3 === 0) ? "20% OFF" : undefined,
    lat: place.lat,
    lng: place.lon,
  };
}

// Fetch real restaurants from Overpass API
async function fetchOSMRestaurants(lat: number, lng: number): Promise<(Restaurant & { lat: number; lng: number })[]> {
  try {
    const query = `
      [out:json];
      (
        node["amenity"="restaurant"](around:3000, ${lat}, ${lng});
        node["amenity"="cafe"](around:3000, ${lat}, ${lng});
        node["amenity"="fast_food"](around:3000, ${lat}, ${lng});
        way["amenity"="restaurant"](around:3000, ${lat}, ${lng});
      );
      out 50;
    `;

    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
    });

    if (!res.ok) throw new Error("Overpass API error");

    const data = await res.json();
    return data.elements
      .filter((e: OSMPlace) => e.tags?.name)
      .map((place: OSMPlace, i: number) => osmToRestaurant(place, i));
  } catch (err) {
    console.error("Failed to fetch OSM restaurants:", err);
    return [];
  }
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
  const [osmPlaces, setOsmPlaces] = useState<(Restaurant & { lat: number; lng: number })[]>([]);
  const [loading, setLoading] = useState(false);

  const geo = useGeolocation();
  const userLocation = geo.coords || VIZAG_CENTER;

  // Fetch OSM restaurants when location changes
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchOSMRestaurants(userLocation.lat, userLocation.lng).then((places) => {
      if (mounted && places.length > 0) {
        setOsmPlaces(places);
      } else if (mounted && places.length === 0) {
        // Fallback to mock data with coordinates around user location
        const mockWithCoords = restaurants.map((r, i) => ({
          ...r,
          lat: userLocation.lat + (Math.random() - 0.5) * 0.08,
          lng: userLocation.lng + (Math.random() - 0.5) * 0.08,
        }));
        setOsmPlaces(mockWithCoords);
      }
      setLoading(false);
    });

    return () => { mounted = false; };
  }, [userLocation.lat, userLocation.lng]);

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Filter and rank restaurants
  const results: SearchResult[] = useMemo(() => {
    return osmPlaces
      .map((restaurant) => {
        const distance = haversineKm(userLocation, { lat: restaurant.lat, lng: restaurant.lng });
        const eta = etaMinutes(distance);
        const dishes = menuByRestaurant[restaurant.id] || menu.slice(0, 3);
        const matchScore = debouncedQuery
          ? calculateMatchScore(restaurant, dishes, debouncedQuery)
          : 100;
        const labels = generateLabels({ ...restaurant, distance, eta });

        return {
          restaurant: { ...restaurant, distance, eta },
          matchedDishes: dishes,
          matchScore,
          labels,
        };
      })
      .filter((result) => {
        if (result.restaurant.distance > SEARCH_RADIUS_KM) return false;
        if (debouncedQuery && result.matchScore < 10) return false;

        const r = result.restaurant;
        if (filters.veg && !r.tags.includes("Veg")) return false;
        if (filters.nonVeg && !r.tags.includes("Non-veg")) return false;
        if (filters.rating4 && r.rating < 4.0) return false;
        if (filters.under200 && r.priceFor2 > 200) return false;
        if (filters.under300 && r.priceFor2 > 300) return false;

        return true;
      })
      .sort((a, b) => {
        if (debouncedQuery && a.matchScore !== b.matchScore) {
          return b.matchScore - a.matchScore;
        }
        switch (sortBy) {
          case "distance": return a.restaurant.distance - b.restaurant.distance;
          case "rating": return b.restaurant.rating - a.restaurant.rating;
          case "price": return a.restaurant.priceFor2 - b.restaurant.priceFor2;
          case "eta": return parseInt(a.restaurant.eta) - parseInt(b.restaurant.eta);
          default: return 0;
        }
      });
  }, [osmPlaces, userLocation, debouncedQuery, filters, sortBy]);

  const toggleFilter = useCallback(<K extends keyof SearchFilters>(key: K) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ veg: false, nonVeg: false, rating4: false, under200: false, under300: false });
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
    loading,
  };
}
