"use server";

import { requireUser } from "@/server/guards";
import { succeed, type ActionState } from "@/lib/action-state";
import { goalStatusSchema } from "@/lib/constants";
import { idSchema } from "@/server/validation/circle";
import { checkInSchema, goalSchema } from "@/server/validation/goals";
import { addCheckIn, createGoal, deleteGoal, setGoalStatus, updateGoal } from "@/server/services/goals";
import { guarded, parseForm } from "./run";

export async function createGoalAction(circleId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  let goalId = "";
  const state = await guarded(async () => {
    const user = await requireUser();
    const parsed = parseForm(goalSchema, formData);
    if ("state" in parsed) return parsed.state;
    goalId = (await createGoal(user.id, idSchema.parse(circleId), parsed.data)).id;
    return succeed();
  });
  if (!state.ok) return state;
  return succeed({ redirectTo: `/app/c/${circleId}/goals/${goalId}` });
}

export async function updateGoalAction(circleId: string, goalId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const state = await guarded(async () => {
    const user = await requireUser();
    const parsed = parseForm(goalSchema, formData);
    if ("state" in parsed) return parsed.state;
    await updateGoal(user.id, idSchema.parse(circleId), idSchema.parse(goalId), parsed.data);
    return succeed();
  });
  if (!state.ok) return state;
  return succeed({ redirectTo: `/app/c/${circleId}/goals/${goalId}` });
}

export async function setGoalStatusAction(circleId: string, goalId: string, status: string): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    await setGoalStatus(user.id, idSchema.parse(circleId), idSchema.parse(goalId), goalStatusSchema.parse(status));
    return succeed();
  });
}

export async function deleteGoalAction(circleId: string, goalId: string): Promise<ActionState> {
  const state = await guarded(async () => {
    const user = await requireUser();
    await deleteGoal(user.id, idSchema.parse(circleId), idSchema.parse(goalId));
    return succeed();
  });
  if (!state.ok) return state;
  return succeed({ redirectTo: `/app/c/${circleId}/goals` });
}

export async function addCheckInAction(circleId: string, goalId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    const parsed = parseForm(checkInSchema, formData);
    if ("state" in parsed) return parsed.state;
    await addCheckIn(user.id, idSchema.parse(circleId), idSchema.parse(goalId), parsed.data);
    return succeed();
  });
}
