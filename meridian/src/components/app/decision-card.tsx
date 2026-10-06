import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/tag";
import { DECISION_STATUS_STYLE, type DecisionStatus } from "@/lib/constants";
import { formatDate } from "@/lib/dates";

export interface DecisionView {
  id: string;
  title: string;
  context: string;
  decidedOn: Date;
  status: string;
  involvedNames: string[];
}

export function DecisionStatusPill({ status }: { status: string }) {
  const s = DECISION_STATUS_STYLE[status as DecisionStatus] ?? DECISION_STATUS_STYLE.ACTIVE;
  return <Pill tone={s.tone}>{s.label}</Pill>;
}

export function DecisionCard({ decision, circleId, heading: H = "h3" }: { decision: DecisionView; circleId: string; heading?: "h2" | "h3" }) {
  return (
    <Card variant="soft" tone="decisions" className="flex h-full flex-col gap-3 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-ink-soft">{formatDate(decision.decidedOn)}</span>
        <DecisionStatusPill status={decision.status} />
      </div>
      <H className="font-display text-lg font-bold leading-snug">
        <Link href={`/app/c/${circleId}/decisions/${decision.id}`} className="hover:underline">{decision.title}</Link>
      </H>
      <p className="line-clamp-3 text-sm text-ink-soft">{decision.context}</p>
      {decision.involvedNames.length ? (
        <div className="mt-auto flex items-center gap-2">
          <div className="flex -space-x-2">
            {decision.involvedNames.slice(0, 5).map((n) => (
              <Avatar key={n} name={n} size="sm" />
            ))}
          </div>
          <span className="text-xs text-ink-soft">{decision.involvedNames.length} involved</span>
        </div>
      ) : null}
    </Card>
  );
}
