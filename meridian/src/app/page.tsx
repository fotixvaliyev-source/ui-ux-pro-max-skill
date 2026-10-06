import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Highlight } from "@/components/brand/highlight";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-start justify-center gap-6 px-6">
      <h1 className="text-display-lg font-extrabold">
        Your circle, finally <Highlight>organized</Highlight>.
      </h1>
      <p className="text-lg text-ink-soft">The public site arrives in Phase 2. For now, the design system preview is live.</p>
      <Button asChild size="lg">
        <Link href="/design">See the design system</Link>
      </Button>
    </main>
  );
}
