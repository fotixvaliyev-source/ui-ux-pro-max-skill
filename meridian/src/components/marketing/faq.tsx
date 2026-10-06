import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQ } from "./content";
import { Section } from "./section";

export function Faq() {
  return (
    <Section eyebrow="FAQ" title={<>Questions, <span className="text-primary">answered</span>.</>} className="max-w-3xl">
      <Accordion type="single" collapsible className="flex flex-col gap-3">
        {FAQ.map((f, i) => (
          <AccordionItem key={f.q} value={`q${i}`}>
            <AccordionTrigger>{f.q}</AccordionTrigger>
            <AccordionContent>{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}
