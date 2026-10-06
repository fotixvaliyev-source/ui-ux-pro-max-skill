import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Sign up" };

// Placeholder until authentication ships in Phase 3.
export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-start justify-center gap-4 px-6">
      <h1 className="text-display-lg font-extrabold">Sign up</h1>
      <p className="text-lg text-ink-soft">Accounts open soon. We are finishing the doors before we hand out keys.</p>
      <Button asChild variant="secondary">
        <Link href="/">Back to the homepage</Link>
      </Button>
    </main>
  );
}
