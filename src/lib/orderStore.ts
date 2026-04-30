// Simulated "real-time" order: stages advance over wall-clock time.
// Anyone polling sees the same authoritative timeline because it's
// stored once and derived deterministically from elapsed time.

export type OrderStage = "placed" | "preparing" | "out" | "delivered";
export const STAGES: OrderStage[] = ["placed", "preparing", "out", "delivered"];

export type ActiveOrder = {
  id: string;
  restaurant: string;
  startedAt: number;
  // seconds spent in each stage before advancing
  durations: [number, number, number]; // placed→preparing, preparing→out, out→delivered
  items: { name: string; price: number; qty: number }[];
  total: number;
  payment: string;
  // stable rider info
  rider: { name: string; rating: number; deliveries: number };
};

const KEY = "bb:active-order";

function defaultOrder(): ActiveOrder {
  return {
    id: "BB-" + Math.floor(10000 + Math.random() * 89999),
    restaurant: "Mama's Corner",
    startedAt: Date.now(),
    durations: [25, 90, 70], // ~3 minutes total for demo
    items: [
      { name: "Classic Mac & Cheese", price: 149, qty: 1 },
      { name: "Tonkotsu Ramen", price: 219, qty: 2 },
    ],
    total: 637,
    payment: "UPI",
    rider: { name: "Ravi K.", rating: 4.9, deliveries: 1247 },
  };
}

export const orderStore = {
  get(): ActiveOrder {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw) as ActiveOrder;
    } catch {
      /* fall through */
    }
    const o = defaultOrder();
    localStorage.setItem(KEY, JSON.stringify(o));
    return o;
  },
  reset() {
    const o = defaultOrder();
    localStorage.setItem(KEY, JSON.stringify(o));
    window.dispatchEvent(new Event("bb:order-reset"));
    return o;
  },
};

export type OrderProgress = {
  stageIndex: number;
  stage: OrderStage;
  elapsed: number;
  totalDuration: number;
  etaSeconds: number;
  stageStartedAt: number[];
};

export function computeProgress(o: ActiveOrder, now = Date.now()): OrderProgress {
  const elapsed = Math.max(0, Math.floor((now - o.startedAt) / 1000));
  const total = o.durations.reduce((a, b) => a + b, 0);
  const stageStarts: number[] = [0];
  for (let i = 0; i < o.durations.length; i++) {
    stageStarts.push(stageStarts[i] + o.durations[i]);
  }
  let idx = 0;
  for (let i = 0; i < STAGES.length; i++) {
    if (elapsed >= stageStarts[i]) idx = i;
  }
  return {
    stageIndex: idx,
    stage: STAGES[idx],
    elapsed,
    totalDuration: total,
    etaSeconds: Math.max(0, total - elapsed),
    stageStartedAt: stageStarts.map((s) => o.startedAt + s * 1000),
  };
}
