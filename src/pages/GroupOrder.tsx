import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Copy, Check, Plus, Users, Share2, Sparkles, Crown, Lock, Trash2, UserPlus, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { GroupOrder as GroupOrderT, groupStore, totalsFor } from "@/lib/groupStore";
import { menu } from "@/data/mock";
import { toast } from "@/hooks/use-toast";
import { nameSchema, groupCodeSchema, rateLimit, safeText } from "@/lib/security";

function shareLinkFor(code: string) {
  return `${window.location.origin}/g/${code}`;
}

export default function GroupOrder() {
  const params = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();

  const codeFromUrl = params.code ?? null;
  const [code, setCode] = useState<string | null>(codeFromUrl ?? groupStore.getActiveCode());
  const [group, setGroup] = useState<GroupOrderT | null>(() => (code ? groupStore.get(code) : null));
  const [copied, setCopied] = useState(false);
  const [meId, setMeId] = useState<string | null>(() => localStorage.getItem("bb:me-member"));
  const [joinName, setJoinName] = useState("");
  const [showJoin, setShowJoin] = useState(false);

  // Subscribe to live updates for the active group
  useEffect(() => {
    if (!code) return;
    const unsub = groupStore.subscribe(code, (g) => setGroup(g));
    setGroup(groupStore.get(code));
    return unsub;
  }, [code]);

  // Auto-prompt join dialog if landing on /g/:code without a member identity
  useEffect(() => {
    if (!codeFromUrl) return;
    const g = groupStore.get(codeFromUrl);
    if (!g) {
      toast({ title: "Group not found", description: "That invite link is invalid or expired." });
      navigate("/group", { replace: true });
      return;
    }
    setCode(codeFromUrl);
    const stored = localStorage.getItem("bb:me-member");
    const stillMember = stored && g.members.some((m) => m.id === stored);
    if (!stillMember) {
      setJoinName(search.get("name") ?? "");
      setShowJoin(true);
    }
  }, [codeFromUrl, navigate, search]);

  const totals = useMemo(() => (group ? totalsFor(group) : null), [group]);
  const me = group && meId ? group.members.find((m) => m.id === meId) ?? null : null;

  function handleCreate(name: string) {
    const g = groupStore.create({ hostName: name || "Sampath", title: "Block C · Friday Feast" });
    localStorage.setItem("bb:me-member", g.members[0].id);
    setMeId(g.members[0].id);
    setCode(g.code);
    toast({ title: "Group created", description: `Share code ${g.code} with friends.` });
  }

  function handleJoin() {
    if (!code) return;
    const name = joinName.trim();
    if (!name) {
      toast({ title: "Name required", description: "Tell us who's joining." });
      return;
    }
    const g = groupStore.join(code, name);
    if (!g) return;
    const mine = g.members.find((m) => m.name.toLowerCase() === name.toLowerCase());
    if (mine) {
      localStorage.setItem("bb:me-member", mine.id);
      setMeId(mine.id);
    }
    setShowJoin(false);
    if (codeFromUrl) navigate("/group", { replace: true });
  }

  function copyLink() {
    if (!code) return;
    navigator.clipboard.writeText(shareLinkFor(code));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function shareNative() {
    if (!code) return;
    const url = shareLinkFor(code);
    if (navigator.share) {
      navigator.share({ title: "Join my Bytebites group order", text: `Use code ${code}`, url }).catch(() => {});
    } else {
      copyLink();
    }
  }

  // -------- Empty state: no group yet ----------
  if (!group) {
    return <EmptyState onCreate={handleCreate} onJoin={(c, n) => {
      const g = groupStore.join(c, n);
      if (!g) { toast({ title: "Invalid code" }); return; }
      const mine = g.members.find((m) => m.name.toLowerCase() === n.toLowerCase());
      if (mine) { localStorage.setItem("bb:me-member", mine.id); setMeId(mine.id); }
      setCode(c);
    }} />;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Group order · {group.code}</p>
          <h1 className="font-display text-2xl font-bold md:text-3xl flex items-center gap-2">{group.title} <Users className="h-6 w-6 text-primary" /></h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5" /> {group.members.length} hostelers · split {group.splitMode === "even" ? "evenly" : "by item"}
            {group.locked && <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"><Lock className="h-3 w-3" /> Locked</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full" onClick={() => { groupStore.reset(group.code); setGroup(null); setCode(null); setMeId(null); localStorage.removeItem("bb:me-member"); }}>
            <RefreshCw className="mr-1.5 h-4 w-4" /> End group
          </Button>
          <Button className="rounded-full bg-gradient-primary shadow-pop" onClick={shareNative}>
            <Share2 className="mr-1.5 h-4 w-4" /> Share invite
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        <div className="space-y-5">
          {/* Invite */}
          <section className="rounded-2xl border border-border bg-gradient-hero p-5 shadow-soft">
            <div className="flex items-start gap-3">
              <Share2 className="mt-1 h-5 w-5 text-primary" />
              <div className="min-w-0 flex-1">
                <h2 className="font-display font-semibold">Invite friends</h2>
                <p className="text-xs text-muted-foreground">
                  Anyone with the link joins this group from their device. Add items till the host locks the cart.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-dashed border-primary/50 bg-card px-4 py-2.5">
                <span className="text-xs text-muted-foreground">Code</span>
                <span className="font-display text-lg font-bold tracking-widest text-primary">{group.code}</span>
              </div>
              <Input value={shareLinkFor(group.code)} readOnly className="rounded-xl bg-card font-mono text-xs" />
              <Button onClick={copyLink} className="rounded-xl bg-gradient-primary">
                {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
                {copied ? "Copied" : "Copy link"}
              </Button>
            </div>
            {!me && (
              <div className="mt-3">
                <Button variant="secondary" size="sm" className="rounded-full" onClick={() => setShowJoin(true)}>
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Join this group
                </Button>
              </div>
            )}
          </section>

          {/* Add item to my tab */}
          {me && !group.locked && <AddItemPanel onAdd={(item) => {
            const g = groupStore.addItem(group.code, me.id, item);
            if (g) setGroup(g);
          }} />}

          {/* Members shared cart */}
          <section className="rounded-2xl border border-border bg-card p-4 shadow-soft md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display font-semibold">Shared cart</h2>
              <span className="text-xs text-muted-foreground">Tagged by member</span>
            </div>
            <ul className="space-y-4">
              {group.members.map((m) => {
                const sub = m.items.reduce((s, i) => s + i.price, 0);
                const isMe = me?.id === m.id;
                return (
                  <li key={m.id} className="rounded-2xl border border-border bg-background p-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-primary-foreground ${m.color}`}>
                        {m.name[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 font-display font-semibold">
                          {m.name}{isMe && <span className="text-xs text-muted-foreground">(you)</span>}
                          {m.isHost && <Crown className="h-3.5 w-3.5 text-highlight" />}
                        </p>
                        <p className="text-xs text-muted-foreground">{m.items.length} items · ₹{sub}</p>
                      </div>
                    </div>
                    {m.items.length > 0 && (
                      <ul className="mt-2 ml-13 space-y-1 border-l border-dashed border-border pl-4 text-sm">
                        {m.items.map((it) => (
                          <li key={it.id} className="flex items-center justify-between gap-2">
                            <span>{it.name}</span>
                            <span className="flex items-center gap-2">
                              <span className="font-semibold">₹{it.price}</span>
                              {isMe && !group.locked && (
                                <button
                                  className="text-muted-foreground hover:text-destructive"
                                  onClick={() => { const g = groupStore.removeItem(group.code, m.id, it.id); if (g) setGroup(g); }}
                                  aria-label="Remove"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {/* Split summary */}
        <aside>
          <div className="sticky top-20 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">Auto split</h3>
                <ToggleGroup
                  type="single"
                  value={group.splitMode}
                  onValueChange={(v) => v && setGroup(groupStore.setSplit(group.code, v as "even" | "by-item") ?? group)}
                  size="sm"
                >
                  <ToggleGroupItem value="by-item" className="text-xs">By item</ToggleGroupItem>
                  <ToggleGroupItem value="even" className="text-xs">Even</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {group.splitMode === "even"
                  ? "Total divided equally across members."
                  : "Each member is charged for what they added."}
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {totals!.perMember.map(({ member, subtotal }) => {
                  const owed = group.splitMode === "even" ? totals!.evenShare : subtotal;
                  return (
                    <li key={member.id} className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold text-primary-foreground ${member.color}`}>
                          {member.name[0]?.toUpperCase()}
                        </span>
                        {member.name}
                      </span>
                      <span className="font-semibold">₹{owed}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 space-y-2 border-t border-dashed border-border pt-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Group total</span><span className="font-semibold">₹{totals!.total}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Even share (×{group.members.length})</span><span className="font-semibold">₹{totals!.evenShare}</span></div>
              </div>
              <Button
                className="mt-5 h-11 w-full rounded-xl bg-gradient-primary shadow-pop"
                onClick={() => {
                  groupStore.lock(group.code);
                  toast({ title: "Cart locked", description: "Heading to checkout…" });
                  navigate("/cart");
                }}
                disabled={!totals!.total}
              >
                <Lock className="mr-1.5 h-4 w-4" /> Lock cart & checkout
              </Button>
            </div>

            <div className="rounded-2xl bg-foreground p-4 text-background">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Pro tip</p>
              <p className="mt-1 font-display text-sm font-semibold">Add 2 more items to unlock free delivery for the whole group.</p>
            </div>
          </div>
        </aside>
      </div>

      {/* Join dialog */}
      <Dialog open={showJoin} onOpenChange={setShowJoin}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join {group.title}</DialogTitle>
            <DialogDescription>You'll be added to the shared cart with code <span className="font-mono">{group.code}</span>.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="joinName">Your name</Label>
            <Input id="joinName" value={joinName} onChange={(e) => setJoinName(e.target.value)} placeholder="e.g., Aarav" />
          </div>
          <DialogFooter>
            <Button onClick={handleJoin} className="bg-gradient-primary">Join group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddItemPanel({ onAdd }: { onAdd: (item: { name: string; price: number }) => void }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-soft md:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display font-semibold">Add to your tab</h2>
        <span className="text-xs text-muted-foreground">From popular menu</span>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {menu.slice(0, 6).map((m) => (
          <button
            key={m.id}
            onClick={() => onAdd({ name: m.name, price: m.price })}
            className="group flex items-center justify-between gap-2 rounded-xl border border-border bg-background p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-card"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{m.name}</span>
              <span className="text-xs text-muted-foreground">₹{m.price}</span>
            </span>
            <Plus className="h-4 w-4 shrink-0 text-primary" />
          </button>
        ))}
      </div>
    </section>
  );
}

function EmptyState({
  onCreate,
  onJoin,
}: {
  onCreate: (name: string) => void;
  onJoin: (code: string, name: string) => void;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">Group order</p>
        <h1 className="font-display text-2xl font-bold md:text-3xl flex items-center gap-2">Order together, split the bill <Users className="h-6 w-6 text-primary" /></h1>
        <p className="mt-1 text-sm text-muted-foreground">Start a group or join a friend's invite — bills split automatically.</p>
      </header>
      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-gradient-hero p-6 shadow-soft">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="mt-3 font-display text-lg font-semibold">Start a new group</h2>
          <p className="text-xs text-muted-foreground">You'll be the host. Share the link with friends in your hostel.</p>
          <div className="mt-4 space-y-2">
            <Label htmlFor="hostName">Your name</Label>
            <Input id="hostName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Sampath" />
          </div>
          <Button className="mt-4 w-full rounded-xl bg-gradient-primary" onClick={() => onCreate(name)}>
            <Crown className="mr-1.5 h-4 w-4" /> Create group
          </Button>
        </section>
        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <UserPlus className="h-6 w-6 text-accent" />
          <h2 className="mt-3 font-display text-lg font-semibold">Join with code</h2>
          <p className="text-xs text-muted-foreground">Got an invite from a friend? Enter the code or open their link.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="joinCode">Code</Label>
              <Input id="joinCode" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="HSTL-AB12CD" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="joinSelf">Your name</Label>
              <Input id="joinSelf" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aarav" />
            </div>
          </div>
          <Button variant="outline" className="mt-4 w-full rounded-xl" onClick={() => onJoin(code.trim(), name.trim() || "Guest")}>
            Join group
          </Button>
        </section>
      </div>
    </div>
  );
}
