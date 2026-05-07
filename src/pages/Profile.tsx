import { useEffect, useState } from "react";
import { MapPin, Bell, CreditCard, LogOut, Sparkles, Home, Edit, Phone, Moon, Sun, Languages, Wallet, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useI18n, LANGS, Lang } from "@/lib/i18n";
import { summary, getWeeklyLimit, setWeeklyLimit, addSpend } from "@/lib/budget";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const AVATARS = [
  { id: "burger", emoji: "🍔", bg: "bg-orange-500" },
  { id: "pizza", emoji: "🍕", bg: "bg-red-500" },
  { id: "ramen", emoji: "🍜", bg: "bg-amber-500" },
  { id: "salad", emoji: "🥗", bg: "bg-emerald-500" },
  { id: "biryani", emoji: "🍛", bg: "bg-yellow-600" },
  { id: "ice", emoji: "🍦", bg: "bg-pink-400" },
  { id: "coffee", emoji: "☕", bg: "bg-amber-700" },
  { id: "taco", emoji: "🌮", bg: "bg-rose-500" },
];

type Prefs = {
  notif: { orders: boolean; offers: boolean; group: boolean };
  payment: { upi: string; defaultMethod: "upi" | "card" | "cod" };
  ai: { diet: "any" | "veg" | "non-veg"; spice: "mild" | "medium" | "spicy"; budget: number };
};

const PREFS_KEY = "bb:prefs";
const AVATAR_KEY = "bb:avatar";

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {}
  return defaults;
}
const defaults: Prefs = {
  notif: { orders: true, offers: true, group: true },
  payment: { upi: "", defaultMethod: "upi" },
  ai: { diet: "any", spice: "medium", budget: 200 },
};

export default function Profile() {
  const geo = useGeolocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, lang, setLang } = useI18n();

  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("bb:dark-mode");
    return saved === null ? true : JSON.parse(saved);
  });
  useEffect(() => {
    localStorage.setItem("bb:dark-mode", JSON.stringify(dark));
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const [budgetData, setBudgetData] = useState(() => ({ ...summary(), limit: getWeeklyLimit() }));
  useEffect(() => {
    const update = () => setBudgetData({ ...summary(), limit: getWeeklyLimit() });
    window.addEventListener("bb:budget:update", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("bb:budget:update", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  // Inline profile edit
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [savingProfile, setSavingProfile] = useState(false);
  useEffect(() => { setName(user?.name || ""); setPhone(user?.phone || ""); }, [user]);

  // Avatar
  const [avatar, setAvatar] = useState(() => localStorage.getItem(AVATAR_KEY) || "burger");
  useEffect(() => { localStorage.setItem(AVATAR_KEY, avatar); }, [avatar]);
  const currentAvatar = AVATARS.find((a) => a.id === avatar) || AVATARS[0];

  // Prefs
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  useEffect(() => { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); }, [prefs]);
  const [open, setOpen] = useState<"notif" | "pay" | "ai" | null>(null);

  async function saveProfile() {
    if (!name.trim() || !/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ""))) {
      toast({ title: "Check details", description: "Name + valid 10-digit phone required." });
      return;
    }
    setSavingProfile(true);
    try {
      if (user?.id) {
        await supabase.from("users").update({ name, phone }).eq("id", user.id);
      }
      toast({ title: "Profile updated" });
      setEditing(false);
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  }

  function handleSignOut() {
    supabase.auth.signOut();
    navigate("/login");
  }

  function promptLimit() {
    const v = prompt("Set your weekly food budget (₹):", String(budgetData.limit));
    if (v && !isNaN(Number(v))) setWeeklyLimit(Number(v));
  }

  const pct = Math.min(100, Math.round((budgetData.week / Math.max(1, budgetData.limit)) * 100));
  const over = budgetData.week > budgetData.limit;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* User Header */}
      <header className="flex items-center gap-4">
        <button
          onClick={() => setEditing((e) => !e)}
          className={cn("grid h-16 w-16 place-items-center rounded-full text-3xl shadow-pop", currentAvatar.bg)}
          title="Change avatar"
        >
          {currentAvatar.emoji}
        </button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">{t("common.welcome")}, {user?.name || t("common.guest")}!</h1>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{user?.phone || "—"}</div>
            <div className="flex items-center gap-2 truncate">{user?.email || "—"}</div>
          </div>
        </div>
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => setEditing((e) => !e)}>
          {editing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
        </Button>
      </header>

      {/* Inline edit panel */}
      {editing && (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card animate-fade-in space-y-4">
          <h2 className="font-display font-semibold">Edit profile</h2>

          <div>
            <Label className="text-xs">Choose your avatar</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAvatar(a.id)}
                  className={cn(
                    "grid h-12 w-12 place-items-center rounded-full text-xl transition-all",
                    a.bg,
                    avatar === a.id ? "ring-2 ring-primary ring-offset-2 ring-offset-card scale-110" : "opacity-80 hover:opacity-100"
                  )}
                >
                  {a.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="pname" className="text-xs">Name</Label>
              <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="pphone" className="text-xs">Phone</Label>
              <Input id="pphone" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={10} className="mt-1" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={saveProfile} disabled={savingProfile} className="rounded-xl bg-gradient-primary">
              <Check className="mr-1 h-4 w-4" /> {savingProfile ? "Saving…" : "Save"}
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)} className="rounded-xl">Cancel</Button>
          </div>
        </section>
      )}

      {/* Budget tracker */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-accent"><Wallet className="h-5 w-5" /></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display font-semibold">{t("profile.budget")}</h2>
              <button onClick={promptLimit} className="text-xs font-semibold text-primary hover:underline">{t("profile.budgetSetLimit")}</button>
            </div>
            {budgetData.count === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">{t("profile.budgetNoData")}</p>
            ) : (
              <>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-muted/50 p-3"><p className="text-muted-foreground">{t("profile.budgetThisWeek")}</p><p className="mt-1 font-display text-xl font-bold">₹{budgetData.week}</p></div>
                  <div className="rounded-xl bg-muted/50 p-3"><p className="text-muted-foreground">{t("profile.budgetThisMonth")}</p><p className="mt-1 font-display text-xl font-bold">₹{budgetData.month}</p></div>
                </div>
                <div className="mt-3">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t("profile.budgetLimit")}: ₹{budgetData.limit}</span>
                    <span className={over ? "text-destructive font-semibold" : "text-accent font-semibold"}>{over ? t("profile.budgetOver") : `₹${budgetData.limit - budgetData.week} ${t("profile.budgetLeft")}`}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full transition-all duration-500 ${over ? "bg-destructive" : "bg-gradient-accent"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </>
            )}
            {import.meta.env.DEV && (
              <button onClick={() => addSpend(Math.floor(50 + Math.random() * 250), "Sample order")} className="mt-3 text-[10px] text-muted-foreground hover:text-primary">+ add sample spend (dev)</button>
            )}
          </div>
        </div>
      </section>

      {/* Theme toggle */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">{dark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}</div>
          <div className="flex-1">
            <h2 className="font-display font-semibold">{t("profile.theme")}</h2>
            <p className="text-xs text-muted-foreground">{t("profile.themeDesc")}</p>
          </div>
          <button role="switch" aria-checked={dark} onClick={() => setDark((d: boolean) => !d)} className={`relative h-6 w-11 rounded-full transition-colors ${dark ? "bg-primary" : "bg-muted"}`}>
            <span className={`absolute top-0.5 grid h-5 w-5 place-items-center rounded-full bg-background shadow-card transition-all ${dark ? "left-5" : "left-0.5"}`}>
              {dark ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
            </span>
          </button>
        </div>
      </section>

      {/* Language */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-accent"><Languages className="h-5 w-5" /></div>
          <div className="flex-1">
            <h2 className="font-display font-semibold">{t("profile.language")}</h2>
            <p className="text-xs text-muted-foreground">{t("profile.languageDesc")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {LANGS.map((l) => (
                <button key={l.code} onClick={() => setLang(l.code as Lang)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${lang === l.code ? "border-primary bg-primary text-primary-foreground shadow-pop" : "border-border bg-background hover:border-primary hover:text-primary"}`}>
                  {l.native}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Geo Location */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 text-primary" />
          <div className="flex-1">
            <h2 className="font-display font-semibold">{t("profile.location")}</h2>
            <p className="text-xs text-muted-foreground">{geo.address ? geo.address : geo.coords ? `${geo.coords.lat.toFixed(4)}, ${geo.coords.lng.toFixed(4)}` : "Not set."}</p>
          </div>
          <Button size="sm" variant="outline" className="rounded-full" onClick={geo.request}>{geo.coords ? t("common.update") : t("common.allow")}</Button>
        </div>
      </section>

      {/* Notifications */}
      <SettingPanel
        icon={<Bell className="h-4 w-4 text-primary" />}
        title={t("profile.notifications")}
        desc={t("profile.notificationsDesc")}
        open={open === "notif"}
        onToggle={() => setOpen(open === "notif" ? null : "notif")}
      >
        {[
          { k: "orders", label: "Order updates" },
          { k: "offers", label: "Offers & deals" },
          { k: "group", label: "Group order invites" },
        ].map((n) => (
          <Toggle
            key={n.k}
            label={n.label}
            value={(prefs.notif as any)[n.k]}
            onChange={(v) => setPrefs({ ...prefs, notif: { ...prefs.notif, [n.k]: v } })}
          />
        ))}
      </SettingPanel>

      {/* Payment methods */}
      <SettingPanel
        icon={<CreditCard className="h-4 w-4 text-primary" />}
        title={t("profile.payment")}
        desc={prefs.payment.upi ? `Default UPI: ${prefs.payment.upi}` : t("profile.paymentDesc")}
        open={open === "pay"}
        onToggle={() => setOpen(open === "pay" ? null : "pay")}
      >
        <div>
          <Label className="text-xs">Your UPI ID</Label>
          <Input
            placeholder="you@upi"
            value={prefs.payment.upi}
            onChange={(e) => setPrefs({ ...prefs, payment: { ...prefs.payment, upi: e.target.value } })}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Default method</Label>
          <div className="mt-2 flex gap-2">
            {(["upi", "card", "cod"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setPrefs({ ...prefs, payment: { ...prefs.payment, defaultMethod: m } })}
                className={cn("flex-1 rounded-xl border px-3 py-2 text-xs font-semibold uppercase",
                  prefs.payment.defaultMethod === m ? "border-primary bg-primary/10 text-primary" : "border-border")}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <Button size="sm" className="rounded-full bg-gradient-primary" onClick={() => toast({ title: "Saved", description: "Payment preferences updated." })}>
          <Check className="mr-1 h-3.5 w-3.5" /> Save
        </Button>
      </SettingPanel>

      {/* AI preferences */}
      <SettingPanel
        icon={<Sparkles className="h-4 w-4 text-primary" />}
        title={t("profile.aiPrefs")}
        desc={`Diet: ${prefs.ai.diet} · Spice: ${prefs.ai.spice} · Budget: ₹${prefs.ai.budget}`}
        open={open === "ai"}
        onToggle={() => setOpen(open === "ai" ? null : "ai")}
      >
        <div>
          <Label className="text-xs">Diet</Label>
          <div className="mt-2 flex gap-2">
            {(["any", "veg", "non-veg"] as const).map((d) => (
              <button key={d} onClick={() => setPrefs({ ...prefs, ai: { ...prefs.ai, diet: d } })}
                className={cn("flex-1 rounded-xl border px-3 py-2 text-xs font-semibold uppercase",
                  prefs.ai.diet === d ? "border-accent bg-accent/10 text-accent" : "border-border")}>{d}</button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-xs">Spice level</Label>
          <div className="mt-2 flex gap-2">
            {(["mild", "medium", "spicy"] as const).map((s) => (
              <button key={s} onClick={() => setPrefs({ ...prefs, ai: { ...prefs.ai, spice: s } })}
                className={cn("flex-1 rounded-xl border px-3 py-2 text-xs font-semibold uppercase",
                  prefs.ai.spice === s ? "border-orange-500 bg-orange-500/10 text-orange-500" : "border-border")}>{s}</button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-xs">Per-meal budget: ₹{prefs.ai.budget}</Label>
          <input type="range" min={50} max={500} step={10} value={prefs.ai.budget}
            onChange={(e) => setPrefs({ ...prefs, ai: { ...prefs.ai, budget: Number(e.target.value) } })}
            className="mt-2 w-full accent-primary" />
        </div>
      </SettingPanel>

      {/* Address shortcut */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10"><Home className="h-5 w-5 text-primary" /></div>
          <div className="flex-1">
            <h2 className="font-display font-semibold">{t("profile.address")}</h2>
            <p className="text-sm text-muted-foreground">{t("profile.addressDesc")}</p>
          </div>
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => setEditing(true)}>{t("common.add")}</Button>
        </div>
      </section>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-destructive/50 hover:shadow-card"
      >
        <div className="grid h-10 w-10 place-items-center rounded-full bg-destructive/10"><LogOut className="h-4 w-4 text-destructive" /></div>
        <div>
          <p className="font-display font-semibold">{t("profile.signout")}</p>
          <p className="text-xs text-muted-foreground">{t("profile.signoutDesc")}</p>
        </div>
      </button>
    </div>
  );
}

function SettingPanel({
  icon, title, desc, open, onToggle, children,
}: {
  icon: React.ReactNode; title: string; desc: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
      <button onClick={onToggle} className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/40">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-muted">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{desc}</p>
        </div>
        <span className={cn("text-muted-foreground transition-transform", open && "rotate-180")}>▾</span>
      </button>
      {open && <div className="space-y-3 border-t border-border bg-muted/20 p-4 animate-fade-in">{children}</div>}
    </section>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn("relative h-6 w-11 rounded-full transition-colors", value ? "bg-accent" : "bg-muted")}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-card transition-all", value ? "left-5" : "left-0.5")} />
      </button>
    </div>
  );
}
