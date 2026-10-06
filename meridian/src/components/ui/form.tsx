import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-xl border-2 border-line bg-surface px-4 py-2.5 text-base text-ink placeholder:text-ink-soft/70 transition-colors hover:border-ink-soft focus-visible:border-primary aria-[invalid=true]:border-danger disabled:cursor-not-allowed disabled:opacity-60";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input ref={ref} type={type} className={cn(control, "h-11", className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn(control, "min-h-[96px] resize-y", className)} {...props} />,
);
Textarea.displayName = "Textarea";

// Neutral mid-gray chevron: readable on both the light and dark surface.
const CHEVRON =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%238a88a8'><path d='M5 7l5 6 5-6z'/></svg>\")";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, style, ...props }, ref) => (
    <select ref={ref} className={cn(control, "h-11 appearance-none pr-10", className)}
      style={{
        backgroundColor: "var(--surface)",
        backgroundImage: CHEVRON,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.9rem center",
        backgroundSize: "1.1rem",
        ...style,
      }}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn("text-sm font-semibold text-ink", className)} {...props} />
));
Label.displayName = "Label";

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

/** Label + control + hint + error. Error text never uses emoji. */
export function Field({ label, htmlFor, hint, error, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error ? <p id={`${htmlFor}-hint`} className="text-xs text-ink-soft">{hint}</p> : null}
      {error ? <p id={`${htmlFor}-error`} role="alert" className="text-xs font-semibold text-danger">{error}</p> : null}
    </div>
  );
}
