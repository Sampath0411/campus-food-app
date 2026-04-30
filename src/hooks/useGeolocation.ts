import { useCallback, useEffect, useState } from "react";

export type GeoCoord = { lat: number; lng: number };
export type GeoState = {
  status: "idle" | "prompt" | "granted" | "denied" | "unsupported" | "error";
  coords: GeoCoord | null;
  address: string | null;
  error: string | null;
};

const KEY = "bb:geo";
const KEY_ADDRESS = "bb:geo:address";

function loadCached(): { coords: GeoCoord | null; address: string | null } {
  try {
    const raw = localStorage.getItem(KEY);
    const addr = localStorage.getItem(KEY_ADDRESS);
    return {
      coords: raw ? (JSON.parse(raw) as GeoCoord) : null,
      address: addr,
    };
  } catch {
    return { coords: null, address: null };
  }
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`
    );
    if (!res.ok) return null;
    const data = await res.json();
    // Build readable address from road, suburb, city
    const addr = data.address;
    const parts = [
      addr.road,
      addr.suburb,
      addr.city || addr.town || addr.village,
      addr.state,
    ].filter(Boolean);
    return parts.length ? parts.join(", ") : data.display_name || null;
  } catch {
    return null;
  }
}

export function haversineKm(a: GeoCoord, b: GeoCoord): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Rough delivery ETA: bike ~25 km/h + 5 min prep buffer.
export function etaMinutes(distanceKm: number, prepMin = 5) {
  return Math.max(1, Math.round((distanceKm / 25) * 60 + prepMin));
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>(() => {
    const cached = loadCached();
    return {
      status: cached.coords ? "granted" : "idle",
      coords: cached.coords,
      address: cached.address,
      error: null,
    };
  });

  const request = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setState({ status: "unsupported", coords: null, address: null, error: "Geolocation not supported" });
      return;
    }
    setState((s) => ({ ...s, status: "prompt" }));
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        localStorage.setItem(KEY, JSON.stringify(coords));
        // Fetch address from reverse geocoding
        const address = await reverseGeocode(coords.lat, coords.lng);
        if (address) {
          localStorage.setItem(KEY_ADDRESS, address);
        }
        setState({ status: "granted", coords, address, error: null });
      },
      (err) => {
        setState({
          status: err.code === err.PERMISSION_DENIED ? "denied" : "error",
          coords: null,
          address: null,
          error: err.message,
        });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  useEffect(() => {
    if (!("permissions" in navigator) || !navigator.permissions?.query) return;
    navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((p) => {
        if (p.state === "granted" && !state.coords) request();
      })
      .catch(() => {/* ignore */});
    // run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...state, request };
}
