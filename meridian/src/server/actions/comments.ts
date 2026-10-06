"use server";

import { z } from "zod";
import { requireUser } from "@/server/guards";
import { succeed, type ActionState } from "@/lib/action-state";
import { commentTargetSchema, reactionSchema } from "@/lib/constants";
import { idSchema } from "@/server/validation/circle";
import { commentSchema } from "@/server/validation/goals";
import { addComment, deleteComment, toggleReaction } from "@/server/services/comments";
import { guarded, parseForm } from "./run";

const targetSchema = z.object({ type: commentTargetSchema, id: idSchema });

export async function addCommentAction(circleId: string, targetType: string, targetId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    const parsed = parseForm(commentSchema, formData);
    if ("state" in parsed) return parsed.state;
    await addComment(user.id, idSchema.parse(circleId), targetSchema.parse({ type: targetType, id: targetId }), parsed.data.body);
    return succeed();
  });
}

export async function deleteCommentAction(circleId: string, commentId: string): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    await deleteComment(user.id, idSchema.parse(circleId), idSchema.parse(commentId));
    return succeed();
  });
}

/** `on` is either "comment" (id = comment id) or a comment target type like "GOAL" (id = target id). */
export async function toggleReactionAction(circleId: string, on: string, id: string, key: string): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    const reaction = reactionSchema.parse(key);
    const cid = idSchema.parse(circleId);
    if (on === "comment") await toggleReaction(user.id, cid, { kind: "comment", id: idSchema.parse(id) }, reaction);
    else await toggleReaction(user.id, cid, { kind: "target", target: targetSchema.parse({ type: on, id }) }, reaction);
    return succeed();
  });
}
