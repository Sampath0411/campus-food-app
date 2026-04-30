import { useEffect, useState } from "react";
import { ActiveOrder, computeProgress, orderStore, OrderProgress } from "@/lib/orderStore";

// Polls every second to surface the authoritative timeline. Lightweight
// stand-in for a websocket: the source of truth is shared via localStorage
// so other tabs see the same state.
export function useOrderProgress(): { order: ActiveOrder; progress: OrderProgress; reset: () => void } {
  const [order, setOrder] = useState<ActiveOrder>(() => orderStore.get());
  const [progress, setProgress] = useState<OrderProgress>(() => computeProgress(order));

  useEffect(() => {
    const tick = () => setProgress(computeProgress(order));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [order]);

  useEffect(() => {
    const onReset = () => setOrder(orderStore.get());
    const onStorage = (e: StorageEvent) => {
      if (e.key === "bb:active-order") setOrder(orderStore.get());
    };
    window.addEventListener("bb:order-reset", onReset);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("bb:order-reset", onReset);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return {
    order,
    progress,
    reset: () => setOrder(orderStore.reset()),
  };
}
