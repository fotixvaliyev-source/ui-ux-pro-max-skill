import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 border-ink font-display font-bold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-ink shadow-[3px_3px_0_var(--ink)] hover:-translate-y-0.5 hover:shadow-[3px_5px_0_var(--ink)]",
        secondary: "bg-surface text-ink shadow-[3px_3px_0_var(--ink)] hover:-translate-y-0.5 hover:shadow-[3px_5px_0_var(--ink)]",
        ghost: "border-transparent bg-transparent text-ink hover:bg-primary-soft hover:text-primary-soft-ink",
        danger: "bg-danger-tint text-danger shadow-[3px_3px_0_var(--danger)] hover:-translate-y-0.5",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-base",
        lg: "h-14 px-8 text-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as the child element (e.g. a next/link). */
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        {...(asChild ? {} : { type: type ?? "button" })}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
