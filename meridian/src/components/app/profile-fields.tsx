import { Field, Input, Textarea } from "@/components/ui/form";
import type { ActionState } from "@/lib/action-state";
import { FormGrid, fieldError } from "./form-parts";

export interface ProfileDefaults {
  name?: string | null;
  headline?: string | null;
  currentRole?: string | null;
  company?: string | null;
  industry?: string | null;
  bio?: string | null;
  linkedinUrl?: string | null;
  expertise?: string[];
}

/** Shared by onboarding and Settings. */
export function ProfileFields({ state, defaults = {} }: { state: ActionState; defaults?: ProfileDefaults }) {
  const e = (n: string) => fieldError(state, n);
  return (
    <FormGrid>
      <Field label="Name" htmlFor="name" error={e("name")}>
        <Input id="name" name="name" defaultValue={defaults.name ?? ""} autoComplete="name" required aria-invalid={!!e("name")} />
      </Field>
      <Field label="Headline" htmlFor="headline" hint="One line that says what you do. For example: Founder building tools for independent clinics." error={e("headline")}>
        <Input id="headline" name="headline" defaultValue={defaults.headline ?? ""} maxLength={120} aria-invalid={!!e("headline")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Current role" htmlFor="currentRole" error={e("currentRole")}>
          <Input id="currentRole" name="currentRole" defaultValue={defaults.currentRole ?? ""} autoComplete="organization-title" />
        </Field>
        <Field label="Company" htmlFor="company" error={e("company")}>
          <Input id="company" name="company" defaultValue={defaults.company ?? ""} autoComplete="organization" />
        </Field>
      </div>
      <Field label="Industry" htmlFor="industry" error={e("industry")}>
        <Input id="industry" name="industry" defaultValue={defaults.industry ?? ""} />
      </Field>
      <Field label="Short bio" htmlFor="bio" hint="Two or three sentences. Up to 600 characters." error={e("bio")}>
        <Textarea id="bio" name="bio" defaultValue={defaults.bio ?? ""} maxLength={600} aria-invalid={!!e("bio")} />
      </Field>
      <Field label="Expertise tags" htmlFor="expertise" hint="Separate with commas. For example: fundraising, hiring, pricing." error={e("expertise")}>
        <Input id="expertise" name="expertise" defaultValue={(defaults.expertise ?? []).join(", ")} />
      </Field>
      <Field label="LinkedIn URL (optional)" htmlFor="linkedinUrl" error={e("linkedinUrl")}>
        <Input id="linkedinUrl" name="linkedinUrl" type="url" defaultValue={defaults.linkedinUrl ?? ""} placeholder="https://linkedin.com/in/..." aria-invalid={!!e("linkedinUrl")} />
      </Field>
    </FormGrid>
  );
}
