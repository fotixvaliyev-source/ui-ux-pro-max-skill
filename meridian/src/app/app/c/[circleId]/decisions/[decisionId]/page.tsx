import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmActionButton } from "@/components/app/confirm-button";
import { DecisionStatusControl } from "@/components/app/decision-forms";
import { DecisionStatusPill } from "@/components/app/decision-card";
import { Discussion } from "@/components/app/discussion";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/dates";
import { loadMembers } from "@/lib/members";
import { deleteDecisionAction } from "@/server/actions/meetings";
import { db } from "@/server/db";
import { getCircleContext } from "@/server/guards";
import { loadThread } from "@/server/services/comments";

export const metadata: Metadata = { title: "Decision" };

export default async function DecisionPage({ params }: { params: Promise<{ circleId: string; decisionId: string }> }) {
  const { circleId, decisionId } = await params;
  const { user, isFounder } = await getCircleContext(circleId);
  const d = await db.decision.findFirst({ where: { id: decisionId, circleId }, include: { involved: true, meeting: { select: { id: true, title: true } } } });
  if (!d) notFound();
  const [members, thread] = await Promise.all([loadMembers(circleId), loadThread(user.id, circleId, { type: "DECISION", id: d.id })]);
  const name = new Map(members.map((m) => [m.userId, m.name]));
  const canManage = isFounder || d.createdById === user.id;
  const base = `/app/c/${circleId}`;
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <Link href={`${base}/decisions`} className="text-sm font-bold text-primary hover:underline">&larr; Decision log</Link>
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold uppercase tracking-wide text-ink-soft">{formatDate(d.decidedOn)}</span>
          <DecisionStatusPill status={d.status} />
        </div>
        <h1 className="text-4xl font-extrabold leading-tight">{d.title}</h1>
        {d.meeting ? <p className="text-ink-soft">From <Link href={`${base}/meetings/${d.meeting.id}`} className="font-bold text-primary hover:underline">{d.meeting.title}</Link></p> : null}
      </header>

      <section aria-labelledby="context" className="flex flex-col gap-2">
        <h2 id="context" className="font-display text-2xl font-extrabold">Context and reasoning</h2>
        <p className="whitespace-pre-wrap text-lg">{d.context}</p>
      </section>

      <section aria-labelledby="involved" className="flex flex-col gap-3">
        <h2 id="involved" className="font-display text-2xl font-extrabold">Who was involved</h2>
        {d.involved.length === 0 ? <p className="text-ink-soft">Not recorded.</p> : null}
        <ul className="flex flex-wrap gap-2">
          {d.involved.map((p) => {
            const n = name.get(p.userId) ?? "Former member";
            return (
              <li key={p.userId} className="inline-flex items-center gap-2 rounded-full border-2 border-line py-1 pl-1 pr-3 text-sm font-semibold"><Avatar name={n} size="sm" /> {n}</li>
            );
          })}
        </ul>
      </section>

      {canManage ? (
        <div className="flex flex-wrap items-end gap-4 rounded-card border-2 border-line p-4">
          <DecisionStatusControl circleId={circleId} decisionId={d.id} status={d.status} />
          <Button asChild variant="secondary" size="sm"><Link href={`${base}/decisions/${d.id}/edit`}>Edit decision</Link></Button>
          <ConfirmActionButton variant="danger" label="Delete decision" confirmText="Delete this decision and its comments?" run={deleteDecisionAction.bind(null, circleId, d.id)} />
        </div>
      ) : null}

      <Discussion
        circleId={circleId}
        targetType="DECISION"
        targetId={d.id}
        viewerId={user.id}
        isFounder={isFounder}
        targetReactions={thread.reactions}
        comments={thread.comments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }))}
      />
    </div>
  );
}
