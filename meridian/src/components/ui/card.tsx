import * as React from "react";
import type { Tone } from "@/lib/constants";
import { TONE_ACCENT } from "@/lib/tone";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "key" = thick border + hard shadow. "soft" = hairline + glow. */
  variant?: "key" | "soft";
  tone?: Tone;
  /** Tilt slightly on hover. Marketing cards only. */
  tilt?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "soft", tone = "primary", tilt = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        variant === "key" ? "card-key" : "card-soft",
        TONE_ACCENT[tone],
        tilt && "transition-transform duration-200 hover:-translate-y-1 hover:rotate-[-1.2deg]",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 p-5 pb-0", className)} {...props} />;
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-display text-xl font-bold leading-tight", className)} {...props} />;
}
export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-ink-soft", className)} {...props} />;
}
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}
