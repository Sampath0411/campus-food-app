import { Star, Clock, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Restaurant } from "@/data/mock";

export function RestaurantCard({ r }: { r: Restaurant }) {
  const nav = useNavigate();
  return (
    <button
      onClick={() => nav(`/r/${r.id}`)}
      className="group flex w-full flex-col overflow-hidden rounded-2xl bg-card text-left shadow-card transition-all hover:-translate-y-1 hover:shadow-float"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={r.img}
          alt={r.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {r.offer && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <p className="font-display text-sm font-bold text-white">{r.offer}</p>
          </div>
        )}
      </div>
      <div className="space-y-2 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold leading-tight">{r.name}</h3>
          <span className="flex shrink-0 items-center gap-0.5 rounded-md bg-accent px-1.5 py-0.5 text-xs font-bold text-accent-foreground">
            <Star className="h-3 w-3 fill-current" /> {r.rating}
          </span>
        </div>
        <p className="line-clamp-1 text-xs text-muted-foreground">{r.cuisine}</p>
        <div className="flex items-center gap-3 border-t border-dashed border-border pt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {r.eta}
          </span>
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3" /> ₹{r.priceFor2} for two
          </span>
        </div>
      </div>
    </button>
  );
}
