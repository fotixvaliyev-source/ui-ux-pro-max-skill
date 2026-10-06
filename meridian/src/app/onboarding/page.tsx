import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { OnboardingWizard } from "@/components/app/onboarding-wizard";
import { safeNext } from "@/lib/action-state";
import { parseTags } from "@/lib/tags";
import { db } from "@/server/db";
import { requireUser } from "@/server/guards";

export const metadata: Metadata = { title: "Welcome", robots: { index: false } };

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const user = await requireUser();
  const { next: rawNext } = await searchParams;
  const full = await db.user.findUniqueOrThrow({ where: { id: user.id }, include: { profile: true } });
  if (full.onboardedAt) redirect("/app");
  const next = rawNext ? safeNext(rawNext, "") || undefined : undefined;
  return (
    <div className="min-h-screen px-5 py-10">
      <div className="mx-auto mb-8 flex max-w-2xl justify-center"><Logo /></div>
      <OnboardingWizard
        next={next}
        defaults={{
          name: full.name,
          headline: full.profile?.headline,
          currentRole: full.profile?.currentRole,
          company: full.profile?.company,
          industry: full.profile?.industry,
          bio: full.profile?.bio,
          linkedinUrl: full.profile?.linkedinUrl,
          expertise: parseTags(full.profile?.expertise),
        }}
      />
    </div>
  );
}
