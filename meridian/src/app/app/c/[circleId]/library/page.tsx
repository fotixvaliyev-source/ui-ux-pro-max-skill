import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmActionButton } from "@/components/app/confirm-button";
import { EmojiTile } from "@/components/brand/emoji-tile";
import { ResourceForm } from "@/components/app/resource-parts";
import { Markdown } from "@/components/app/markdown";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/form";
import { Tag } from "@/components/ui/tag";
import { RESOURCE_KINDS } from "@/lib/constants";
import { timeAgo } from "@/lib/dates";
import { loadMembers } from "@/lib/members";
import { parseTags } from "@/lib/tags";
import { deleteResourceAction } from "@/server/actions/resources";
import { getCircleContext } from "@/server/guards";
import { listResources, parseFileRef } from "@/server/services/resources";

export const metadata: Metadata = { title: "Library" };

const KIND_LABEL: Record<string, string> = { LINK: "Link", FILE: "File", NOTE: "Note" };

export default async function LibraryPage({ params, searchParams }: { params: Promise<{ circleId: string }>; searchParams: Promise<{ q?: string; tag?: string; kind?: string }> }) {
  const { circleId } = await params;
  const { q = "", tag = "", kind = "" } = await searchParams;
  const { user, isFounder } = await getCircleContext(circleId);
  const k = (RESOURCE_KINDS as readonly string[]).includes(kind) ? kind : "";
  const [items, all, members] = await Promise.all([listResources(user.id, circleId, { q, tag: tag || undefined, kind: k || undefined }), listResources(user.id, circleId), loadMembers(circleId)]);
  const name = new Map(members.map((m) => [m.userId, m.name]));
  const allTags = [...new Set(all.flatMap((r) => parseTags(r.tags)))].sort();
  const base = `/app/c/${circleId}/library`;
  const filtered = Boolean(q || tag || k);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <EmojiTile feature="library" />
        <div>
          <h1 className="text-3xl font-extrabold">Library</h1>
          <p className="text-ink-soft">The good stuff, saved once.</p>
        </div>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_21rem]">
        <div className="flex flex-col gap-5">
          <form action={base} method="get" role="search" className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
            <div><label htmlFor="lib-q" className="sr-only">Search</label><Input id="lib-q" name="q" defaultValue={q} placeholder="Search the library" /></div>
            <div><label htmlFor="lib-kind" className="sr-only">Type</label><Select id="lib-kind" name="kind" defaultValue={k}><option value="">Any type</option>{RESOURCE_KINDS.map((x) => (<option key={x} value={x}>{KIND_LABEL[x]}</option>))}</Select></div>
            <div><label htmlFor="lib-tag" className="sr-only">Tag</label><Select id="lib-tag" name="tag" defaultValue={tag}><option value="">Any tag</option>{allTags.map((x) => (<option key={x} value={x}>{x}</option>))}</Select></div>
            <Button type="submit">Filter</Button>
          </form>
          {items.length === 0 ? (
            <div className="card-soft flex flex-col items-center gap-3 p-10 text-center">
              <EmojiTile feature="library" size="lg" />
              <p className="font-display text-xl font-bold">{filtered ? "Nothing matches" : "The shelf is empty"}</p>
              <p className="max-w-md text-ink-soft">{filtered ? "Try fewer filters." : "Add the article, template or tool that changed how you work, with a line on why."}</p>
              {filtered ? <Button asChild size="sm" variant="secondary"><Link href={base}>Clear filters</Link></Button> : null}
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((r) => {
                const author = name.get(r.authorId) ?? "Former member";
                const file = r.filePath ? parseFileRef(r.filePath) : null;
                return (
                  <li key={r.id}>
                    <Card variant="soft" tone="library" className="flex flex-col gap-3 p-5">
                      <div className="flex flex-wrap items-center gap-2"><Tag tone="library">{KIND_LABEL[r.kind] ?? r.kind}</Tag>{parseTags(r.tags).map((t) => (<Tag key={t}>{t}</Tag>))}</div>
                      <h2 className="font-display text-xl font-bold leading-snug">
                        {r.kind === "LINK" && r.url ? <a href={r.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{r.title}</a> : r.title}
                      </h2>
                      <p className="rounded-xl bg-library-tint px-3 py-2 text-sm text-library-text"><span className="font-bold">Why it is useful:</span> {r.whyUseful}</p>
                      {r.kind === "NOTE" && r.body ? <Markdown>{r.body}</Markdown> : null}
                      {file ? <a href={`/api/circles/${circleId}/files/${r.id}`} className="text-sm font-bold text-primary hover:underline">Download {file.name}</a> : null}
                      {r.kind === "LINK" && r.url ? <p className="break-all text-xs text-ink-soft">{r.url}</p> : null}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-ink-soft">
                        <span className="inline-flex items-center gap-1.5"><Avatar name={author} size="sm" /> {author} · {timeAgo(r.createdAt)}</span>
                        {r.authorId === user.id || isFounder ? (
                          <span className="ml-auto flex items-center gap-3">
                            <Link href={`${base}/${r.id}/edit`} className="font-semibold hover:text-primary">Edit</Link>
                            <ConfirmActionButton size="sm" variant="ghost" label="Delete" confirmText="Delete this resource?" run={deleteResourceAction.bind(null, circleId, r.id)} />
                          </span>
                        ) : null}
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <Card variant="key" tone="library" className="p-5">
          <h2 className="mb-3 font-display text-lg font-bold">Add to the library</h2>
          <ResourceForm circleId={circleId} />
        </Card>
      </div>
    </div>
  );
}
