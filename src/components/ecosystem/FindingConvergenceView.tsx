import { ArrowDownToLine, CircleHelp, GitMerge, Link2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TrustBadge } from "@/components/shared/StatusBadges";
import {
  computeFindingConvergences,
  type FindingConvergenceReason,
  type FindingConvergenceUncertaintyReason
} from "@/domain/finding-convergence";
import { resolveSourceRefDisplay } from "@/domain/situation-narrative";
import {
  findingStatusLabels,
  findingTypeLabels,
  type Finding,
  type FindingSourceKind,
  type KnowledgeSourceRef,
  type ProductState
} from "@/domain/types";

const provenanceLabels: Record<FindingSourceKind, string> = {
  human: "Analyse humaine",
  rule: "Règle déterministe",
  llm: "Modèle de langage",
  statistical: "Traitement statistique",
  ml: "Modèle d’apprentissage"
};

const sourceTypeLabels: Record<KnowledgeSourceRef["objectType"], string> = {
  signal: "Signal",
  situation: "Situation",
  finding: "Constat",
  service_request: "Demande de service",
  evidence: "Preuve",
  infrastructure: "Infrastructure",
  vessel: "Navire",
  fishing_trip: "Sortie en mer",
  landing: "Débarquement",
  capacity: "Capacité",
  territory: "Territoire",
  site: "Site"
};

const uncertaintyLabels: Record<FindingConvergenceUncertaintyReason, string> = {
  knowledge_gap: "Connaissance manquante explicitement documentée",
  status_proposed: "Constat encore proposé",
  status_under_review: "Constat encore en cours de revue",
  trust_declaree: "Confiance déclarée",
  trust_estimee: "Confiance estimée",
  trust_contestee: "Confiance contestée",
  trust_expiree: "Confiance expirée"
};

function findingTitle(findings: Finding[], findingId: string): string {
  return findings.find((finding) => finding.id === findingId)?.title ?? "Constat référencé";
}

function Reason({ reason, findings, state }: { reason: FindingConvergenceReason; findings: Finding[]; state: ProductState }) {
  if (reason.kind === "explicit_finding_lineage") {
    return (
      <li className="flex items-start gap-2">
        <Link2 size={14} className="mt-0.5 shrink-0 text-[#1d4468]" />
        <span>
          « {findingTitle(findings, reason.findingId)} » cite explicitement « {findingTitle(findings, reason.referencedFindingId)} » comme constat source.
        </span>
      </li>
    );
  }

  const source = resolveSourceRefDisplay(state, reason.sourceRef);
  return (
    <li className="flex items-start gap-2">
      <GitMerge size={14} className="mt-0.5 shrink-0 text-[#1d4468]" />
      <span>
        {reason.findingIds.length} constats citent la même source structurée : « {source?.label ?? sourceTypeLabels[reason.sourceRef.objectType]} ».
      </span>
    </li>
  );
}

export function FindingConvergenceView({ state }: { state: ProductState }) {
  const groups = computeFindingConvergences(state);
  if (groups.length === 0) return null;

  return (
    <section aria-labelledby="documented-convergences-title" className="overflow-hidden rounded-2xl border border-[#1d4468]/20 bg-gradient-to-br from-[#f7f3e9]/55 via-white to-[#edf3f6]/65">
      <div className="border-b border-[#1d4468]/15 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="marine"><GitMerge size={12} /> Lecture transversale</Badge>
          <Badge variant="outline">Projection déterministe · mode démonstration</Badge>
        </div>
        <h2 id="documented-convergences-title" className="mt-3 font-serif text-xl font-bold text-[#0b1a2a]">Convergences documentées</h2>
        <p className="mt-1 max-w-3xl text-xs leading-5 text-muted-foreground">
          Mbàmbulaan rapproche ici des constats déjà reliés par leurs références structurées. Aucun rapprochement n’est déduit du seul territoire, du type de constat ou de la ressemblance des textes.
        </p>
      </div>

      <div className="space-y-6 p-4 sm:p-5">
        {groups.map((group) => {
          const territoryNames = group.territoryIds.map((id) => state.territories.find((territory) => territory.id === id)?.name ?? id);
          return (
            <article key={group.id} className="relative border-l-2 border-[#1d4468]/35 pl-4 sm:pl-5">
              <span className="absolute -left-[7px] top-0 size-3 rounded-full border-2 border-white bg-[#1d4468] shadow-sm" aria-hidden="true" />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1d4468]">{group.findings.length} constats reliés</p>
                  <h3 className="mt-1 text-base font-bold text-[#0b1a2a]">Convergence documentaire à examiner</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Territoires cités : {territoryNames.join(" · ")}</p>
                </div>
                <Badge variant="outline"><ShieldCheck size={12} /> Aucun score agrégé</Badge>
              </div>

              <div className="mt-4 grid gap-3 xl:grid-cols-2">
                {group.findings.map((finding) => (
                  <div key={finding.id} className="rounded-xl border bg-white/85 p-4 shadow-[0_8px_22px_rgba(11,26,42,0.04)]">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant={finding.type === "knowledge_gap" ? "amber" : "outline"}>{findingTypeLabels[finding.type]}</Badge>
                      <TrustBadge trust={finding.trust} />
                      <Badge variant="outline">{findingStatusLabels[finding.status]}</Badge>
                    </div>
                    <p className="mt-3 text-sm font-semibold leading-5 text-[#0b1a2a]">{finding.title}</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{finding.statement}</p>
                    <p className="mt-3 text-[11px] font-medium text-muted-foreground">Origine : {provenanceLabels[finding.provenance]}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <section className="rounded-xl border border-[#1d4468]/15 bg-white/65 p-4">
                  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#0b1a2a]"><GitMerge size={14} /> Pourquoi ces constats sont rapprochés</p>
                  <ul className="mt-2 space-y-2 text-xs leading-5 text-muted-foreground">
                    {group.reasons.map((reason, index) => <Reason key={`${group.id}:reason:${index}`} reason={reason} findings={group.findings} state={state} />)}
                  </ul>
                </section>

                <section className="rounded-xl border border-[#c68a2c]/30 bg-[#fffaf0] p-4">
                  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#755018]"><CircleHelp size={14} /> Ce qui reste incertain</p>
                  {group.uncertainties.length > 0 ? (
                    <ul className="mt-2 space-y-2 text-xs leading-5 text-muted-foreground">
                      {group.uncertainties.map((uncertainty) => {
                        const finding = group.findings.find((item) => item.id === uncertainty.findingId)!;
                        return (
                          <li key={uncertainty.findingId}>
                            <p className="font-semibold text-foreground">{finding.statement}</p>
                            <p className="mt-0.5">{uncertainty.reasons.map((reason) => uncertaintyLabels[reason]).join(" · ")}</p>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">Aucune incertitude additionnelle n’est portée par les champs structurés de ces constats. Cela ne transforme pas le rapprochement en certitude.</p>
                  )}
                </section>
              </div>

              <details className="group mt-4 rounded-xl border bg-white/80">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-bold text-[#0b1a2a] [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2"><ArrowDownToLine size={14} /> Examiner les sources sous-jacentes ({group.sources.length})</span>
                  <span className="text-[11px] font-medium text-muted-foreground group-open:hidden">Afficher</span>
                  <span className="hidden text-[11px] font-medium text-muted-foreground group-open:inline">Masquer</span>
                </summary>
                <div className="divide-y border-t">
                  {group.sources.map((source) => {
                    const resolved = resolveSourceRefDisplay(state, source.ref);
                    return (
                      <div key={`${source.ref.objectType}:${source.ref.objectId}`} className="grid gap-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground">{resolved?.label ?? sourceTypeLabels[source.ref.objectType]}</p>
                          {resolved?.detail && <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{resolved.detail}</p>}
                          <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{sourceTypeLabels[source.ref.objectType]} · citée par {source.findingIds.length} constat{source.findingIds.length > 1 ? "s" : ""}</p>
                        </div>
                        {source.trust ? <TrustBadge trust={source.trust} /> : <Badge variant="outline">Confiance non portée par ce type de source</Badge>}
                      </div>
                    );
                  })}
                </div>
              </details>

              <p className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-muted-foreground">
                <ShieldCheck size={13} className="mt-0.5 shrink-0" /> {group.decisionBoundary}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
