import type { z } from "zod";
import { db } from "@/server/db";
import { ForbiddenError, UserError, membershipOrThrow } from "@/server/access";
import { notify, notifyCircle } from "@/server/services/notifications";
import type { actionItemSchema, decisionSchema, meetingSchema } from "@/server/validation/meetings";
import type { DecisionStatus } from "@/lib/constants";

type MeetingInput = z.output<typeof meetingSchema>;
type ActionItemInput = z.output<typeof actionItemSchema>;
type DecisionInput = z.output<typeof decisionSchema>;

async function meetingInCircle(circleId: string, meetingId: string) {
  const m = await db.meeting.findFirst({ where: { id: meetingId, circleId } });
  if (!m) throw new UserError("That meeting could not be found.");
  return m;
}

async function nameOf(userId: string): Promise<string> {
  const u = await db.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
  return u?.name ?? u?.email ?? "Someone";
}

/** Creator or a Founder may change a meeting's details. */
function canManage(actorId: string, isFounder: boolean, createdById: string): boolean {
  return isFounder || actorId === createdById;
}

// ── Meetings ─────────────────────────────────────────────────────

export async function createMeeting(actorId: string, circleId: string, input: MeetingInput): Promise<{ id: string }> {
  await membershipOrThrow(actorId, circleId);
  const meeting = await db.meeting.create({
    data: {
      circleId,
      createdById: actorId,
      title: input.title,
      startsAt: input.startsAt,
      location: input.location ?? null,
      videoUrl: input.videoUrl ?? null,
      agenda: { create: input.agenda.map((text, position) => ({ text, position })) },
    },
    select: { id: true },
  });
  const href = `/app/c/${circleId}/meetings/${meeting.id}`;
  await notifyCircle(actorId, circleId, { type: "MEETING", title: `New meeting: ${input.title}`, href });
  await db.activity.create({ data: { circleId, actorId, verb: "meeting", summary: `${await nameOf(actorId)} scheduled ${input.title}`, href } });
  return meeting;
}

export async function updateMeeting(actorId: string, circleId: string, meetingId: string, input: MeetingInput): Promise<void> {
  const { isFounder } = await membershipOrThrow(actorId, circleId);
  const meeting = await meetingInCircle(circleId, meetingId);
  if (!canManage(actorId, isFounder, meeting.createdById)) throw new ForbiddenError("Only the organizer or a Founder can edit the meeting details.");
  await db.$transaction([
    db.agendaItem.deleteMany({ where: { meetingId } }),
    db.meeting.update({
      where: { id: meetingId },
      data: {
        title: input.title,
        startsAt: input.startsAt,
        location: input.location ?? null,
        videoUrl: input.videoUrl ?? null,
        agenda: { create: input.agenda.map((text, position) => ({ text, position })) },
      },
    }),
  ]);
}

/** Shared notes: any member of the circle may edit. */
export async function updateNotes(actorId: string, circleId: string, meetingId: string, notesMd: string): Promise<void> {
  await membershipOrThrow(actorId, circleId);
  await meetingInCircle(circleId, meetingId);
  await db.meeting.update({ where: { id: meetingId }, data: { notesMd } });
}

export async function deleteMeeting(actorId: string, circleId: string, meetingId: string): Promise<void> {
  const { isFounder } = await membershipOrThrow(actorId, circleId);
  const meeting = await meetingInCircle(circleId, meetingId);
  if (!canManage(actorId, isFounder, meeting.createdById)) throw new ForbiddenError("Only the organizer or a Founder can delete the meeting.");
  const comments = await db.comment.findMany({ where: { circleId, targetType: "MEETING", targetId: meetingId }, select: { id: true } });
  await db.$transaction([
    db.reaction.deleteMany({ where: { circleId, OR: [{ scope: `MEETING:${meetingId}` }, { commentId: { in: comments.map((c) => c.id) } }] } }),
    db.comment.deleteMany({ where: { id: { in: comments.map((c) => c.id) } } }),
    db.meeting.delete({ where: { id: meetingId } }), // decisions and action items keep existing: meetingId is set null
  ]);
}

export async function listMeetings(actorId: string, circleId: string, now = new Date()) {
  await membershipOrThrow(actorId, circleId);
  const [upcoming, past] = await Promise.all([
    db.meeting.findMany({ where: { circleId, startsAt: { gte: now } }, orderBy: { startsAt: "asc" }, include: { _count: { select: { actionItems: true, decisions: true } } } }),
    db.meeting.findMany({ where: { circleId, startsAt: { lt: now } }, orderBy: { startsAt: "desc" }, include: { _count: { select: { actionItems: true, decisions: true } } } }),
  ]);
  return { upcoming, past };
}

// ── Action items ─────────────────────────────────────────────────

export async function createActionItem(actorId: string, circleId: string, input: ActionItemInput): Promise<{ id: string }> {
  await membershipOrThrow(actorId, circleId);
  // The owner must belong to this circle.
  const owner = await db.membership.findUnique({ where: { circleId_userId: { circleId, userId: input.ownerId } }, select: { userId: true } });
  if (!owner) throw new UserError("Pick an owner from this circle.");
  if (input.meetingId) await meetingInCircle(circleId, input.meetingId);
  const item = await db.actionItem.create({
    data: { circleId, meetingId: input.meetingId ?? null, ownerId: input.ownerId, title: input.title, dueDate: input.dueDate ?? null },
    select: { id: true },
  });
  const href = input.meetingId ? `/app/c/${circleId}/meetings/${input.meetingId}` : `/app/c/${circleId}/tasks`;
  await notify(actorId, [input.ownerId], { circleId, type: "ACTION_ITEM", title: `${await nameOf(actorId)} assigned you: ${input.title}`, href });
  return item;
}

/** Only the owner or a Founder may tick an item off, edit or delete it. */
async function itemForChange(actorId: string, circleId: string, itemId: string) {
  const { isFounder } = await membershipOrThrow(actorId, circleId);
  const item = await db.actionItem.findFirst({ where: { id: itemId, circleId } });
  if (!item) throw new UserError("That action item could not be found.");
  if (item.ownerId !== actorId && !isFounder) throw new ForbiddenError("Only the owner or a Founder can change an action item.");
  return item;
}

export async function setActionItemDone(actorId: string, circleId: string, itemId: string, done: boolean): Promise<void> {
  await itemForChange(actorId, circleId, itemId);
  await db.actionItem.update({ where: { id: itemId }, data: { done, doneAt: done ? new Date() : null } });
}

export async function deleteActionItem(actorId: string, circleId: string, itemId: string): Promise<void> {
  await itemForChange(actorId, circleId, itemId);
  await db.actionItem.delete({ where: { id: itemId } });
}

/** The circle's shared board. */
export async function listCircleActionItems(actorId: string, circleId: string) {
  await membershipOrThrow(actorId, circleId);
  return db.actionItem.findMany({
    where: { circleId },
    orderBy: [{ done: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    include: { meeting: { select: { id: true, title: true } } },
  });
}

/** "My tasks": open items assigned to the user in every circle they still belong to. */
export async function listMyTasks(userId: string) {
  return db.actionItem.findMany({
    where: { ownerId: userId, circle: { members: { some: { userId } } } },
    orderBy: [{ done: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    include: { circle: { select: { id: true, name: true } }, meeting: { select: { id: true, title: true } } },
  });
}

// ── Decisions ────────────────────────────────────────────────────

async function validParticipants(circleId: string, userIds: string[]): Promise<string[]> {
  const unique = [...new Set(userIds)];
  if (unique.length === 0) return [];
  const found = await db.membership.findMany({ where: { circleId, userId: { in: unique } }, select: { userId: true } });
  if (found.length !== unique.length) throw new UserError("Everyone involved must be a member of this circle.");
  return unique;
}

export async function createDecision(actorId: string, circleId: string, input: DecisionInput): Promise<{ id: string }> {
  await membershipOrThrow(actorId, circleId);
  if (input.meetingId) await meetingInCircle(circleId, input.meetingId);
  const involved = await validParticipants(circleId, input.involved);
  if (!input.decidedOn) throw new UserError("Pick the date it was decided.");
  const decision = await db.decision.create({
    data: {
      circleId,
      meetingId: input.meetingId ?? null,
      createdById: actorId,
      title: input.title,
      context: input.context,
      decidedOn: input.decidedOn,
      status: input.status,
      involved: { create: involved.map((userId) => ({ userId })) },
    },
    select: { id: true },
  });
  const href = `/app/c/${circleId}/decisions/${decision.id}`;
  await db.activity.create({ data: { circleId, actorId, verb: "decision", summary: `${await nameOf(actorId)} logged a decision`, href } });
  return decision;
}

async function decisionForChange(actorId: string, circleId: string, decisionId: string) {
  const { isFounder } = await membershipOrThrow(actorId, circleId);
  const d = await db.decision.findFirst({ where: { id: decisionId, circleId } });
  if (!d) throw new UserError("That decision could not be found.");
  if (!canManage(actorId, isFounder, d.createdById)) throw new ForbiddenError("Only the person who logged it or a Founder can change a decision.");
  return d;
}

export async function updateDecision(actorId: string, circleId: string, decisionId: string, input: DecisionInput): Promise<void> {
  await decisionForChange(actorId, circleId, decisionId);
  const involved = await validParticipants(circleId, input.involved);
  if (!input.decidedOn) throw new UserError("Pick the date it was decided.");
  await db.$transaction([
    db.decisionParticipant.deleteMany({ where: { decisionId } }),
    db.decision.update({
      where: { id: decisionId },
      data: { title: input.title, context: input.context, decidedOn: input.decidedOn, status: input.status, involved: { create: involved.map((userId) => ({ userId })) } },
    }),
  ]);
}

export async function setDecisionStatus(actorId: string, circleId: string, decisionId: string, status: DecisionStatus): Promise<void> {
  await decisionForChange(actorId, circleId, decisionId);
  await db.decision.update({ where: { id: decisionId }, data: { status } });
}

export async function deleteDecision(actorId: string, circleId: string, decisionId: string): Promise<void> {
  await decisionForChange(actorId, circleId, decisionId);
  const comments = await db.comment.findMany({ where: { circleId, targetType: "DECISION", targetId: decisionId }, select: { id: true } });
  await db.$transaction([
    db.reaction.deleteMany({ where: { circleId, OR: [{ scope: `DECISION:${decisionId}` }, { commentId: { in: comments.map((c) => c.id) } }] } }),
    db.comment.deleteMany({ where: { id: { in: comments.map((c) => c.id) } } }),
    db.decision.delete({ where: { id: decisionId } }),
  ]);
}

export interface DecisionFilter {
  q?: string;
  status?: string;
  involvedId?: string;
}

/** Search and filter are done in JS so the same code works on SQLite and PostgreSQL. */
export async function listDecisions(actorId: string, circleId: string, filter: DecisionFilter = {}) {
  await membershipOrThrow(actorId, circleId);
  const rows = await db.decision.findMany({
    where: { circleId, ...(filter.status ? { status: filter.status } : {}), ...(filter.involvedId ? { involved: { some: { userId: filter.involvedId } } } : {}) },
    orderBy: { decidedOn: "desc" },
    include: { involved: { select: { userId: true } }, meeting: { select: { id: true, title: true } } },
  });
  const words = (filter.q ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return rows;
  return rows.filter((d) => {
    const hay = `${d.title} ${d.context}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}
