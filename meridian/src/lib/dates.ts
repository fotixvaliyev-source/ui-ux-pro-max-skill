/** Quarter helpers. A quarter is a string like "2026-Q4". All dates are handled in UTC to stay stable across servers. */

export const QUARTER_RE = /^\d{4}-Q[1-4]$/;

export function quarterOf(date: Date): string {
  return `${date.getUTCFullYear()}-Q${Math.floor(date.getUTCMonth() / 3) + 1}`;
}

export function quarterLabel(q: string): string {
  const [year, qn] = q.split("-");
  return `${qn} ${year}`;
}

export function quarterEnd(q: string): Date {
  const [yearStr, qn] = q.split("-Q");
  const year = Number(yearStr);
  const month = Number(qn) * 3; // 1-based month after the quarter's last month
  return new Date(Date.UTC(year, month, 0, 12)); // day 0 of next month = last day of this quarter
}

/** The quarter before and after `q`, plus the current one around it, for a small selector. */
export function nearbyQuarters(now: Date, extra: string[] = []): string[] {
  const set = new Set<string>(extra);
  let y = now.getUTCFullYear();
  let n = Math.floor(now.getUTCMonth() / 3) + 1;
  for (let i = 0; i < 4; i++) {
    set.add(`${y}-Q${n}`);
    n += 1;
    if (n > 4) { n = 1; y += 1; }
  }
  // one quarter back
  let by = now.getUTCFullYear();
  let bn = Math.floor(now.getUTCMonth() / 3);
  if (bn < 1) { bn = 4; by -= 1; }
  set.add(`${by}-Q${bn}`);
  return [...set].sort();
}

export function formatDate(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function formatDateTime(d: Date): string {
  return d.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false });
}

/** yyyy-mm-dd for <input type="date"> */
export function toDateInput(d: Date | null | undefined): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

/** Relative "3 days ago" style text for activity feeds. */
export function timeAgo(d: Date, now = new Date()): string {
  const s = Math.round((now.getTime() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const days = Math.round(h / 24);
  if (days < 30) return `${days} d ago`;
  return formatDate(d);
}
