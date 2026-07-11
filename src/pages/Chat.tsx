import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";
import { Send, Sparkles, Loader2, Utensils, Bot, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { mcpSearchFood, parseIntent, MCP_ENDPOINTS } from "@/lib/mcp";
import { orderStore } from "@/lib/orderStore";
import type { MenuItem } from "@/data/mock";

type Msg = {
  role: "user" | "assistant";
  content: string;
  items?: MenuItem[];
  source?: string;
  ts: number;
};

function FoodBlob({ position, color, speed }: { position: [number, number, number]; color: string; speed: number }) {
  const ref = useRef<any>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * speed * 0.3;
      ref.current.rotation.y = state.clock.elapsedTime * speed * 0.5;
    }
  });
  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={1.5}>
      <Sphere ref={ref} args={[1, 64, 64]} position={position}>
        <MeshDistortMaterial color={color} distort={0.45} speed={2} roughness={0.15} metalness={0.4} />
      </Sphere>
    </Float>
  );
}

function Scene3D() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#FF6B00" />
      <pointLight position={[-10, -5, -5]} intensity={0.8} color="#00C853" />
      <Suspense fallback={null}>
        <FoodBlob position={[-2.4, 0.6, 0]} color="#FF6B00" speed={1} />
        <FoodBlob position={[2.2, -0.4, -1]} color="#00C853" speed={0.8} />
        <FoodBlob position={[0, 1.2, -2]} color="#FFB300" speed={1.3} />
        <Environment preset="sunset" />
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} />
    </Canvas>
  );
}

const suggestions = [
  "Order biryani under 200",
  "Find healthy meals under 150",
  "Get me 2 ramen bowls",
  "Show andhra specials",
];

export default function Chat() {
  const { addMany, lines, subtotal } = useCart();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hey! I'm your QuickBite AI agent, connected to Swiggy MCP endpoints. Tell me what you want — e.g., 'order biryani under 200' — and I'll add it to your cart and place the order automatically.",
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const runCommand = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text.trim(), ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const intent = parseIntent(text);
      const result = await mcpSearchFood(intent.keywords.join(" ") || text, intent.maxPrice);

      if (result.items.length === 0) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: `No matches for "${text}" via ${result.endpoint}. Try 'biryani', 'ramen', 'paneer' or 'andhra'.`,
            source: result.endpoint,
            ts: Date.now(),
          },
        ]);
        return;
      }

      const picks = result.items.slice(0, Math.max(1, intent.qty)).slice(0, 4);
      const ids: string[] = [];
      for (let i = 0; i < intent.qty; i++) picks.forEach((p) => ids.push(p.id));

      if (intent.action === "order") {
        addMany(ids);
        const total = picks.reduce((s, p) => s + p.price * intent.qty, 0);
        orderStore.set({
          restaurant: "QuickBite AI Auto-Order",
          items: picks.map((p) => ({ name: p.name, price: p.price, qty: intent.qty })),
          total,
          payment: "UPI (Auto)",
        });
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: `Done! Added ${picks.length} item(s) × ${intent.qty} to your cart via ${result.endpoint} and placed the order. Total ₹${total}. Redirecting to live tracking...`,
            items: picks,
            source: result.endpoint,
            ts: Date.now(),
          },
        ]);
        toast.success(`Order placed — ₹${total}`);
        setTimeout(() => navigate("/orders"), 1600);
      } else {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: `Found ${result.items.length} matches via ${result.endpoint}. Tap any to add to cart, or say "order it" to auto-place.`,
            items: picks,
            source: result.endpoint,
            ts: Date.now(),
          },
        ]);
      }
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Something went wrong. Try again.", ts: Date.now() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-background pt-16 md:pl-60 md:pt-16 pb-16 md:pb-0">
      {/* 3D backdrop */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <Scene3D />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden px-4 py-6">
        <div className="mb-4 flex items-center gap-3 animate-fade-in">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-pop">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">QuickBite Agent</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-primary" />
              Live • MCP: {Object.values(MCP_ENDPOINTS).join(" · ")}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex animate-scale-in gap-3",
                msg.role === "user" ? "flex-row-reverse" : "flex-row",
              )}
            >
              <div
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground",
                )}
              >
                {msg.role === "user" ? <Utensils className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={cn("max-w-[80%] space-y-2", msg.role === "user" ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm shadow-soft backdrop-blur",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card/90 border border-border",
                  )}
                >
                  {msg.content}
                </div>
                {msg.items && msg.items.length > 0 && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {msg.items.map((it) => (
                      <div key={it.id} className="flex items-center gap-2 rounded-xl border border-border bg-card/80 p-2 backdrop-blur">
                        <img src={it.img} alt={it.name} className="h-12 w-12 rounded-lg object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold">{it.name}</p>
                          <p className="text-[11px] text-muted-foreground">₹{it.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {msg.source && (
                  <p className="text-[10px] text-muted-foreground">via {msg.source}</p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
              <Loader2 className="h-4 w-4 animate-spin" /> Contacting MCP servers...
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Suggestions */}
        {messages.length < 3 && !loading && (
          <div className="my-3 flex flex-wrap gap-2 animate-fade-in">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => runCommand(s)}
                className="rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs backdrop-blur hover:bg-primary/10 hover:border-primary transition-all hover:scale-105"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Cart peek */}
        {lines.length > 0 && (
          <button
            onClick={() => navigate("/cart")}
            className="mb-3 flex items-center justify-between rounded-xl bg-primary/10 border border-primary/30 px-3 py-2 text-sm animate-fade-in hover:bg-primary/20 transition-all"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              {lines.reduce((s, l) => s + l.qty, 0)} items in cart
            </span>
            <span className="font-bold text-primary">₹{subtotal}</span>
          </button>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runCommand(input);
          }}
          className="flex items-center gap-2 rounded-full border border-border bg-card/90 p-1.5 backdrop-blur shadow-pop"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Order biryani under 200"
            className="h-10 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={loading}
          />
          <Button type="submit" size="icon" className="rounded-full h-10 w-10" disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
