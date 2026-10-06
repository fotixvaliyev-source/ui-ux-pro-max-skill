import type { Metadata } from "next";
import { Emoji } from "@/components/brand/emoji";
import { EmojiTile } from "@/components/brand/emoji-tile";
import { Highlight } from "@/components/brand/highlight";
import { Sticker } from "@/components/brand/sticker";
import { Blob } from "@/components/brand/blob";
import { ThemeToggle } from "@/components/brand/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Pill, Tag } from "@/components/ui/tag";
import { FEATURES, FEATURE_KEYS, GOAL_STATUS_STYLE, OPPORTUNITY_TYPE_STYLE, REACTIONS } from "@/lib/constants";

export const metadata: Metadata = { title: "Design system", robots: { index: false } };

export default function DesignPage() {
  return (
    <main className="relative mx-auto max-w-5xl overflow-hidden px-6 py-12">
      <Blob tone="library" shape={0} className="-right-24 -top-24 h-96 w-96" />
      <header className="relative flex items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          <Sticker tone="primary" className="self-start">Internal preview</Sticker>
          <h1 className="text-display-lg font-extrabold">
            Meridian <Highlight>design system</Highlight>
          </h1>
          <p className="max-w-xl text-ink-soft">Tokens, type, buttons, cards, tags, forms and emoji. Toggle dark mode to check both palettes.</p>
        </div>
        <ThemeToggle />
      </header>

      <Section title="Feature colors">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_KEYS.map((key) => (
            <Card key={key} variant="key" tone={key} tilt className="flex items-center gap-3 p-4">
              <EmojiTile feature={key} />
              <div>
                <p className="font-display font-bold">{FEATURES[key].label}</p>
                <Tag tone={key}>{key}</Tag>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Type">
        <div className="flex flex-col gap-3">
          <p className="font-display text-display-xl font-extrabold">Decisions you can actually <Highlight variant="marker">find</Highlight> later.</p>
          <h2 className="text-3xl font-bold">Heading two in Bricolage Grotesque</h2>
          <p className="max-w-prose">Body copy is Inter. Short sentences. Warm, confident, a little witty. Because group chats are where goals go to die.</p>
          <p className="text-sm text-ink-soft">Secondary text uses the soft ink token.</p>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-4">
          <Button size="lg">Get started</Button>
          <Button>Create a circle</Button>
          <Button variant="secondary">See how it works</Button>
          <Button variant="ghost">Log in</Button>
          <Button variant="danger">Delete circle</Button>
          <Button size="sm" disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Cards, tags and pills">
        <div className="grid gap-5 md:grid-cols-2">
          <Card variant="key" tone="goals">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>Ship the pilot to three clients</CardTitle>
                <Pill tone={GOAL_STATUS_STYLE.ON_TRACK.tone}>{GOAL_STATUS_STYLE.ON_TRACK.label}</Pill>
              </div>
              <CardDescription>Target: 3 signed pilots by 30 Nov</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Tag tone="goals">Q4 goal</Tag>
              <Tag>revenue</Tag>
            </CardContent>
          </Card>
          <Card variant="soft" tone="opps">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>Intro to a VP of Data</CardTitle>
                <Tag tone={OPPORTUNITY_TYPE_STYLE.INTRO.tone}>{OPPORTUNITY_TYPE_STYLE.INTRO.label}</Tag>
              </div>
              <CardDescription>A calm, quiet card for use inside the app.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Pill tone="opps">Open</Pill>
              <Pill tone="decisions">At risk</Pill>
              <Pill tone="projects">Done</Pill>
              <Pill tone="goals">Reversed</Pill>
              <Pill>Closed</Pill>
            </CardContent>
          </Card>
        </div>
        <div className="mt-5 flex flex-wrap gap-4">
          <Sticker tone="primary" tilt={-4}>Invite only</Sticker>
          <Sticker tone="opps" tilt={3}>Private by default</Sticker>
          <Sticker tone="decisions" tilt={-2}>No ads</Sticker>
          <Sticker tone="goals" tilt={4}>You own your data</Sticker>
        </div>
      </Section>

      <Section title="Forms">
        <Card variant="soft" className="max-w-xl">
          <CardContent className="grid gap-4">
            <Field label="Circle name" htmlFor="d-name" hint="Something your group would say out loud.">
              <Input id="d-name" placeholder="Tuesday Founders" />
            </Field>
            <Field label="Cadence" htmlFor="d-cadence">
              <Select id="d-cadence" defaultValue="biweekly">
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly</option>
                <option value="monthly">Monthly</option>
              </Select>
            </Field>
            <Field label="Purpose" htmlFor="d-purpose">
              <Textarea id="d-purpose" placeholder="Help each other hit one real goal per quarter." />
            </Field>
            <Field label="Email" htmlFor="d-email" error="Enter a valid email address.">
              <Input id="d-email" aria-invalid="true" aria-describedby="d-email-error" defaultValue="maya@" />
            </Field>
          </CardContent>
        </Card>
      </Section>

      <Section title="Emoji">
        <div className="flex flex-wrap items-center gap-5">
          {REACTIONS.map((r) => (
            <span key={r} className="inline-flex items-center gap-1.5 rounded-full border-2 border-line bg-surface px-3 py-1.5 text-sm font-semibold">
              <Emoji name={r} size={18} />
              {r === "thumbs" ? 3 : r === "target" ? 1 : r === "bulb" ? 2 : r === "raised" ? 4 : 1}
            </span>
          ))}
        </div>
        <Card variant="soft" tone="directory" className="mt-5 flex max-w-md flex-col items-center gap-3 p-8 text-center">
          <EmojiTile feature="directory" size="lg" />
          <h3 className="text-xl font-bold">No one here yet</h3>
          <p className="text-sm text-ink-soft">Invite your first peer and the directory fills itself in.</p>
          <Button size="sm">Invite someone</Button>
        </Card>
        <p className="mt-4 text-xs text-ink-soft">Emoji: Twemoji by Twitter/jdecked, licensed CC-BY 4.0.</p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="relative mt-14">
      <h2 className="mb-5 text-2xl font-bold">{title}</h2>
      {children}
    </section>
  );
}
