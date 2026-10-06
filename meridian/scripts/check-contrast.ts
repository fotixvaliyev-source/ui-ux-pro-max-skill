/**
 * Parses the design tokens in src/app/globals.css and fails if any text/background
 * pair drops below WCAG AA (4.5:1 for text, 3:1 for UI and large text).
 */
import { readFileSync } from "node:fs";
import path from "node:path";

type Tokens = Record<string, string>;

export function parseBlock(css: string, selector: string): Tokens {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`Block ${selector} not found`);
  const end = css.indexOf("}", start);
  const out: Tokens = {};
  for (const m of css.slice(start, end).matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    const [, name, hex] = m;
    if (name && hex) out[name] = hex;
  }
  return out;
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const FEATURES = ["goals", "meetings", "decisions", "opps", "projects", "library", "directory"];

/** [foreground token, background token, minimum ratio] */
export function pairs(): Array<[string, string, number]> {
  const list: Array<[string, string, number]> = [
    ["ink", "bg", 4.5],
    ["ink", "surface", 4.5],
    ["ink-soft", "bg", 4.5],
    ["ink-soft", "surface", 4.5],
    ["primary-ink", "primary", 4.5],
    ["primary", "bg", 4.5],
    ["primary", "surface", 4.5],
    ["primary-soft-ink", "primary-soft", 4.5],
    ["danger", "bg", 4.5],
    ["danger", "danger-tint", 4.5],
    ["danger", "surface", 4.5],
    // UI contrast: key borders against the page
    ["ink", "bg", 3],
  ];
  for (const f of FEATURES) {
    list.push([`${f}-text`, `${f}-tint`, 4.5]);
    list.push([`${f}-text`, "surface", 4.5]);
  }
  return list;
}

export function check(css: string): string[] {
  const failures: string[] = [];
  const base = parseBlock(css, ":root");
  const modes: Record<string, Tokens> = { light: base, dark: { ...base, ...parseBlock(css, ".dark") } };
  for (const [mode, tokens] of Object.entries(modes)) {
    for (const [fg, bg, min] of pairs()) {
      const a = tokens[fg];
      const b = tokens[bg];
      if (!a || !b) {
        failures.push(`${mode}: missing token ${!a ? fg : bg}`);
        continue;
      }
      const ratio = contrast(a, b);
      if (ratio < min) failures.push(`${mode}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1 (needs ${min}:1)`);
    }
  }
  return failures;
}

const isMain = process.argv[1]?.endsWith("check-contrast.ts");
if (isMain) {
  const css = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");
  const failures = check(css);
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log("All token pairs pass WCAG AA in light and dark.");
}
