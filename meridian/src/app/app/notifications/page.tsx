import type { Metadata } from "next";
import Link from "next/link";
import { EmojiTile } from "@/components/brand/emoji-tile";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { markAllReadAction } from "@/server/actions/notifications";
import { db } from "@/server/db";
import { requireUser } from "@/server/guards";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await requireUser();
  const items = await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 });
  const unread = items.filter((n) => !n.readAt).length;
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold">Notifications</h1>
        {unread > 0 ? (
          <form action={markAllReadAction}><Button type="submit" variant="secondary" size="sm">Mark all as read</Button></form>
        ) : null}
      </div>
      {items.length === 0 ? (
        <div className="card-soft flex flex-col items-center gap-3 p-10 text-center">
          <EmojiTile feature="meetings" emoji="bell" size="lg" />
          <p className="font-display text-xl font-bold">All quiet</p>
          <p className="text-ink-soft">Assigned tasks, new meetings and comments on your work will show up here.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((n) => (
            <li key={n.id}>
              <a
                href={`/app/notifications/${n.id}`}
                className={cn("flex w-full items-start gap-3 rounded-card border-2 p-4 text-left transition-colors hover:border-ink", n.readAt ? "border-line bg-surface" : "border-ink bg-primary-soft text-primary-soft-ink")}
              >
                <span aria-hidden className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", n.readAt ? "bg-transparent" : "bg-primary")} />
                <span className="flex-1">
                  <span className="block font-semibold">{n.title}</span>
                  <span className="block text-xs opacity-80">{timeAgo(n.createdAt)}{n.readAt ? "" : ", unread"}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-center text-sm text-ink-soft"><Link href="/app" className="font-bold text-primary hover:underline">Back to my circles</Link></p>
    </div>
  );
}
