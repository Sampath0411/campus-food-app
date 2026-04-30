import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface RestaurantMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  cuisine: string;
  deliveryTime: string;
}

interface RestaurantMapProps {
  restaurants: RestaurantMarker[];
}

function LocateUser({ onLocated }: { onLocated: (pos: [number, number]) => void }) {
  useMapEvents({
    load() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            onLocated([pos.coords.lat, pos.coords.lng]);
          },
          () => onLocated([17.6868, 83.2185]) // Default to Vizag
        );
      }
    },
  });
  return null;
}

export function RestaurantMap({ restaurants }: RestaurantMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  return (
    <div className="relative">
      <MapContainer
        center={userLocation || [17.6868, 83.2185]}
        zoom={userLocation ? 14 : 13}
        scrollWheelZoom={true}
        className="h-[450px] w-full rounded-2xl"
      >
        <LocateUser onLocated={setUserLocation} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {restaurants.map((r) => (
          <Marker key={r.id} position={[r.lat, r.lng]}>
            <Popup>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">{r.name}</h3>
                <p className="text-xs text-muted-foreground">{r.cuisine}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-0.5">
                    <span className="font-bold text-green-600">★</span> {r.rating}
                  </span>
                  <span>•</span>
                  <span>{r.deliveryTime}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">Your Location</h3>
                <p className="text-xs text-muted-foreground">Delivery address</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      <div className="absolute bottom-3 right-3 flex gap-2">
        <a href="https://www.google.com/maps/search/restaurants+near+me" target="_blank" rel="noopener noreferrer">
          <Button size="sm" className="rounded-full shadow-lg">
            <ExternalLink className="mr-1.5 h-4 w-4" /> Open in Google Maps
          </Button>
        </a>
      </div>
    </div>
  );
}
