import type { Metadata } from "next";
import Link from "next/link";
import { DecisionStatusPill } from "@/components/app/decision-card";
import { LocalTime } from "@/components/app/local-time";
import { EmojiTile } from "@/components/brand/emoji-tile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pill, Tag } from "@/components/ui/tag";
import { GOAL_STATUSES, GOAL_STATUS_STYLE, OPPORTUNITY_TYPE_STYLE, type OpportunityType, type FeatureKey } from "@/lib/constants";
import { formatDate, quarterLabel, quarterOf, timeAgo } from "@/lib/dates";
import { getCircleContext } from "@/server/guards";
import { loadHome } from "@/server/services/home";

export const metadata: Metadata = { title: "Circle home" };

function Panel({ feature, title, href, linkLabel, children }: { feature: FeatureKey; title: string; href: string; linkLabel: string; children: React.ReactNode }) {
  return (
    <Card variant="soft" tone={feature} className="flex flex-col gap-3 p-5">
      <div className="flex items-center gap-3">
        <EmojiTile feature={feature} size="sm" />
        <h2 className="font-display text-lg font-extrabold">{title}</h2>
        <Link href={href} className="ml-auto text-sm font-bold text-primary hover:underline">{linkLabel}</Link>
      </div>
      {children}
    </Card>
  );
}

export default async function CircleHome({ params }: { params: Promise<{ circleId: string }> }) {
  const { circleId } = await params;
  const { user, circle } = await getCircleContext(circleId);
  const home = await loadHome(user.id, circleId);
  const base = `/app/c/${circleId}`;
  const now = new Date();
  const goalTotal = GOAL_STATUSES.reduce((n, s) => n + (home.goalCounts[s] ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-extrabold">{circle.name}</h1>
        <p className="mt-2 max-w-2xl text-lg text-ink-soft">{circle.purpose}</p>
      </div>

      <Card variant="key" tone="decisions" className="flex flex-col gap-1 p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">This week in the circle</p>
        <p className="font-display text-xl font-bold leading-snug">{home.summary.sentence}</p>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel feature="meetings" title="Next meeting" href={`${base}/meetings`} linkLabel="All meetings">
          {home.nextMeeting ? (
            <>
              <Link href={`${base}/meetings/${home.nextMeeting.id}`} className="font-display text-xl font-bold hover:underline">{home.nextMeeting.title}</Link>
              <p className="font-medium"><LocalTime iso={home.nextMeeting.startsAt.toISOString()} format="full" /></p>
              {home.nextMeeting.agenda.length ? (
                <ol className="list-decimal pl-5 text-sm text-ink-soft">{home.nextMeeting.agenda.map((a) => (<li key={a.id}>{a.text}</li>))}</ol>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-ink-soft">Nothing scheduled.</p>
              <div><Button asChild size="sm"><Link href={`${base}/meetings/new`}>Schedule a meeting</Link></Button></div>
            </>
          )}
        </Panel>

        <Panel feature="meetings" title="My open action items" href={`${base}/tasks`} linkLabel="All tasks">
          {home.myTasks.length === 0 ? (
            <p className="text-ink-soft">You are all caught up in this circle.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {home.myTasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 rounded-xl border-2 border-line px-3 py-2">
                  <span className="font-medium">{t.title}</span>
                  {t.dueDate ? <Tag tone={t.dueDate < now ? "danger" : "meetings"}>{formatDate(t.dueDate)}</Tag> : null}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel feature="goals" title={`Goals, ${quarterLabel(quarterOf(now))}`} href={`${base}/goals`} linkLabel="All goals">
          {goalTotal === 0 ? (
            <p className="text-ink-soft">No goals set for this quarter yet. <Link href={`${base}/goals/new`} className="font-bold text-primary hover:underline">Add yours</Link></p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {GOAL_STATUSES.map((s) => (<Pill key={s} tone={GOAL_STATUS_STYLE[s].tone}>{GOAL_STATUS_STYLE[s].label}: {home.goalCounts[s] ?? 0}</Pill>))}
            </div>
          )}
        </Panel>

        <Panel feature="decisions" title="Recent decisions" href={`${base}/decisions`} linkLabel="Decision log">
          {home.decisions.length === 0 ? <p className="text-ink-soft">No decisions logged yet.</p> : (
            <ul className="flex flex-col gap-2">
              {home.decisions.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-2">
                  <Link href={`${base}/decisions/${d.id}`} className="font-medium hover:underline">{d.title}</Link>
                  <DecisionStatusPill status={d.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel feature="opps" title="Open opportunities" href={`${base}/opportunities`} linkLabel="Opportunities board">
          {home.opportunities.length === 0 ? <p className="text-ink-soft">Nothing open right now.</p> : (
            <ul className="flex flex-col gap-2">
              {home.opportunities.map((o) => {
                const t = OPPORTUNITY_TYPE_STYLE[o.type as OpportunityType] ?? OPPORTUNITY_TYPE_STYLE.QUESTION;
                return (
                  <li key={o.id} className="flex flex-wrap items-center gap-2">
                    <Tag tone={t.tone}>{t.label}</Tag>
                    <Link href={`${base}/opportunities/${o.id}`} className="font-medium hover:underline">{o.title}</Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel feature="directory" title="Activity" href={`${base}/members`} linkLabel="Members">
          {home.activity.length === 0 ? <p className="text-ink-soft">Activity shows up here as the circle gets going.</p> : (
            <ul className="flex flex-col gap-2.5">
              {home.activity.map((a) => (
                <li key={a.id} className="text-sm">
                  <Link href={a.href} className="font-medium hover:underline">{a.summary}</Link>
                  <span className="ml-2 text-xs text-ink-soft">{timeAgo(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
