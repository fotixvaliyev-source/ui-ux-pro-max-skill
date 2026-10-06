import { describe, expect, it } from "vitest";
import { normalizeTags, parseTags, serializeTags } from "@/lib/tags";

describe("tags", () => {
  it("round-trips and normalizes", () => {
    const raw = serializeTags([" Fundraising ", "fundraising", "", "Hiring"]);
    expect(parseTags(raw)).toEqual(["fundraising", "hiring"]);
  });
  it("returns an empty list for bad input", () => {
    expect(parseTags("not json")).toEqual([]);
    expect(parseTags('{"a":1}')).toEqual([]);
    expect(parseTags(null)).toEqual([]);
  });
  it("caps the number and length of tags", () => {
    const many = Array.from({ length: 30 }, (_, i) => `t${i}`);
    expect(normalizeTags(many)).toHaveLength(12);
    expect(normalizeTags(["x".repeat(100)])[0]).toHaveLength(32);
  });
});
