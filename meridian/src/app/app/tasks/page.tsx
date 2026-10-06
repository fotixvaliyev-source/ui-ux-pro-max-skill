import type { Metadata } from "next";
import Link from "next/link";
import { EmojiTile } from "@/components/brand/emoji-tile";
import { TaskRow, type TaskView } from "@/components/app/task-parts";
import { db } from "@/server/db";
import { requireUser } from "@/server/guards";
import { listMyTasks } from "@/server/services/meetings";

export const metadata: Metadata = { title: "My tasks" };

export default async function MyTasksPage() {
  const user = await requireUser();
  const items = await listMyTasks(user.id);
  const founderOf = new Set((await db.membership.findMany({ where: { userId: user.id, role: "FOUNDER" }, select: { circleId: true } })).map((m) => m.circleId));
  const toView = (i: (typeof items)[number]): TaskView => ({
    id: i.id, circleId: i.circle.id, circleName: i.circle.name, title: i.title, ownerId: i.ownerId, ownerName: user.name ?? user.email,
    dueIso: i.dueDate?.toISOString() ?? null, done: i.done, meeting: i.meeting, canChange: (i.ownerId === user.id || founderOf.has(i.circle.id)),
  });
  const open = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-4">
        <EmojiTile feature="meetings" emoji="check" />
        <div>
          <h1 className="text-3xl font-extrabold">My tasks</h1>
          <p className="text-ink-soft">Everything assigned to you, across all your circles.</p>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="card-soft flex flex-col items-center gap-3 p-10 text-center">
          <EmojiTile feature="meetings" emoji="party" size="lg" />
          <p className="font-display text-xl font-bold">Nothing on your plate</p>
          <p className="max-w-md text-ink-soft">When someone assigns you an action item in a meeting, it lands here. <Link href="/app" className="font-bold text-primary hover:underline">Back to your circles</Link></p>
        </div>
      ) : (
        <>
          <section aria-labelledby="open" className="flex flex-col gap-3">
            <h2 id="open" className="font-display text-xl font-extrabold">Open <span className="text-ink-soft">({open.length})</span></h2>
            {open.length === 0 ? <p className="text-ink-soft">All clear.</p> : null}
            <ul className="flex flex-col gap-2">{open.map((i) => <TaskRow key={i.id} task={toView(i)} showOwner={false} />)}</ul>
          </section>
          {done.length ? (
            <section aria-labelledby="done" className="flex flex-col gap-3">
              <h2 id="done" className="font-display text-xl font-extrabold">Done <span className="text-ink-soft">({done.length})</span></h2>
              <ul className="flex flex-col gap-2">{done.map((i) => <TaskRow key={i.id} task={toView(i)} showOwner={false} />)}</ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
