// Lightweight client-side security helpers: rate limiting + input validation.
// Note: client-side checks are UX guards. Real enforcement must happen server-side.
import { z } from "zod";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, max = 5, windowMs = 10_000): { ok: boolean; retryInMs: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryInMs: 0 };
  }
  if (b.count >= max) return { ok: false, retryInMs: b.resetAt - now };
  b.count += 1;
  return { ok: true, retryInMs: 0 };
}

export function stripControlChars(s: string) {
  return s.replace(/[\u0000-\u001F\u007F\u200B-\u200F\u202A-\u202E\uFEFF]/g, "");
}

export function safeText(s: string, max = 200) {
  return stripControlChars(s).trim().slice(0, max);
}

export const nameSchema = z
  .string()
  .trim()
  .min(1, "Name required")
  .max(40, "Name too long")
  .regex(/^[\p{L}\p{N}\s'.\-]+$/u, "Letters, numbers and basic punctuation only");

export const groupCodeSchema = z
  .string()
  .trim()
  .regex(/^HSTL-[A-Z0-9]{6}$/, "Invalid group code");

export const budgetSchema = z
  .number()
  .int()
  .min(500, "Minimum ₹500")
  .max(10_000, "Maximum ₹10,000");
