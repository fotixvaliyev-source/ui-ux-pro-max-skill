import type { Metadata } from "next";
import { JoinCircleForm } from "@/components/app/simple-forms";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Join a circle" };

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-extrabold">Join a circle</h1>
      <p className="mb-6 mt-1 text-ink-soft">Enter the 8-character code a Founder shared with you.</p>
      <Card variant="key" tone="directory" className="p-6"><JoinCircleForm /></Card>
    </div>
  );
}
