import Link from "next/link";
import { Blob } from "@/components/brand/blob";
import { Highlight } from "@/components/brand/highlight";
import { Sticker } from "@/components/brand/sticker";
import { Float } from "@/components/brand/reveal";
import { Button } from "@/components/ui/button";
import { AgendaMock, DecisionMock, GoalsMock } from "./mockups";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden className="dot-grid absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <Blob tone="library" shape={0} className="-left-32 -top-24 -z-10 h-[28rem] w-[28rem]" />
      <Blob tone="directory" shape={1} className="-right-20 top-40 -z-10 h-[26rem] w-[26rem]" />
      <Blob tone="opps" shape={0} className="bottom-0 left-1/3 -z-10 h-72 w-72 opacity-40" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
        <div className="flex flex-col items-start gap-6">
          <div className="flex flex-wrap gap-3">
            <Sticker tone="primary" tilt={-3}>Invite only</Sticker>
            <Sticker tone="opps" tilt={2}>Private by default</Sticker>
          </div>
          <h1 className="text-display-xl font-extrabold">
            Your circle, finally <Highlight>organized</Highlight>.
          </h1>
          <p className="max-w-xl text-lg text-ink-soft sm:text-xl">
            Meridian gives peer groups one private place for goals, meetings, decisions and introductions. Because group chats are where goals go to die.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/signup">Start your circle</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/how-it-works">See how it works</Link>
            </Button>
          </div>
        </div>

        {/* Product mockup: real UI cards, floated at slight angles. Stacked and straight on small screens. */}
        <div aria-hidden className="relative mx-auto flex w-full max-w-md flex-col gap-5 lg:mx-0 lg:block lg:h-[42rem] lg:max-w-none">
          <Float className="lg:absolute lg:left-0 lg:top-0 lg:w-[16rem] lg:-rotate-3">
            <GoalsMock />
          </Float>
          <Float delay={1.5} className="lg:absolute lg:right-0 lg:top-12 lg:w-[16rem] lg:rotate-3">
            <DecisionMock />
          </Float>
          <Float delay={3} className="lg:absolute lg:bottom-0 lg:left-[22%] lg:w-[16rem] lg:-rotate-1">
            <AgendaMock />
          </Float>
        </div>
      </div>
    </section>
  );
}
