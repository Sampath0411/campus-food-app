import { useMemo } from "react";
import { Check, ChefHat, Bike, PackageCheck, Phone, MessageCircle, MapPin, Clock, Radio, RotateCcw, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOrderProgress } from "@/hooks/useOrderProgress";
import { useGeolocation, haversineKm, etaMinutes } from "@/hooks/useGeolocation";

const STAGE_META = [
  { key: "placed",    label: "Order Placed",     icon: Check },
  { key: "preparing", label: "Preparing",        icon: ChefHat },
  { key: "out",       label: "Out for Delivery", icon: Bike },
  { key: "delivered", label: "Delivered",        icon: PackageCheck },
] as const;

// Demo restaurant location (VIT Vellore-ish). Used for real distance calc.
const RESTAURANT_COORD = { lat: 12.9692, lng: 79.1559 };

function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
function fmtDuration(s: number) {
  if (s <= 0) return "now";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m ? `${m}m ${sec.toString().padStart(2, "0")}s` : `${sec}s`;
}

export default function OrderTracking() {
  const { order, progress, reset } = useOrderProgress();
  const geo = useGeolocation();

  const distanceKm = useMemo(
    () => (geo.coords ? haversineKm(geo.coords, RESTAURANT_COORD) : null),
    [geo.coords],
  );
  const distanceEta = distanceKm != null ? etaMinutes(distanceKm) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              Order #{order.id}
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                <Radio className="h-3 w-3 animate-soft-pulse" /> Live
              </span>
            </p>
            <h1 className="font-display text-2xl font-bold md:text-3xl flex items-center gap-2">{order.restaurant} is on it <ChefHat className="h-6 w-6 text-orange-500" /></h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {progress.stage === "delivered" ? (
                <>Delivered · enjoy!</>
              ) : (
                <>Arriving in <span className="font-semibold text-foreground">~{fmtDuration(progress.etaSeconds)}</span></>
              )}
            </p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full" onClick={reset}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Restart demo
          </Button>
        </header>

        {/* Step tracker */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card md:p-6">
          {/* Desktop horizontal */}
          <ol className="hidden items-start justify-between gap-2 md:flex">
            {STAGE_META.map((s, i) => {
              const done = i <= progress.stageIndex;
              const active = i === progress.stageIndex && progress.stageIndex < 3;
              const ts = progress.stageStartedAt[i];
              const Icon = s.icon;
              return (
                <li key={s.key} className="relative flex flex-1 flex-col items-center text-center">
                  {i > 0 && (
                    <div className={cn(
                      "absolute right-1/2 top-5 h-1 w-full -translate-y-1/2",
                      i <= progress.stageIndex ? "bg-primary" : "bg-muted",
                    )} />
                  )}
                  <div className={cn(
                    "relative z-10 grid h-10 w-10 place-items-center rounded-full transition-all",
                    done ? "bg-primary text-primary-foreground shadow-pop" : "bg-muted text-muted-foreground",
                    active && "ring-4 ring-primary/30 animate-soft-pulse",
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className={cn("mt-2 text-sm font-semibold", done ? "text-foreground" : "text-muted-foreground")}>
                    {s.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {done ? fmtTime(ts) : "—"}
                  </p>
                </li>
              );
            })}
          </ol>

          {/* Mobile vertical */}
          <ol className="space-y-4 md:hidden">
            {STAGE_META.map((s, i) => {
              const done = i <= progress.stageIndex;
              const active = i === progress.stageIndex && progress.stageIndex < 3;
              const Icon = s.icon;
              return (
                <li key={s.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "grid h-10 w-10 place-items-center rounded-full",
                      done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                      active && "ring-4 ring-primary/30 animate-soft-pulse",
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {i < STAGE_META.length - 1 && (
                      <div className={cn("mt-1 h-8 w-0.5", i < progress.stageIndex ? "bg-primary" : "bg-muted")} />
                    )}
                  </div>
                  <div className="pt-1.5">
                    <p className={cn("text-sm font-semibold", done ? "text-foreground" : "text-muted-foreground")}>
                      {s.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{done ? fmtTime(progress.stageStartedAt[i]) : "—"}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-gradient-primary transition-all duration-1000"
                style={{ width: `${Math.min(100, (progress.elapsed / progress.totalDuration) * 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-right text-xs text-muted-foreground">
              {fmtDuration(progress.elapsed)} elapsed · {fmtDuration(progress.totalDuration)} total
            </p>
          </div>
        </section>

        {/* Map with real distance */}
        <section className="overflow-hidden rounded-2xl border border-border shadow-card">
          <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Navigation className="h-3.5 w-3.5 text-primary" />
              {distanceKm != null
                ? <>{distanceKm.toFixed(2)} km away · est {distanceEta} min by bike</>
                : <>Allow location to see real distance</>}
            </div>
            {geo.status !== "granted" && (
              <Button size="sm" variant="outline" className="h-7 rounded-full text-xs" onClick={geo.request}>
                {geo.status === "prompt" ? "Locating…" : "Use my location"}
              </Button>
            )}
          </div>
          <div className="relative h-64 bg-gradient-hero md:h-80">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 240" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="400" height="240" fill="url(#grid)" />
              <path
                d="M 40 200 Q 140 80 360 50"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="6 6"
                fill="none"
              />
              {/* Animated rider dot proportional to elapsed progress */}
              {(() => {
                const pct = Math.min(1, progress.elapsed / progress.totalDuration);
                // Approximate quadratic curve point
                const t = pct;
                const x = (1 - t) * (1 - t) * 40 + 2 * (1 - t) * t * 140 + t * t * 360;
                const y = (1 - t) * (1 - t) * 200 + 2 * (1 - t) * t * 80 + t * t * 50;
                return <circle cx={x} cy={y} r="6" fill="hsl(var(--primary))" className="animate-soft-pulse" />;
              })()}
              <circle cx="40" cy="200" r="8" fill="hsl(var(--accent))" />
              <circle cx="360" cy="50" r="8" fill="hsl(var(--primary))" />
            </svg>
            <div className="absolute left-3 top-3 rounded-lg bg-card/90 px-2 py-1 text-xs font-semibold shadow-soft backdrop-blur">
              <MapPin className="mr-1 inline h-3 w-3 text-accent" /> {order.restaurant}
            </div>
            <div className="absolute bottom-3 right-3 rounded-lg bg-card/90 px-2 py-1 text-xs font-semibold shadow-soft backdrop-blur">
              <MapPin className="mr-1 inline h-3 w-3 text-primary" /> {geo.coords ? "Your location" : "Hostel C"}
            </div>
          </div>
          {geo.status === "denied" && (
            <p className="border-t border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
              Location blocked. Enable it in your browser settings to see live distance.
            </p>
          )}
        </section>
      </div>

      {/* Rider card */}
      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Delivery partner</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-accent font-bold text-accent-foreground">
              {order.rider.name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display font-semibold">{order.rider.name}</p>
              <p className="text-xs text-muted-foreground">⭐ {order.rider.rating} · {order.rider.deliveries.toLocaleString()} deliveries</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" className="rounded-xl"><Phone className="mr-1.5 h-3.5 w-3.5" /> Call</Button>
            <Button className="rounded-xl bg-gradient-primary"><MessageCircle className="mr-1.5 h-3.5 w-3.5" /> Chat</Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-display font-semibold">Order summary</h3>
          <ul className="mt-3 space-y-1.5 text-sm">
            {order.items.map((it) => (
              <li key={it.name} className="flex justify-between">
                <span>{it.qty} × {it.name}</span>
                <span>₹{it.price * it.qty}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-dashed border-border pt-3 font-display font-bold">
            <span>Paid via {order.payment}</span><span>₹{order.total}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
