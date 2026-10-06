import type { z } from "zod";
import { db } from "@/server/db";
import { DEFAULT_COLUMNS } from "@/lib/constants";
import { membershipOrThrow, UserError } from "@/server/access";
import { generateInviteCode } from "@/server/services/invites";
import type { circleSchema } from "@/server/validation/circle";
import { inviteCodeSchema } from "@/server/validation/circle";

type CircleInput = z.output<typeof circleSchema>;

async function uniqueInviteCode(): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const code = generateInviteCode();
    if (!(await db.circle.findUnique({ where: { inviteCode: code }, select: { id: true } }))) return code;
  }
  throw new UserError("Could not create an invite code. Please try again.");
}

/** Creates the circle, makes the creator its Founder and sets up the default Kanban board. */
export async function createCircle(userId: string, input: CircleInput): Promise<{ id: string }> {
  const inviteCode = await uniqueInviteCode();
  const circle = await db.circle.create({
    data: {
      name: input.name,
      purpose: input.purpose,
      cadence: input.cadence ?? null,
      accent: input.accent,
      inviteCode,
      members: { create: { userId, role: "FOUNDER" } },
      board: { create: { columns: { create: DEFAULT_COLUMNS.map((name, position) => ({ name, position })) } } },
    },
    select: { id: true },
  });
  await db.activity.create({
    data: { circleId: circle.id, actorId: userId, verb: "created", summary: `started ${input.name}`, href: `/app/c/${circle.id}` },
  });
  return circle;
}

/** What a visitor with a code may see before joining: just enough to recognise the circle. */
export async function previewInvite(rawCode: string) {
  const parsed = inviteCodeSchema.safeParse(rawCode);
  if (!parsed.success) return null;
  const circle = await db.circle.findUnique({
    where: { inviteCode: parsed.data },
    select: { id: true, name: true, purpose: true, inviteOpen: true, _count: { select: { members: true } } },
  });
  return circle ? { ...circle, memberCount: circle._count.members } : null;
}

export async function joinCircleByCode(userId: string, rawCode: string): Promise<{ id: string }> {
  const parsed = inviteCodeSchema.safeParse(rawCode);
  if (!parsed.success) throw new UserError("Invite codes are 8 letters and numbers.");
  const circle = await db.circle.findUnique({ where: { inviteCode: parsed.data }, select: { id: true, name: true, inviteOpen: true } });
  if (!circle) throw new UserError("That code did not match a circle. Check it and try again.");
  const existing = await db.membership.findUnique({ where: { circleId_userId: { circleId: circle.id, userId } } });
  if (existing) return { id: circle.id };
  if (!circle.inviteOpen) throw new UserError("Invitations for this circle are paused. Ask the Founder to turn them back on.");
  await db.membership.create({ data: { circleId: circle.id, userId, role: "MEMBER" } });
  const user = await db.user.findUnique({ where: { id: userId }, select: { name: true } });
  await db.activity.create({
    data: { circleId: circle.id, actorId: userId, verb: "joined", summary: `${user?.name ?? "Someone"} joined the circle`, href: `/app/c/${circle.id}/members` },
  });
  return { id: circle.id };
}

export async function updateCircle(actorId: string, circleId: string, input: CircleInput): Promise<void> {
  await membershipOrThrow(actorId, circleId, { founder: true });
  await db.circle.update({
    where: { id: circleId },
    data: { name: input.name, purpose: input.purpose, cadence: input.cadence ?? null, accent: input.accent },
  });
}

export async function regenerateInviteCode(actorId: string, circleId: string): Promise<string> {
  await membershipOrThrow(actorId, circleId, { founder: true });
  const inviteCode = await uniqueInviteCode();
  await db.circle.update({ where: { id: circleId }, data: { inviteCode } });
  return inviteCode;
}

export async function setInviteOpen(actorId: string, circleId: string, open: boolean): Promise<void> {
  await membershipOrThrow(actorId, circleId, { founder: true });
  await db.circle.update({ where: { id: circleId }, data: { inviteOpen: open } });
}

export async function removeMember(actorId: string, circleId: string, targetUserId: string): Promise<void> {
  await membershipOrThrow(actorId, circleId, { founder: true });
  if (targetUserId === actorId) throw new UserError("Use Leave circle to remove yourself.");
  const target = await db.membership.findUnique({ where: { circleId_userId: { circleId, userId: targetUserId } } });
  if (!target) throw new UserError("That person is not in this circle.");
  await db.membership.delete({ where: { id: target.id } });
}

export async function setMemberRole(actorId: string, circleId: string, targetUserId: string, role: "FOUNDER" | "MEMBER"): Promise<void> {
  await membershipOrThrow(actorId, circleId, { founder: true });
  const target = await db.membership.findUnique({ where: { circleId_userId: { circleId, userId: targetUserId } } });
  if (!target) throw new UserError("That person is not in this circle.");
  if (target.role === "FOUNDER" && role === "MEMBER") {
    const founders = await db.membership.count({ where: { circleId, role: "FOUNDER" } });
    if (founders <= 1) throw new UserError("A circle needs at least one Founder.");
  }
  await db.membership.update({ where: { id: target.id }, data: { role } });
}

export async function leaveCircle(userId: string, circleId: string): Promise<void> {
  const { membership } = await membershipOrThrow(userId, circleId);
  const [members, founders] = await Promise.all([
    db.membership.count({ where: { circleId } }),
    db.membership.count({ where: { circleId, role: "FOUNDER" } }),
  ]);
  if (members === 1) throw new UserError("You are the only member. Delete the circle instead.");
  if (membership.role === "FOUNDER" && founders === 1) throw new UserError("Make someone else a Founder before you leave.");
  await db.membership.delete({ where: { id: membership.id } });
}

export async function deleteCircle(actorId: string, circleId: string, confirmName: string): Promise<void> {
  const { circle } = await membershipOrThrow(actorId, circleId, { founder: true });
  if (confirmName.trim() !== circle.name) throw new UserError("Type the circle name exactly to confirm.");
  await db.$transaction([
    db.notification.deleteMany({ where: { circleId } }),
    db.circle.delete({ where: { id: circleId } }),
  ]);
}
