import { useState, useEffect } from "react";
import { MapPin, Bell, CreditCard, LogOut, Sparkles, Home, Building, Edit, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useNavigate } from "react-router-dom";

interface User {
  name: string;
  phone: string;
  createdAt: number;
}

interface Address {
  doorNo: string;
  flatNo?: string;
  street?: string;
  area?: string;
  city?: string;
  type: "home" | "work";
}

export default function Profile() {
  const geo = useGeolocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [address, setAddress] = useState<Address | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("bb:user");
    const savedAddress = localStorage.getItem("bb:address");
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedAddress) setAddress(JSON.parse(savedAddress));
  }, []);

  function handleSignOut() {
    localStorage.removeItem("bb:user");
    localStorage.removeItem("bb:address");
    navigate("/login");
  }

  const initials = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="space-y-6">
      {/* User Header */}
      <header className="flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-accent text-2xl font-bold text-accent-foreground">
          {initials}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">{user?.name || "Guest"}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            {user?.phone || "Not set"}
          </div>
        </div>
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => navigate("/login")}>
          <Edit className="h-4 w-4" />
        </Button>
      </header>

      {/* Saved Address */}
      {address && (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10">
              {address.type === "home" ? (
                <Home className="h-5 w-5 text-primary" />
              ) : (
                <Building className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-semibold">
                  {address.type === "home" ? "Home" : "Work"} Address
                </h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {[address.doorNo, address.flatNo, address.street, address.area, address.city]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => navigate("/login")}
            >
              Edit
            </Button>
          </div>
        </section>
      )}

      {/* Geo Location */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 text-primary" />
          <div className="flex-1">
            <h2 className="font-display font-semibold">Delivery location</h2>
            <p className="text-xs text-muted-foreground">
              {geo.address
                ? geo.address
                : geo.coords
                ? `${geo.coords.lat.toFixed(4)}, ${geo.coords.lng.toFixed(4)}`
                : "Not set — used for distance, ETA and nearby picks."}
            </p>
          </div>
          <Button size="sm" variant="outline" className="rounded-full" onClick={geo.request}>
            {geo.coords ? "Update" : "Allow"}
          </Button>
        </div>
      </section>

      {/* Settings Grid */}
      <section className="grid gap-3 md:grid-cols-2">
        {[
          { icon: Bell, label: "Notifications", desc: "Order updates, group invites" },
          { icon: CreditCard, label: "Payment methods", desc: "UPI, cards, wallet" },
          { icon: Sparkles, label: "AI preferences", desc: "Diet, budget, cuisines" },
          { icon: LogOut, label: "Sign out", desc: "End this session", danger: true },
        ].map((row) => (
          <button
            key={row.label}
            onClick={() => (row.label === "Sign out" ? handleSignOut() : null)}
            className={`flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card ${
              row.danger ? "hover:border-destructive/50" : ""
            }`}
          >
            <div className={`grid h-10 w-10 place-items-center rounded-full ${row.danger ? "bg-destructive/10" : "bg-muted"}`}>
              <row.icon className={`h-4 w-4 ${row.danger ? "text-destructive" : ""}`} />
            </div>
            <div>
              <p className="font-display font-semibold">{row.label}</p>
              <p className="text-xs text-muted-foreground">{row.desc}</p>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
}
