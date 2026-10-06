import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmActionButton } from "@/components/app/confirm-button";
import { DecisionCard } from "@/components/app/decision-card";
import { Discussion } from "@/components/app/discussion";
import { LocalTime } from "@/components/app/local-time";
import { Markdown } from "@/components/app/markdown";
import { NotesPanel } from "@/components/app/meeting-forms";
import { ActionItemForm, TaskRow } from "@/components/app/task-parts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { loadMembers } from "@/lib/members";
import { deleteMeetingAction } from "@/server/actions/meetings";
import { db } from "@/server/db";
import { getCircleContext } from "@/server/guards";
import { loadThread } from "@/server/services/comments";

export const metadata: Metadata = { title: "Meeting" };

export default async function MeetingPage({ params }: { params: Promise<{ circleId: string; meetingId: string }> }) {
  const { circleId, meetingId } = await params;
  const { user, isFounder } = await getCircleContext(circleId);
  const meeting = await db.meeting.findFirst({
    where: { id: meetingId, circleId },
    include: {
      agenda: { orderBy: { position: "asc" } },
      actionItems: { orderBy: [{ done: "asc" }, { dueDate: "asc" }] },
      decisions: { orderBy: { decidedOn: "desc" }, include: { involved: { select: { userId: true } } } },
    },
  });
  if (!meeting) notFound();
  const [members, thread] = await Promise.all([loadMembers(circleId), loadThread(user.id, circleId, { type: "MEETING", id: meeting.id })]);
  const name = new Map(members.map((m) => [m.userId, m.name]));
  const canManage = isFounder || meeting.createdById === user.id;
  const base = `/app/c/${circleId}`;
  const isPast = meeting.startsAt.getTime() < Date.now();

  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <Link href={`${base}/meetings`} className="-mb-6 text-sm font-bold text-primary hover:underline">&larr; All meetings</Link>

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="meetings">{isPast ? "Past meeting" : "Upcoming"}</Tag>
          {meeting.location ? <Tag>{meeting.location}</Tag> : null}
        </div>
        <h1 className="text-4xl font-extrabold leading-tight">{meeting.title}</h1>
        <p className="text-lg font-medium"><LocalTime iso={meeting.startsAt.toISOString()} format="full" /></p>
        <div className="flex flex-wrap items-center gap-3">
          {meeting.videoUrl ? (
            <Button asChild size="sm"><a href={meeting.videoUrl} target="_blank" rel="noopener noreferrer">Join the video call</a></Button>
          ) : null}
          {canManage ? (
            <>
              <Button asChild variant="secondary" size="sm"><Link href={`${base}/meetings/${meeting.id}/edit`}>Edit details</Link></Button>
              <ConfirmActionButton variant="danger" label="Delete meeting" confirmText="Delete this meeting and its notes? Decisions and action items stay in the circle." run={deleteMeetingAction.bind(null, circleId, meeting.id)} />
            </>
          ) : null}
        </div>
      </header>

      <section aria-labelledby="agenda" className="flex flex-col gap-3">
        <h2 id="agenda" className="font-display text-2xl font-extrabold">Agenda</h2>
        {meeting.agenda.length === 0 ? (
          <p className="text-ink-soft">No agenda yet.</p>
        ) : (
          <ol className="flex flex-col gap-2">
            {meeting.agenda.map((a, i) => (
              <li key={a.id} className="flex gap-3 rounded-xl bg-meetings-tint px-4 py-2.5 text-meetings-text">
                <span className="font-display font-extrabold">{i + 1}.</span>
                <span className="font-medium">{a.text}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="notes" className="flex flex-col gap-3">
        <h2 id="notes" className="font-display text-2xl font-extrabold">Shared notes</h2>
        <NotesPanel circleId={circleId} meetingId={meeting.id} notesMd={meeting.notesMd} rendered={<Markdown>{meeting.notesMd}</Markdown>} />
      </section>

      <section aria-labelledby="decisions" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="decisions" className="font-display text-2xl font-extrabold">Decisions</h2>
          <Button asChild variant="secondary" size="sm"><Link href={`${base}/decisions/new?meeting=${meeting.id}`}>Log a decision</Link></Button>
        </div>
        {meeting.decisions.length === 0 ? <p className="text-ink-soft">Nothing decided in this meeting yet.</p> : null}
        <ul className="grid gap-4 sm:grid-cols-2">
          {meeting.decisions.map((d) => (
            <li key={d.id}>
              <DecisionCard circleId={circleId} decision={{ id: d.id, title: d.title, context: d.context, decidedOn: d.decidedOn, status: d.status, involvedNames: d.involved.map((p) => name.get(p.userId) ?? "Former member") }} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="actions" className="flex flex-col gap-3">
        <h2 id="actions" className="font-display text-2xl font-extrabold">Action items</h2>
        {meeting.actionItems.length === 0 ? <p className="text-ink-soft">No action items yet.</p> : null}
        <ul className="flex flex-col gap-2">
          {meeting.actionItems.map((a) => (
            <TaskRow
              key={a.id}
              task={{ id: a.id, circleId, title: a.title, ownerId: a.ownerId, ownerName: name.get(a.ownerId) ?? "Former member", dueIso: a.dueDate?.toISOString() ?? null, done: a.done, meeting: null, canChange: a.ownerId === user.id || isFounder }}
            />
          ))}
        </ul>
        <Card variant="soft" tone="meetings" className="p-5">
          <ActionItemForm circleId={circleId} meetingId={meeting.id} members={members.map((m) => ({ userId: m.userId, name: m.name }))} defaultOwnerId={user.id} />
        </Card>
        <p className="text-sm text-ink-soft">Action items also appear on the circle&rsquo;s Tasks board and in each owner&rsquo;s My tasks.</p>
      </section>

      <Discussion
        circleId={circleId}
        targetType="MEETING"
        targetId={meeting.id}
        viewerId={user.id}
        isFounder={isFounder}
        comments={thread.comments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }))}
      />
    </div>
  );
}
