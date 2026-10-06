import type { Metadata } from "next";
import Link from "next/link";
import { EmojiTile } from "@/components/brand/emoji-tile";
import { DecisionCard } from "@/components/app/decision-card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { DECISION_STATUSES, DECISION_STATUS_STYLE } from "@/lib/constants";
import { loadMembers } from "@/lib/members";
import { getCircleContext } from "@/server/guards";
import { listDecisions } from "@/server/services/meetings";

export const metadata: Metadata = { title: "Decision log" };

export default async function DecisionsPage({ params, searchParams }: { params: Promise<{ circleId: string }>; searchParams: Promise<{ q?: string; status?: string; who?: string }> }) {
  const { circleId } = await params;
  const { q = "", status = "", who = "" } = await searchParams;
  const { user } = await getCircleContext(circleId);
  const validStatus = (DECISION_STATUSES as readonly string[]).includes(status) ? status : "";
  const [decisions, members] = await Promise.all([
    listDecisions(user.id, circleId, { q, status: validStatus || undefined, involvedId: who || undefined }),
    loadMembers(circleId),
  ]);
  const name = new Map(members.map((m) => [m.userId, m.name]));
  const filtered = Boolean(q || validStatus || who);
  const base = `/app/c/${circleId}/decisions`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <EmojiTile feature="decisions" />
          <div>
            <h1 className="text-3xl font-extrabold">Decision log</h1>
            <p className="text-ink-soft">Decisions you can actually find later.</p>
          </div>
        </div>
        <Button asChild><Link href={`${base}/new`}>Log a decision</Link></Button>
      </div>

      <form action={base} method="get" role="search" className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
        <div>
          <label htmlFor="q" className="sr-only">Search decisions</label>
          <Input id="q" name="q" defaultValue={q} placeholder="Search the decision or its reasoning" />
        </div>
        <div>
          <label htmlFor="status" className="sr-only">Status</label>
          <Select id="status" name="status" defaultValue={validStatus}>
            <option value="">Any status</option>
            {DECISION_STATUSES.map((s) => (
              <option key={s} value={s}>{DECISION_STATUS_STYLE[s].label}</option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="who" className="sr-only">Involved</label>
          <Select id="who" name="who" defaultValue={who}>
            <option value="">Anyone involved</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>{m.name}</option>
            ))}
          </Select>
        </div>
        <Button type="submit">Filter</Button>
      </form>

      {decisions.length === 0 ? (
        <div className="card-soft flex flex-col items-center gap-3 p-10 text-center">
          <EmojiTile feature="decisions" size="lg" />
          <p className="font-display text-xl font-bold">{filtered ? "No decisions match" : "No decisions logged yet"}</p>
          <p className="max-w-md text-ink-soft">{filtered ? "Try fewer words or clear the filters." : "The next time the circle settles something, write it down with the reasoning. It takes a minute and saves an argument."}</p>
          {filtered ? <Button asChild size="sm" variant="secondary"><Link href={base}>Clear filters</Link></Button> : <Button asChild size="sm"><Link href={`${base}/new`}>Log the first one</Link></Button>}
        </div>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {decisions.map((d) => (
            <li key={d.id}>
              <DecisionCard heading="h2" circleId={circleId} decision={{ id: d.id, title: d.title, context: d.context, decidedOn: d.decidedOn, status: d.status, involvedNames: d.involved.map((p) => name.get(p.userId) ?? "Former member") }} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
