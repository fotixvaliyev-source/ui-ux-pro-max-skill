"use server";

import { requireUser } from "@/server/guards";
import { succeed, type ActionState } from "@/lib/action-state";
import { idSchema } from "@/server/validation/circle";
import { resourceSchema } from "@/server/validation/resources";
import { createResource, deleteResource, updateResource, type UploadInput } from "@/server/services/resources";
import { guarded, parseForm } from "./run";

async function readUpload(formData: FormData): Promise<UploadInput | undefined> {
  const f = formData.get("file");
  if (!(f instanceof File) || f.size === 0) return undefined;
  return { name: f.name, type: f.type, data: Buffer.from(await f.arrayBuffer()) };
}

export async function createResourceAction(circleId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    const parsed = parseForm(resourceSchema, formData);
    if ("state" in parsed) return parsed.state;
    await createResource(user.id, idSchema.parse(circleId), parsed.data, await readUpload(formData));
    return succeed();
  });
}

export async function updateResourceAction(circleId: string, resourceId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    const parsed = parseForm(resourceSchema, formData);
    if ("state" in parsed) return parsed.state;
    await updateResource(user.id, idSchema.parse(circleId), idSchema.parse(resourceId), parsed.data);
    return succeed({ redirectTo: `/app/c/${circleId}/library` });
  });
}

export async function deleteResourceAction(circleId: string, resourceId: string): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireUser();
    await deleteResource(user.id, idSchema.parse(circleId), idSchema.parse(resourceId));
    return succeed();
  });
}
