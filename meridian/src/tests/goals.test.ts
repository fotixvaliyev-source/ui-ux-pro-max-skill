import { describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { ForbiddenError, UserError } from "@/server/access";
import { createCircle, joinCircleByCode } from "@/server/services/circles";
import { addCheckIn, createGoal, deleteGoal, listGoals, setGoalStatus, updateGoal } from "@/server/services/goals";
import { addComment, deleteComment, loadThread, toggleReaction } from "@/server/services/comments";
import { markAllRead } from "@/server/services/notifications";
import { goalSchema } from "@/server/validation/goals";
import { nearbyQuarters, quarterEnd, quarterLabel, quarterOf } from "@/lib/dates";
import { makeUser } from "./helpers";

const circleInput = { name: "Goal Circle", purpose: "A circle for testing goals.", accent: "indigo" as const };
const goalInput = goalSchema.parse({ title: "Sign three pilot clients", quarter: "2026-Q4", target: "3 signed pilots", deadline: "2026-11-30" });

async function setup() {
  const owner = await makeUser("Owner");
  const peer = await makeUser("Peer");
  const circle = await createCircle(owner.id, circleInput);
  const { inviteCode } = await db.circle.findUniqueOrThrow({ where: { id: circle.id } });
  await joinCircleByCode(peer.id, inviteCode);
  return { owner, peer, circleId: circle.id };
}

describe("quarters", () => {
  it("computes quarter, label and end", () => {
    expect(quarterOf(new Date("2026-10-06T10:00:00Z"))).toBe("2026-Q4");
    expect(quarterOf(new Date("2026-03-31T23:00:00Z"))).toBe("2026-Q1");
    expect(quarterLabel("2026-Q4")).toBe("Q4 2026");
    expect(quarterEnd("2026-Q4").toISOString().slice(0, 10)).toBe("2026-12-31");
    expect(quarterEnd("2026-Q1").toISOString().slice(0, 10)).toBe("2026-03-31");
    expect(nearbyQuarters(new Date("2026-10-06T00:00:00Z"))).toContain("2026-Q3");
  });
  it("validates goal input", () => {
    expect(goalSchema.safeParse({ title: "x", quarter: "2026-Q4" }).success).toBe(false);
    expect(goalSchema.safeParse({ title: "Valid title", quarter: "2026-Q9" }).success).toBe(false);
    expect(goalSchema.safeParse({ title: "Valid title", quarter: "2026-Q4", deadline: "31/12/2026" }).success).toBe(false);
    expect(goalSchema.parse({ title: "Valid title", quarter: "2026-Q4" }).status).toBe("ON_TRACK");
  });
});

describe("goals", () => {
  it("members can create and see goals; outsiders cannot", async () => {
    const { owner, peer, circleId } = await setup();
    const outsider = await makeUser("Outsider");
    await createGoal(owner.id, circleId, goalInput);
    expect(await listGoals(peer.id, circleId, "2026-Q4")).toHaveLength(1);
    await expect(listGoals(outsider.id, circleId, "2026-Q4")).rejects.toThrow(ForbiddenError);
    await expect(createGoal(outsider.id, circleId, goalInput)).rejects.toThrow(ForbiddenError);
  });

  it("only the owner can edit, change status, check in or delete", async () => {
    const { owner, peer, circleId } = await setup();
    const { id } = await createGoal(owner.id, circleId, goalInput);
    await expect(updateGoal(peer.id, circleId, id, goalInput)).rejects.toThrow("owner");
    await expect(setGoalStatus(peer.id, circleId, id, "DONE")).rejects.toThrow("owner");
    await expect(addCheckIn(peer.id, circleId, id, { progressed: "Did a thing", blocked: undefined, helpNeeded: undefined })).rejects.toThrow("owner");
    await expect(deleteGoal(peer.id, circleId, id)).rejects.toThrow("owner");
    await setGoalStatus(owner.id, circleId, id, "AT_RISK");
    expect((await db.goal.findUniqueOrThrow({ where: { id } })).status).toBe("AT_RISK");
  });

  it("a goal id from another circle cannot be reached", async () => {
    const { owner, circleId } = await setup();
    const otherOwner = await makeUser("Other");
    const otherCircle = await createCircle(otherOwner.id, circleInput);
    const { id } = await createGoal(owner.id, circleId, goalInput);
    await expect(setGoalStatus(otherOwner.id, otherCircle.id, id, "DONE")).rejects.toThrow(UserError);
    await expect(addComment(otherOwner.id, otherCircle.id, { type: "GOAL", id }, "hello")).rejects.toThrow(UserError);
  });

  it("check-ins are recorded and the goal can be deleted with its thread", async () => {
    const { owner, peer, circleId } = await setup();
    const { id } = await createGoal(owner.id, circleId, goalInput);
    await addCheckIn(owner.id, circleId, id, { progressed: "Two calls booked", blocked: "Waiting on legal", helpNeeded: "An intro to a lawyer" });
    const comment = await addComment(peer.id, circleId, { type: "GOAL", id }, "Happy to help.");
    await toggleReaction(owner.id, circleId, { kind: "comment", id: comment.id }, "raised");
    await toggleReaction(owner.id, circleId, { kind: "target", target: { type: "GOAL", id } }, "target");
    expect(await db.checkIn.count({ where: { goalId: id } })).toBe(1);
    await deleteGoal(owner.id, circleId, id);
    expect(await db.goal.findUnique({ where: { id } })).toBeNull();
    expect(await db.comment.count({ where: { targetId: id } })).toBe(0);
    expect(await db.reaction.count({ where: { circleId } })).toBe(0);
  });
});

describe("comments, reactions and notifications", () => {
  it("commenting notifies the goal owner once, never the commenter", async () => {
    const { owner, peer, circleId } = await setup();
    const { id } = await createGoal(owner.id, circleId, goalInput);
    await markAllRead(owner.id);
    await addComment(peer.id, circleId, { type: "GOAL", id }, "Looks ambitious. Good.");
    const ownerNotes = await db.notification.findMany({ where: { userId: owner.id, type: "COMMENT" } });
    expect(ownerNotes).toHaveLength(1);
    expect(ownerNotes[0]?.href).toBe(`/app/c/${circleId}/goals/${id}`);
    expect(await db.notification.count({ where: { userId: peer.id, type: "COMMENT" } })).toBe(0);
    // owner replying notifies the earlier commenter
    await addComment(owner.id, circleId, { type: "GOAL", id }, "Thanks!");
    expect(await db.notification.count({ where: { userId: peer.id, type: "COMMENT" } })).toBe(1);
  });

  it("reactions toggle on and off and only the five allowed keys work", async () => {
    const { owner, peer, circleId } = await setup();
    const { id } = await createGoal(owner.id, circleId, goalInput);
    const target = { kind: "target", target: { type: "GOAL", id } } as const;
    expect((await toggleReaction(peer.id, circleId, target, "fire")).active).toBe(true);
    expect((await toggleReaction(peer.id, circleId, target, "fire")).active).toBe(false);
    await expect(toggleReaction(peer.id, circleId, target, "poop" as never)).rejects.toThrow("not available");
    await toggleReaction(peer.id, circleId, target, "thumbs");
    await toggleReaction(owner.id, circleId, target, "thumbs");
    const thread = await loadThread(peer.id, circleId, { type: "GOAL", id });
    const thumbs = thread.reactions.find((r) => r.key === "thumbs");
    expect(thumbs).toEqual({ key: "thumbs", count: 2, mine: true });
  });

  it("only the author or a Founder can delete a comment", async () => {
    const { owner, peer, circleId } = await setup();
    const third = await makeUser("Third");
    const { inviteCode } = await db.circle.findUniqueOrThrow({ where: { id: circleId } });
    await joinCircleByCode(third.id, inviteCode);
    const { id } = await createGoal(owner.id, circleId, goalInput);
    const c1 = await addComment(peer.id, circleId, { type: "GOAL", id }, "first");
    await expect(deleteComment(third.id, circleId, c1.id)).rejects.toThrow("your own");
    await deleteComment(peer.id, circleId, c1.id);
    const c2 = await addComment(peer.id, circleId, { type: "GOAL", id }, "second");
    await deleteComment(owner.id, circleId, c2.id); // owner is the Founder
    expect(await db.comment.count({ where: { targetId: id } })).toBe(0);
  });
});
