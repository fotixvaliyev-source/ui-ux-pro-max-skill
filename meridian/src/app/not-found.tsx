import Link from "next/link";
import { Blob } from "@/components/brand/blob";
import { Emoji } from "@/components/brand/emoji";
import { Highlight } from "@/components/brand/highlight";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <Blob tone="decisions" shape={1} className="-z-10 h-[32rem] w-[32rem] opacity-40" />
      <p className="font-display text-8xl font-extrabold text-primary sm:text-9xl">404</p>
      <h1 className="mt-2 max-w-2xl text-display-lg font-extrabold">
        This page <Highlight>missed</Highlight> the meeting <Emoji name="calendar" size={48} className="align-[-0.1em]" />
      </h1>
      <p className="mt-4 max-w-md text-lg text-ink-soft">It may have moved, or it never existed. Either way, the rest of your circle is where you left it.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button asChild size="lg">
          <Link href="/">Back to the homepage</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/login">Log in</Link>
        </Button>
      </div>
    </main>
  );
}
