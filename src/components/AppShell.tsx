import { ReactNode, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  ScrollText,
  Users,
  CalendarClock,
  Search,
  MapPin,
  ShoppingCart,
  Moon,
  Sun,
  User,
  Sparkles,
  Truck,
  MessageCircle,
  Vote,
  Refrigerator,
  Pizza,
  Salad,
  Coffee,
  IceCream,
  Soup,
  Sandwich,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useGeolocation } from "@/hooks/useGeolocation";
import { cn } from "@/lib/utils";
import { AIConcierge } from "@/components/AIConcierge";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/chat", label: "AI Chat Agent", icon: MessageCircle },
  { to: "/search", label: "Search", icon: Search },
  { to: "/recent-orders", label: "Recent Orders", icon: ScrollText },
  { to: "/orders", label: "Track Order", icon: Truck },
  { to: "/group", label: "Group Orders", icon: Users },
  { to: "/meal-planner", label: "AI Meal Planner", icon: Sparkles },
  { to: "/fridge", label: "Fridge AI", icon: Refrigerator },
  { to: "/polls", label: "Food Polls", icon: Vote },
  { to: "/scheduled", label: "Scheduled", icon: CalendarClock },
];

const AI_TIPS = [
  "Mac & Cheese + Cola — under your ₹200 budget.",
  "Try a paneer wrap + lassi — high protein under ₹180.",
  "Late night? Maggi + masala chai for ₹90.",
  "Veg thali combo — balanced and under ₹150.",
  "Biryani + raita — comfort pick for today.",
  "Chole bhature + lassi — weekend treat under ₹220.",
  "Idli sambhar + filter coffee — light start under ₹120.",
];
function tipOfTheDay() {
  const d = new Date();
  const day = Math.floor(d.getTime() / 86400000);
  return AI_TIPS[day % AI_TIPS.length];
}

const mobileNav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/chat", label: "AI Chat", icon: MessageCircle },
  { to: "/recent-orders", label: "Orders", icon: ScrollText },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/profile", label: "Profile", icon: User },
];

const avatarIcons: Record<string, typeof Utensils> = {
  burger: Sandwich,
  pizza: Pizza,
  ramen: Soup,
  salad: Salad,
  biryani: Utensils,
  ice: IceCream,
  coffee: Coffee,
  taco: Utensils,
};

export function AppShell({ children }: { children: ReactNode }) {
  const { count } = useCart();
  const navigate = useNavigate();
  const geo = useGeolocation();
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("bb:dark-mode");
    return saved === null ? true : JSON.parse(saved);
  });
  const [aiOpen, setAiOpen] = useState(false);

  // Persist dark mode on toggle
  useEffect(() => {
    localStorage.setItem("bb:dark-mode", JSON.stringify(dark));
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Sync dark mode with system preference on mount
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const saved = localStorage.getItem("bb:dark-mode");
      if (saved === null) {
        setDark(mediaQuery.matches);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Top navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 md:gap-6 md:px-6">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center">
              <img src="/quickbite-logo.png" alt="QuickBite" className="h-full w-full object-contain" />
            </div>
            <span className="hidden font-display text-lg font-bold sm:inline">QuickBite</span>
          </button>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={geo.request}
              className="hidden items-center gap-2 rounded-full bg-muted px-3 py-1.5 transition-colors hover:bg-muted/70 md:flex"
              title={geo.status === "granted" ? "Update your location" : "Use my location"}
            >
              <MapPin className={cn("h-4 w-4", geo.coords ? "text-accent" : "text-primary")} />
              <div className="text-left text-xs leading-tight max-w-[200px]">
                <p className="font-semibold truncate">
                  {geo.address || (geo.coords ? "Location on" : "Set location")}
                </p>
                <p className="text-muted-foreground truncate">
                  {!geo.coords
                    ? geo.status === "denied"
                      ? "Permission denied"
                      : "Tap to share"
                    : geo.address
                    ? "Click to update"
                    : "Fetching address..."}
                </p>
              </div>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-primary hover:bg-primary/10 animate-pulse-soft"
              onClick={() => navigate("/chat")}
              aria-label="Open AI Chat Agent"
              title="AI Chat Agent"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
              onClick={() => navigate("/cart")}
              aria-label="Cart"
            >
              <ShoppingCart className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Button>
            <button
              onClick={() => navigate("/profile")}
              className="grid h-9 w-9 place-items-center rounded-full bg-gradient-accent text-accent-foreground shadow-soft transition-transform hover:scale-105"
              title="Profile"
            >
              {(() => {
                const a = localStorage.getItem("bb:avatar") || "burger";
                const Icon = avatarIcons[a] || Sandwich;
                return <Icon className="h-4.5 w-4.5" />;
              })()}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 border-r border-border bg-sidebar p-4 md:block">
          <nav className="flex flex-col gap-1">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-muted",
                  )
                }
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 rounded-2xl bg-gradient-primary p-4 text-primary-foreground shadow-pop">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide opacity-90">
              <Sparkles className="h-3.5 w-3.5" /> AI Concierge
            </div>
            <p className="mt-2 font-display text-base font-bold leading-tight">
              "{tipOfTheDay()}"
            </p>
            <Button size="sm" variant="secondary" className="mt-3 rounded-full" onClick={() => navigate("/meal-planner")}>
              Plan my week
            </Button>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 px-4 pb-28 pt-4 md:px-8 md:pb-10 md:pt-6">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md md:hidden">
        <div className="grid grid-cols-5">
          {mobileNav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
                  isActive ? "text-primary" : "text-muted-foreground",
                )
              }
            >
              <div className="relative">
                <n.icon className="h-5 w-5" />
                {n.to === "/cart" && count > 0 && (
                  <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                    {count}
                  </span>
                )}
              </div>
              {n.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* AI Concierge (controlled from topbar button) */}
      <AIConcierge open={aiOpen} onOpenChange={setAiOpen} hideFab />
    </div>
  );
}
