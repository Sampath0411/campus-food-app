import { useEffect, useState } from "react";
import { MapPin, Bell, CreditCard, LogOut, Sparkles, Home, Edit, Phone, Moon, Sun, Languages, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useI18n, LANGS, Lang } from "@/lib/i18n";
import { summary, getWeeklyLimit, setWeeklyLimit, addSpend } from "@/lib/budget";

export default function Profile() {
  const geo = useGeolocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t, lang, setLang } = useI18n();

  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("bb:dark-mode");
    return saved === null ? true : JSON.parse(saved);
  });

  useEffect(() => {
    localStorage.setItem("bb:dark-mode", JSON.stringify(dark));
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Budget tracker state
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

  function handleSignOut() {
    signOut();
    navigate("/login");
  }

  function promptLimit() {
    const v = prompt("Set your weekly food budget (₹):", String(budgetData.limit));
    if (v && !isNaN(Number(v))) setWeeklyLimit(Number(v));
  }

  const initials = user?.name?.charAt(0).toUpperCase() || "U";
  const pct = Math.min(100, Math.round((budgetData.week / Math.max(1, budgetData.limit)) * 100));
  const over = budgetData.week > budgetData.limit;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* User Header */}
      <header className="flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-accent text-2xl font-bold text-accent-foreground">
          {initials}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">{t("common.welcome")}, {user?.name || t("common.guest")}!</h1>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" />
              {user?.phone || "—"}
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              {user?.email || "—"}
            </div>
          </div>
        </div>
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => navigate("/edit-profile")}>
          <Edit className="h-4 w-4" />
        </Button>
      </header>

      {/* Budget tracker */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-accent">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display font-semibold">{t("profile.budget")}</h2>
              <button onClick={promptLimit} className="text-xs font-semibold text-primary hover:underline">
                {t("profile.budgetSetLimit")}
              </button>
            </div>

            {budgetData.count === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">{t("profile.budgetNoData")}</p>
            ) : (
              <>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-muted-foreground">{t("profile.budgetThisWeek")}</p>
                    <p className="mt-1 font-display text-xl font-bold">₹{budgetData.week}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-muted-foreground">{t("profile.budgetThisMonth")}</p>
                    <p className="mt-1 font-display text-xl font-bold">₹{budgetData.month}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t("profile.budgetLimit")}: ₹{budgetData.limit}</span>
                    <span className={over ? "text-destructive font-semibold" : "text-accent font-semibold"}>
                      {over ? t("profile.budgetOver") : `₹${budgetData.limit - budgetData.week} ${t("profile.budgetLeft")}`}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${over ? "bg-destructive" : "bg-gradient-accent"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Demo: add a quick sample spend */}
            {import.meta.env.DEV && (
              <button
                onClick={() => addSpend(Math.floor(50 + Math.random() * 250), "Sample order")}
                className="mt-3 text-[10px] text-muted-foreground hover:text-primary"
              >
                + add sample spend (dev)
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Theme toggle */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
            {dark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            <h2 className="font-display font-semibold">{t("profile.theme")}</h2>
            <p className="text-xs text-muted-foreground">{t("profile.themeDesc")}</p>
          </div>
          <button
            role="switch"
            aria-checked={dark}
            onClick={() => setDark((d: boolean) => !d)}
            className={`relative h-6 w-11 rounded-full transition-colors ${dark ? "bg-primary" : "bg-muted"}`}
          >
            <span
              className={`absolute top-0.5 grid h-5 w-5 place-items-center rounded-full bg-background shadow-card transition-all ${dark ? "left-5" : "left-0.5"}`}
            >
              {dark ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
            </span>
          </button>
        </div>
      </section>

      {/* Language */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-accent">
            <Languages className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-display font-semibold">{t("profile.language")}</h2>
            <p className="text-xs text-muted-foreground">{t("profile.languageDesc")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code as Lang)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                    lang === l.code
                      ? "border-primary bg-primary text-primary-foreground shadow-pop"
                      : "border-border bg-background hover:border-primary hover:text-primary"
                  }`}
                >
                  {l.native}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Address */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10">
            <Home className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-display font-semibold">{t("profile.address")}</h2>
            <p className="text-sm text-muted-foreground">{t("profile.addressDesc")}</p>
          </div>
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => navigate("/edit-profile")}>
            {t("common.add")}
          </Button>
        </div>
      </section>

      {/* Geo Location */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 text-primary" />
          <div className="flex-1">
            <h2 className="font-display font-semibold">{t("profile.location")}</h2>
            <p className="text-xs text-muted-foreground">
              {geo.address
                ? geo.address
                : geo.coords
                ? `${geo.coords.lat.toFixed(4)}, ${geo.coords.lng.toFixed(4)}`
                : "Not set."}
            </p>
          </div>
          <Button size="sm" variant="outline" className="rounded-full" onClick={geo.request}>
            {geo.coords ? t("common.update") : t("common.allow")}
          </Button>
        </div>
      </section>

      {/* Settings Grid */}
      <section className="grid gap-3 md:grid-cols-2">
        {[
          { icon: Bell, label: t("profile.notifications"), desc: t("profile.notificationsDesc") },
          { icon: CreditCard, label: t("profile.payment"), desc: t("profile.paymentDesc") },
          { icon: Sparkles, label: t("profile.aiPrefs"), desc: t("profile.aiPrefsDesc") },
          { icon: LogOut, label: t("profile.signout"), desc: t("profile.signoutDesc"), danger: true, action: handleSignOut },
        ].map((row: any) => (
          <button
            key={row.label}
            onClick={row.action ?? undefined}
            className={`flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card ${
              row.danger ? "hover:border-destructive/50" : ""
            }`}
          >
            <div className={`grid h-10 w-10 place-items-center rounded-full ${row.danger ? "bg-destructive/10" : "bg-muted"}`}>
              <row.icon className={`h-4 w-4 ${row.danger ? "text-destructive" : ""}`} />
            </div>
            <div>
              <p className="font-display font-semibold">{row.label}</p>
              <p className="text-xs text-muted-foreground">{row.desc}</p>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
}
