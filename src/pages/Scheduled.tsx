import { CalendarClock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const upcoming = [
  { id: 1, when: "Today · 8:30 PM", title: "Mama's Corner — Mac & Cheese combo", note: "Repeats every Friday" },
  { id: 2, when: "Tomorrow · 1:00 PM", title: "Hostel Hub Tiffins — Veg Thali", note: "One-time" },
];

export default function Scheduled() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Scheduled orders</p>
          <h1 className="font-display text-2xl font-bold md:text-3xl flex items-center gap-2">Plan your week of meals <CalendarClock className="h-6 w-6 text-primary" /></h1>
        </div>
        <Button className="rounded-full bg-gradient-primary shadow-pop">
          <Plus className="mr-1.5 h-4 w-4" /> New schedule
        </Button>
      </header>

      <div className="grid gap-3">
        {upcoming.map((u) => (
          <article key={u.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-primary">{u.when}</p>
              <p className="truncate font-display font-semibold">{u.title}</p>
              <p className="text-xs text-muted-foreground">{u.note}</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-full">Edit</Button>
          </article>
        ))}
      </div>

      <section className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center">
        <p className="font-display font-semibold">Want food on autopilot?</p>
        <p className="mt-1 text-sm text-muted-foreground">Schedule recurring orders so dinner shows up without thinking about it.</p>
      </section>
    </div>
  );
}
