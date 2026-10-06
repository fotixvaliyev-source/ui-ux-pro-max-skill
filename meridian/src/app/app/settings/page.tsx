import type { Metadata } from "next";
import { EditProfileForm } from "@/components/app/simple-forms";
import { Card } from "@/components/ui/card";
import { parseTags } from "@/lib/tags";
import { db } from "@/server/db";
import { requireUser } from "@/server/guards";

export const metadata: Metadata = { title: "My profile" };

export default async function ProfileSettingsPage() {
  const user = await requireUser();
  const full = await db.user.findUniqueOrThrow({ where: { id: user.id }, include: { profile: true } });
  const p = full.profile;
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-extrabold">My profile</h1>
      <p className="mb-6 mt-1 text-ink-soft">This is what members of your circles see in the directory.</p>
      <Card variant="soft" className="p-6">
        <EditProfileForm
          defaults={{ name: full.name, headline: p?.headline, currentRole: p?.currentRole, company: p?.company, industry: p?.industry, bio: p?.bio, linkedinUrl: p?.linkedinUrl, expertise: parseTags(p?.expertise) }}
        />
      </Card>
    </div>
  );
}
