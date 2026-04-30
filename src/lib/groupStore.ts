// Lightweight cross-tab "real" store backed by localStorage + storage events.
// Lets group invite links work between tabs/windows on the same device,
// and gives us a single source of truth that any subscriber can react to.

export type GroupItem = { id: string; name: string; price: number };
export type GroupMember = {
  id: string;
  name: string;
  color: string;
  isHost?: boolean;
  items: GroupItem[];
  joinedAt: number;
};
export type GroupOrder = {
  code: string;
  title: string;
  hostName: string;
  createdAt: number;
  locked: boolean;
  splitMode: "even" | "by-item";
  members: GroupMember[];
};

const KEY_PREFIX = "bb:group:";
const ACTIVE_KEY = "bb:group:active";

const palette = [
  "bg-gradient-primary",
  "bg-gradient-accent",
  "bg-foreground text-background",
  "bg-highlight text-highlight-foreground",
  "bg-primary/80",
  "bg-accent/80",
];

const rid = () => Math.random().toString(36).slice(2, 8);
const code6 = () =>
  Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");

function read(code: string): GroupOrder | null {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + code);
    return raw ? (JSON.parse(raw) as GroupOrder) : null;
  } catch {
    return null;
  }
}

function write(g: GroupOrder) {
  localStorage.setItem(KEY_PREFIX + g.code, JSON.stringify(g));
  // Nudge same-tab subscribers; storage events only fire across tabs.
  window.dispatchEvent(new CustomEvent("bb:group-change", { detail: g.code }));
}

export const groupStore = {
  getActiveCode(): string | null {
    return localStorage.getItem(ACTIVE_KEY);
  },
  setActiveCode(code: string) {
    localStorage.setItem(ACTIVE_KEY, code);
  },
  get(code: string) {
    return read(code);
  },
  create(opts: { hostName: string; title?: string }): GroupOrder {
    const code = "HSTL-" + code6();
    const g: GroupOrder = {
      code,
      title: opts.title ?? "Hostel Feast",
      hostName: opts.hostName,
      createdAt: Date.now(),
      locked: false,
      splitMode: "by-item",
      members: [
        {
          id: rid(),
          name: opts.hostName,
          color: palette[0],
          isHost: true,
          items: [],
          joinedAt: Date.now(),
        },
      ],
    };
    write(g);
    localStorage.setItem(ACTIVE_KEY, code);
    return g;
  },
  join(code: string, name: string): GroupOrder | null {
    const g = read(code);
    if (!g) return null;
    if (g.members.some((m) => m.name.toLowerCase() === name.toLowerCase())) {
      localStorage.setItem(ACTIVE_KEY, code);
      return g;
    }
    if (g.locked) return g;
    g.members.push({
      id: rid(),
      name,
      color: palette[g.members.length % palette.length],
      items: [],
      joinedAt: Date.now(),
    });
    write(g);
    localStorage.setItem(ACTIVE_KEY, code);
    return g;
  },
  addItem(code: string, memberId: string, item: Omit<GroupItem, "id">) {
    const g = read(code);
    if (!g || g.locked) return g;
    const m = g.members.find((x) => x.id === memberId);
    if (!m) return g;
    m.items.push({ id: rid(), ...item });
    write(g);
    return g;
  },
  removeItem(code: string, memberId: string, itemId: string) {
    const g = read(code);
    if (!g || g.locked) return g;
    const m = g.members.find((x) => x.id === memberId);
    if (!m) return g;
    m.items = m.items.filter((i) => i.id !== itemId);
    write(g);
    return g;
  },
  setSplit(code: string, mode: "even" | "by-item") {
    const g = read(code);
    if (!g) return g;
    g.splitMode = mode;
    write(g);
    return g;
  },
  lock(code: string) {
    const g = read(code);
    if (!g) return g;
    g.locked = true;
    write(g);
    return g;
  },
  reset(code: string) {
    localStorage.removeItem(KEY_PREFIX + code);
    if (localStorage.getItem(ACTIVE_KEY) === code) localStorage.removeItem(ACTIVE_KEY);
    window.dispatchEvent(new CustomEvent("bb:group-change", { detail: code }));
  },
  subscribe(code: string, cb: (g: GroupOrder | null) => void) {
    const handler = (e: Event) => {
      if (e instanceof StorageEvent && e.key && e.key !== KEY_PREFIX + code) return;
      if (e instanceof CustomEvent && e.detail && e.detail !== code) return;
      cb(read(code));
    };
    window.addEventListener("storage", handler);
    window.addEventListener("bb:group-change", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("bb:group-change", handler);
    };
  },
};

export function totalsFor(g: GroupOrder) {
  const perMember = g.members.map((m) => ({
    member: m,
    subtotal: m.items.reduce((s, i) => s + i.price, 0),
  }));
  const total = perMember.reduce((s, p) => s + p.subtotal, 0);
  const evenShare = g.members.length ? Math.ceil(total / g.members.length) : 0;
  return { perMember, total, evenShare };
}
