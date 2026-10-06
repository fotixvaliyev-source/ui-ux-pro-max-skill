"use client";

import { useActionState, useState } from "react";
import { EmojiTile } from "@/components/brand/emoji-tile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initialState, type ActionState } from "@/lib/action-state";
import { FEATURES, type FeatureKey } from "@/lib/constants";
import { createFirstCircleAction, finishOnboardingAction, joinWithCodeAction, saveProfileAction } from "@/server/actions/onboarding";
import { CircleFields } from "./circle-fields";
import { FormMessage, SubmitButton, fieldError, ActionForm } from "./form-parts";
import { ProfileFields, type ProfileDefaults } from "./profile-fields";

const STEPS = ["Your profile", "Your circle", "A quick tour"] as const;

const TOUR: { key: FeatureKey; text: string }[] = [
  { key: "goals", text: "Set a quarterly goal with a target. Check in briefly, and let your peers cheer or help." },
  { key: "meetings", text: "Plan the agenda, keep shared notes, and hand out action items with owners and dates." },
  { key: "decisions", text: "Log what the circle decided and why, so it is findable months later." },
  { key: "opps", text: "Post leads, ask for introductions, and answer each other's questions." },
];

export function OnboardingWizard({ defaults, next }: { defaults: ProfileDefaults; next?: string }) {
  const [step, setStep] = useState(0);
  const [circleId, setCircleId] = useState<string>("");

  const [profileState, profileAction] = useActionState(async (prev: ActionState, fd: FormData) => {
    const r = await saveProfileAction(prev, fd);
    if (r.ok) setStep(1);
    return r;
  }, initialState);

  const [createState, createAction] = useActionState(async (prev: ActionState, fd: FormData) => {
    const r = await createFirstCircleAction(prev, fd);
    if (r.ok && r.data?.circleId) {
      setCircleId(r.data.circleId);
      setStep(2);
    }
    return r;
  }, initialState);

  const [joinState, joinAction] = useActionState(async (prev: ActionState, fd: FormData) => {
    const r = await joinWithCodeAction(prev, fd);
    if (r.ok && r.data?.circleId) {
      setCircleId(r.data.circleId);
      setStep(2);
    }
    return r;
  }, initialState);

  const [finishState, finishAction] = useActionState(finishOnboardingAction, initialState);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm font-semibold">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span className="text-ink-soft">{STEPS[step]}</span>
        </div>
        <div role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1} aria-label="Onboarding progress" className="h-3 overflow-hidden rounded-full border-2 border-ink bg-surface">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>

      {step === 0 ? (
        <Card variant="key" className="p-6 sm:p-8">
          <h1 className="text-3xl font-extrabold">Tell your circle who you are</h1>
          <p className="mb-6 mt-1 text-ink-soft">You fill this in once. It follows you into every circle you join.</p>
          <ActionForm action={profileAction} className="flex flex-col gap-5">
            <ProfileFields state={profileState} defaults={defaults} />
            <FormMessage state={profileState} />
            <SubmitButton size="lg" pending="Saving...">Save and continue</SubmitButton>
          </ActionForm>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card variant="key" tone="directory" className="p-6 sm:p-8">
          <h1 className="text-3xl font-extrabold">Start a circle or join one</h1>
          <p className="mb-6 mt-1 text-ink-soft">You can belong to as many as you like. Pick one to begin.</p>
          <Tabs defaultValue={next ? "join" : "create"}>
            <TabsList aria-label="Create or join">
              <TabsTrigger value="create">Create a circle</TabsTrigger>
              <TabsTrigger value="join">Join with a code</TabsTrigger>
            </TabsList>
            <TabsContent value="create">
              <ActionForm action={createAction} className="flex flex-col gap-5">
                <CircleFields state={createState} idPrefix="c-" />
                <FormMessage state={createState} />
                <SubmitButton size="lg" pending="Creating...">Create circle</SubmitButton>
              </ActionForm>
            </TabsContent>
            <TabsContent value="join">
              <ActionForm action={joinAction} className="flex flex-col gap-5">
                <Field label="Invite code" htmlFor="code" hint="8 letters and numbers, from the person who invited you." error={fieldError(joinState, "code")}>
                  <Input id="code" name="code" autoCapitalize="characters" autoComplete="off" spellCheck={false} maxLength={12} className="font-display text-xl uppercase tracking-[0.2em]" required />
                </Field>
                <FormMessage state={joinState} />
                <SubmitButton size="lg" pending="Joining...">Join circle</SubmitButton>
              </ActionForm>
            </TabsContent>
          </Tabs>
          <div className="mt-6 border-t border-line pt-4">
            <Button variant="ghost" size="sm" onClick={() => setStep(2)}>I will do this later</Button>
          </div>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card variant="key" tone="opps" className="p-6 sm:p-8">
          <h1 className="text-3xl font-extrabold">You are in. Here is the lay of the land.</h1>
          <ul className="my-6 grid gap-3">
            {TOUR.map((t) => (
              <li key={t.key} className="flex items-start gap-4 rounded-card border-2 border-line p-4">
                <EmojiTile feature={t.key} size="sm" />
                <div>
                  <p className="font-display font-bold">{FEATURES[t.key].label}</p>
                  <p className="text-sm text-ink-soft">{t.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <ActionForm action={finishAction} state={finishState}>
            <input type="hidden" name="circleId" value={circleId} />
            {next ? <input type="hidden" name="next" value={next} /> : null}
            <SubmitButton size="lg" pending="Opening your circle...">{circleId ? "Take me to my circle" : "Take me to the app"}</SubmitButton>
          </ActionForm>
        </Card>
      ) : null}
    </div>
  );
}
