import { NextResponse, type NextRequest } from "next/server";
import { ForbiddenError } from "@/server/access";
import { auth } from "@/server/auth";
import { CSV_DATASETS, exportCsv, exportMarkdown, type CsvDataset } from "@/server/services/export";

/** GET /api/circles/:id/export?format=md  or  ?format=csv&dataset=decisions|actions|notes. Members only. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ circleId: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Sign in to export." }, { status: 401 });
  const { circleId } = await params;
  const format = req.nextUrl.searchParams.get("format") ?? "md";
  const dataset = req.nextUrl.searchParams.get("dataset") ?? "decisions";
  try {
    let file: { filename: string; body: string };
    if (format === "md") file = await exportMarkdown(userId, circleId);
    else if (format === "csv" && (CSV_DATASETS as readonly string[]).includes(dataset)) file = await exportCsv(userId, circleId, dataset as CsvDataset);
    else return NextResponse.json({ error: "Use format=md, or format=csv with dataset=decisions, actions or notes." }, { status: 400 });
    return new Response(file.body, {
      headers: {
        "Content-Type": format === "md" ? "text/markdown; charset=utf-8" : "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${file.filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ error: "Not found." }, { status: 404 });
    throw e;
  }
}
