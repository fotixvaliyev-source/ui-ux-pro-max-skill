import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app/app-header";
import { db } from "@/server/db";
import { requireUser } from "@/server/guards";

export const metadata = { robots: { index: false } };

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [full, memberships, unread] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: user.id }, select: { onboardedAt: true } }),
    db.membership.findMany({ where: { userId: user.id }, orderBy: { joinedAt: "asc" }, select: { circle: { select: { id: true, name: true } } } }),
    db.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  if (!full.onboardedAt) redirect("/onboarding");
  return (
    <div className="min-h-screen">
      <AppHeader user={user} circles={memberships.map((m) => m.circle)} unread={unread} />
      <main id="main" className="mx-auto max-w-7xl px-5 py-8">{children}</main>
    </div>
  );
}
