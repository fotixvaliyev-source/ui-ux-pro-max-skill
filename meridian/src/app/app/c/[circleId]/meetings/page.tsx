import type { Metadata } from "next";
import Link from "next/link";
import { EmojiTile } from "@/components/brand/emoji-tile";
import { MeetingCard } from "@/components/app/meeting-card";
import { Button } from "@/components/ui/button";
import { getCircleContext } from "@/server/guards";
import { listMeetings } from "@/server/services/meetings";

export const metadata: Metadata = { title: "Meetings" };

export default async function MeetingsPage({ params }: { params: Promise<{ circleId: string }> }) {
  const { circleId } = await params;
  const { user } = await getCircleContext(circleId);
  const { upcoming, past } = await listMeetings(user.id, circleId);
  const view = (m: (typeof upcoming)[number]) => ({ id: m.id, title: m.title, startsAt: m.startsAt, location: m.location, videoUrl: m.videoUrl, actionCount: m._count.actionItems, decisionCount: m._count.decisions });
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <EmojiTile feature="meetings" />
          <div>
            <h1 className="text-3xl font-extrabold">Meetings</h1>
            <p className="text-ink-soft">Agendas, notes, decisions and action items in one place.</p>
          </div>
        </div>
        <Button asChild><Link href={`/app/c/${circleId}/meetings/new`}>Schedule a meeting</Link></Button>
      </div>

      <section aria-labelledby="upcoming" className="flex flex-col gap-3">
        <h2 id="upcoming" className="font-display text-xl font-extrabold">Upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="card-soft flex flex-col items-center gap-3 p-8 text-center">
            <EmojiTile feature="meetings" size="lg" />
            <p className="font-display text-xl font-bold">Nothing on the calendar</p>
            <p className="max-w-md text-ink-soft">Put the next meeting in with an agenda, and the circle will know what to prepare.</p>
          </div>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {upcoming.map((m) => (
              <li key={m.id}><MeetingCard meeting={view(m)} circleId={circleId} /></li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="past" className="flex flex-col gap-3">
        <h2 id="past" className="font-display text-xl font-extrabold">Past meetings</h2>
        {past.length === 0 ? (
          <p className="text-ink-soft">Meetings move here once they have happened, with their notes, decisions and action items.</p>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {past.map((m) => (
              <li key={m.id}><MeetingCard meeting={view(m)} circleId={circleId} muted /></li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
