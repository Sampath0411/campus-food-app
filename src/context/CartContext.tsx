import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { menu, MenuItem } from "@/data/mock";

type CartLine = { item: MenuItem; qty: number };
type CartCtx = {
  lines: CartLine[];
  add: (id: string) => void;
  remove: (id: string) => void;
  count: number;
  subtotal: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<Record<string, number>>({ m1: 1, m3: 2 });

  const add = (id: string) => setMap((m) => ({ ...m, [id]: (m[id] ?? 0) + 1 }));
  const remove = (id: string) =>
    setMap((m) => {
      const next = { ...m };
      const q = (next[id] ?? 0) - 1;
      if (q <= 0) delete next[id];
      else next[id] = q;
      return next;
    });

  const lines = useMemo<CartLine[]>(
    () =>
      Object.entries(map)
        .map(([id, qty]) => {
          const item = menu.find((m) => m.id === id);
          return item ? { item, qty } : null;
        })
        .filter(Boolean) as CartLine[],
    [map],
  );

  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.qty * l.item.price, 0);

  return <Ctx.Provider value={{ lines, add, remove, count, subtotal }}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used inside CartProvider");
  return v;
};
