import type { Metadata } from "next";
import Link from "next/link";
import { EmojiTile } from "@/components/brand/emoji-tile";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/form";
import { Pill, Tag } from "@/components/ui/tag";
import {
  OPPORTUNITY_STATUSES, OPPORTUNITY_STATUS_STYLE, OPPORTUNITY_TYPES, OPPORTUNITY_TYPE_STYLE, type OpportunityStatus, type OpportunityType,
} from "@/lib/constants";
import { timeAgo } from "@/lib/dates";
import { loadMembers } from "@/lib/members";
import { parseTags } from "@/lib/tags";
import { db } from "@/server/db";
import { getCircleContext } from "@/server/guards";
import { listOpportunities } from "@/server/services/opportunities";

export const metadata: Metadata = { title: "Opportunities" };

export default async function OpportunitiesPage({ params, searchParams }: { params: Promise<{ circleId: string }>; searchParams: Promise<{ q?: string; type?: string; status?: string; tag?: string }> }) {
  const { circleId } = await params;
  const { q = "", type = "", status = "", tag = "" } = await searchParams;
  const { user } = await getCircleContext(circleId);
  const t = (OPPORTUNITY_TYPES as readonly string[]).includes(type) ? type : "";
  const s = (OPPORTUNITY_STATUSES as readonly string[]).includes(status) ? status : "";
  const [posts, members, counts, everything] = await Promise.all([
    listOpportunities(user.id, circleId, { q, type: t || undefined, status: s || undefined, tag: tag || undefined }),
    loadMembers(circleId),
    db.comment.groupBy({ by: ["targetId"], where: { circleId, targetType: "OPPORTUNITY" }, _count: { _all: true } }),
    listOpportunities(user.id, circleId),
  ]);
  const name = new Map(members.map((m) => [m.userId, m.name]));
  const replies = new Map(counts.map((c) => [c.targetId, c._count._all]));
  const allTags = [...new Set(everything.flatMap((p) => parseTags(p.tags)))].sort();
  const base = `/app/c/${circleId}/opportunities`;
  const filtered = Boolean(q || t || s || tag);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <EmojiTile feature="opps" />
          <div>
            <h1 className="text-3xl font-extrabold">Opportunities</h1>
            <p className="text-ink-soft">Leads, introductions, collaborations and questions.</p>
          </div>
        </div>
        <Button asChild><Link href={`${base}/new`}>Post something</Link></Button>
      </div>

      <form action={base} method="get" role="search" className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <div><label htmlFor="q" className="sr-only">Search</label><Input id="q" name="q" defaultValue={q} placeholder="Search posts" /></div>
        <div><label htmlFor="type" className="sr-only">Type</label>
          <Select id="type" name="type" defaultValue={t}><option value="">Any type</option>{OPPORTUNITY_TYPES.map((x) => (<option key={x} value={x}>{OPPORTUNITY_TYPE_STYLE[x].label}</option>))}</Select></div>
        <div><label htmlFor="status" className="sr-only">Status</label>
          <Select id="status" name="status" defaultValue={s}><option value="">Any status</option>{OPPORTUNITY_STATUSES.map((x) => (<option key={x} value={x}>{OPPORTUNITY_STATUS_STYLE[x].label}</option>))}</Select></div>
        <div><label htmlFor="tag" className="sr-only">Tag</label>
          <Select id="tag" name="tag" defaultValue={tag}><option value="">Any tag</option>{allTags.map((x) => (<option key={x} value={x}>{x}</option>))}</Select></div>
        <Button type="submit">Filter</Button>
      </form>

      {posts.length === 0 ? (
        <div className="card-soft flex flex-col items-center gap-3 p-10 text-center">
          <EmojiTile feature="opps" size="lg" />
          <p className="font-display text-xl font-bold">{filtered ? "No posts match" : "Nothing posted yet"}</p>
          <p className="max-w-md text-ink-soft">{filtered ? "Try fewer filters." : "Got a lead, an intro to ask for, or a question for the group? This is the place."}</p>
          {filtered ? <Button asChild size="sm" variant="secondary"><Link href={base}>Clear filters</Link></Button> : <Button asChild size="sm"><Link href={`${base}/new`}>Make the first post</Link></Button>}
        </div>
      ) : (
        <ul className="grid gap-5 lg:grid-cols-2">
          {posts.map((p) => {
            const ty = OPPORTUNITY_TYPE_STYLE[p.type as OpportunityType] ?? OPPORTUNITY_TYPE_STYLE.QUESTION;
            const st = OPPORTUNITY_STATUS_STYLE[p.status as OpportunityStatus] ?? OPPORTUNITY_STATUS_STYLE.OPEN;
            const author = name.get(p.authorId) ?? "Former member";
            return (
              <li key={p.id} id={`post-${p.id}`} className="scroll-mt-24">
                <Card variant="soft" tone="opps" className="flex h-full flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2"><Tag tone={ty.tone}>{ty.label}</Tag><Pill tone={st.tone}>{st.label}</Pill></div>
                  <h2 className="font-display text-lg font-bold leading-snug"><Link href={`${base}/${p.id}`} className="hover:underline">{p.title}</Link></h2>
                  <p className="line-clamp-3 text-sm text-ink-soft">{p.description}</p>
                  <div className="flex flex-wrap gap-1.5">{parseTags(p.tags).map((x) => (<Tag key={x}>{x}</Tag>))}</div>
                  <div className="mt-auto flex items-center gap-2 text-xs text-ink-soft">
                    <Avatar name={author} size="sm" /> {author} · {timeAgo(p.createdAt)} · {replies.get(p.id) ?? 0} {replies.get(p.id) === 1 ? "reply" : "replies"}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
