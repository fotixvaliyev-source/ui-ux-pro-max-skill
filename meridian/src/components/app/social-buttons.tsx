import { Button } from "@/components/ui/button";
import { socialSignInAction } from "@/server/actions/auth";
import { socialProviders } from "@/server/auth";

/** Shown only for providers whose env vars are set. */
export function SocialButtons({ next }: { next?: string }) {
  const items = [
    socialProviders.google ? { id: "google", label: "Continue with Google" } : null,
    socialProviders.linkedin ? { id: "linkedin", label: "Continue with LinkedIn" } : null,
  ].filter((i) => i !== null);
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      {items.map((p) => (
        <form key={p.id} action={socialSignInAction}>
          <input type="hidden" name="provider" value={p.id} />
          {next ? <input type="hidden" name="next" value={next} /> : null}
          <Button type="submit" variant="secondary" className="w-full">
            {p.label}
          </Button>
        </form>
      ))}
      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-ink-soft" aria-hidden>
        <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
      </div>
    </div>
  );
}
