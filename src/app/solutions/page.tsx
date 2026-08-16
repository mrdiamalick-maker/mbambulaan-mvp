import { ArrowRight, Footprints, Globe, Handshake, MessageCircle, PhoneCall, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicSectionHero } from "@/components/public/PublicSectionHero";
import { SolutionWizard } from "@/components/public/SolutionWizard";
import type { PublicRequestIntent } from "@/domain/public/request";

// PUB-S3 (audit Premium XXL Public, CEO 2026-08-16) : les 4 canaux d'entrée
// réels — mêmes icônes que channelMeta (status-tokens.ts) et le bloc
// omnicanal de Contact, pour rester cohérent d'une page à l'autre.
const inputChannels = [
  { label: "WhatsApp", icon: MessageCircle },
  { label: "Web", icon: Globe },
  { label: "Téléphone", icon: PhoneCall },
  { label: "Terrain", icon: Footprints }
];

export const metadata: Metadata = {
  title: "Décrire une situation | Mbàmbulaan",
  description: "Décrivez une situation liée au transport, au froid, à la transformation, à l’équipement, à la maintenance, à la formation, aux débouchés ou au financement. Mbàmbulaan qualifie le besoin et organise la suite.",
  alternates: { canonical: "/solutions" }
};

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
    <main className="pub-scope min-h-screen">
      <PublicHeader dark />
      <PublicSectionHero
        eyebrow="Décrire une situation"
        title={<>Décrivez la situation. <span className="text-[var(--pub-turquoise-300)]">Mbàmbulaan qualifie le besoin et organise la suite.</span></>}
        description="Indiquez ce qui se passe, le territoire concerné et le résultat recherché. Mbàmbulaan transforme ces éléments en besoin qualifié avant d’organiser la réponse adaptée."
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

      {/* PUB-S3 (audit Premium XXL Public, CEO 2026-08-16) : la carte texte
          "Ce que Mbàmbulaan protège" devient un schéma — 4 canaux d'entrée →
          Qualification Mbàmbulaan → Besoin structuré → Coordination. Plus
          différenciant qu'une seconde carte de texte, explique
          l'infrastructure plutôt que de la décrire. #d9e3e3/#5f7378
          (couleurs legacy hors palette --pub-*) harmonisés au passage vers
          --pub-stone-150/--pub-stone-700. */}
      <section className="border-t border-[var(--pub-stone-150)] bg-white px-5 py-14 md:px-10 md:py-18">
        <div className="mx-auto max-w-[1500px]">
          <p className="pub-eyebrow">Un même moteur, plusieurs canaux</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-[740] tracking-[-.04em] text-[var(--pub-deep-900)] md:text-4xl">Web, WhatsApp, téléphone ou terrain : la situation reste le même objet Mbàmbulaan.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--pub-stone-700)]">Le site n’impose pas un parcours numérique unique. L’équipe peut reprendre le contexte, qualifier le besoin et poursuivre l’échange sur le canal le plus adapté.</p>

          <div className="mt-9 rounded-[var(--pub-radius-lg)] border border-[var(--pub-stone-150)] bg-[var(--pub-surface)] p-6 md:p-8">
            <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center lg:justify-center lg:gap-4">
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                {inputChannels.map(({ label, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-2 rounded-xl border border-[var(--pub-stone-150)] bg-white px-3.5 py-2.5">
                    <Icon size={15} className="shrink-0 text-[var(--pub-turquoise-500)]" />
                    <span className="text-xs font-bold text-[var(--pub-deep-900)]">{label}</span>
                  </div>
                ))}
              </div>

              <ArrowRight size={18} className="mx-auto shrink-0 rotate-90 text-[var(--pub-stone-300)] lg:mx-0 lg:rotate-0" aria-hidden />

              <div className="flex shrink-0 flex-col items-center gap-2 rounded-xl bg-[var(--pub-deep-900)] px-5 py-4 text-center text-white">
                <Sparkles size={16} className="text-[var(--pub-turquoise-300)]" />
                <span className="text-xs font-bold">Qualification Mbàmbulaan</span>
              </div>

              <ArrowRight size={18} className="mx-auto shrink-0 rotate-90 text-[var(--pub-stone-300)] lg:mx-0 lg:rotate-0" aria-hidden />

              <div className="flex shrink-0 flex-col items-center gap-2 rounded-xl border border-[var(--pub-stone-150)] bg-white px-5 py-4 text-center">
                <span className="text-xs font-bold text-[var(--pub-deep-900)]">Besoin structuré</span>
              </div>

              <ArrowRight size={18} className="mx-auto shrink-0 rotate-90 text-[var(--pub-stone-300)] lg:mx-0 lg:rotate-0" aria-hidden />

              <div className="flex shrink-0 flex-col items-center gap-2 rounded-xl bg-[var(--pub-turquoise-500)] px-5 py-4 text-center text-white">
                <Handshake size={16} />
                <span className="text-xs font-bold">Coordination</span>
              </div>
            </div>
            <p className="mt-6 text-xs leading-5 text-[var(--pub-stone-700)]">La situation est qualifiée avant toute mise en relation — les coordonnées de tiers ne sont jamais exposées comme un annuaire.</p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
