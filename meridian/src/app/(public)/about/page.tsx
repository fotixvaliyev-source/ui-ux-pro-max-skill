import type { Metadata } from "next";
import { Sticker } from "@/components/brand/sticker";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "About",
  description: "Why Meridian exists: peer groups are powerful, and most of them leak. Here is how we think about fixing that.",
};

const BELIEFS = [
  { title: "Small beats big", text: "The best groups have five to fifteen people who know each other. We build for that size and refuse to scale past it." },
  { title: "Structure is kindness", text: "A clear agenda, an owner and a date are not bureaucracy. They are how you respect other people's time." },
  { title: "Memory is a feature", text: "A group that remembers what it decided gets smarter every month. One that does not starts over each time." },
  { title: "Calm tools win", text: "No streaks, no feeds engineered for outrage, no ads. Open it, do the thing, close it." },
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        tone="goals"
        title={<>We built what our own groups <span className="text-primary">kept</span> missing.</>}
        intro="Meridian began with a familiar frustration: great people, great conversations, and nothing to show for them a month later."
      />
      <article className="mx-auto max-w-3xl px-5 py-12 text-lg leading-relaxed">
        <div className="flex flex-col gap-6">
          <p>
            If you have ever been in a peer group, you know the feeling. The first meeting is electric. Everyone is candid. Someone promises an
            introduction. Someone commits to a goal. Then life happens, the group chat fills up with other things, and three months later nobody
            can remember who was meant to do what.
          </p>
          <p>
            The advice was good. The people were good. The system was a chat thread, and a chat thread is a river: everything flows past and
            nothing stays put.
          </p>
          <h2 className="mt-4 text-3xl font-extrabold">Not another enterprise tool</h2>
          <p>
            We looked at what was out there. Project tools assume a company. Community platforms assume an audience. Neither assumes what a
            circle actually is: a handful of experienced people who want to be a little more accountable and a lot more useful to each other.
          </p>
          <p>
            So Meridian leaves things out on purpose. There is no CRM, no sprint planning, no permission matrix. A circle has Founders and
            Members, and that is the whole model.
          </p>
          <h2 className="mt-4 text-3xl font-extrabold">Serious inside, a little fun outside</h2>
          <p>
            What you write in Meridian stays professional and clean: goals, decisions, notes. The packaging around it is allowed to have a
            personality. Software for ambitious adults does not have to look like a spreadsheet.
          </p>
        </div>

        <h2 className="mb-6 mt-14 text-3xl font-extrabold">What we believe</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {BELIEFS.map((b) => (
            <li key={b.title} className="rounded-card border-2 border-ink bg-surface p-5 text-base">
              <p className="font-display text-xl font-extrabold">{b.title}</p>
              <p className="mt-1 text-ink-soft">{b.text}</p>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-wrap gap-3">
          <Sticker tone="opps" tilt={-2}>Private by default</Sticker>
          <Sticker tone="meetings" tilt={2}>Invitation only</Sticker>
          <Sticker tone="decisions" tilt={-1}>No ads</Sticker>
          <Sticker tone="goals" tilt={3}>You own your data</Sticker>
        </div>
      </article>
      <CtaBanner />
    </>
  );
}
