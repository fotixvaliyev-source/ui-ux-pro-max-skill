import { CircleNav } from "@/components/app/circle-nav";
import { Tag } from "@/components/ui/tag";
import { ACCENT_TONE, CIRCLE_ACCENTS } from "@/lib/constants";
import { TONE_SOLID } from "@/lib/tone";
import { getCircleContext } from "@/server/guards";

const CADENCE_LABEL: Record<string, string> = { weekly: "Meets weekly", biweekly: "Meets every two weeks", monthly: "Meets monthly" };

export default async function CircleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ circleId: string }> }) {
  const { circleId } = await params;
  const { circle, isFounder } = await getCircleContext(circleId);
  const accent = (CIRCLE_ACCENTS as readonly string[]).includes(circle.accent) ? (circle.accent as (typeof CIRCLE_ACCENTS)[number]) : "indigo";
  return (
    <div className="grid gap-8 lg:grid-cols-[13rem_1fr]">
      <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <div className="mb-4 flex items-start gap-3">
          <span aria-hidden className={`mt-1 h-10 w-2 shrink-0 rounded-full ${TONE_SOLID[ACCENT_TONE[accent]]}`} />
          <div className="min-w-0">
            <p className="truncate font-display text-xl font-extrabold leading-tight">{circle.name}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {isFounder ? <Tag tone="primary">Founder</Tag> : null}
              {circle.cadence ? <Tag>{CADENCE_LABEL[circle.cadence] ?? circle.cadence}</Tag> : null}
            </div>
          </div>
        </div>
        <CircleNav circleId={circle.id} />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
