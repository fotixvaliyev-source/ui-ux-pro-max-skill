import type { z } from "zod";
import { db } from "@/server/db";
import { membershipOrThrow, ForbiddenError, UserError } from "@/server/access";
import type { checkInSchema, goalSchema } from "@/server/validation/goals";
import type { GoalStatus } from "@/lib/constants";

type GoalInput = z.output<typeof goalSchema>;
type CheckInInput = z.output<typeof checkInSchema>;

/** Loads a goal that belongs to this circle. A goal id from another circle is indistinguishable from a missing one. */
async function goalInCircle(circleId: string, goalId: string) {
  const goal = await db.goal.findFirst({ where: { id: goalId, circleId } });
  if (!goal) throw new UserError("That goal could not be found.");
  return goal;
}

function ownerOnly(goalOwnerId: string, actorId: string): void {
  if (goalOwnerId !== actorId) throw new ForbiddenError("Only the goal's owner can change it.");
}

export async function createGoal(actorId: string, circleId: string, input: GoalInput): Promise<{ id: string }> {
  await membershipOrThrow(actorId, circleId);
  const goal = await db.goal.create({
    data: {
      circleId,
      ownerId: actorId,
      title: input.title,
      description: input.description ?? null,
      target: input.target ?? null,
      deadline: input.deadline ?? null,
      quarter: input.quarter,
      status: input.status,
    },
    select: { id: true },
  });
  const user = await db.user.findUnique({ where: { id: actorId }, select: { name: true } });
  await db.activity.create({
    data: { circleId, actorId, verb: "goal", summary: `${user?.name ?? "Someone"} set a goal: ${input.title}`, href: `/app/c/${circleId}/goals/${goal.id}` },
  });
  return goal;
}

export async function updateGoal(actorId: string, circleId: string, goalId: string, input: GoalInput): Promise<void> {
  await membershipOrThrow(actorId, circleId);
  const goal = await goalInCircle(circleId, goalId);
  ownerOnly(goal.ownerId, actorId);
  await db.goal.update({
    where: { id: goalId },
    data: {
      title: input.title,
      description: input.description ?? null,
      target: input.target ?? null,
      deadline: input.deadline ?? null,
      quarter: input.quarter,
      status: input.status,
    },
  });
}

export async function setGoalStatus(actorId: string, circleId: string, goalId: string, status: GoalStatus): Promise<void> {
  await membershipOrThrow(actorId, circleId);
  const goal = await goalInCircle(circleId, goalId);
  ownerOnly(goal.ownerId, actorId);
  await db.goal.update({ where: { id: goalId }, data: { status } });
}

export async function deleteGoal(actorId: string, circleId: string, goalId: string): Promise<void> {
  await membershipOrThrow(actorId, circleId);
  const goal = await goalInCircle(circleId, goalId);
  ownerOnly(goal.ownerId, actorId);
  const checkIns = await db.checkIn.findMany({ where: { goalId }, select: { id: true } });
  const comments = await db.comment.findMany({
    where: { circleId, OR: [{ targetType: "GOAL", targetId: goalId }, { targetType: "CHECKIN", targetId: { in: checkIns.map((c) => c.id) } }] },
    select: { id: true },
  });
  await db.$transaction([
    db.reaction.deleteMany({
      where: { circleId, OR: [{ scope: `GOAL:${goalId}` }, { scope: { in: checkIns.map((c) => `CHECKIN:${c.id}`) } }, { commentId: { in: comments.map((c) => c.id) } }] },
    }),
    db.comment.deleteMany({ where: { id: { in: comments.map((c) => c.id) } } }),
    db.goal.delete({ where: { id: goalId } }),
  ]);
}

export async function addCheckIn(actorId: string, circleId: string, goalId: string, input: CheckInInput): Promise<void> {
  await membershipOrThrow(actorId, circleId);
  const goal = await goalInCircle(circleId, goalId);
  ownerOnly(goal.ownerId, actorId);
  await db.checkIn.create({
    data: { goalId, authorId: actorId, progressed: input.progressed, blocked: input.blocked ?? null, helpNeeded: input.helpNeeded ?? null },
  });
  const user = await db.user.findUnique({ where: { id: actorId }, select: { name: true } });
  const href = `/app/c/${circleId}/goals/${goalId}`;
  await db.activity.create({
    data: { circleId, actorId, verb: "checkin", summary: `${user?.name ?? "Someone"} checked in on ${goal.title}`, href },
  });
}

export async function listGoals(actorId: string, circleId: string, quarter: string) {
  await membershipOrThrow(actorId, circleId);
  return db.goal.findMany({
    where: { circleId, quarter },
    orderBy: [{ createdAt: "asc" }],
    include: { checkIns: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
}
