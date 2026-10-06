"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { safeNext } from "@/lib/action-state";

/** Rendered only for providers whose env vars are set (the server page passes the flags). */
export function SocialButtons({ next, google, linkedin }: { next?: string; google: boolean; linkedin: boolean }) {
  const items = [google ? { id: "google", label: "Continue with Google" } : null, linkedin ? { id: "linkedin", label: "Continue with LinkedIn" } : null].filter((i) => i !== null);
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      {items.map((p) => (
        <Button key={p.id} type="button" variant="secondary" className="w-full" onClick={() => signIn(p.id, { callbackUrl: safeNext(next, "/app") })}>
          {p.label}
        </Button>
      ))}
      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-ink-soft" aria-hidden>
        <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
      </div>
    </div>
  );
}
