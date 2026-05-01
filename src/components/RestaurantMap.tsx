import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin, Navigation } from "lucide-react";

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface NearbyPlace {
  name: string;
  lat: number;
  lng: number;
  type: string;
  address?: string;
}

interface RestaurantMapProps {
  restaurants: Array<{
    id: string;
    name: string;
    lat?: number;
    lng?: number;
    rating: number;
    cuisine: string;
    deliveryTime: string;
  }>;
}

function MapController({ center, onCenterChange }: { center: [number, number], onCenterChange: (c: [number, number]) => void }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

export function RestaurantMap({ restaurants }: RestaurantMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation([17.6868, 83.2185]); // Default Vizag
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const center: [number, number] = [lat, lng];
        setUserLocation(center);

        // Fetch real nearby restaurants from OpenStreetMap Overpass API
        try {
          const query = `
            [out:json];
            (
              node["amenity"="restaurant"](around:500,${lat},${lng});
              node["amenity"="cafe"](around:500,${lat},${lng});
              node["amenity"="fast_food"](around:500,${lat},${lng});
              way["amenity"="restaurant"](around:500,${lat},${lng});
              way["amenity"="cafe"](around:500,${lat},${lng});
            );
            out 30;
          `;
          const res = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: query,
          });
          const data = await res.json();
          const places = data.elements.map((e: any) => ({
            name: e.tags.name || e.tags.brand || "Unknown",
            lat: e.lat || e.center?.lat || 0,
            lng: e.lon || e.center?.lon || 0,
            type: e.tags.amenity || "restaurant",
            address: e.tags.addr_street || e.tags.description || "",
          })).filter((p: any) => p.name !== "Unknown" && p.lat !== 0);
          setNearbyPlaces(places.slice(0, 25));
        } catch (err) {
          console.error("Failed to fetch places:", err);
        }
        setLoading(false);
      },
      () => {
        setUserLocation([17.6868, 83.2185]);
        setLoading(false);
      }
    );
  }, []);

  if (loading) {
    return (
      <div className="grid h-[450px] place-items-center rounded-2xl border border-border bg-card">
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Interactive Map */}
      <div className="overflow-hidden rounded-2xl border border-border">
        <MapContainer
          {...({ center: userLocation || [17.6868, 83.2185], zoom: 15, scrollWheelZoom: true } as any)}
          className="h-[400px] w-full"
        >
          {userLocation && <MapController center={userLocation} onCenterChange={setUserLocation} />}
          <TileLayer
            {...({
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
              url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            } as any)}
          />
          {/* User location marker */}
          {userLocation && (
            <Marker position={userLocation}>
              <Popup>
                <div className="space-y-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-sm">Your Location</p>
                </div>
              </Popup>
            </Marker>
          )}
          {/* Real nearby restaurants */}
          {nearbyPlaces.map((place, i) => (
            <Marker key={i} position={[place.lat, place.lng]}>
              <Popup>
                <div className="space-y-1">
                  <p className="font-semibold text-sm">{place.name}</p>
                  <p className="text-xs text-muted-foreground">{place.type}</p>
                  {place.address && <p className="text-xs text-muted-foreground">{place.address}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* List of nearby places */}
      {nearbyPlaces.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Restaurants near you ({nearbyPlaces.length} found)</h3>
          </div>
          <div className="grid max-h-[250px] overflow-y-auto gap-2 sm:grid-cols-2">
            {nearbyPlaces.map((place, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg border border-border p-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{place.name}</p>
                  <p className="text-xs text-muted-foreground">{place.type}</p>
                  {place.address && <p className="text-xs text-muted-foreground truncate">{place.address}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {userLocation && (
          <>
            <a
              href={`https://www.google.com/maps/search/restaurants/@${userLocation[0]},${userLocation[1]},14z`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[200px]"
            >
              <Button className="w-full rounded-full bg-[#4285F4] hover:bg-[#357abd]">
                <ExternalLink className="mr-1.5 h-4 w-4" /> Open in Google Maps
              </Button>
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${userLocation[0]},${userLocation[1]}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="rounded-full">
                Get Directions
              </Button>
            </a>
          </>
        )}
      </div>
    </div>
  );
}
