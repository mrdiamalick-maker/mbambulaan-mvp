import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { SiteHeader } from "@/components/landing/SiteHeader";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#14312d]">
      <SiteHeader />
      <Hero />
      <Footer />
    </main>
  );
}
