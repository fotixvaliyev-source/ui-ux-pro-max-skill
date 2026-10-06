"use client";

import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SCENARIOS } from "./content";
import { Section } from "./section";

export function Scenarios() {
  const first = SCENARIOS[0];
  return (
    <Section
      eyebrow="Who it is for"
      title={<>Any group that <span className="text-primary">shows up</span> for each other.</>}
      intro="If you meet regularly and want the meeting to matter, Meridian fits."
    >
      <Tabs defaultValue={first.id}>
        <TabsList aria-label="Types of circle">
          {SCENARIOS.map((s) => (
            <TabsTrigger key={s.id} value={s.id}>
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {SCENARIOS.map((s) => (
          <TabsContent key={s.id} value={s.id}>
            <Card variant="key" tone={s.tone} className="grid gap-6 p-7 md:grid-cols-[1.4fr_1fr] md:p-10">
              <div>
                <h3 className="mb-3 text-3xl font-extrabold leading-tight">{s.title}</h3>
                <p className="text-lg text-ink-soft">{s.text}</p>
              </div>
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-soft">What they use</p>
                <ul className="flex flex-wrap gap-2">
                  {s.uses.map((u) => (
                    <li key={u}>
                      <Tag tone={s.tone} className="px-3 py-1.5 text-sm">{u}</Tag>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </Section>
  );
}
