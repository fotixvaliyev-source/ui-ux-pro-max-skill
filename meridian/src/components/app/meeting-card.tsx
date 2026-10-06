import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { LocalTime } from "./local-time";

export interface MeetingView {
  id: string;
  title: string;
  startsAt: Date;
  location: string | null;
  videoUrl: string | null;
  actionCount: number;
  decisionCount: number;
}

export function MeetingCard({ meeting, circleId, muted = false }: { meeting: MeetingView; circleId: string; muted?: boolean }) {
  const d = meeting.startsAt;
  return (
    <Card variant="soft" tone="meetings" className="flex gap-4 p-4">
      <div aria-hidden className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-ink bg-meetings-tint text-meetings-text">
        <span className="text-xs font-bold uppercase">{d.toLocaleString("en-GB", { month: "short", timeZone: "UTC" })}</span>
        <span className="font-display text-2xl font-extrabold leading-none">{d.getUTCDate()}</span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-lg font-bold leading-snug">
          <Link href={`/app/c/${circleId}/meetings/${meeting.id}`} className="hover:underline">{meeting.title}</Link>
        </h3>
        <p className={muted ? "text-sm text-ink-soft" : "text-sm font-medium"}><LocalTime iso={d.toISOString()} format="full" /></p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {meeting.location ? <Tag>{meeting.location}</Tag> : null}
          {meeting.videoUrl ? <Tag tone="meetings">Video call</Tag> : null}
          {meeting.actionCount ? <Tag tone="primary">{meeting.actionCount} action {meeting.actionCount === 1 ? "item" : "items"}</Tag> : null}
          {meeting.decisionCount ? <Tag tone="decisions">{meeting.decisionCount} {meeting.decisionCount === 1 ? "decision" : "decisions"}</Tag> : null}
        </div>
      </div>
    </Card>
  );
}
