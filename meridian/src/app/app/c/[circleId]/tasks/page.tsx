import type { Metadata } from "next";
import Link from "next/link";
import { EmojiTile } from "@/components/brand/emoji-tile";
import { ActionItemForm, TaskRow, type TaskView } from "@/components/app/task-parts";
import { Card } from "@/components/ui/card";
import { loadMembers } from "@/lib/members";
import { cn } from "@/lib/utils";
import { getCircleContext } from "@/server/guards";
import { listCircleActionItems } from "@/server/services/meetings";

export const metadata: Metadata = { title: "Tasks" };

export default async function CircleTasksPage({ params, searchParams }: { params: Promise<{ circleId: string }>; searchParams: Promise<{ owner?: string }> }) {
  const { circleId } = await params;
  const { owner = "" } = await searchParams;
  const { user, isFounder } = await getCircleContext(circleId);
  const [items, members] = await Promise.all([listCircleActionItems(user.id, circleId), loadMembers(circleId)]);
  const name = new Map(members.map((m) => [m.userId, m.name]));
  const shown = owner ? items.filter((i) => i.ownerId === owner) : items;
  const toView = (i: (typeof items)[number]): TaskView => ({
    id: i.id, circleId, title: i.title, ownerId: i.ownerId, ownerName: name.get(i.ownerId) ?? "Former member",
    dueIso: i.dueDate?.toISOString() ?? null, done: i.done, meeting: i.meeting, canChange: i.ownerId === user.id || isFounder,
  });
  const open = shown.filter((i) => !i.done);
  const done = shown.filter((i) => i.done);
  const base = `/app/c/${circleId}/tasks`;
  const chip = (active: boolean) => cn("inline-flex rounded-full border-2 px-3 py-1 text-sm font-bold", active ? "border-ink bg-primary text-primary-ink" : "border-line hover:border-ink");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <EmojiTile feature="meetings" emoji="check" />
        <div>
          <h1 className="text-3xl font-extrabold">Tasks</h1>
          <p className="text-ink-soft">Every action item the circle has handed out. Yours also show up in <Link href="/app/tasks" className="font-bold text-primary hover:underline">My tasks</Link>.</p>
        </div>
      </div>

      <ul className="flex flex-wrap gap-2" aria-label="Filter by owner">
        <li><Link href={base} aria-current={!owner ? "true" : undefined} className={chip(!owner)}>Everyone</Link></li>
        {members.map((m) => (
          <li key={m.userId}><Link href={`${base}?owner=${m.userId}`} aria-current={owner === m.userId ? "true" : undefined} className={chip(owner === m.userId)}>{m.userId === user.id ? "Me" : m.name}</Link></li>
        ))}
      </ul>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="open" className="flex flex-col gap-3">
          <h2 id="open" className="font-display text-xl font-extrabold">Open <span className="text-ink-soft">({open.length})</span></h2>
          {open.length === 0 ? <p className="text-ink-soft">Nothing open. Enjoy it while it lasts.</p> : null}
          <ul className="flex flex-col gap-2">{open.map((i) => <TaskRow key={i.id} task={toView(i)} />)}</ul>
        </section>
        <section aria-labelledby="done" className="flex flex-col gap-3">
          <h2 id="done" className="font-display text-xl font-extrabold">Done <span className="text-ink-soft">({done.length})</span></h2>
          {done.length === 0 ? <p className="text-ink-soft">Completed items collect here.</p> : null}
          <ul className="flex flex-col gap-2">{done.map((i) => <TaskRow key={i.id} task={toView(i)} />)}</ul>
        </section>
      </div>

      <Card variant="soft" tone="meetings" className="p-5">
        <h2 className="mb-3 font-display text-lg font-bold">Add an action item</h2>
        <ActionItemForm circleId={circleId} members={members.map((m) => ({ userId: m.userId, name: m.name }))} defaultOwnerId={user.id} />
      </Card>
    </div>
  );
}
