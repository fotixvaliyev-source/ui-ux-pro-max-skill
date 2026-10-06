import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckInForm, DeleteGoalButton, StatusControl } from "@/components/app/goal-forms";
import { StatusPill } from "@/components/app/goal-card";
import { Discussion } from "@/components/app/discussion";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { formatDate, quarterLabel, timeAgo } from "@/lib/dates";
import { db } from "@/server/db";
import { getCircleContext } from "@/server/guards";
import { loadThread } from "@/server/services/comments";

export const metadata: Metadata = { title: "Goal" };

export default async function GoalPage({ params }: { params: Promise<{ circleId: string; goalId: string }> }) {
  const { circleId, goalId } = await params;
  const { user, isFounder } = await getCircleContext(circleId);
  const goal = await db.goal.findFirst({ where: { id: goalId, circleId }, include: { checkIns: { orderBy: { createdAt: "desc" } } } });
  if (!goal) notFound();
  const owner = await db.user.findUnique({ where: { id: goal.ownerId }, select: { name: true, email: true } });
  const ownerName = owner?.name ?? owner?.email ?? "Former member";
  const isOwner = goal.ownerId === user.id;
  const thread = await loadThread(user.id, circleId, { type: "GOAL", id: goal.id });
  const path = `/app/c/${circleId}/goals/${goal.id}`;

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <Link href={`/app/c/${circleId}/goals?quarter=${goal.quarter}`} className="text-sm font-bold text-primary hover:underline">&larr; All goals</Link>

      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Tag tone="goals">{quarterLabel(goal.quarter)}</Tag>
          <StatusPill status={goal.status} />
          {goal.deadline ? <Tag>Due {formatDate(goal.deadline)}</Tag> : null}
        </div>
        <h1 className="text-4xl font-extrabold leading-tight">{goal.title}</h1>
        <div className="flex items-center gap-2 text-ink-soft"><Avatar name={ownerName} size="sm" /> {ownerName}</div>
        {goal.target ? <p className="text-lg"><span className="font-bold">Target:</span> {goal.target}</p> : null}
        {goal.description ? <p className="whitespace-pre-wrap text-ink-soft">{goal.description}</p> : null}
        {isOwner ? (
          <div className="flex flex-wrap items-end gap-4 rounded-card border-2 border-line p-4">
            <StatusControl circleId={circleId} goalId={goal.id} status={goal.status} />
            <Button asChild variant="secondary" size="sm"><Link href={`${path}/edit`}>Edit goal</Link></Button>
            <DeleteGoalButton circleId={circleId} goalId={goal.id} />
          </div>
        ) : null}
      </header>

      <section aria-labelledby="checkins" className="flex flex-col gap-4">
        <h2 id="checkins" className="font-display text-2xl font-extrabold">Check-ins</h2>
        {isOwner ? (
          <Card variant="soft" tone="goals" className="p-5"><CheckInForm circleId={circleId} goalId={goal.id} /></Card>
        ) : null}
        {goal.checkIns.length === 0 ? <p className="text-ink-soft">No check-ins yet.</p> : null}
        <ol className="flex flex-col gap-4 border-l-2 border-goals pl-5">
          {goal.checkIns.map((c) => (
            <li key={c.id} className="flex flex-col gap-1.5">
              <time dateTime={c.createdAt.toISOString()} className="text-xs font-semibold text-ink-soft">{timeAgo(c.createdAt)}</time>
              <p><span className="font-bold">Progressed:</span> {c.progressed}</p>
              {c.blocked ? <p><span className="font-bold">Blocked:</span> {c.blocked}</p> : null}
              {c.helpNeeded ? <p><span className="font-bold">Help needed:</span> {c.helpNeeded}</p> : null}
            </li>
          ))}
        </ol>
      </section>

      <Discussion
        circleId={circleId}
        targetType="GOAL"
        targetId={goal.id}
        viewerId={user.id}
        isFounder={isFounder}
        targetReactions={thread.reactions}
        comments={thread.comments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }))}
      />
    </div>
  );
}
