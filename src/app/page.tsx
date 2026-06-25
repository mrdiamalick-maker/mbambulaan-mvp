import { ActorsSection } from "@/components/landing/ActorsSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { ProjectSection } from "@/components/landing/ProjectSection";
import { SiteHeader } from "@/components/landing/SiteHeader";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f4ec] text-[#14312d]">
      <SiteHeader />
      <Hero />
      <ProjectSection />
      <ActorsSection />
      <FeaturesSection />
      <BenefitsSection />
      <Footer />
    </main>
  );
}
