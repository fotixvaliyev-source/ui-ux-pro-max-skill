import type { Metadata } from "next";
import Link from "next/link";
import { EmojiTile } from "@/components/brand/emoji-tile";
import { MemberCard } from "@/components/app/member-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { loadMembers, matchesQuery } from "@/lib/members";
import { parseTags } from "@/lib/tags";
import { getCircleContext } from "@/server/guards";

export const metadata: Metadata = { title: "Members" };

export default async function MembersPage({ params, searchParams }: { params: Promise<{ circleId: string }>; searchParams: Promise<{ q?: string; tag?: string }> }) {
  const { circleId } = await params;
  const { q = "", tag = "" } = await searchParams;
  await getCircleContext(circleId);
  const all = await loadMembers(circleId);
  const allTags = [...new Set(all.flatMap((m) => parseTags(m.expertise)))].sort();
  const shown = all.filter((m) => matchesQuery(m, q) && (!tag || parseTags(m.expertise).includes(tag)));
  const base = `/app/c/${circleId}/members`;
  const tagHref = (t: string) => `${base}?${new URLSearchParams({ ...(q ? { q } : {}), ...(t ? { tag: t } : {}) }).toString()}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <EmojiTile feature="directory" />
          <div>
            <h1 className="text-3xl font-extrabold">Members</h1>
            <p className="text-ink-soft">{all.length} {all.length === 1 ? "person" : "people"} in this circle</p>
          </div>
        </div>
        <Button asChild variant="secondary" size="sm"><Link href={`${base}/edit`}>Edit my circle profile</Link></Button>
      </div>

      <form action={base} method="get" role="search" className="flex flex-wrap gap-3">
        <label htmlFor="q" className="sr-only">Search members</label>
        <Input id="q" name="q" defaultValue={q} placeholder="Search by name, topic or need" className="max-w-md" />
        {tag ? <input type="hidden" name="tag" value={tag} /> : null}
        <Button type="submit">Search</Button>
      </form>

      {allTags.length ? (
        <ul className="flex flex-wrap gap-2" aria-label="Filter by expertise">
          <li>
            <Link href={tagHref("")} aria-current={!tag ? "true" : undefined} className={cn("inline-flex rounded-full border-2 px-3 py-1 text-sm font-bold", !tag ? "border-ink bg-primary text-primary-ink" : "border-line hover:border-ink")}>All</Link>
          </li>
          {allTags.map((t) => (
            <li key={t}>
              <Link href={tagHref(t)} aria-current={tag === t ? "true" : undefined} className={cn("inline-flex rounded-full border-2 px-3 py-1 text-sm font-bold", tag === t ? "border-ink bg-primary text-primary-ink" : "border-line hover:border-ink")}>{t}</Link>
            </li>
          ))}
        </ul>
      ) : null}

      {shown.length === 0 ? (
        <div className="card-soft flex flex-col items-center gap-3 p-10 text-center">
          <EmojiTile feature="directory" emoji="compass" size="lg" />
          <p className="font-display text-xl font-bold">No one matches that</p>
          <p className="text-ink-soft">Try fewer words, or clear the filter.</p>
          <Button asChild size="sm" variant="secondary"><Link href={base}>Clear search</Link></Button>
        </div>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((m) => (
            <li key={m.userId}><MemberCard member={m} circleId={circleId} /></li>
          ))}
        </ul>
      )}
    </div>
  );
}
