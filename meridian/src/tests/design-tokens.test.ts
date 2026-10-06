import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { check, contrast } from "../../scripts/check-contrast";
import { EMOJI, FEATURE_KEYS, FEATURES } from "@/lib/constants";
import { existsSync } from "node:fs";

const root = path.resolve(__dirname, "../..");

describe("design tokens", () => {
  it("every text pair passes WCAG AA in light and dark", () => {
    const css = readFileSync(path.join(root, "src/app/globals.css"), "utf8");
    expect(check(css)).toEqual([]);
  });
  it("computes known contrast ratios", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 0);
  });
  it("every feature has an emoji and a tile file on disk", () => {
    for (const key of FEATURE_KEYS) {
      const file = EMOJI[FEATURES[key].emoji];
      expect(existsSync(path.join(root, "public/emoji", `${file}.svg`))).toBe(true);
    }
  });
  it("every emoji file exists", () => {
    for (const code of Object.values(EMOJI)) {
      expect(existsSync(path.join(root, "public/emoji", `${code}.svg`))).toBe(true);
    }
  });
});
