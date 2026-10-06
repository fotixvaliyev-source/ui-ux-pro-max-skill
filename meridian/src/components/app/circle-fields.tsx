import { Field, Input, Select, Textarea } from "@/components/ui/form";
import type { ActionState } from "@/lib/action-state";
import { ACCENT_TONE, CADENCES, CIRCLE_ACCENTS } from "@/lib/constants";
import { TONE_SOLID } from "@/lib/tone";
import { cn } from "@/lib/utils";
import { FormGrid, fieldError } from "./form-parts";

export interface CircleDefaults {
  name?: string;
  purpose?: string;
  cadence?: string | null;
  accent?: string;
}

const CADENCE_LABEL: Record<(typeof CADENCES)[number], string> = { weekly: "Weekly", biweekly: "Every two weeks", monthly: "Monthly" };

/** Shared by Create circle, onboarding and circle Settings. */
export function CircleFields({ state, defaults = {}, idPrefix = "" }: { state: ActionState; defaults?: CircleDefaults; idPrefix?: string }) {
  const e = (n: string) => fieldError(state, n);
  const accent = defaults.accent ?? "indigo";
  return (
    <FormGrid>
      <Field label="Circle name" htmlFor={`${idPrefix}name`} error={e("name")}>
        <Input id={`${idPrefix}name`} name="name" defaultValue={defaults.name ?? ""} maxLength={60} required aria-invalid={!!e("name")} />
      </Field>
      <Field label="Purpose" htmlFor={`${idPrefix}purpose`} hint="One or two sentences on what the circle is for." error={e("purpose")}>
        <Textarea id={`${idPrefix}purpose`} name="purpose" defaultValue={defaults.purpose ?? ""} maxLength={300} required aria-invalid={!!e("purpose")} />
      </Field>
      <Field label="Meeting cadence (optional)" htmlFor={`${idPrefix}cadence`} error={e("cadence")}>
        <Select id={`${idPrefix}cadence`} name="cadence" defaultValue={defaults.cadence ?? ""}>
          <option value="">No fixed cadence</option>
          {CADENCES.map((c) => (
            <option key={c} value={c}>{CADENCE_LABEL[c]}</option>
          ))}
        </Select>
      </Field>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Accent color</legend>
        <div className="flex flex-wrap gap-3">
          {CIRCLE_ACCENTS.map((a) => (
            <label key={a} className="cursor-pointer">
              <input type="radio" name="accent" value={a} defaultChecked={a === accent} className="peer sr-only" />
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink transition-transform peer-checked:scale-110 peer-checked:ring-2 peer-checked:ring-ink peer-checked:ring-offset-2 peer-checked:ring-offset-surface peer-focus-visible:ring-2 peer-focus-visible:ring-primary",
                  TONE_SOLID[ACCENT_TONE[a]],
                )}
              >
                <span className="sr-only">{a}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </FormGrid>
  );
}
