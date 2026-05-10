// Mock food polls store (localStorage)
const KEY = "bb:polls";

export type Poll = {
  id: string;
  question: string;
  hostel: string;
  options: { id: string; label: string; votes: number }[];
  createdAt: number;
  endsAt: number;
  voters: string[]; // poll voter ids who already voted
};

const SEED: Poll[] = [
  {
    id: "p1",
    question: "Block B — what's for dinner tonight?",
    hostel: "Block B",
    options: [
      { id: "a", label: "Hyderabadi Biryani", votes: 14 },
      { id: "b", label: "Campus Pizza (BOGO)", votes: 9 },
      { id: "c", label: "Kathi Rolls", votes: 6 },
      { id: "d", label: "Ramen", votes: 4 },
    ],
    createdAt: Date.now() - 3600_000,
    endsAt: Date.now() + 5400_000,
    voters: [],
  },
  {
    id: "p2",
    question: "Sunday brunch pick — Block A",
    hostel: "Block A",
    options: [
      { id: "a", label: "Pesarattu + Upma", votes: 8 },
      { id: "b", label: "Masala Dosa", votes: 11 },
      { id: "c", label: "Chole Bhature", votes: 5 },
    ],
    createdAt: Date.now() - 7200_000,
    endsAt: Date.now() + 9000_000,
    voters: [],
  },
];

function read(): Poll[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(SEED));
      return SEED;
    }
    return JSON.parse(raw);
  } catch {
    return SEED;
  }
}

function write(polls: Poll[]) {
  localStorage.setItem(KEY, JSON.stringify(polls));
  window.dispatchEvent(new Event("bb:polls:update"));
}

export const pollStore = {
  list: () => read().sort((a, b) => b.createdAt - a.createdAt),
  vote(pollId: string, optId: string, voter = "me") {
    const polls = read();
    const p = polls.find((x) => x.id === pollId);
    if (!p || p.voters.includes(voter)) return false;
    const o = p.options.find((x) => x.id === optId);
    if (!o) return false;
    o.votes += 1;
    p.voters.push(voter);
    write(polls);
    return true;
  },
  create(p: Omit<Poll, "id" | "createdAt" | "voters" | "options"> & { options: string[] }) {
    const polls = read();
    polls.unshift({
      id: "p" + Date.now(),
      question: p.question,
      hostel: p.hostel,
      endsAt: p.endsAt,
      createdAt: Date.now(),
      voters: [],
      options: p.options.map((label, i) => ({ id: String.fromCharCode(97 + i), label, votes: 0 })),
    });
    write(polls);
  },
};
