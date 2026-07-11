// Mock MCP (Model Context Protocol) endpoints — simulated Swiggy connectors.
// URLs used only as identifiers; requests never leave the browser (CSP-safe).
import { menu, restaurants, type MenuItem, type Restaurant } from "@/data/mock";

export const MCP_ENDPOINTS = {
  food: "mcp.swiggy.com/food",
  im: "mcp.swiggy.com/im",
  dineout: "mcp.swiggy.com/dineout",
} as const;

export type MCPSource = keyof typeof MCP_ENDPOINTS;

export type MCPSearchResult = {
  source: MCPSource;
  endpoint: string;
  items: MenuItem[];
  restaurants: Restaurant[];
};

/** Mock MCP food search. Filters local menu by keywords + max price. */
export async function mcpSearchFood(query: string, maxPrice?: number): Promise<MCPSearchResult> {
  await new Promise((r) => setTimeout(r, 250));
  const q = query.toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);
  const items = menu.filter((m) => {
    const hay = `${m.name} ${m.desc} ${m.category}`.toLowerCase();
    const kwHit = tokens.some((t) => hay.includes(t));
    const priceOk = maxPrice ? m.price <= maxPrice : true;
    return kwHit && priceOk;
  });
  const rests = restaurants.filter((r) =>
    tokens.some((t) => `${r.name} ${r.cuisine} ${r.tags.join(" ")}`.toLowerCase().includes(t)),
  );
  return { source: "food", endpoint: MCP_ENDPOINTS.food, items, restaurants: rests };
}

export type ParsedIntent = {
  action: "order" | "search" | "chat";
  keywords: string[];
  maxPrice?: number;
  qty: number;
};

/** Parse natural-language commands like "order biriyani under 200" */
export function parseIntent(text: string): ParsedIntent {
  const lower = text.toLowerCase();
  const priceMatch = lower.match(/(?:under|below|less than|<)\s*₹?\s*(\d{2,5})/);
  const maxPrice = priceMatch ? parseInt(priceMatch[1], 10) : undefined;
  const qtyMatch = lower.match(/\b(\d+)\s*(x|plates?|orders?)?\b/);
  const qty = qtyMatch && !priceMatch?.[0].includes(qtyMatch[1]) ? Math.min(10, parseInt(qtyMatch[1], 10)) : 1;

  const action: ParsedIntent["action"] = /\b(order|buy|get me|place)\b/.test(lower)
    ? "order"
    : /\b(find|show|search|any)\b/.test(lower)
    ? "search"
    : "chat";

  const stop = new Set([
    "order","buy","get","me","a","an","the","under","below","less","than","for","please",
    "want","need","some","and","to","of","with","place","find","show","search","any","rs","₹","rupees",
  ]);
  const keywords = lower
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !stop.has(w) && !/^\d+$/.test(w));

  return { action, keywords, maxPrice, qty };
}
