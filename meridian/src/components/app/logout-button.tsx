"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-primary-soft">
      Log out
    </button>
  );
}
