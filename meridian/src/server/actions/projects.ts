"use server";

import { requireUser } from "@/server/guards";
import { succeed, type ActionState } from "@/lib/action-state";
import { opportunityStatusSchema } from "@/lib/constants";
import { idSchema } from "@/server/validation/circle";
import { cardSchema, columnNameSchema, opportunitySchema, pollSchema } from "@/server/validation/projects";
import { addChecklistItem, addColumn, createCard, deleteCard, deleteChecklistItem, deleteColumn, moveCard, renameColumn, setChecklistItemDone, updateCard } from "@/server/services/projects";
import { createOpportunity, deleteOpportunity, setOpportunityStatus, updateOpportunity } from "@/server/services/opportunities";
import { createPoll, deletePoll, vote } from "@/server/services/polls";
import { z } from "zod";
import { guarded, parseForm } from "./run";

const base = (circleId: string) => `/app/c/${circleId}`;
const id = (v: string) => idSchema.parse(v);

// ── Board ────────────────────────────────────────────────────────

export async function createCardAction(circleId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    const parsed = parseForm(cardSchema, formData);
    if ("state" in parsed) return parsed.state;
    await createCard(user.id, id(circleId), parsed.data);
    return succeed();
  });
}

export async function updateCardAction(circleId: string, cardId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    const parsed = parseForm(cardSchema, formData);
    if ("state" in parsed) return parsed.state;
    await updateCard(user.id, id(circleId), id(cardId), parsed.data);
    return succeed();
  });
}

export async function moveCardAction(circleId: string, cardId: string, columnId: string, position: number): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    await moveCard(user.id, id(circleId), id(cardId), id(columnId), z.number().finite().parse(position));
    return succeed();
  });
}

export async function deleteCardAction(circleId: string, cardId: string): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    await deleteCard(user.id, id(circleId), id(cardId));
    return succeed({ redirectTo: `${base(circleId)}/projects` });
  });
}

export async function addChecklistItemAction(circleId: string, cardId: string, text: string): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    await addChecklistItem(user.id, id(circleId), id(cardId), text);
    return succeed();
  });
}

export async function setChecklistDoneAction(circleId: string, itemId: string, done: boolean): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    await setChecklistItemDone(user.id, id(circleId), id(itemId), done);
    return succeed();
  });
}

export async function deleteChecklistItemAction(circleId: string, itemId: string): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    await deleteChecklistItem(user.id, id(circleId), id(itemId));
    return succeed();
  });
}

export async function addColumnAction(circleId: string, name: string): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    const parsed = columnNameSchema.safeParse(name);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Name the column." };
    await addColumn(user.id, id(circleId), parsed.data);
    return succeed();
  });
}

export async function renameColumnAction(circleId: string, columnId: string, name: string): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    const parsed = columnNameSchema.safeParse(name);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Name the column." };
    await renameColumn(user.id, id(circleId), id(columnId), parsed.data);
    return succeed();
  });
}

export async function deleteColumnAction(circleId: string, columnId: string): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    await deleteColumn(user.id, id(circleId), id(columnId));
    return succeed();
  });
}

// ── Opportunities ────────────────────────────────────────────────

export async function createOpportunityAction(circleId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    const parsed = parseForm(opportunitySchema, formData);
    if ("state" in parsed) return parsed.state;
    const post = await createOpportunity(user.id, id(circleId), parsed.data);
    return succeed({ redirectTo: `${base(circleId)}/opportunities/${post.id}` });
  });
}

export async function updateOpportunityAction(circleId: string, postId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    const parsed = parseForm(opportunitySchema, formData);
    if ("state" in parsed) return parsed.state;
    await updateOpportunity(user.id, id(circleId), id(postId), parsed.data);
    return succeed({ redirectTo: `${base(circleId)}/opportunities/${postId}` });
  });
}

export async function setOpportunityStatusAction(circleId: string, postId: string, status: string): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    await setOpportunityStatus(user.id, id(circleId), id(postId), opportunityStatusSchema.parse(status));
    return succeed();
  });
}

export async function deleteOpportunityAction(circleId: string, postId: string): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    await deleteOpportunity(user.id, id(circleId), id(postId));
    return succeed({ redirectTo: `${base(circleId)}/opportunities` });
  });
}

// ── Polls ────────────────────────────────────────────────────────

export async function createPollAction(circleId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    const parsed = parseForm(pollSchema, formData);
    if ("state" in parsed) return parsed.state;
    await createPoll(user.id, id(circleId), parsed.data);
    return succeed();
  });
}

export async function voteAction(circleId: string, pollId: string, optionId: string): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    await vote(user.id, id(circleId), id(pollId), id(optionId));
    return succeed();
  });
}

export async function deletePollAction(circleId: string, pollId: string): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    await deletePoll(user.id, id(circleId), id(pollId));
    return succeed();
  });
}
