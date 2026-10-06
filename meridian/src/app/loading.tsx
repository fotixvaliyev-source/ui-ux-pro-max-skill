import { Emoji } from "@/components/brand/emoji";

export default function Loading() {
  return (
    <main role="status" aria-live="polite" className="flex min-h-screen flex-col items-center justify-center gap-4">
      <span className="flex h-20 w-20 animate-bounce items-center justify-center rounded-[22px] border-2 border-ink bg-meetings shadow-[4px_4px_0_var(--ink)] motion-reduce:animate-none">
        <Emoji name="calendar" size={44} />
      </span>
      <p className="font-display text-xl font-bold">Getting the room ready</p>
      <span className="sr-only">Loading</span>
    </main>
  );
}
