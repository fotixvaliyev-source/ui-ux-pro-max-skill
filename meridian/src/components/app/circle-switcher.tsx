"use client";

import { useParams, useRouter } from "next/navigation";
import { Select } from "@/components/ui/form";

export interface SwitcherCircle {
  id: string;
  name: string;
}

export function CircleSwitcher({ circles }: { circles: SwitcherCircle[] }) {
  const router = useRouter();
  const params = useParams<{ circleId?: string }>();
  if (circles.length === 0) return null;
  return (
    <div className="min-w-0 max-w-[14rem] flex-1 sm:max-w-xs">
      <label htmlFor="circle-switcher" className="sr-only">Switch circle</label>
      <Select
        id="circle-switcher"
        value={params.circleId ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "__new") router.push("/app/circles/new");
          else if (v === "__join") router.push("/app/join");
          else if (v) router.push(`/app/c/${v}`);
        }}
        className="h-10 border-ink py-1.5 font-display font-bold"
      >
        {!params.circleId ? <option value="">Choose a circle</option> : null}
        {circles.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
        <option value="__new">New circle...</option>
        <option value="__join">Join with a code...</option>
      </Select>
    </div>
  );
}
