import { cn } from "@/lib/utils";

type Variant = "marker" | "underline";

interface HighlightProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

/** The one highlighted word in a headline: a marker swipe or a hand-drawn underline. */
export function Highlight({ children, variant = "underline", className }: HighlightProps) {
  if (variant === "marker") {
    return (
      <span className={cn("relative inline-block px-[0.12em]", className)}>
        <span aria-hidden className="absolute inset-x-0 bottom-[0.08em] top-[0.18em] -z-10 -rotate-1 rounded-md bg-decisions" />
        <span className="text-[#1b1a2e]">{children}</span>
      </span>
    );
  }
  return (
    <span className={cn("relative inline-block", className)}>
      {children}
      <svg
        aria-hidden
        viewBox="0 0 200 14"
        preserveAspectRatio="none"
        className="absolute -bottom-[0.16em] left-0 h-[0.28em] w-full text-goals"
      >
        <path d="M3 9 C 40 2, 70 13, 110 6 S 170 3, 197 8" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>
    </span>
  );
}
