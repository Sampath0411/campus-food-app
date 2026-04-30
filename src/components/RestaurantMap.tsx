import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";

interface RestaurantMapProps {
  restaurants: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    rating: number;
    cuisine: string;
    deliveryTime: string;
  }>;
}

export function RestaurantMap({ restaurants }: RestaurantMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.lat, pos.coords.lng]);
        },
        () => {
          // Default to Visakhapatnam
          setUserLocation([17.6868, 83.2185]);
        }
      );
    }
  }, []);

  if (!userLocation) {
    return (
      <div className="grid h-[400px] w-full place-items-center bg-muted">
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    );
  }

  return (
    <MapContainer
      center={userLocation}
      zoom={13}
      scrollWheelZoom={false}
      className="h-[400px] w-full rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {restaurants.map((r) => (
        <Marker key={r.id} position={[r.lat, r.lng]}>
          <Popup>
            <div className="space-y-1">
              <h3 className="font-semibold">{r.name}</h3>
              <p className="text-sm text-muted-foreground">{r.cuisine}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1">
                  <span className="font-bold text-green-600">★</span> {r.rating}
                </span>
                <span>•</span>
                <span>{r.deliveryTime}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      {/* User location marker */}
      <Marker position={userLocation}>
        <Popup>
          <div className="space-y-1">
            <h3 className="font-semibold">Your Location</h3>
            <p className="text-sm text-muted-foreground">Delivery address</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
