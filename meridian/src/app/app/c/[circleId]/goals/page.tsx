import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmojiTile } from "@/components/brand/emoji-tile";
import { GoalCard } from "@/components/app/goal-card";
import { Pill } from "@/components/ui/tag";
import { GOAL_STATUS_STYLE, GOAL_STATUSES } from "@/lib/constants";
import { QUARTER_RE, nearbyQuarters, quarterLabel, quarterOf } from "@/lib/dates";
import { loadMembers } from "@/lib/members";
import { cn } from "@/lib/utils";
import { getCircleContext } from "@/server/guards";
import { listGoals } from "@/server/services/goals";

export const metadata: Metadata = { title: "Goals" };

export default async function GoalsPage({ params, searchParams }: { params: Promise<{ circleId: string }>; searchParams: Promise<{ quarter?: string }> }) {
  const { circleId } = await params;
  const { quarter: rawQuarter } = await searchParams;
  const { user } = await getCircleContext(circleId);
  const now = new Date();
  const quarter = rawQuarter && QUARTER_RE.test(rawQuarter) ? rawQuarter : quarterOf(now);
  const [goals, members] = await Promise.all([listGoals(user.id, circleId, quarter), loadMembers(circleId)]);
  const quarters = nearbyQuarters(now, [quarter]);
  const base = `/app/c/${circleId}/goals`;

  const byOwner = new Map<string, typeof goals>();
  for (const g of goals) byOwner.set(g.ownerId, [...(byOwner.get(g.ownerId) ?? []), g]);
  const ordered = [...members].sort((a, b) => (a.userId === user.id ? -1 : b.userId === user.id ? 1 : a.name.localeCompare(b.name)));
  const counts = GOAL_STATUSES.map((s) => ({ s, n: goals.filter((g) => g.status === s).length }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <EmojiTile feature="goals" />
          <div>
            <h1 className="text-3xl font-extrabold">Goals</h1>
            <p className="text-ink-soft">{quarterLabel(quarter)}, across the whole circle</p>
          </div>
        </div>
        <Button asChild><Link href={`${base}/new?quarter=${quarter}`}>Add a goal</Link></Button>
      </div>

      <ul className="flex flex-wrap gap-2" aria-label="Quarter">
        {quarters.map((q) => (
          <li key={q}>
            <Link href={`${base}?quarter=${q}`} aria-current={q === quarter ? "true" : undefined} className={cn("inline-flex rounded-full border-2 px-3 py-1 text-sm font-bold", q === quarter ? "border-ink bg-primary text-primary-ink" : "border-line hover:border-ink")}>
              {quarterLabel(q)}
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2" aria-label="Status overview">
        {counts.map(({ s, n }) => (
          <Pill key={s} tone={GOAL_STATUS_STYLE[s].tone}>{GOAL_STATUS_STYLE[s].label}: {n}</Pill>
        ))}
      </div>

      {goals.length === 0 ? (
        <div className="card-soft flex flex-col items-center gap-3 p-10 text-center">
          <EmojiTile feature="goals" size="lg" />
          <p className="font-display text-xl font-bold">No goals for {quarterLabel(quarter)} yet</p>
          <p className="max-w-md text-ink-soft">Say what you are aiming for this quarter. Peers cannot cheer for a goal they have not seen.</p>
          <Button asChild size="sm"><Link href={`${base}/new?quarter=${quarter}`}>Add the first goal</Link></Button>
        </div>
      ) : (
        ordered
          .filter((m) => byOwner.has(m.userId))
          .map((m) => (
            <section key={m.userId} aria-labelledby={`owner-${m.userId}`} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Avatar name={m.name} size="md" />
                <h2 id={`owner-${m.userId}`} className="font-display text-xl font-bold">{m.userId === user.id ? "My goals" : m.name}</h2>
              </div>
              <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {(byOwner.get(m.userId) ?? []).map((g) => (
                  <li key={g.id}>
                    <GoalCard circleId={circleId} goal={{ id: g.id, title: g.title, target: g.target, deadline: g.deadline, status: g.status, latestCheckIn: g.checkIns[0]?.progressed ?? null }} />
                  </li>
                ))}
              </ul>
            </section>
          ))
      )}
    </div>
  );
}
