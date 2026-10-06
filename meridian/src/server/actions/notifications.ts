"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/server/guards";
import { markAllRead } from "@/server/services/notifications";

export async function markAllReadAction(): Promise<void> {
  const user = await requireUser();
  await markAllRead(user.id);
  revalidatePath("/app", "layout");
}
