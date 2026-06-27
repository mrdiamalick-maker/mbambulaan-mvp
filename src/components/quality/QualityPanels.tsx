import Link from "next/link";
import type { ReactNode } from "react";
import type { Arrivage } from "@/lib/arrivages";
import type { Besoin } from "@/lib/besoins";
import { computeMatching, computeTransactions } from "@/lib/coordination";
import type { Opportunite, Transaction } from "@/lib/coordination";
import { computeSensitiveLots, computeLotsQuality, getQualityTone, getWasteRiskTone } from "@/lib/quality";
import type { LotQuality } from "@/lib/quality";
import { StatusBadge as UiStatusBadge } from "@/components/ui/StatusBadge";
import type { StatusTone } from "@/components/ui/StatusBadge";

type QualityContext = {
  arrivages: Arrivage[];
  besoins?: Besoin[];
  opportunites?: Opportunite[];
  transactions?: Transaction[];
};

export function ArrivagesQualitySection({ arrivages, besoins = [], opportunites = [] }: QualityContext) {
  const qualities = computeLotsQuality(arrivages, { besoins, opportunites });

  return (
    <QualityBand title="Qualité des lots" eyebrow="Fraîcheur et risque" description="Chaque lot est évalué selon son heure d'arrivée, son quai, son statut, les tensions territoriales et les opportunités existantes.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {qualities.map((quality) => (
          <QualityCard key={quality.lotId} quality={quality} />
        ))}
      </div>
    </QualityBand>
  );
}

export function OpportunityQualitySection({ opportunite }: { opportunite: Opportunite }) {
  const quality = computeLotsQuality(
    [
      {
        id: opportunite.arrivageId,
        espece: opportunite.espece,
        quai: opportunite.offre.quai,
        quantite: opportunite.offre.quantite,
        heureDebarquement: opportunite.offre.heureDebarquement,
        vendeur: opportunite.offre.vendeur,
        statut: opportunite.offre.statut as Arrivage["statut"]
      }
    ],
    { opportunites: [opportunite] }
  )[0];

  return (
    <QualityBand title="Qualité du lot" eyebrow="Décision métier" description="Le lot lié à cette opportunité est évalué avant réservation ou transaction.">
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <QualityCard quality={quality} />
        <FactorList quality={quality} />
      </div>
    </QualityBand>
  );
}

export function TransactionsQualitySection({ arrivages, opportunites = [] }: QualityContext) {
  const statusByOpportunityId = Object.fromEntries(opportunites.slice(0, 3).map((opportunite) => [opportunite.id, "Réservée" as const]));
  const transactions = computeTransactions(opportunites, statusByOpportunityId);
  const qualities = computeLotsQuality(arrivages, { opportunites, transactions }).filter((quality) => opportunites.some((opportunite) => opportunite.arrivageId === quality.arrivageId));

  return (
    <QualityBand title="Qualité des lots transactionnés" eyebrow="Transactions" description="Les lots liés à une opportunité affichent leur niveau de risque pour accélérer le suivi opérationnel.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {qualities.slice(0, 6).map((quality) => (
          <QualityCard key={quality.lotId} quality={quality} />
        ))}
      </div>
    </QualityBand>
  );
}

export function DashboardSensitiveLotsSection({ arrivages, besoins = [], opportunites = [], transactions = [] }: QualityContext) {
  const sensitiveLots = computeSensitiveLots(arrivages, { besoins, opportunites, transactions });

  return (
    <QualityBand title="Lots sensibles à traiter" eyebrow="Impact immédiat" description="Les lots présentant un risque de perte ou une fraîcheur à surveiller sont remontés pour décision rapide.">
      <div className="grid gap-4 lg:grid-cols-3">
        {sensitiveLots.slice(0, 6).map((quality) => (
          <QualityCard key={quality.lotId} quality={quality} compact />
        ))}
      </div>
    </QualityBand>
  );
}

export function CoordinationQualityPanel({ arrivages, besoins = [], opportunites = [], transactions = [] }: QualityContext) {
  const sensitiveLots = computeSensitiveLots(arrivages, { besoins, opportunites, transactions });

  return (
    <QualityBand title="Qualité et risque de perte" eyebrow="Coordination" description="Le centre de coordination priorise les lots qui doivent être réservés, transformés ou mieux conservés.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sensitiveLots.slice(0, 5).map((quality) => (
          <QualityCard key={quality.lotId} quality={quality} compact />
        ))}
      </div>
    </QualityBand>
  );
}

export function DemoQualityCard({ arrivages, besoins = [] }: QualityContext) {
  const opportunites = computeMatching(arrivages, besoins);
  const sensitiveLots = computeSensitiveLots(arrivages, { besoins, opportunites });
  const highlighted = sensitiveLots[0];

  return (
    <QualityBand title="Mbàmbulaan aide à sauver les lots sensibles" eyebrow="Qualité métier" description="La démonstration montre comment le moteur détecte le risque de perte et recommande une action simple.">
      {highlighted ? (
        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <QualityCard quality={highlighted} />
          <FactorList quality={highlighted} />
        </div>
      ) : (
        <p className="rounded-2xl bg-white p-5 text-sm font-black text-[#14312d]/70">Aucun lot sensible détecté sur les données mock actuelles.</p>
      )}
    </QualityBand>
  );
}

function QualityBand({ children, description, eyebrow, title }: { children: ReactNode; description: string; eyebrow: string; title: string }) {
  return (
    <section className="bg-[#f7f4ec] px-5 py-8 text-[#14312d] sm:px-8">
      <div className="mx-auto max-w-7xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">{eyebrow}</p>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-black">{title}</h2>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#14312d]/65">{description}</p>
          </div>
          <Link href="/dashboard" className="w-fit rounded-full border border-[#14312d]/15 px-4 py-2 text-sm font-black transition hover:border-[#14312d]">
            Voir dashboard
          </Link>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

function QualityCard({ compact = false, quality }: { compact?: boolean; quality: LotQuality }) {
  return (
    <article className="rounded-2xl bg-[#f7f4ec] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{quality.lotId}</p>
          <h3 className="mt-2 text-xl font-black">{quality.espece}</h3>
          <p className="mt-1 text-sm font-semibold text-[#14312d]/65">{quality.quai}</p>
        </div>
        <QualityBadge score={quality.score} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <RiskBadge risk={quality.risqueGaspillage} />
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#14312d]/65 ring-1 ring-[#14312d]/10">{quality.fraicheur}</span>
      </div>
      <p className="mt-4 text-sm font-bold leading-6 text-[#14312d]/70">{quality.actionRecommandee}</p>
      {!compact ? <FactorList quality={quality} /> : null}
    </article>
  );
}

function FactorList({ quality }: { quality: LotQuality }) {
  return (
    <div className="rounded-2xl bg-[#f7f4ec] p-5">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">Facteurs du score</p>
      <ul className="mt-3 grid gap-2">
        {quality.facteurs.map((factor) => (
          <li key={factor} className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#14312d]/70">
            {factor}
          </li>
        ))}
      </ul>
    </div>
  );
}

function QualityBadge({ score }: { score: number }) {
  return <UiStatusBadge tone={qualityToneMap[getQualityTone(score)]}>{score}% qualité</UiStatusBadge>;
}

function RiskBadge({ risk }: { risk: Parameters<typeof getWasteRiskTone>[0] }) {
  return <UiStatusBadge tone={riskToneMap[getWasteRiskTone(risk)]}>Risque {risk.toLowerCase()}</UiStatusBadge>;
}

const qualityToneMap: Record<ReturnType<typeof getQualityTone>, StatusTone> = {
  green: "success",
  orange: "warning",
  red: "danger"
};

const riskToneMap: Record<ReturnType<typeof getWasteRiskTone>, StatusTone> = {
  low: "success",
  medium: "warning",
  high: "impact",
  critical: "danger"
};
