import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EmojiTile } from "@/components/brand/emoji-tile";
import { Reveal } from "@/components/brand/reveal";
import { FEATURE_COPY } from "./content";
import { Section } from "./section";

const LANDING = ["directory", "goals", "meetings", "decisions", "opps", "library"] as const;

export function FeatureGrid() {
  const items = LANDING.map((k) => FEATURE_COPY.find((f) => f.key === k)).filter((f) => f !== undefined);
  return (
    <Section
      id="features"
      eyebrow="Features"
      title={<>Six tools. <span className="text-primary">One</span> place.</>}
      intro="Each one is simple on purpose. Together they give a circle a memory."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f, i) => (
          <Reveal key={f.key} delay={(i % 3) * 0.08}>
            <Link href={`/features#${f.slug}`} className="block h-full rounded-card focus-visible:ring-offset-4">
              <Card variant="key" tone={f.key} tilt className="flex h-full flex-col gap-4 p-6">
                <EmojiTile feature={f.key} size="lg" />
                <h3 className="text-2xl font-extrabold leading-tight">{f.name}</h3>
                <p className="text-ink-soft">{f.blurb}</p>
                <span className="mt-auto font-display text-sm font-bold">Read more &rarr;</span>
              </Card>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
