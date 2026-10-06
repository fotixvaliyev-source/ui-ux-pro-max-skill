"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Emoji } from "@/components/brand/emoji";
import { cn } from "@/lib/utils";
import { CIRCLE_NAV } from "./nav-config";

/** Sidebar on desktop, scrolling tab row on mobile. */
export function CircleNav({ circleId }: { circleId: string }) {
  const pathname = usePathname();
  const base = `/app/c/${circleId}`;
  return (
    <nav aria-label="Circle" className="-mx-5 overflow-x-auto px-5 lg:mx-0 lg:overflow-visible lg:px-0">
      <ul className="flex gap-2 lg:flex-col lg:gap-1">
        {CIRCLE_NAV.map((item) => {
          const href = base + item.href;
          const active = item.href === "" ? pathname === base : pathname.startsWith(href);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2 font-display text-sm font-bold transition-colors",
                  active ? "bg-primary-soft text-primary-soft-ink" : "text-ink-soft hover:bg-primary-soft/60 hover:text-ink",
                )}
              >
                <Emoji name={item.emoji} size={18} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
