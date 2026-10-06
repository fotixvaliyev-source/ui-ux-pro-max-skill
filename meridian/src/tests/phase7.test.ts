import { describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { ForbiddenError, UserError } from "@/server/access";
import { createCircle, joinCircleByCode } from "@/server/services/circles";
import { createResource, deleteResource, getResourceFile, listResources, updateResource } from "@/server/services/resources";
import { csvCell, exportCsv, exportMarkdown, toCsv } from "@/server/services/export";
import { loadHome, summaryText } from "@/server/services/home";
import { createActionItem, createDecision, createMeeting, updateNotes } from "@/server/services/meetings";
import { createGoal, addCheckIn } from "@/server/services/goals";
import { resourceSchema } from "@/server/validation/resources";
import { decisionSchema, meetingSchema, actionItemSchema } from "@/server/validation/meetings";
import { goalSchema } from "@/server/validation/goals";
import { makeUser } from "./helpers";

const circleInput = { name: "Library & Export", purpose: "A circle for testing the library and exports.", accent: "indigo" as const };

async function setup() {
  const founder = await makeUser("Founder");
  const member = await makeUser("Member");
  const circle = await createCircle(founder.id, circleInput);
  const { inviteCode } = await db.circle.findUniqueOrThrow({ where: { id: circle.id } });
  await joinCircleByCode(member.id, inviteCode);
  return { founder, member, circleId: circle.id };
}

describe("CSV", () => {
  it("quotes properly and defuses formula injection", () => {
    expect(csvCell('say "hi", ok')).toBe('"say ""hi"", ok"');
    expect(csvCell("line1\nline2")).toBe('"line1\nline2"');
    expect(csvCell("=HYPERLINK(\"http://evil\")")).toBe("\"'=HYPERLINK(\"\"http://evil\"\")\"");
    expect(csvCell("+1 555")).toBe("'+1 555");
    expect(csvCell("-5")).toBe("'-5");
    expect(csvCell(null)).toBe("");
    expect(toCsv(["a", "b"], [["1", "x,y"]])).toBe('a,b\r\n1,"x,y"\r\n');
  });
});

describe("resource library", () => {
  const link = (over: Record<string, string> = {}) => resourceSchema.parse({ kind: "LINK", title: "The Mom Test", url: "https://example.com/mom-test", whyUseful: "Fixes how we run customer calls.", tags: "Research, sales", ...over });

  it("validates per kind", () => {
    expect(resourceSchema.safeParse({ kind: "LINK", title: "No url", whyUseful: "Because." }).success).toBe(false);
    expect(resourceSchema.safeParse({ kind: "LINK", title: "Bad url", whyUseful: "Because.", url: "javascript:alert(1)" }).success).toBe(false);
    expect(resourceSchema.safeParse({ kind: "NOTE", title: "Empty note", whyUseful: "Because." }).success).toBe(false);
    expect(resourceSchema.safeParse({ kind: "NOTE", title: "A note", whyUseful: "Because.", body: "Text" }).success).toBe(true);
  });

  it("members add, search and filter; only the author or a Founder change", async () => {
    const { founder, member, circleId } = await setup();
    const third = await makeUser("Third");
    const { inviteCode } = await db.circle.findUniqueOrThrow({ where: { id: circleId } });
    await joinCircleByCode(third.id, inviteCode);
    const r = await createResource(member.id, circleId, link());
    await createResource(member.id, circleId, resourceSchema.parse({ kind: "NOTE", title: "Pricing checklist", body: "1. Talk to five customers", whyUseful: "A repeatable start.", tags: "pricing" }));
    expect((await listResources(founder.id, circleId, { tag: "research" })).map((x) => x.title)).toEqual(["The Mom Test"]);
    expect((await listResources(founder.id, circleId, { q: "customers" })).map((x) => x.title)).toEqual(["Pricing checklist"]);
    expect(await listResources(founder.id, circleId, { kind: "LINK" })).toHaveLength(1);
    await expect(updateResource(third.id, circleId, r.id, link({ title: "Hijack" }))).rejects.toThrow(ForbiddenError);
    await updateResource(member.id, circleId, r.id, link({ title: "The Mom Test (2nd ed.)" }));
    await expect(updateResource(member.id, circleId, r.id, resourceSchema.parse({ kind: "NOTE", title: "Now a note", body: "x", whyUseful: "Why not." }))).rejects.toThrow("cannot be changed");
    await deleteResource(founder.id, circleId, r.id);
  });

  it("files: size and type limits, members-only download, cleanup on delete", async () => {
    const { founder, member, circleId } = await setup();
    const outsider = await makeUser("Outsider");
    const base = resourceSchema.parse({ kind: "FILE", title: "Pitch deck", whyUseful: "Latest version of the deck." });
    await expect(createResource(member.id, circleId, base)).rejects.toThrow("Choose a file");
    await expect(createResource(member.id, circleId, base, { name: "x.exe", type: "application/x-msdownload", data: Buffer.from("MZ") })).rejects.toThrow("not allowed");
    await expect(createResource(member.id, circleId, base, { name: "big.pdf", type: "application/pdf", data: Buffer.alloc(5 * 1024 * 1024 + 1) })).rejects.toThrow("5 MB");
    const r = await createResource(member.id, circleId, base, { name: "../../etc/passwd.pdf", type: "application/pdf", data: Buffer.from("%PDF-1.4 test") });
    const file = await getResourceFile(founder.id, circleId, r.id);
    expect(file.data.toString()).toContain("%PDF");
    expect(file.key.startsWith(`${circleId}/`)).toBe(true);
    expect(file.key).not.toContain("..");
    await expect(getResourceFile(outsider.id, circleId, r.id)).rejects.toThrow(ForbiddenError);
    await deleteResource(member.id, circleId, r.id);
    await expect(getResourceFile(founder.id, circleId, r.id)).rejects.toThrow(UserError);
  });
});

describe("export", () => {
  it("exports decisions, notes and action items; members only", async () => {
    const { founder, member, circleId } = await setup();
    const outsider = await makeUser("Outsider");
    const m = await createMeeting(founder.id, circleId, meetingSchema.parse({ title: "Pricing call", startsAt: new Date(Date.now() - 86400000).toISOString(), agenda: "Seats vs usage" }));
    await updateNotes(member.id, circleId, m.id, "## Outcome\n- Test usage-based pricing");
    await createDecision(founder.id, circleId, decisionSchema.parse({ title: "Test usage-based pricing for a quarter", context: "Seats punish small teams, so we try \"usage\", with a review.", decidedOn: "2026-09-12", involved: `${founder.id},${member.id}`, meetingId: m.id }));
    await createActionItem(founder.id, circleId, actionItemSchema.parse({ title: "=SUM(1+1) evil title", ownerId: member.id, meetingId: m.id }));
    const md = await exportMarkdown(member.id, circleId);
    expect(md.filename).toBe("library-export-export.md");
    expect(md.body).toContain("# Library & Export");
    expect(md.body).toContain("### Test usage-based pricing for a quarter");
    expect(md.body).toContain("Involved: Founder, Member");
    expect(md.body).toContain("## Outcome");
    expect(md.body).toContain("- [ ] =SUM(1+1) evil title (Member)");
    const decisions = await exportCsv(founder.id, circleId, "decisions");
    expect(decisions.body.split("\r\n")[0]).toBe("Date,Decision,Status,Context and reasoning,Involved,Meeting");
    expect(decisions.body).toContain('"Seats punish small teams, so we try ""usage"", with a review."');
    expect(decisions.body).toContain("Pricing call");
    const actions = await exportCsv(founder.id, circleId, "actions");
    expect(actions.body).toContain("'=SUM(1+1) evil title");
    expect((await exportCsv(founder.id, circleId, "notes")).body).toContain("Test usage-based pricing");
    await expect(exportMarkdown(outsider.id, circleId)).rejects.toThrow(ForbiddenError);
    await expect(exportCsv(outsider.id, circleId, "decisions")).rejects.toThrow(ForbiddenError);
  });
});

describe("circle home", () => {
  it("summarises the week in plain words", () => {
    const zero = { checkIns: 0, decisions: 0, opportunities: 0, tasksCompleted: 0, meetingsHeld: 0, newMembers: 0 };
    expect(summaryText(zero)).toMatch(/quiet week/);
    expect(summaryText({ ...zero, checkIns: 1 })).toBe("This week: 1 goal check-in.");
    expect(summaryText({ ...zero, meetingsHeld: 2, decisions: 1, tasksCompleted: 3 })).toBe("This week: 2 meetings held, 1 decision logged and 3 action items completed.");
  });

  it("collects what the home page needs, scoped to the viewer and circle", async () => {
    const { founder, member, circleId } = await setup();
    const outsider = await makeUser("Outsider");
    await createMeeting(founder.id, circleId, meetingSchema.parse({ title: "Next call", startsAt: new Date(Date.now() + 86400000).toISOString(), agenda: "One\nTwo" }));
    await createActionItem(founder.id, circleId, actionItemSchema.parse({ title: "Mine", ownerId: member.id }));
    await createActionItem(founder.id, circleId, actionItemSchema.parse({ title: "Not mine", ownerId: founder.id }));
    const g = await createGoal(member.id, circleId, goalSchema.parse({ title: "Sign three pilots", quarter: new Date().getUTCFullYear() + "-Q" + (Math.floor(new Date().getUTCMonth() / 3) + 1) }));
    await addCheckIn(member.id, circleId, g.id, { progressed: "Booked two calls", blocked: undefined, helpNeeded: undefined });
    const home = await loadHome(member.id, circleId);
    expect(home.nextMeeting?.title).toBe("Next call");
    expect(home.nextMeeting?.agenda).toHaveLength(2);
    expect(home.myTasks.map((t) => t.title)).toEqual(["Mine"]);
    expect(home.goalCounts.ON_TRACK).toBe(1);
    expect(home.summary.checkIns).toBe(1);
    expect(home.activity.length).toBeGreaterThan(0);
    await expect(loadHome(outsider.id, circleId)).rejects.toThrow(ForbiddenError);
  });
});
