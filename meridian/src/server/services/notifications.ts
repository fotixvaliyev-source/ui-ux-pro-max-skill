import { db } from "@/server/db";

interface NotifyInput {
  circleId: string;
  type: "ACTION_ITEM" | "MEETING" | "OPPORTUNITY" | "COMMENT" | "POLL";
  title: string;
  href: string;
}

/** In-app notifications only. The person who caused the event is never notified about it. */
export async function notify(actorId: string, userIds: readonly string[], input: NotifyInput): Promise<number> {
  const recipients = [...new Set(userIds)].filter((id) => id !== actorId);
  if (recipients.length === 0) return 0;
  // Only members of the circle may be notified about its content.
  const members = await db.membership.findMany({
    where: { circleId: input.circleId, userId: { in: recipients } },
    select: { userId: true },
  });
  if (members.length === 0) return 0;
  const res = await db.notification.createMany({ data: members.map((m) => ({ userId: m.userId, ...input })) });
  return res.count;
}

export async function notifyCircle(actorId: string, circleId: string, input: Omit<NotifyInput, "circleId">): Promise<number> {
  const members = await db.membership.findMany({ where: { circleId }, select: { userId: true } });
  return notify(actorId, members.map((m) => m.userId), { ...input, circleId });
}

export async function markRead(userId: string, id: string): Promise<void> {
  await db.notification.updateMany({ where: { id, userId, readAt: null }, data: { readAt: new Date() } });
}

export async function markAllRead(userId: string): Promise<void> {
  await db.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });
}
