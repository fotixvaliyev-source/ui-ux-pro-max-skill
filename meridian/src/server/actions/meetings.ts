"use server";

import { requireUser } from "@/server/guards";
import { succeed, type ActionState } from "@/lib/action-state";
import { decisionStatusSchema } from "@/lib/constants";
import { idSchema } from "@/server/validation/circle";
import { actionItemSchema, decisionSchema, meetingSchema, notesSchema } from "@/server/validation/meetings";
import {
  createActionItem, createDecision, createMeeting, deleteActionItem, deleteDecision, deleteMeeting,
  setActionItemDone, setDecisionStatus, updateDecision, updateMeeting, updateNotes,
} from "@/server/services/meetings";
import { guarded, parseForm } from "./run";

const base = (circleId: string) => `/app/c/${circleId}`;

// ── Meetings ─────────────────────────────────────────────────────

export async function createMeetingAction(circleId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    const parsed = parseForm(meetingSchema, formData);
    if ("state" in parsed) return parsed.state;
    const m = await createMeeting(user.id, idSchema.parse(circleId), parsed.data);
    return succeed({ redirectTo: `${base(circleId)}/meetings/${m.id}` });
  });
}

export async function updateMeetingAction(circleId: string, meetingId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    const parsed = parseForm(meetingSchema, formData);
    if ("state" in parsed) return parsed.state;
    await updateMeeting(user.id, idSchema.parse(circleId), idSchema.parse(meetingId), parsed.data);
    return succeed({ redirectTo: `${base(circleId)}/meetings/${meetingId}` });
  });
}

export async function saveNotesAction(circleId: string, meetingId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    const parsed = parseForm(notesSchema, formData);
    if ("state" in parsed) return parsed.state;
    await updateNotes(user.id, idSchema.parse(circleId), idSchema.parse(meetingId), parsed.data.notesMd);
    return succeed();
  });
}

export async function deleteMeetingAction(circleId: string, meetingId: string): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    await deleteMeeting(user.id, idSchema.parse(circleId), idSchema.parse(meetingId));
    return succeed({ redirectTo: `${base(circleId)}/meetings` });
  });
}

// ── Action items ─────────────────────────────────────────────────

export async function addActionItemAction(circleId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    const parsed = parseForm(actionItemSchema, formData);
    if ("state" in parsed) return parsed.state;
    await createActionItem(user.id, idSchema.parse(circleId), parsed.data);
    return succeed();
  });
}

export async function setActionItemDoneAction(circleId: string, itemId: string, done: boolean): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    await setActionItemDone(user.id, idSchema.parse(circleId), idSchema.parse(itemId), done);
    return succeed();
  });
}

export async function deleteActionItemAction(circleId: string, itemId: string): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    await deleteActionItem(user.id, idSchema.parse(circleId), idSchema.parse(itemId));
    return succeed();
  });
}

// ── Decisions ────────────────────────────────────────────────────

export async function createDecisionAction(circleId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    const parsed = parseForm(decisionSchema, formData);
    if ("state" in parsed) return parsed.state;
    const d = await createDecision(user.id, idSchema.parse(circleId), parsed.data);
    return succeed({ redirectTo: `${base(circleId)}/decisions/${d.id}` });
  });
}

export async function updateDecisionAction(circleId: string, decisionId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    const parsed = parseForm(decisionSchema, formData);
    if ("state" in parsed) return parsed.state;
    await updateDecision(user.id, idSchema.parse(circleId), idSchema.parse(decisionId), parsed.data);
    return succeed({ redirectTo: `${base(circleId)}/decisions/${decisionId}` });
  });
}

export async function setDecisionStatusAction(circleId: string, decisionId: string, status: string): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    await setDecisionStatus(user.id, idSchema.parse(circleId), idSchema.parse(decisionId), decisionStatusSchema.parse(status));
    return succeed();
  });
}

export async function deleteDecisionAction(circleId: string, decisionId: string): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    await deleteDecision(user.id, idSchema.parse(circleId), idSchema.parse(decisionId));
    return succeed({ redirectTo: `${base(circleId)}/decisions` });
  });
}
