import { describe, expect, it } from "vitest";
import { FAQ, FEATURE_COPY, PRINCIPLES, PROBLEMS, SCENARIOS, STEPS, USE_CASES } from "@/components/marketing/content";
import { FEATURE_KEYS } from "@/lib/constants";

const allText = JSON.stringify({ FAQ, FEATURE_COPY, PRINCIPLES, PROBLEMS, SCENARIOS, STEPS, USE_CASES });

describe("marketing content", () => {
  it("matches the structure in the brief", () => {
    expect(PROBLEMS).toHaveLength(4);
    expect(STEPS).toHaveLength(3);
    expect(PRINCIPLES).toHaveLength(4);
    expect(FAQ).toHaveLength(5);
    expect(USE_CASES).toHaveLength(5);
  });
  it("documents every feature exactly once", () => {
    const keys = FEATURE_COPY.map((f) => f.key).sort();
    expect(keys).toEqual([...FEATURE_KEYS].sort());
  });
  it("has no placeholder text", () => {
    expect(allText.toLowerCase()).not.toMatch(/lorem|ipsum|todo|tbd/);
  });
  it("keeps emoji out of copy (emoji are rendered by the Emoji component only)", () => {
    expect(allText).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
