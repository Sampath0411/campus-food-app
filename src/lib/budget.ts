// Lightweight budget tracker — localStorage based.
// Records spend entries and computes weekly/monthly totals.

const KEY = "bb:budget:entries";
const LIMIT_KEY = "bb:budget:weekly-limit";

export type SpendEntry = { ts: number; amount: number; label?: string };

export function getEntries(): SpendEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addSpend(amount: number, label?: string) {
  const entries = getEntries();
  entries.push({ ts: Date.now(), amount, label });
  localStorage.setItem(KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event("bb:budget:update"));
}

export function getWeeklyLimit(): number {
  const v = localStorage.getItem(LIMIT_KEY);
  return v ? Number(v) : 1500;
}

export function setWeeklyLimit(v: number) {
  localStorage.setItem(LIMIT_KEY, String(v));
  window.dispatchEvent(new Event("bb:budget:update"));
}

function startOfWeek(d = new Date()) {
  const day = d.getDay(); // 0 Sun ... 6 Sat
  const diff = (day + 6) % 7; // make Monday start
  const monday = new Date(d);
  monday.setDate(d.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

export function summary() {
  const entries = getEntries();
  const wkStart = startOfWeek();
  const moStart = startOfMonth();
  const week = entries.filter((e) => e.ts >= wkStart).reduce((s, e) => s + e.amount, 0);
  const month = entries.filter((e) => e.ts >= moStart).reduce((s, e) => s + e.amount, 0);
  return { week, month, count: entries.length };
}
