import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Emoji } from "@/components/brand/emoji";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/brand/theme-toggle";
import { LogoutButton } from "./logout-button";
import { CircleSwitcher, type SwitcherCircle } from "./circle-switcher";

interface AppHeaderProps {
  user: { name: string | null; email: string };
  circles: SwitcherCircle[];
  unread: number;
}

export function AppHeader({ user, circles, unread }: AppHeaderProps) {
  const display = user.name ?? user.email;
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-5">
        <Logo className="[&>span:last-child]:hidden sm:[&>span:last-child]:inline" />
        <CircleSwitcher circles={circles} />
        <div className="ml-auto flex items-center gap-1">
          <Link href="/app/tasks" className="hidden rounded-full px-3 py-2 font-display text-sm font-bold hover:bg-primary-soft sm:block">
            My tasks
          </Link>
          <Link href="/app/notifications" aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"} className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-primary-soft">
            <Emoji name="bell" size={22} />
            {unread > 0 ? (
              <span aria-hidden className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-bg bg-goals px-1 text-[10px] font-extrabold text-[#1b1a2e]">
                {unread > 9 ? "9+" : unread}
              </span>
            ) : null}
          </Link>
          <ThemeToggle />
          <details className="group relative">
            <summary className="flex h-10 cursor-pointer list-none items-center rounded-full [&::-webkit-details-marker]:hidden" aria-label="Account menu">
              <Avatar name={display} size="md" className="border-ink" />
            </summary>
            <div className="card-soft absolute right-0 mt-2 w-56 p-2">
              <p className="truncate px-3 py-2 text-sm font-semibold">{display}</p>
              <Link href="/app/settings" className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-primary-soft">My profile</Link>
              <Link href="/app/tasks" className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-primary-soft sm:hidden">My tasks</Link>
              <LogoutButton />
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
