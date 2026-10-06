import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Checklist, EditCardForm } from "@/components/app/card-forms";
import { ConfirmActionButton } from "@/components/app/confirm-button";
import { Discussion } from "@/components/app/discussion";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { toDateInput } from "@/lib/dates";
import { loadMembers } from "@/lib/members";
import { deleteCardAction } from "@/server/actions/projects";
import { db } from "@/server/db";
import { getCircleContext } from "@/server/guards";
import { loadThread } from "@/server/services/comments";

export const metadata: Metadata = { title: "Card" };

export default async function CardPage({ params }: { params: Promise<{ circleId: string; cardId: string }> }) {
  const { circleId, cardId } = await params;
  const { user, isFounder } = await getCircleContext(circleId);
  const card = await db.projectCard.findFirst({ where: { id: cardId, circleId }, include: { column: { select: { name: true } }, checklist: { orderBy: { position: "asc" } } } });
  if (!card) notFound();
  const [members, thread] = await Promise.all([loadMembers(circleId), loadThread(user.id, circleId, { type: "CARD", id: card.id })]);
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <Link href={`/app/c/${circleId}/projects`} className="text-sm font-bold text-primary hover:underline">&larr; Board</Link>
      <header className="flex flex-col gap-3">
        <Tag tone="projects">{card.column.name}</Tag>
        <h1 className="text-4xl font-extrabold leading-tight">{card.title}</h1>
      </header>
      <Card variant="soft" tone="projects" className="p-5">
        <EditCardForm circleId={circleId} cardId={card.id} members={members.map((m) => ({ userId: m.userId, name: m.name }))}
          defaults={{ title: card.title, description: card.description, ownerId: card.ownerId, dueDate: toDateInput(card.dueDate), label: card.label }} />
      </Card>
      <section aria-labelledby="checklist" className="flex flex-col gap-3">
        <h2 id="checklist" className="font-display text-2xl font-extrabold">Checklist</h2>
        <Checklist circleId={circleId} cardId={card.id} items={card.checklist.map((i) => ({ id: i.id, text: i.text, done: i.done }))} />
      </section>
      <Discussion circleId={circleId} targetType="CARD" targetId={card.id} viewerId={user.id} isFounder={isFounder} comments={thread.comments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }))} />
      <div>
        <ConfirmActionButton variant="danger" label="Delete card" confirmText="Delete this card, its checklist and comments?" run={deleteCardAction.bind(null, circleId, card.id)} />
      </div>
    </div>
  );
}
