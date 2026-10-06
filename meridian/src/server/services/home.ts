import { db } from "@/server/db";
import { membershipOrThrow } from "@/server/access";
import { quarterOf } from "@/lib/dates";

const WEEK_MS = 7 * 24 * 3600 * 1000;

export interface WeeklySummary {
  checkIns: number;
  decisions: number;
  opportunities: number;
  tasksCompleted: number;
  meetingsHeld: number;
  newMembers: number;
  /** One readable sentence, or a nudge when the week was quiet. */
  sentence: string;
}

export function summaryText(s: Omit<WeeklySummary, "sentence">): string {
  const parts: string[] = [];
  const add = (n: number, one: string, many: string) => n > 0 && parts.push(`${n} ${n === 1 ? one : many}`);
  add(s.meetingsHeld, "meeting held", "meetings held");
  add(s.checkIns, "goal check-in", "goal check-ins");
  add(s.decisions, "decision logged", "decisions logged");
  add(s.tasksCompleted, "action item completed", "action items completed");
  add(s.opportunities, "new post on the opportunities board", "new posts on the opportunities board");
  add(s.newMembers, "new member", "new members");
  if (parts.length === 0) return "A quiet week. A check-in on a goal is a good way to start the next one.";
  const last = parts.pop();
  return `This week: ${parts.length ? `${parts.join(", ")} and ${last}` : last}.`;
}

export async function loadHome(actorId: string, circleId: string, now = new Date()) {
  await membershipOrThrow(actorId, circleId);
  const since = new Date(now.getTime() - WEEK_MS);
  const [nextMeeting, myTasks, activity, decisions, opportunities, goals, checkIns, decisionsWeek, oppsWeek, doneWeek, meetingsHeld, newMembers] = await Promise.all([
    db.meeting.findFirst({ where: { circleId, startsAt: { gte: now } }, orderBy: { startsAt: "asc" }, include: { agenda: { orderBy: { position: "asc" }, take: 3 } } }),
    db.actionItem.findMany({ where: { circleId, ownerId: actorId, done: false }, orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }], take: 5 }),
    db.activity.findMany({ where: { circleId }, orderBy: { createdAt: "desc" }, take: 12 }),
    db.decision.findMany({ where: { circleId }, orderBy: { decidedOn: "desc" }, take: 3 }),
    db.opportunity.findMany({ where: { circleId, status: "OPEN" }, orderBy: { createdAt: "desc" }, take: 3 }),
    db.goal.groupBy({ by: ["status"], where: { circleId, quarter: quarterOf(now) }, _count: { _all: true } }),
    db.checkIn.count({ where: { goal: { circleId }, createdAt: { gte: since } } }),
    db.decision.count({ where: { circleId, createdAt: { gte: since } } }),
    db.opportunity.count({ where: { circleId, createdAt: { gte: since } } }),
    db.actionItem.count({ where: { circleId, done: true, doneAt: { gte: since } } }),
    db.meeting.count({ where: { circleId, startsAt: { gte: since, lt: now } } }),
    db.membership.count({ where: { circleId, joinedAt: { gte: since } } }),
  ]);
  const base = { checkIns, decisions: decisionsWeek, opportunities: oppsWeek, tasksCompleted: doneWeek, meetingsHeld, newMembers };
  const goalCounts = { ON_TRACK: 0, AT_RISK: 0, DONE: 0 } as Record<string, number>;
  for (const g of goals) goalCounts[g.status] = g._count._all;
  const actorIds = [...new Set(activity.map((a) => a.actorId))];
  const users = await db.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, name: true, email: true } });
  return {
    nextMeeting, myTasks, activity, decisions, opportunities, goalCounts,
    actors: new Map(users.map((u) => [u.id, u.name ?? u.email])),
    summary: { ...base, sentence: summaryText(base) } satisfies WeeklySummary,
  };
}
