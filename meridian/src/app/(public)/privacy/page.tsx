import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Our privacy policy in plain language: what we store, who can see it, and how to take it with you.",
};

const SECTIONS = [
  {
    h: "What we collect",
    p: [
      "Your account details: name, email address and a hashed password, or the identity returned by Google or LinkedIn if you sign in with them.",
      "Your profile: the headline, role, industry and bio you choose to write.",
      "What you add to a circle: goals, check-ins, meeting notes, decisions, action items, posts, polls, resources and comments.",
    ],
  },
  {
    h: "Who can see it",
    p: [
      "Content inside a circle is visible only to that circle's members. Every request is checked against circle membership before anything is read or changed.",
      "Your profile is visible to members of the circles you belong to. It is not public and not searchable from outside.",
    ],
  },
  {
    h: "What we do not do",
    p: [
      "We do not show ads. We do not sell your data. We do not share it with advertisers or data brokers.",
    ],
  },
  {
    h: "Cookies",
    p: ["We use a session cookie to keep you signed in and a small preference to remember light or dark mode. We do not use advertising or cross-site tracking cookies."],
  },
  {
    h: "Taking your data with you",
    p: ["A circle's decisions, notes and action items can be exported as Markdown or CSV at any time."],
  },
  {
    h: "Deleting things",
    p: [
      "A Founder can delete a circle, which removes its content. You can leave a circle at any time. To delete your account, contact us and we will remove it.",
    ],
  },
  {
    h: "Questions",
    p: ["Write to hello@meridian.example and a person will answer."],
  },
] as const;

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Privacy"
        tone="opps"
        title={<>Short, plain, and <span className="text-primary">on your side</span>.</>}
        intro="This is what we do with your information, written for people rather than lawyers. Last updated 6 October 2026."
      />
      <article className="mx-auto max-w-3xl px-5 py-10">
        {SECTIONS.map((s) => (
          <section key={s.h} className="mb-10">
            <h2 className="mb-3 text-2xl font-extrabold">{s.h}</h2>
            <div className="flex flex-col gap-3 text-lg text-ink-soft">
              {s.p.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
          </section>
        ))}
      </article>
    </>
  );
}
