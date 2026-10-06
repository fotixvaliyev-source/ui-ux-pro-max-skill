import { NextResponse, type NextRequest } from "next/server";
import { ForbiddenError, UserError } from "@/server/access";
import { auth } from "@/server/auth";
import { getResourceFile } from "@/server/services/resources";
import { ALLOWED_UPLOAD_TYPES } from "@/server/storage";

/** Downloads an uploaded file. Members only; always sent as an attachment so nothing renders inside our origin. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ circleId: string; resourceId: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Sign in to download." }, { status: 401 });
  const { circleId, resourceId } = await params;
  try {
    const file = await getResourceFile(userId, circleId, resourceId);
    const type = ALLOWED_UPLOAD_TYPES.has(file.type) ? file.type : "application/octet-stream";
    const name = file.name.replace(/[^a-zA-Z0-9._ -]+/g, "_");
    return new Response(new Uint8Array(file.data), {
      headers: {
        "Content-Type": type,
        "Content-Disposition": `attachment; filename="${name}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    if (e instanceof ForbiddenError || e instanceof UserError) return NextResponse.json({ error: "Not found." }, { status: 404 });
    throw e;
  }
}
