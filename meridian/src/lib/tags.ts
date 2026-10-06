import { z } from "zod";

const tagListSchema = z.array(z.string());

/** Tags are stored as a JSON string so one schema works on SQLite and PostgreSQL. */
export function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = tagListSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

/** Trim, lowercase, drop empties and duplicates, cap length and count. */
export function normalizeTags(tags: readonly string[], max = 12): string[] {
  const seen = new Set<string>();
  for (const t of tags) {
    const clean = t.trim().toLowerCase().slice(0, 32);
    if (clean) seen.add(clean);
    if (seen.size >= max) break;
  }
  return [...seen];
}

export function serializeTags(tags: readonly string[]): string {
  return JSON.stringify(normalizeTags(tags));
}
