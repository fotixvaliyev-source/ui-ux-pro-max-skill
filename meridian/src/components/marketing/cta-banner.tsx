import Link from "next/link";
import { Blob } from "@/components/brand/blob";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-6xl px-5">
      <div className="relative isolate overflow-hidden rounded-panel border-2 border-ink bg-primary px-6 py-14 text-center text-primary-ink shadow-[6px_6px_0_var(--decisions)] md:px-12 md:py-20">
        <Blob tone="goals" shape={1} className="-left-16 -top-16 -z-10 h-64 w-64 opacity-70" />
        <Blob tone="opps" shape={0} className="-bottom-20 -right-12 -z-10 h-72 w-72 opacity-60" />
        <h2 className="mx-auto max-w-3xl text-display-lg font-extrabold">Your next meeting could leave a paper trail.</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg">Start a circle in a minute. Bring the people who keep you honest.</p>
        <Button asChild size="lg" variant="secondary" className="mt-8 !text-[#1b1a2e] !bg-[#fff9f0]">
          <Link href="/signup">Start your circle</Link>
        </Button>
      </div>
    </section>
  );
}
