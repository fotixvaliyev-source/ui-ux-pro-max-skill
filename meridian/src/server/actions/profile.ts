"use server";

import { db } from "@/server/db";
import { requireMember, requireUser } from "@/server/guards";
import { succeed, type ActionState } from "@/lib/action-state";
import { serializeTags } from "@/lib/tags";
import { circleProfileSchema, profileSchema } from "@/server/validation/profile";
import { idSchema } from "@/server/validation/circle";
import { guarded, parseForm } from "./run";

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    const parsed = parseForm(profileSchema, formData);
    if ("state" in parsed) return parsed.state;
    const { name, expertise, ...rest } = parsed.data;
    const data = {
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
      db.profile.upsert({ where: { userId: user.id }, create: { userId: user.id, ...data }, update: data }),
    ]);
    return succeed();
  });
}

/** Per-circle directory fields: what I am working on here, can help with, and looking for. */
export async function updateCircleProfileAction(circleId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const ctx = await requireMember(idSchema.parse(circleId));
    const parsed = parseForm(circleProfileSchema, formData);
    if ("state" in parsed) return parsed.state;
    await db.membership.update({
      where: { id: ctx.membership.id },
      data: {
        workingOn: parsed.data.workingOn ?? null,
        canHelpWith: parsed.data.canHelpWith ?? null,
        lookingFor: parsed.data.lookingFor ?? null,
      },
    });
    return succeed();
  });
}
