import type { Metadata } from "next";
import { EmojiTile } from "@/components/brand/emoji-tile";
import { KanbanBoard } from "@/components/app/kanban-board";
import { loadMembers } from "@/lib/members";
import { getCircleContext } from "@/server/guards";
import { getBoard } from "@/server/services/projects";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage({ params }: { params: Promise<{ circleId: string }> }) {
  const { circleId } = await params;
  const { user, isFounder } = await getCircleContext(circleId);
  const [board, members] = await Promise.all([getBoard(user.id, circleId), loadMembers(circleId)]);
  const name = new Map(members.map((m) => [m.userId, m.name]));
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <EmojiTile feature="projects" />
        <div>
          <h1 className="text-3xl font-extrabold">Projects</h1>
          <p className="text-ink-soft">A small board for what the circle is building together.</p>
        </div>
      </div>
      <KanbanBoard
        circleId={circleId}
        isFounder={isFounder}
        columns={board.columns.map((c) => ({
          id: c.id,
          name: c.name,
          cards: c.cards.map((card) => ({
            id: card.id, title: card.title, position: card.position, label: card.label,
            ownerName: card.ownerId ? (name.get(card.ownerId) ?? null) : null,
            dueIso: card.dueDate?.toISOString() ?? null,
            checkTotal: card.checklist.length, checkDone: card.checklist.filter((i) => i.done).length,
          })),
        }))}
      />
    </div>
  );
}
