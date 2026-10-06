"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { requireUser } from "@/server/guards";
import { safeNext, succeed, type ActionState } from "@/lib/action-state";
import { serializeTags } from "@/lib/tags";
import { circleSchema, inviteCodeSchema } from "@/server/validation/circle";
import { profileSchema } from "@/server/validation/profile";
import { createCircle, joinCircleByCode } from "@/server/services/circles";
import { guarded, parseForm } from "./run";

export async function saveProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    const parsed = parseForm(profileSchema, formData);
    if ("state" in parsed) return parsed.state;
    const { name, expertise, ...rest } = parsed.data;
    const profileData = {
      headline: rest.headline ?? null,
      currentRole: rest.currentRole ?? null,
      company: rest.company ?? null,
      industry: rest.industry ?? null,
      bio: rest.bio ?? null,
      linkedinUrl: rest.linkedinUrl ?? null,
      expertise: serializeTags(expertise),
    };
    await db.$transaction([
      db.user.update({ where: { id: user.id }, data: { name } }),
      db.profile.upsert({ where: { userId: user.id }, create: { userId: user.id, ...profileData }, update: profileData }),
    ]);
    revalidatePath("/app", "layout");
    return succeed();
  });
}

export async function createFirstCircleAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    const parsed = parseForm(circleSchema, formData);
    if ("state" in parsed) return parsed.state;
    const circle = await createCircle(user.id, parsed.data);
    return succeed({ circleId: circle.id });
  });
}

export async function joinWithCodeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    const code = inviteCodeSchema.safeParse(formData.get("code"));
    if (!code.success) return { ok: false, error: "Invite codes are 8 letters and numbers.", fieldErrors: { code: ["Check the code and try again."] } };
    const circle = await joinCircleByCode(user.id, code.data);
    return succeed({ circleId: circle.id });
  });
}

/** Marks onboarding done and lands the user in their circle. */
export async function finishOnboardingAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  await db.user.update({ where: { id: user.id }, data: { onboardedAt: new Date() } });
  const circleId = String(formData.get("circleId") ?? "");
  const member = circleId ? await db.membership.findUnique({ where: { circleId_userId: { circleId, userId: user.id } }, select: { circleId: true } }) : null;
  const next = safeNext(String(formData.get("next") ?? ""), "");
  redirect(member ? `/app/c/${member.circleId}` : next || "/app");
}
