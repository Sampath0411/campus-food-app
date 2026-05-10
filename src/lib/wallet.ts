// Lightweight referral wallet (mock, localStorage-backed)
const BAL_KEY = "bb:wallet:balance";
const CODE_KEY = "bb:wallet:code";
const REDEEMED_KEY = "bb:wallet:redeemed";
const TX_KEY = "bb:wallet:txns";

export type WalletTxn = { id: string; ts: number; amount: number; reason: string };

function rand(n = 6) {
  const c = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < n; i++) s += c[Math.floor(Math.random() * c.length)];
  return s;
}

export function getReferralCode(): string {
  let c = localStorage.getItem(CODE_KEY);
  if (!c) {
    c = "QB-" + rand(6);
    localStorage.setItem(CODE_KEY, c);
  }
  return c;
}

export function getBalance(): number {
  return Number(localStorage.getItem(BAL_KEY) || 0);
}

export function getTxns(): WalletTxn[] {
  try { return JSON.parse(localStorage.getItem(TX_KEY) || "[]"); } catch { return []; }
}

function setBalance(v: number) {
  localStorage.setItem(BAL_KEY, String(Math.max(0, v)));
  window.dispatchEvent(new Event("bb:wallet:update"));
}

function pushTxn(amount: number, reason: string) {
  const list = getTxns();
  list.unshift({ id: crypto.randomUUID(), ts: Date.now(), amount, reason });
  localStorage.setItem(TX_KEY, JSON.stringify(list.slice(0, 30)));
}

export function credit(amount: number, reason: string) {
  setBalance(getBalance() + amount);
  pushTxn(amount, reason);
}

export function debit(amount: number, reason: string): boolean {
  if (getBalance() < amount) return false;
  setBalance(getBalance() - amount);
  pushTxn(-amount, reason);
  return true;
}

export function redeemCode(code: string): { ok: boolean; msg: string } {
  const c = code.trim().toUpperCase();
  if (!/^QB-[A-Z0-9]{6}$/.test(c)) return { ok: false, msg: "Invalid code format. Try QB-XXXXXX." };
  if (c === getReferralCode()) return { ok: false, msg: "You can't redeem your own code." };
  const used: string[] = JSON.parse(localStorage.getItem(REDEEMED_KEY) || "[]");
  if (used.includes(c)) return { ok: false, msg: "Code already redeemed." };
  used.push(c);
  localStorage.setItem(REDEEMED_KEY, JSON.stringify(used));
  credit(50, `Referral bonus (${c})`);
  return { ok: true, msg: "₹50 added to your wallet!" };
}
