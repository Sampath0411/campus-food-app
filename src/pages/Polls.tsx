import { useEffect, useMemo, useState } from "react";
import { Vote, Users, Clock, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pollStore, type Poll } from "@/lib/pollStore";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function timeLeft(ts: number) {
  const d = ts - Date.now();
  if (d < 0) return "Ended";
  const m = Math.floor(d / 60000);
  if (m < 60) return `${m}m left`;
  return `${Math.floor(m / 60)}h ${m % 60}m left`;
}

export default function Polls() {
  const [polls, setPolls] = useState<Poll[]>(pollStore.list());
  const [openCreate, setOpenCreate] = useState(false);
  const [q, setQ] = useState("");
  const [hostel, setHostel] = useState("Block A");
  const [opts, setOpts] = useState(["", ""]);

  useEffect(() => {
    const refresh = () => setPolls(pollStore.list());
    window.addEventListener("bb:polls:update", refresh);
    return () => window.removeEventListener("bb:polls:update", refresh);
  }, []);

  const totalVotes = useMemo(() => polls.reduce((a, p) => a + p.options.reduce((s, o) => s + o.votes, 0), 0), [polls]);

  function castVote(pollId: string, optId: string) {
    const ok = pollStore.vote(pollId, optId);
    toast({ title: ok ? "Vote counted!" : "Already voted", description: ok ? "Thanks for voting." : "Only one vote per poll." });
  }

  function createPoll() {
    const cleanOpts = opts.map((o) => o.trim()).filter(Boolean);
    if (!q.trim() || cleanOpts.length < 2) {
      toast({ title: "Add a question + at least 2 options", variant: "destructive" });
      return;
    }
    pollStore.create({ question: q.trim(), hostel, options: cleanOpts, endsAt: Date.now() + 4 * 3600_000 });
    setQ(""); setOpts(["", ""]); setOpenCreate(false);
    toast({ title: "Poll posted", description: "Your hostel mates can now vote." });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Hostel decisions</p>
          <h1 className="font-display text-2xl font-bold">Food Polls</h1>
          <p className="text-xs text-muted-foreground">{totalVotes} votes across {polls.length} polls</p>
        </div>
        <Button onClick={() => setOpenCreate(true)} className="rounded-full bg-gradient-primary"><Plus className="mr-1 h-4 w-4" />New Poll</Button>
      </header>

      {openCreate && (
        <section className="rounded-2xl border border-border bg-card p-5 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Create a poll</h2>
            <button onClick={() => setOpenCreate(false)}><X className="h-4 w-4" /></button>
          </div>
          <div>
            <Label className="text-xs">Question</Label>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="What should we order tonight?" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Hostel / Block</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Block A", "Block B", "Block C", "Block D"].map((h) => (
                <button key={h} onClick={() => setHostel(h)} className={cn("rounded-full border px-3 py-1 text-xs font-semibold", hostel === h ? "border-primary bg-primary/10 text-primary" : "border-border")}>{h}</button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs">Options</Label>
            <div className="mt-1 space-y-2">
              {opts.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={o} onChange={(e) => setOpts(opts.map((x, j) => (i === j ? e.target.value : x)))} placeholder={`Option ${i + 1}`} />
                  {opts.length > 2 && <button onClick={() => setOpts(opts.filter((_, j) => j !== i))}><X className="h-4 w-4 text-muted-foreground" /></button>}
                </div>
              ))}
              {opts.length < 5 && <button onClick={() => setOpts([...opts, ""])} className="text-xs font-semibold text-primary hover:underline"><Plus className="inline h-3 w-3" /> Add option</button>}
            </div>
          </div>
          <Button onClick={createPoll} className="rounded-full bg-gradient-primary"><Check className="mr-1 h-4 w-4" /> Post poll</Button>
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {polls.map((p) => {
          const total = p.options.reduce((s, o) => s + o.votes, 0) || 1;
          const voted = p.voters.includes("me");
          const ended = p.endsAt < Date.now();
          const winner = [...p.options].sort((a, b) => b.votes - a.votes)[0];
          return (
            <section key={p.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="h-3 w-3" /> {p.hostel}</div>
                  <h3 className="mt-1 font-display font-bold">{p.question}</h3>
                </div>
                <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold flex items-center gap-1"><Clock className="h-3 w-3" />{timeLeft(p.endsAt)}</span>
              </div>
              <div className="mt-3 space-y-2">
                {p.options.map((o) => {
                  const pct = Math.round((o.votes / total) * 100);
                  const isWin = ended && o.id === winner.id;
                  return (
                    <button
                      key={o.id}
                      disabled={voted || ended}
                      onClick={() => castVote(p.id, o.id)}
                      className={cn("relative w-full overflow-hidden rounded-xl border px-3 py-2.5 text-left text-sm transition-all",
                        voted || ended ? "cursor-default" : "hover:border-primary",
                        isWin ? "border-accent" : "border-border")}
                    >
                      <div className={cn("absolute inset-y-0 left-0 transition-all", isWin ? "bg-accent/20" : "bg-primary/10")} style={{ width: `${pct}%` }} />
                      <div className="relative flex items-center justify-between">
                        <span className="font-medium">{o.label}{isWin && " 🏆"}</span>
                        <span className="text-xs font-semibold">{o.votes} · {pct}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span><Vote className="mr-1 inline h-3 w-3" />{total} votes</span>
                {voted && <span className="font-semibold text-accent">You voted</span>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
