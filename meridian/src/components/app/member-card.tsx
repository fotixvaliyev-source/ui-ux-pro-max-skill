import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { parseTags } from "@/lib/tags";

export interface MemberView {
  userId: string;
  name: string;
  role: string;
  headline: string | null;
  currentRole: string | null;
  company: string | null;
  industry: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  expertise: string;
  workingOn: string | null;
  canHelpWith: string | null;
  lookingFor: string | null;
}

function Line({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-ink-soft">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

export function MemberCard({ member, circleId, full = false }: { member: MemberView; circleId: string; full?: boolean }) {
  const tags = parseTags(member.expertise);
  const roleLine = [member.currentRole, member.company].filter(Boolean).join(" at ");
  return (
    <Card variant="soft" tone="directory" className="flex h-full flex-col gap-4 p-5">
      <div className="flex items-start gap-3">
        <Avatar name={member.name} size="lg" />
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold leading-tight">
            {full ? member.name : <Link href={`/app/c/${circleId}/members/${member.userId}`} className="hover:underline">{member.name}</Link>}
          </h3>
          {member.headline ? <p className="text-sm text-ink-soft">{member.headline}</p> : null}
          {roleLine ? <p className="text-sm font-medium">{roleLine}</p> : null}
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {member.role === "FOUNDER" ? <Tag tone="primary">Founder</Tag> : null}
            {member.industry ? <Tag>{member.industry}</Tag> : null}
          </div>
        </div>
      </div>
      {full && member.bio ? <p className="text-ink-soft">{member.bio}</p> : null}
      <dl className="flex flex-col gap-2">
        <Line label="Currently working on" value={member.workingOn} />
        <Line label="Can help with" value={member.canHelpWith} />
        <Line label="Looking for" value={member.lookingFor} />
      </dl>
      {tags.length ? (
        <ul className="mt-auto flex flex-wrap gap-1.5" aria-label="Expertise">
          {tags.map((t) => (
            <li key={t}><Tag tone="directory">{t}</Tag></li>
          ))}
        </ul>
      ) : null}
      {member.linkedinUrl ? (
        <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-primary underline-offset-4 hover:underline">
          LinkedIn profile
        </a>
      ) : null}
    </Card>
  );
}
