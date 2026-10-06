import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Pill, Tag } from "@/components/ui/tag";
import { GOAL_STATUS_STYLE, type GoalStatus } from "@/lib/constants";
import { formatDate } from "@/lib/dates";

export interface GoalView {
  id: string;
  title: string;
  target: string | null;
  deadline: Date | null;
  status: string;
  latestCheckIn: string | null;
}

export function StatusPill({ status }: { status: string }) {
  const style = GOAL_STATUS_STYLE[status as GoalStatus] ?? GOAL_STATUS_STYLE.ON_TRACK;
  return <Pill tone={style.tone}>{style.label}</Pill>;
}

export function GoalCard({ goal, circleId }: { goal: GoalView; circleId: string }) {
  return (
    <Card variant="soft" tone="goals" className="flex h-full flex-col gap-3 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-display text-lg font-bold leading-snug">
          <Link href={`/app/c/${circleId}/goals/${goal.id}`} className="hover:underline">{goal.title}</Link>
        </h3>
        <StatusPill status={goal.status} />
      </div>
      {goal.target ? <p className="text-sm"><span className="font-semibold">Target:</span> {goal.target}</p> : null}
      {goal.latestCheckIn ? <p className="line-clamp-2 text-sm text-ink-soft">Latest: {goal.latestCheckIn}</p> : null}
      {goal.deadline ? <div className="mt-auto"><Tag tone="goals">Due {formatDate(goal.deadline)}</Tag></div> : null}
    </Card>
  );
}
