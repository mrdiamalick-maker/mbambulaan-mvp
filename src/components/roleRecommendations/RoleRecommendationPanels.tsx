import Link from "next/link";
import type { ReactNode } from "react";
import { getRecommendationLevelTone } from "@/lib/roleRecommendations";
import type { RoleRecommendation, RoleRecommendationRole } from "@/lib/roleRecommendations";

export function RoleRecommendationsSection({ recommendations, title = "Recommandations par rôle" }: { recommendations: RoleRecommendation[]; title?: string }) {
  return (
    <RecommendationBand title={title} eyebrow="Recommandations acteurs" description="Mbàmbulaan adapte les actions proposées selon le métier, le niveau d'urgence et l'impact attendu.">
      <div className="grid gap-4 lg:grid-cols-2">
        {recommendations.map((recommendation) => (
          <RecommendationCard key={recommendation.id} recommendation={recommendation} />
        ))}
      </div>
    </RecommendationBand>
  );
}

export function RoleRecommendationsByRoleSection({ recommendations, role }: { recommendations: RoleRecommendation[]; role: RoleRecommendationRole }) {
  return <RoleRecommendationsSection recommendations={recommendations} title={`Recommandations ${role}`} />;
}

export function DemoRoleRecommendationCard({ recommendations }: { recommendations: RoleRecommendation[] }) {
  return (
    <RecommendationBand title="Mbàmbulaan adapte les recommandations à chaque acteur" eyebrow="Intelligence par rôle" description="Le même écosystème produit des conseils différents pour le pêcheur, le mareyeur, le transformateur, la collectivité et l'administration.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {recommendations.slice(0, 5).map((recommendation) => (
          <RecommendationCard key={recommendation.id} recommendation={recommendation} compact />
        ))}
      </div>
    </RecommendationBand>
  );
}

export function CoordinationRoleRecommendationsPanel({ recommendations }: { recommendations: RoleRecommendation[] }) {
  return (
    <RecommendationBand title="Recommandations acteurs" eyebrow="Coordination" description="Le centre de coordination voit les actions prioritaires à proposer aux différents profils de la filière.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {recommendations.slice(0, 6).map((recommendation) => (
          <RecommendationCard key={recommendation.id} recommendation={recommendation} compact />
        ))}
      </div>
    </RecommendationBand>
  );
}

function RecommendationBand({ children, description, eyebrow, title }: { children: ReactNode; description: string; eyebrow: string; title: string }) {
  return (
    <section className="bg-[#f7f4ec] px-5 py-8 text-[#14312d] sm:px-8">
      <div className="mx-auto max-w-7xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">{eyebrow}</p>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-black">{title}</h2>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#14312d]/65">{description}</p>
          </div>
          <Link href="/espaces" className="w-fit rounded-full border border-[#14312d]/15 px-4 py-2 text-sm font-black transition hover:border-[#14312d]">
            Voir espaces
          </Link>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

function RecommendationCard({ compact = false, recommendation }: { compact?: boolean; recommendation: RoleRecommendation }) {
  return (
    <article className="rounded-2xl bg-[#f7f4ec] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{recommendation.role} · {recommendation.moduleCible}</p>
          <h3 className="mt-2 text-xl font-black">{recommendation.titre}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#14312d]/70">{recommendation.description}</p>
        </div>
        <LevelBadge level={recommendation.niveau} />
      </div>
      {!compact ? (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <RecommendationDetail label="Action" value={recommendation.actionRecommandee} />
          <RecommendationDetail label="Quai" value={recommendation.quai} />
          <RecommendationDetail label="Impact" value={recommendation.impactAttendu} />
        </div>
      ) : (
        <p className="mt-3 text-sm font-black text-[#14312d]/60">{recommendation.quai} · {recommendation.espece}</p>
      )}
      <Link href={recommendation.lienMetier} className="mt-4 inline-flex rounded-full bg-[#14312d] px-4 py-2 text-xs font-black text-white transition hover:bg-[#1e4a43]">
        Voir
      </Link>
    </article>
  );
}

function RecommendationDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-4 py-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{label}</p>
      <p className="mt-1 text-sm font-bold leading-6 text-[#14312d]/70">{value}</p>
    </div>
  );
}

function LevelBadge({ level }: { level: RoleRecommendation["niveau"] }) {
  const styles: Record<ReturnType<typeof getRecommendationLevelTone>, string> = {
    info: "bg-[#dbeafe] text-[#174ea6] ring-[#93c5fd]",
    high: "bg-[#fff3bf] text-[#7a4f00] ring-[#ffd43b]",
    critical: "bg-[#ffe3e3] text-[#9b1c1c] ring-[#ffa8a8]"
  };

  return <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ring-1 ${styles[getRecommendationLevelTone(level)]}`}>{level}</span>;
}
