import type { Metadata } from "next";
import { CreateCircleForm } from "@/components/app/simple-forms";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "New circle" };

export default function NewCirclePage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-extrabold">Create a circle</h1>
      <p className="mb-6 mt-1 text-ink-soft">You will be its Founder. You can invite peers right after.</p>
      <Card variant="key" className="p-6"><CreateCircleForm /></Card>
    </div>
  );
}
