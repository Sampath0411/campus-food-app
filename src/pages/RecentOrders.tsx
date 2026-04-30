import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, RotateCcw, Star, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { restaurants, menu } from "@/data/mock";
import { toast } from "@/hooks/use-toast";

type OrderItem = {
  name: string;
  price: number;
  qty: number;
};

type RecentOrder = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  total: number;
  date: number;
  status: "delivered" | "cancelled";
};

const KEY = "bb:recent-orders";

export default function RecentOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        setOrders(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
  }, []);

  function saveOrder(order: RecentOrder) {
    const updated = [order, ...orders].slice(0, 10); // keep last 10
    localStorage.setItem(KEY, JSON.stringify(updated));
    setOrders(updated);
  }

  function deleteOrder(id: string) {
    const updated = orders.filter((o) => o.id !== id);
    localStorage.setItem(KEY, JSON.stringify(updated));
    setOrders(updated);
    toast({ title: "Order removed", description: "Deleted from history." });
  }

  function reorder(order: RecentOrder) {
    // Navigate to restaurant with items ready to add
    localStorage.setItem(
      "bb:reorder-pending",
      JSON.stringify({
        restaurantId: order.restaurantId,
        items: order.items,
      })
    );
    navigate(`/r/${order.restaurantId}`);
    toast({
      title: "Reorder started",
      description: "Add items to cart from this restaurant.",
    });
  }

  function formatDate(ts: number) {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <header>
          <p className="text-sm text-muted-foreground">Orders</p>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Recent Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your order history will appear here.
          </p>
        </header>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-16 text-center">
          <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="font-display text-lg font-semibold">No orders yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Order something delicious to see it here!
          </p>
          <Button className="mt-4 rounded-full bg-gradient-primary" onClick={() => navigate("/")}>
            Browse Restaurants
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">Orders</p>
        <h1 className="font-display text-2xl font-bold md:text-3xl">Recent Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quick reorder from your favorites.
        </p>
      </header>

      <div className="space-y-3">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden transition-all hover:shadow-card">
            <CardContent className="p-0">
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-bold">{order.restaurantName}</h3>
                    {order.status === "delivered" && (
                      <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-600">
                        Delivered
                      </span>
                    )}
                    {order.status === "cancelled" && (
                      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                        Cancelled
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {order.items.length} item{order.items.length > 1 ? "s" : ""} · ₹{order.total} ·{" "}
                    {formatDate(order.date)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {order.items.slice(0, 3).map((item, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium"
                      >
                        {item.name}
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{order.items.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                  <Button
                    size="sm"
                    className="rounded-full bg-gradient-primary"
                    onClick={() => reorder(order)}
                  >
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reorder
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => deleteOrder(order.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Utility to add order to history (call after checkout)
export function addToOrderHistory(order: Omit<RecentOrder, "date" | "status">) {
  try {
    const raw = localStorage.getItem(KEY);
    const orders: RecentOrder[] = raw ? JSON.parse(raw) : [];
    const newOrder: RecentOrder = {
      ...order,
      date: Date.now(),
      status: "delivered",
    };
    const updated = [newOrder, ...orders].slice(0, 10);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}
