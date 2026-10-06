import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/action-state";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { markRead } from "@/server/services/notifications";

/** Opens a notification: marks it read (only if it is the caller's own) and redirects to where it points. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.redirect(new URL("/login", req.url));
  const n = await db.notification.findFirst({ where: { id, userId } });
  if (!n) return NextResponse.redirect(new URL("/app/notifications", req.url));
  await markRead(userId, n.id);
  return NextResponse.redirect(new URL(safeNext(n.href, "/app/notifications"), req.url));
}
