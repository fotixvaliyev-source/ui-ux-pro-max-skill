"use server";

import { requireUser } from "@/server/guards";
import { succeed, type ActionState } from "@/lib/action-state";
import { circleSchema, idSchema, inviteCodeSchema } from "@/server/validation/circle";
import { roleSchema } from "@/lib/constants";
import {
  createCircle, deleteCircle, joinCircleByCode, leaveCircle, regenerateInviteCode,
  removeMember, setInviteOpen, setMemberRole, updateCircle,
} from "@/server/services/circles";
import { guarded, parseForm } from "./run";

export async function createCircleAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let circleId = "";
  const state = await guarded(async () => {
    const user = await requireUser();
    const parsed = parseForm(circleSchema, formData);
    if ("state" in parsed) return parsed.state;
    circleId = (await createCircle(user.id, parsed.data)).id;
    return succeed();
  });
  if (!state.ok) return state;
  return succeed({ redirectTo: `/app/c/${circleId}` });
}

export async function joinCircleAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let circleId = "";
  const state = await guarded(async () => {
    const user = await requireUser();
    const code = inviteCodeSchema.safeParse(formData.get("code"));
    if (!code.success) return { ok: false, error: "Invite codes are 8 letters and numbers.", fieldErrors: { code: ["Check the code and try again."] } };
    circleId = (await joinCircleByCode(user.id, code.data)).id;
    return succeed();
  });
  if (!state.ok) return state;
  return succeed({ redirectTo: `/app/c/${circleId}` });
}

export async function updateCircleAction(circleId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    const parsed = parseForm(circleSchema, formData);
    if ("state" in parsed) return parsed.state;
    await updateCircle(user.id, idSchema.parse(circleId), parsed.data);
    return succeed();
  });
}

export async function regenerateInviteAction(circleId: string): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    await regenerateInviteCode(user.id, idSchema.parse(circleId));
    return succeed();
  });
}

export async function setInviteOpenAction(circleId: string, open: boolean): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    await setInviteOpen(user.id, idSchema.parse(circleId), open);
    return succeed();
  });
}

export async function removeMemberAction(circleId: string, targetUserId: string): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    await removeMember(user.id, idSchema.parse(circleId), idSchema.parse(targetUserId));
    return succeed();
  });
}

export async function setMemberRoleAction(circleId: string, targetUserId: string, role: string): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    await setMemberRole(user.id, idSchema.parse(circleId), idSchema.parse(targetUserId), roleSchema.parse(role));
    return succeed();
  });
}

export async function leaveCircleAction(circleId: string): Promise<ActionState> {
  const state = await guarded(async () => {
    const user = await requireUser();
    await leaveCircle(user.id, idSchema.parse(circleId));
    return succeed();
  });
  if (!state.ok) return state;
  return succeed({ redirectTo: "/app" });
}

export async function deleteCircleAction(circleId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const state = await guarded(async () => {
    const user = await requireUser();
    await deleteCircle(user.id, idSchema.parse(circleId), String(formData.get("confirmName") ?? ""));
    return succeed();
  });
  if (!state.ok) return state;
  return succeed({ redirectTo: "/app", hard: "1" });
}
