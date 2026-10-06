import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/app/auth-forms";
import { SocialButtons } from "@/components/app/social-buttons";
import { Card } from "@/components/ui/card";
import { safeNext } from "@/lib/action-state";
import { auth } from "@/server/auth";

export const metadata: Metadata = { title: "Log in" };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next: rawNext } = await searchParams;
  const next = rawNext ? safeNext(rawNext) : undefined;
  const session = await auth();
  if (session?.user?.id) redirect(next ?? "/app");
  return (
    <Card variant="key" className="p-7">
      <h1 className="text-3xl font-extrabold">Welcome back</h1>
      <p className="mb-6 mt-1 text-ink-soft">Log in to your circles.</p>
      <div className="flex flex-col gap-5">
        <SocialButtons next={next} />
        <LoginForm next={next} />
      </div>
    </Card>
  );
}
