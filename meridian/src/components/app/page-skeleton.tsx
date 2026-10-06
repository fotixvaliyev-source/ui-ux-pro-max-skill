import { Emoji } from "@/components/brand/emoji";

/** In-app loading state: keeps the header and nav in place, shows soft placeholder blocks. */
export function PageSkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">Loading</span>
      <div className="flex items-center gap-4">
        <span aria-hidden className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl border-2 border-line bg-primary-soft motion-reduce:animate-none">
          <Emoji name="calendar" size={26} />
        </span>
        <div className="flex flex-col gap-2">
          <span aria-hidden className="h-6 w-48 animate-pulse rounded-lg bg-line motion-reduce:animate-none" />
          <span aria-hidden className="h-4 w-32 animate-pulse rounded-lg bg-line/70 motion-reduce:animate-none" />
        </div>
      </div>
      <div aria-hidden className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-card border border-line bg-surface motion-reduce:animate-none" />
        ))}
      </div>
    </div>
  );
}
