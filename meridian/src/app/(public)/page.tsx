import { CtaBanner } from "@/components/marketing/cta-banner";
import { Faq } from "@/components/marketing/faq";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { Hero } from "@/components/marketing/hero";
import { Marquee } from "@/components/brand/marquee";
import { Principles } from "@/components/marketing/principles";
import { Problem } from "@/components/marketing/problem";
import { Scenarios } from "@/components/marketing/scenarios";
import { Steps } from "@/components/marketing/steps";
import { USE_CASES } from "@/components/marketing/content";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee items={USE_CASES} />
      <Problem />
      <FeatureGrid />
      <Steps />
      <Scenarios />
      <Principles />
      <Faq />
      <CtaBanner />
    </>
  );
}
