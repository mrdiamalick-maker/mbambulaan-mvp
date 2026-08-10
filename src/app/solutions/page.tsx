import { PhoneCall } from "lucide-react";
import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicSectionHero } from "@/components/public/PublicSectionHero";
import { SolutionWizard } from "@/components/public/SolutionWizard";
import type { PublicRequestIntent } from "@/domain/public/request";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SolutionsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const initialIntent = first(params.intent) as PublicRequestIntent | undefined;
  const initialCategory = first(params.category);
  const initialTerritory = first(params.territory);
  const source = first(params.source) ?? "solutions";

  return (
    <main className="min-h-screen bg-[#f3f7f6] text-[#10373a]">
      <PublicHeader dark />
      <PublicSectionHero
        eyebrow="Trouver une solution"
        title={<>Décrivez le besoin. <span className="text-[#74e1d6]">Mbàmbulaan organise la suite.</span></>}
        description="Pas de catalogue public de prestataires ni de prix automatiques. Nous qualifions votre besoin, son territoire et son contexte avant d’organiser la réponse adaptée."
        actions={<Link href="/contact?intent=callback" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/18 bg-white/8 px-4 py-2.5 text-sm font-bold text-white">Être rappelé plutôt <PhoneCall size={16}/></Link>}
      />

      <section className="mx-auto max-w-3xl px-5 py-14 md:px-10 md:py-20">
        <SolutionWizard
          initialIntent={initialIntent}
          initialCategory={initialCategory}
          initialTerritory={initialTerritory}
          source="web"
          context={{ page: "solutions", origin: source }}
        />
      </section>

      <section className="border-t border-[#d9e3e3] bg-white px-5 py-14 md:px-10 md:py-18">
        <div className="mx-auto grid max-w-[1500px] gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
          <div>
            <p className="label">Un même moteur, plusieurs canaux</p>
            <h2 className="mt-3 text-3xl font-[740] tracking-[-.04em] text-[#102e37] md:text-4xl">Web, WhatsApp, téléphone ou terrain : le besoin reste le même objet Mbàmbulaan.</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#667b81]">Le site n’impose pas un parcours numérique unique. L’équipe peut reprendre le contexte, qualifier la demande et poursuivre l’échange sur le canal le plus adapté.</p>
          </div>
          <aside className="surface p-6 md:p-8">
            <p className="public-kicker">Ce que Mbàmbulaan protège</p>
            <div className="mt-5 space-y-4 text-sm leading-6 text-[#5f7378]">
              <p>La demande est qualifiée avant toute mise en relation.</p>
              <p>Les coordonnées de tiers ne sont pas exposées comme un annuaire.</p>
              <p>La valeur vient de la compréhension, du réseau, de la coordination et du suivi.</p>
              <p>Aucune promesse de prix, de financement ou d’autorisation n’est faite automatiquement.</p>
            </div>
          </aside>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
