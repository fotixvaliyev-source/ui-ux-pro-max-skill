import { describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { ForbiddenError, UserError } from "@/server/access";
import { createCircle, joinCircleByCode } from "@/server/services/circles";
import {
  createActionItem, createDecision, createMeeting, deleteDecision, deleteMeeting, listCircleActionItems, listDecisions,
  listMeetings, listMyTasks, setActionItemDone, setDecisionStatus, updateDecision, updateMeeting, updateNotes,
} from "@/server/services/meetings";
import { actionItemSchema, decisionSchema, meetingSchema } from "@/server/validation/meetings";
import { makeUser } from "./helpers";

const circleInput = { name: "Meeting Circle", purpose: "A circle for testing meetings.", accent: "indigo" as const };
const future = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString();
const past = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString();
const meetingInput = (over: Partial<Record<string, string>> = {}) =>
  meetingSchema.parse({ title: "Circle call", startsAt: future, agenda: "Wins\n\n  Hiring  \nPricing", ...over });

async function setup() {
  const founder = await makeUser("Founder");
  const member = await makeUser("Member");
  const other = await makeUser("Other");
  const circle = await createCircle(founder.id, circleInput);
  const { inviteCode } = await db.circle.findUniqueOrThrow({ where: { id: circle.id } });
  await joinCircleByCode(member.id, inviteCode);
  await joinCircleByCode(other.id, inviteCode);
  return { founder, member, other, circleId: circle.id };
}

describe("validation", () => {
  it("parses agenda lines and rejects bad input", () => {
    expect(meetingInput().agenda).toEqual(["Wins", "Hiring", "Pricing"]);
    expect(meetingSchema.safeParse({ title: "x", startsAt: future }).success).toBe(false);
    expect(meetingSchema.safeParse({ title: "Valid title", startsAt: "not a date" }).success).toBe(false);
    expect(meetingSchema.safeParse({ title: "Valid title", startsAt: future, videoUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(meetingSchema.safeParse({ title: "Valid title", startsAt: future, videoUrl: "https://meet.example/abc" }).success).toBe(true);
    expect(decisionSchema.safeParse({ title: "Move to sprints", context: "Because it slips.", decidedOn: "" }).success).toBe(false);
    expect(actionItemSchema.parse({ title: "Send scorecard", ownerId: "u1", dueDate: "2026-10-12" }).dueDate).toBeInstanceOf(Date);
  });
});

describe("meetings", () => {
  it("creating a meeting notifies the others, not the organizer; outsiders cannot create", async () => {
    const { founder, member, circleId } = await setup();
    const outsider = await makeUser("Outsider");
    const m = await createMeeting(member.id, circleId, meetingInput());
    expect(await db.agendaItem.count({ where: { meetingId: m.id } })).toBe(3);
    expect(await db.notification.count({ where: { userId: founder.id, type: "MEETING" } })).toBe(1);
    expect(await db.notification.count({ where: { userId: member.id, type: "MEETING" } })).toBe(0);
    await expect(createMeeting(outsider.id, circleId, meetingInput())).rejects.toThrow(ForbiddenError);
  });

  it("splits upcoming and past meetings", async () => {
    const { founder, circleId } = await setup();
    await createMeeting(founder.id, circleId, meetingInput({ title: "Next one" }));
    await createMeeting(founder.id, circleId, meetingInput({ title: "Old one", startsAt: past }));
    const { upcoming, past: archive } = await listMeetings(founder.id, circleId);
    expect(upcoming.map((m) => m.title)).toEqual(["Next one"]);
    expect(archive.map((m) => m.title)).toEqual(["Old one"]);
  });

  it("details: organizer or Founder only. Notes: any member.", async () => {
    const { founder, member, other, circleId } = await setup();
    const m = await createMeeting(member.id, circleId, meetingInput());
    await expect(updateMeeting(other.id, circleId, m.id, meetingInput({ title: "Hijacked" }))).rejects.toThrow("organizer");
    await updateMeeting(member.id, circleId, m.id, meetingInput({ title: "Renamed" }));
    await updateMeeting(founder.id, circleId, m.id, meetingInput({ title: "Renamed by founder" }));
    await updateNotes(other.id, circleId, m.id, "## Notes\n- agreed on pricing");
    expect((await db.meeting.findUniqueOrThrow({ where: { id: m.id } })).notesMd).toContain("agreed on pricing");
    await expect(deleteMeeting(other.id, circleId, m.id)).rejects.toThrow("organizer");
  });

  it("a meeting from another circle cannot be touched", async () => {
    const { founder, circleId } = await setup();
    const stranger = await makeUser("Stranger");
    const otherCircle = await createCircle(stranger.id, circleInput);
    const m = await createMeeting(founder.id, circleId, meetingInput());
    await expect(updateNotes(stranger.id, otherCircle.id, m.id, "x")).rejects.toThrow(UserError);
    await expect(createActionItem(stranger.id, otherCircle.id, { title: "Sneaky", ownerId: stranger.id, meetingId: m.id, dueDate: undefined })).rejects.toThrow(UserError);
  });
});

describe("action items", () => {
  it("appear on the shared board and in the owner's My tasks, and notify the owner", async () => {
    const { founder, member, circleId } = await setup();
    const m = await createMeeting(founder.id, circleId, meetingInput());
    await createActionItem(founder.id, circleId, { title: "Share the scorecard", ownerId: member.id, meetingId: m.id, dueDate: new Date("2026-10-12T12:00:00Z") });
    const board = await listCircleActionItems(founder.id, circleId);
    expect(board.map((i) => i.title)).toContain("Share the scorecard");
    const mine = await listMyTasks(member.id);
    expect(mine.map((i) => i.title)).toContain("Share the scorecard");
    expect(mine.find((i) => i.title === "Share the scorecard")?.meeting?.title).toBe("Circle call");
    expect(await db.notification.count({ where: { userId: member.id, type: "ACTION_ITEM" } })).toBe(1);
    // assigning to yourself notifies nobody
    await createActionItem(member.id, circleId, { title: "My own", ownerId: member.id, meetingId: undefined, dueDate: undefined });
    expect(await db.notification.count({ where: { userId: member.id, type: "ACTION_ITEM" } })).toBe(1);
  });

  it("the owner must be a member of the circle", async () => {
    const { founder, circleId } = await setup();
    const outsider = await makeUser("Outsider");
    await expect(createActionItem(founder.id, circleId, { title: "Nope", ownerId: outsider.id, meetingId: undefined, dueDate: undefined })).rejects.toThrow("owner");
  });

  it("only the owner or a Founder can tick it off", async () => {
    const { founder, member, other, circleId } = await setup();
    const item = await createActionItem(founder.id, circleId, { title: "Do the thing", ownerId: member.id, meetingId: undefined, dueDate: undefined });
    await expect(setActionItemDone(other.id, circleId, item.id, true)).rejects.toThrow("owner");
    await setActionItemDone(member.id, circleId, item.id, true);
    expect((await db.actionItem.findUniqueOrThrow({ where: { id: item.id } })).doneAt).not.toBeNull();
    await setActionItemDone(founder.id, circleId, item.id, false);
    expect((await db.actionItem.findUniqueOrThrow({ where: { id: item.id } })).done).toBe(false);
  });

  it("My tasks excludes circles the user has left", async () => {
    const { founder, member, circleId } = await setup();
    await createActionItem(founder.id, circleId, { title: "Stale", ownerId: member.id, meetingId: undefined, dueDate: undefined });
    await db.membership.deleteMany({ where: { circleId, userId: member.id } });
    expect(await listMyTasks(member.id)).toHaveLength(0);
  });

  it("deleting a meeting keeps its action items and decisions", async () => {
    const { founder, circleId } = await setup();
    const m = await createMeeting(founder.id, circleId, meetingInput());
    const item = await createActionItem(founder.id, circleId, { title: "Survivor", ownerId: founder.id, meetingId: m.id, dueDate: undefined });
    await createDecision(founder.id, circleId, decisionSchema.parse({ title: "Keep the cadence weekly", context: "It works.", decidedOn: "2026-10-01", meetingId: m.id }));
    await deleteMeeting(founder.id, circleId, m.id);
    expect((await db.actionItem.findUniqueOrThrow({ where: { id: item.id } })).meetingId).toBeNull();
    expect(await db.decision.count({ where: { circleId } })).toBe(1);
  });
});

describe("decision log", () => {
  const input = (over: Record<string, string> = {}) =>
    decisionSchema.parse({ title: "Move onboarding to two-week sprints", context: "Open-ended onboarding kept slipping.", decidedOn: "2026-09-12", ...over });

  it("records participants who must be members", async () => {
    const { founder, member, circleId } = await setup();
    const outsider = await makeUser("Outsider");
    await createDecision(founder.id, circleId, input({ involved: `${founder.id},${member.id}` }));
    await expect(createDecision(founder.id, circleId, input({ involved: outsider.id }))).rejects.toThrow("member of this circle");
    const [d] = await listDecisions(member.id, circleId);
    expect(d?.involved).toHaveLength(2);
  });

  it("searches and filters", async () => {
    const { founder, member, circleId } = await setup();
    const a = await createDecision(founder.id, circleId, input({ title: "Adopt a weekly cadence", context: "Fortnightly was too slow." }));
    await createDecision(founder.id, circleId, input({ title: "Cap the circle at twelve people", context: "Trust needs small groups.", involved: member.id }));
    await setDecisionStatus(founder.id, circleId, a.id, "REVERSED");
    expect((await listDecisions(founder.id, circleId, { q: "WEEKLY" })).map((d) => d.title)).toEqual(["Adopt a weekly cadence"]);
    expect((await listDecisions(founder.id, circleId, { q: "small groups" })).map((d) => d.title)).toEqual(["Cap the circle at twelve people"]);
    expect((await listDecisions(founder.id, circleId, { status: "REVERSED" })).map((d) => d.id)).toEqual([a.id]);
    expect((await listDecisions(founder.id, circleId, { involvedId: member.id })).length).toBe(1);
    expect(await listDecisions(founder.id, circleId, { q: "zzz" })).toHaveLength(0);
  });

  it("only the author or a Founder can change or delete; outsiders see nothing", async () => {
    const { founder, member, other, circleId } = await setup();
    const outsider = await makeUser("Outsider");
    const d = await createDecision(member.id, circleId, input());
    await expect(updateDecision(other.id, circleId, d.id, input())).rejects.toThrow("Only the person");
    await expect(setDecisionStatus(other.id, circleId, d.id, "REVISITED")).rejects.toThrow("Only the person");
    await expect(deleteDecision(other.id, circleId, d.id)).rejects.toThrow("Only the person");
    await setDecisionStatus(member.id, circleId, d.id, "REVISITED");
    await updateDecision(founder.id, circleId, d.id, input({ title: "Edited by the founder, still clear" }));
    await expect(listDecisions(outsider.id, circleId)).rejects.toThrow(ForbiddenError);
    await deleteDecision(member.id, circleId, d.id);
    expect(await db.decision.count({ where: { circleId } })).toBe(0);
  });
});
