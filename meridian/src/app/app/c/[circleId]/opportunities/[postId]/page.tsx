import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmActionButton } from "@/components/app/confirm-button";
import { Discussion } from "@/components/app/discussion";
import { OpportunityStatusControl } from "@/components/app/opportunity-parts";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pill, Tag } from "@/components/ui/tag";
import { OPPORTUNITY_STATUS_STYLE, OPPORTUNITY_TYPE_STYLE, type OpportunityStatus, type OpportunityType } from "@/lib/constants";
import { timeAgo } from "@/lib/dates";
import { parseTags } from "@/lib/tags";
import { deleteOpportunityAction } from "@/server/actions/projects";
import { db } from "@/server/db";
import { getCircleContext } from "@/server/guards";
import { loadThread } from "@/server/services/comments";

export const metadata: Metadata = { title: "Opportunity" };

export default async function OpportunityPage({ params }: { params: Promise<{ circleId: string; postId: string }> }) {
  const { circleId, postId } = await params;
  const { user, isFounder } = await getCircleContext(circleId);
  const p = await db.opportunity.findFirst({ where: { id: postId, circleId } });
  if (!p) notFound();
  const author = await db.user.findUnique({ where: { id: p.authorId }, select: { name: true, email: true } });
  const authorName = author?.name ?? author?.email ?? "Former member";
  const thread = await loadThread(user.id, circleId, { type: "OPPORTUNITY", id: p.id });
  const ty = OPPORTUNITY_TYPE_STYLE[p.type as OpportunityType] ?? OPPORTUNITY_TYPE_STYLE.QUESTION;
  const st = OPPORTUNITY_STATUS_STYLE[p.status as OpportunityStatus] ?? OPPORTUNITY_STATUS_STYLE.OPEN;
  const canManage = isFounder || p.authorId === user.id;
  const base = `/app/c/${circleId}/opportunities`;
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <Link href={base} className="text-sm font-bold text-primary hover:underline">&larr; All opportunities</Link>
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2"><Tag tone={ty.tone}>{ty.label}</Tag><Pill tone={st.tone}>{st.label}</Pill></div>
        <h1 className="text-4xl font-extrabold leading-tight">{p.title}</h1>
        <p className="flex items-center gap-2 text-ink-soft"><Avatar name={authorName} size="sm" /> {authorName} · {timeAgo(p.createdAt)}</p>
        <p className="whitespace-pre-wrap text-lg">{p.description}</p>
        <div className="flex flex-wrap gap-1.5">{parseTags(p.tags).map((x) => (<Tag key={x}>{x}</Tag>))}</div>
      </header>
      {canManage ? (
        <div className="flex flex-wrap items-end gap-4 rounded-card border-2 border-line p-4">
          <OpportunityStatusControl circleId={circleId} postId={p.id} status={p.status} />
          <Button asChild variant="secondary" size="sm"><Link href={`${base}/${p.id}/edit`}>Edit post</Link></Button>
          <ConfirmActionButton variant="danger" label="Delete post" confirmText="Delete this post and its replies?" run={deleteOpportunityAction.bind(null, circleId, p.id)} />
        </div>
      ) : null}
      <Discussion circleId={circleId} targetType="OPPORTUNITY" targetId={p.id} viewerId={user.id} isFounder={isFounder} targetReactions={thread.reactions} comments={thread.comments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }))} />
    </div>
  );
}
