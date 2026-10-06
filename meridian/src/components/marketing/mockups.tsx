import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Pill, Tag } from "@/components/ui/tag";
import { EmojiTile } from "@/components/brand/emoji-tile";
import { Emoji } from "@/components/brand/emoji";
import { cn } from "@/lib/utils";

/* Product mockups built from the same components the app uses. All content is static sample data. */

export function GoalsMock({ className }: { className?: string }) {
  const goals = [
    { title: "Sign three pilot clients", who: "Maya Okafor", pct: 66, pill: { tone: "opps", label: "On track" } },
    { title: "Hire a head of sales", who: "Daniel Reyes", pct: 30, pill: { tone: "decisions", label: "At risk" } },
    { title: "Publish the pricing page", who: "Priya Nair", pct: 100, pill: { tone: "projects", label: "Done" } },
  ] as const;
  return (
    <Card variant="key" tone="goals" className={cn("w-full max-w-sm p-5", className)}>
      <div className="mb-4 flex items-center gap-3">
        <EmojiTile feature="goals" size="sm" />
        <div>
          <p className="font-display font-bold leading-tight">Q4 goals</p>
          <p className="text-xs text-ink-soft">Tuesday Founders</p>
        </div>
      </div>
      <ul className="flex flex-col gap-4">
        {goals.map((g) => (
          <li key={g.title} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold leading-snug">{g.title}</p>
              <Pill tone={g.pill.tone}>{g.pill.label}</Pill>
            </div>
            <div className="flex items-center gap-2">
              <Avatar name={g.who} size="sm" />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-goals-tint">
                <div className="h-full rounded-full bg-goals" style={{ width: `${g.pct}%` }} />
              </div>
              <span className="w-8 text-right text-xs font-semibold text-ink-soft">{g.pct}%</span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function DecisionMock({ className }: { className?: string }) {
  return (
    <Card variant="key" tone="decisions" className={cn("w-full max-w-sm p-5", className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <Tag tone="decisions">12 Sep 2026</Tag>
        <Pill tone="opps">Active</Pill>
      </div>
      <p className="font-display text-lg font-bold leading-snug">Move all client onboarding to a fixed two-week sprint.</p>
      <p className="mt-2 text-sm text-ink-soft">
        Open-ended onboarding kept slipping. A fixed window makes the cost visible and the handoff clean.
      </p>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex -space-x-2">
          {["Maya Okafor", "Daniel Reyes", "Priya Nair"].map((n) => (
            <Avatar key={n} name={n} size="sm" />
          ))}
        </div>
        <span className="text-xs font-semibold text-ink-soft">3 involved</span>
      </div>
    </Card>
  );
}

export function AgendaMock({ className }: { className?: string }) {
  const agenda = ["Wins since last time", "Priya: pricing experiment", "Hiring, open questions"];
  const actions = [
    { who: "Daniel Reyes", what: "Share the sales scorecard", due: "Fri" },
    { who: "Maya Okafor", what: "Intro Priya to the Lumen team", due: "Mon" },
  ];
  return (
    <Card variant="key" tone="meetings" className={cn("w-full max-w-sm p-5", className)}>
      <div className="mb-4 flex items-center gap-3">
        <EmojiTile feature="meetings" size="sm" />
        <div>
          <p className="font-display font-bold leading-tight">Circle call</p>
          <p className="text-xs text-ink-soft">Tue 14 Oct, 8:00 AM</p>
        </div>
      </div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">Agenda</p>
      <ol className="mb-4 flex flex-col gap-1.5 text-sm">
        {agenda.map((a, i) => (
          <li key={a} className="flex gap-2">
            <span className="font-display font-bold text-meetings-text">{i + 1}.</span>
            {a}
          </li>
        ))}
      </ol>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">Action items</p>
      <ul className="flex flex-col gap-2">
        {actions.map((a) => (
          <li key={a.what} className="flex items-center gap-2 rounded-xl bg-meetings-tint px-3 py-2 text-sm text-meetings-text">
            <Avatar name={a.who} size="sm" />
            <span className="flex-1 font-medium">{a.what}</span>
            <span className="text-xs font-bold">{a.due}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function DirectoryMock({ className }: { className?: string }) {
  return (
    <Card variant="key" tone="directory" className={cn("w-full max-w-sm p-5", className)}>
      <div className="flex items-center gap-3">
        <Avatar name="Priya Nair" size="lg" />
        <div>
          <p className="font-display text-lg font-bold leading-tight">Priya Nair</p>
          <p className="text-sm text-ink-soft">Founder, Lumen Analytics</p>
        </div>
      </div>
      <dl className="mt-4 flex flex-col gap-2 text-sm">
        <div><dt className="text-xs font-bold uppercase tracking-wide text-ink-soft">Working on</dt><dd>Usage-based pricing for mid-market</dd></div>
        <div><dt className="text-xs font-bold uppercase tracking-wide text-ink-soft">Can help with</dt><dd>Data hiring, analytics stacks</dd></div>
        <div><dt className="text-xs font-bold uppercase tracking-wide text-ink-soft">Looking for</dt><dd>An intro to a retail CFO</dd></div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <Tag tone="directory">pricing</Tag>
        <Tag tone="directory">data</Tag>
        <Tag tone="directory">hiring</Tag>
      </div>
    </Card>
  );
}

export function OpportunityMock({ className }: { className?: string }) {
  const posts = [
    { type: "Introduction request", tone: "directory", title: "Anyone know a CFO in retail?", who: "Priya Nair", replies: 4 },
    { type: "Job lead", tone: "meetings", title: "Staff engineer, fintech, remote", who: "Daniel Reyes", replies: 2 },
    { type: "Question for the group", tone: "decisions", title: "How do you price a pilot?", who: "Maya Okafor", replies: 7 },
  ] as const;
  return (
    <Card variant="key" tone="opps" className={cn("w-full max-w-sm p-5", className)}>
      <div className="mb-4 flex items-center gap-3">
        <EmojiTile feature="opps" size="sm" />
        <p className="font-display font-bold">Opportunities</p>
        <Pill tone="opps" className="ml-auto">3 open</Pill>
      </div>
      <ul className="flex flex-col gap-3">
        {posts.map((p) => (
          <li key={p.title} className="rounded-xl border-2 border-line p-3">
            <Tag tone={p.tone}>{p.type}</Tag>
            <p className="mt-2 text-sm font-semibold leading-snug">{p.title}</p>
            <p className="mt-1 text-xs text-ink-soft">{p.who} · {p.replies} replies</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function KanbanMock({ className }: { className?: string }) {
  const cols = [
    { name: "Backlog", cards: ["Case study draft"] },
    { name: "In progress", cards: ["Pricing experiment", "Hiring scorecard"] },
    { name: "Done", cards: ["Pilot contract"] },
  ];
  return (
    <Card variant="key" tone="projects" className={cn("w-full max-w-md p-4", className)}>
      <div className="grid grid-cols-3 gap-2">
        {cols.map((c) => (
          <div key={c.name} className="rounded-xl bg-projects-tint p-2">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-projects-text">{c.name}</p>
            <ul className="flex flex-col gap-2">
              {c.cards.map((card, i) => (
                <li key={card} className={cn("rounded-lg border-2 border-ink bg-surface p-2 text-xs font-semibold", i === 0 && c.name === "In progress" && "rotate-2")}>
                  {card}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function LibraryMock({ className }: { className?: string }) {
  const items = [
    { title: "The Mom Test, chapter notes", why: "Fixes how we run customer calls.", tags: ["research", "sales"] },
    { title: "Pricing page teardown sheet", why: "Copy it before your next experiment.", tags: ["pricing"] },
  ];
  return (
    <Card variant="key" tone="library" className={cn("w-full max-w-sm p-5", className)}>
      <div className="mb-4 flex items-center gap-3">
        <EmojiTile feature="library" size="sm" />
        <p className="font-display font-bold">Library</p>
      </div>
      <ul className="flex flex-col gap-3">
        {items.map((it) => (
          <li key={it.title} className="rounded-xl bg-library-tint p-3 text-library-text">
            <p className="text-sm font-bold">{it.title}</p>
            <p className="mt-1 text-xs">Why it is useful: {it.why}</p>
            <div className="mt-2 flex gap-1.5">
              {it.tags.map((t) => (
                <span key={t} className="rounded-md bg-surface px-2 py-0.5 text-[11px] font-semibold text-ink">{t}</span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function CommentsMock({ className }: { className?: string }) {
  return (
    <Card variant="soft" className={cn("w-full max-w-xs p-4", className)}>
      <div className="flex gap-2">
        <Avatar name="Daniel Reyes" size="sm" />
        <p className="text-sm">Two of those intros are warm. Want me to send them this week?</p>
      </div>
      <div className="mt-3 flex gap-2">
        {([ ["thumbs", 3], ["raised", 2], ["fire", 1] ] as const).map(([e, n]) => (
          <span key={e} className="inline-flex items-center gap-1 rounded-full border-2 border-line px-2 py-0.5 text-xs font-semibold">
            <Emoji name={e} size={14} />
            {n}
          </span>
        ))}
      </div>
    </Card>
  );
}

export function CreateCircleMock({ className }: { className?: string }) {
  return (
    <Card variant="key" tone="primary" className={cn("w-full max-w-sm p-5", className)}>
      <p className="mb-4 font-display text-lg font-bold">New circle</p>
      <div className="flex flex-col gap-3 text-sm">
        <div>
          <p className="mb-1 font-semibold">Name</p>
          <div className="rounded-xl border-2 border-line px-3 py-2">Tuesday Founders</div>
        </div>
        <div>
          <p className="mb-1 font-semibold">Purpose</p>
          <div className="rounded-xl border-2 border-line px-3 py-2 text-ink-soft">Help each other hit one real goal per quarter.</div>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Cadence</span>
          <Tag tone="primary">Weekly</Tag>
        </div>
        <div className="flex items-center gap-2" aria-hidden>
          {(["bg-primary", "bg-goals", "bg-opps", "bg-projects", "bg-library"] as const).map((c, i) => (
            <span key={c} className={cn("h-6 w-6 rounded-full border-2 border-ink", c, i === 0 && "ring-2 ring-ink ring-offset-2 ring-offset-surface")} />
          ))}
        </div>
      </div>
    </Card>
  );
}

export function InviteMock({ className }: { className?: string }) {
  return (
    <Card variant="key" tone="decisions" className={cn("w-full max-w-sm p-5 text-center", className)}>
      <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">Invite code</p>
      <p className="my-3 font-display text-4xl font-extrabold tracking-[0.25em]">K7M2QXP9</p>
      <p className="text-sm text-ink-soft">Share the code, or send the private link.</p>
      <div className="mt-4 flex justify-center gap-2">
        <Tag tone="decisions">Copy link</Tag>
        <Tag tone="decisions">Copy code</Tag>
      </div>
      <div className="mt-5 flex justify-center -space-x-2">
        {["Maya Okafor", "Daniel Reyes", "Priya Nair", "Sam Whitfield"].map((n) => (
          <Avatar key={n} name={n} size="md" />
        ))}
      </div>
    </Card>
  );
}
