"use client";

import { useMemo, useState } from "react";
import type { AppState } from "../../state";
import { V3_FONT_MONO, V3_FONT_SANS, V3_FONT_SERIF } from "../../theme";
import { useDomainRuntime } from "../../lib/domain-runtime";
import {
  getOpportunities,
  getOpportunityDetail,
  OPPORTUNITY_UI_STEPS,
  type OpportunityUiStep
} from "../../lib/opportunity-bridge";
import { buildSituationRows } from "../../lib/situations-bridge";

type Patch = (patch: Partial<AppState>) => void;
type StepFilter = OpportunityUiStep | "Toutes";

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "date non renseignée" : date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

const STEP_NOTES: Record<OpportunityUiStep, string> = {
  "Repérée": "Signal à instruire",
  "En instruction": "Informations en cours",
  "Qualifiée": "Prête pour arbitrage",
  "Arbitrée": "Décision enregistrée"
};

function StepTrack({ index, compact = false }: { index: number; compact?: boolean }) {
  return (
    <div className="pv3-b2-step-track" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 3 }}>
      {OPPORTUNITY_UI_STEPS.map((step, i) => (
        <div key={step}>
          <div style={{ height: compact ? 2 : 3, background: i <= index ? "#B6522F" : "rgba(11,26,42,.14)", marginBottom: compact ? 4 : 7 }} />
          {!compact && <div style={{ fontSize: 10.5, fontWeight: i === index ? 700 : 450, color: i === index ? "#0B1A2A" : "rgba(11,26,42,.46)" }}>{step}</div>}
        </div>
      ))}
    </div>
  );
}

function DetailColumn({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <section style={{ minWidth: 0 }}>
      <div style={{ fontSize: 10, letterSpacing: ".11em", textTransform: "uppercase", color: "rgba(11,26,42,.48)", marginBottom: 10 }}>{title}</div>
      {items.length > 0 ? items.map((item, index) => (
        <div key={`${item}-${index}`} style={{ borderLeft: "2px solid rgba(182,82,47,.28)", paddingLeft: 10, fontSize: 12.5, lineHeight: 1.5, marginBottom: 9 }}>{item}</div>
      )) : <div style={{ fontSize: 12, lineHeight: 1.5, color: "rgba(11,26,42,.5)" }}>{empty}</div>}
    </section>
  );
}

export function Opportunites({
  state,
  patch,
  onOpenProgramme
}: {
  state: AppState;
  patch: Patch;
  onOpenProgramme: (progId: number) => void;
}) {
  const runtime = useDomainRuntime();
  const liveState = runtime.state ?? undefined;
  const all = useMemo(() => getOpportunities(liveState), [liveState]);
  const situationRows = useMemo(() => liveState ? buildSituationRows(liveState) : [], [liveState]);
  const [stepFilter, setStepFilter] = useState<StepFilter>(state.oppFilter === "rep" ? "Repérée" : state.oppFilter === "ins" ? "En instruction" : "Toutes");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = stepFilter === "Toutes" ? all : all.filter((item) => item.uiStep === stepFilter);
  const activeId = rows.some((item) => item.id === selectedId) ? selectedId : rows[0]?.id ?? null;
  const detail = activeId ? getOpportunityDetail(activeId, liveState) : undefined;
  const stepCounts = OPPORTUNITY_UI_STEPS.map((step) => all.filter((item) => item.uiStep === step).length);

  const openTerritory = (territoryId: string) => {
    patch({ screen: "territoires", terrView: "detail", terrSel: territoryId, terrFromAtlas: false, oppOpen: null });
    window.scrollTo(0, 0);
  };
  const openSituation = (realId: string) => {
    const row = situationRows.find((item) => item.realId === realId);
    if (!row) return;
    patch({ screen: "situations", sitOpen: row.id, territoryFilterId: null, oppOpen: null });
    window.scrollTo(0, 0);
  };

  return (
    <div className="pv3-rise" style={{ fontFamily: V3_FONT_SANS }}>
      <div style={{ padding: "20px clamp(20px,3vw,42px) 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "rgba(11,26,42,.52)" }}>
          <span>Espace État</span><span aria-hidden="true">›</span><span>Pilotage</span><span aria-hidden="true">›</span><strong style={{ color: "#0B1A2A" }}>Opportunités</strong>
        </div>
        <button type="button" className="pv3-outline-action" onClick={() => patch({ presentOpen: true })}>Présentation</button>
      </div>

      <div style={{ padding: "9px clamp(20px,3vw,42px)", background: "rgba(11,26,42,.04)", borderTop: "1px solid rgba(11,26,42,.08)", borderBottom: "1px solid rgba(11,26,42,.08)", fontSize: 11.5, color: "rgba(11,26,42,.6)", display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4E7B5A" }} />
        Données de démonstration — structure réelle, valeurs illustratives
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(28px,4vw,48px) clamp(20px,3vw,42px) 72px" }}>
        <div style={{ fontSize: 10.5, letterSpacing: ".13em", textTransform: "uppercase", color: "#B6522F", fontWeight: 650, marginBottom: 10 }}>Pilotage · Opportunités</div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap", marginBottom: 25 }}>
          <div>
            <h1 style={{ fontWeight: 620, fontSize: "clamp(30px,4vw,48px)", lineHeight: 1.05, letterSpacing: "-.035em", margin: "0 0 12px", maxWidth: 820 }}>Pistes en cours d’instruction</h1>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "rgba(11,26,42,.7)", maxWidth: "70ch" }}>Chaque piste reste une hypothèse jusqu’à qualification. Les faits, inconnues et relations affichés proviennent du domaine RC1.</p>
          </div>
          <div style={{ fontFamily: V3_FONT_MONO, fontSize: 13, color: "rgba(11,26,42,.55)" }}>{all.length} dossiers</div>
        </div>

        <div className="pv3-b2-pipeline" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 8, marginBottom: 24 }}>
          {OPPORTUNITY_UI_STEPS.map((step, index) => {
            const active = stepFilter === step;
            return (
              <button key={step} type="button" aria-pressed={active} onClick={() => setStepFilter(active ? "Toutes" : step)} style={{ border: `1px solid ${active ? "#0B1A2A" : "rgba(11,26,42,.15)"}`, borderTop: `3px solid ${index <= 1 ? "#B6522F" : index === 2 ? "#D89A4A" : "#4E7B5A"}`, background: active ? "#0B1A2A" : "#fff", color: active ? "#F7F3E9" : "#0B1A2A", padding: "13px 14px", textAlign: "left", cursor: "pointer", minWidth: 0 }}>
                <span style={{ display: "block", fontFamily: V3_FONT_MONO, fontSize: 22, lineHeight: 1, marginBottom: 6 }}>{stepCounts[index]}</span>
                <strong style={{ display: "block", fontSize: 12.5 }}>{step}</strong>
                <span style={{ display: "block", marginTop: 3, fontSize: 10.5, opacity: .62 }}>{STEP_NOTES[step]}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 10, fontSize: 11.5, color: "rgba(11,26,42,.55)" }}>
          <span>{stepFilter === "Toutes" ? "Toutes les étapes" : stepFilter}</span>
          <button type="button" onClick={() => setStepFilter("Toutes")} disabled={stepFilter === "Toutes"} style={{ border: 0, background: "transparent", color: "#B6522F", cursor: stepFilter === "Toutes" ? "default" : "pointer", opacity: stepFilter === "Toutes" ? .4 : 1 }}>Réinitialiser</button>
        </div>

        <div className="pv3-b2-master-detail" style={{ display: "grid", gridTemplateColumns: "380px minmax(0,1fr)", border: "1px solid rgba(11,26,42,.13)", alignItems: "start" }}>
          <div className="pv3-b2-master-list" style={{ minWidth: 0, borderRight: "1px solid rgba(11,26,42,.13)", background: "#fff" }}>
            {rows.map((opportunity) => (
              <button key={opportunity.id} type="button" onClick={() => setSelectedId(opportunity.id)} aria-pressed={opportunity.id === activeId} style={{ display: "block", width: "100%", border: 0, borderBottom: "1px solid rgba(11,26,42,.08)", background: opportunity.id === activeId ? "rgba(182,82,47,.07)" : "#fff", boxShadow: opportunity.id === activeId ? "inset 3px 0 #B6522F" : "none", padding: "15px 16px", textAlign: "left", cursor: "pointer", color: "#0B1A2A" }}>
                <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ border: "1px solid #B6522F", color: "#B6522F", padding: "2px 7px", fontSize: 9.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase" }}>Hypothèse</span>
                  <span style={{ fontSize: 10.5, color: "rgba(11,26,42,.52)" }}>{opportunity.territoryNames.join(" · ")}</span>
                </span>
                <strong style={{ display: "block", fontSize: 13.5, lineHeight: 1.35, marginBottom: 8 }}>{opportunity.problem}</strong>
                <StepTrack index={opportunity.uiStepIndex} compact />
                <span style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 7, fontSize: 10.5, color: "rgba(11,26,42,.54)" }}>
                  <span>{opportunity.uiStep}</span><span>{opportunity.missingCount ? `${opportunity.missingCount} manque${opportunity.missingCount > 1 ? "s" : ""}` : "Dossier renseigné"}</span>
                </span>
              </button>
            ))}
            {rows.length === 0 && <div style={{ padding: 24, fontSize: 12.5, lineHeight: 1.5, color: "rgba(11,26,42,.58)" }}>Aucune opportunité à cette étape.</div>}
          </div>

          {detail ? (
            <article style={{ minWidth: 0, background: "#fff" }}>
              <div style={{ padding: "22px clamp(18px,3vw,30px)", borderBottom: "1px solid rgba(11,26,42,.1)" }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                  <span style={{ border: "1px solid #B6522F", color: "#B6522F", padding: "3px 8px", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Hypothèse</span>
                  <span style={{ border: "1px solid rgba(11,26,42,.18)", padding: "3px 8px", fontSize: 10 }}>{detail.statusLabel}</span>
                  <span style={{ border: "1px solid rgba(11,26,42,.18)", padding: "3px 8px", fontSize: 10 }}>Maturité · {detail.maturity}</span>
                </div>
                <h2 style={{ fontFamily: V3_FONT_SERIF, fontSize: "clamp(24px,3vw,34px)", lineHeight: 1.12, letterSpacing: "-.025em", margin: "0 0 8px" }}>{detail.problem}</h2>
                <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.5)", marginBottom: 10 }}>Repérée le {formatDate(detail.createdAt)} · {detail.territoryNames.join(" · ")} · Bénéficiaires potentiels : {detail.potentialBeneficiaries}</div>
                <p style={{ margin: "0 0 18px", fontSize: 13, lineHeight: 1.55, color: "rgba(11,26,42,.65)" }}>{detail.justification}</p>
                <StepTrack index={detail.uiStepIndex} />
                <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 18 }}>
                  <button type="button" onClick={() => patch({ oppOpen: detail.id })} style={{ border: "1px solid #0B1A2A", background: "#0B1A2A", color: "#F7F3E9", padding: "9px 14px", fontSize: 12, fontWeight: 650, cursor: "pointer" }}>Ouvrir la fiche actionnable</button>
                  {detail.uiStepIndex >= 2 && <button type="button" onClick={() => patch({ screen: "arbitrages" })} className="pv3-outline-action">Voir dans Arbitrages</button>}
                </div>
              </div>

              <div className="pv3-b2-detail-columns" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 24, padding: "22px clamp(18px,3vw,30px)", borderBottom: "1px solid rgba(11,26,42,.1)" }}>
                <DetailColumn title="Faits établis" items={detail.establishedFacts} empty="Aucun fait distinct documenté." />
                <DetailColumn title="Hypothèses" items={detail.hypotheses} empty="Aucune hypothèse complémentaire documentée." />
                <DetailColumn title="À qualifier" items={detail.knowledgeGaps} empty="Aucun manque déclaré." />
              </div>

              <div style={{ padding: "20px clamp(18px,3vw,30px)", borderBottom: "1px solid rgba(11,26,42,.1)" }}>
                <div style={{ fontSize: 10, letterSpacing: ".11em", textTransform: "uppercase", color: "#B6522F", marginBottom: 8 }}>Valeur potentielle — hypothèse non estimée</div>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55 }}>{detail.potentialValueHypothesis ?? "Aucune valeur potentielle chiffrée ou qualifiée à ce stade."}</p>
                <div className="pv3-b2-detail-columns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 18 }}>
                  <DetailColumn title="Interventions possibles" items={detail.possibleInterventions} empty="Aucune intervention documentée." />
                  <DetailColumn title="Résultats recherchés" items={detail.desiredOutcomes} empty="Aucun résultat documenté." />
                </div>
              </div>

              <div style={{ padding: "18px clamp(18px,3vw,30px) 24px" }}>
                <div style={{ fontSize: 10, letterSpacing: ".11em", textTransform: "uppercase", color: "rgba(11,26,42,.48)", marginBottom: 10 }}>Objets métier liés</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {detail.territoryIds.map((territoryId, index) => <button key={territoryId} type="button" className="pv3-outline-action" onClick={() => openTerritory(territoryId)}>Territoire · {detail.territoryNames[index] ?? territoryId} →</button>)}
                  {detail.situationIds.map((situationId, index) => <button key={situationId} type="button" className="pv3-outline-action" onClick={() => openSituation(situationId)}>Situation · {detail.situationTitles[index] ?? situationId} →</button>)}
                  {detail.decision && <button type="button" className="pv3-outline-action" onClick={() => patch({ screen: "arbitrages" })}>Décision · {detail.decision.label} →</button>}
                  {/* Correction B (fix/etat-ux-b1b2-regressions) — detail.initiativeId
                      seul ne suffisait pas : screen:"programmes" route vers
                      Portfolio/ProgrammeDetail depuis Architecture Recovery R1, qui ne
                      lisent jamais initiativeFocusId (seul Initiatives.tsx, non routé,
                      le lit) — le clic atterrissait sur le Portfolio générique sans le
                      programme visé. programmeFixtureId est l'identifiant réel que
                      comprend onOpenProgramme ; le lien n'apparaît pas sans lui plutôt
                      que de promettre un programme qu'il ne peut pas ouvrir. */}
                  {detail.programmeFixtureId != null && (
                    <button type="button" className="pv3-outline-action" onClick={() => onOpenProgramme(detail.programmeFixtureId!)}>
                      Programme lié →
                    </button>
                  )}
                </div>
                {(detail.siteNames.length > 0 || detail.involvedActorNames.length > 0) && <div style={{ marginTop: 12, fontSize: 11.5, lineHeight: 1.5, color: "rgba(11,26,42,.55)" }}>{detail.siteNames.length > 0 ? `Sites · ${detail.siteNames.join(", ")}` : ""}{detail.siteNames.length > 0 && detail.involvedActorNames.length > 0 ? " · " : ""}{detail.involvedActorNames.length > 0 ? `Acteurs · ${detail.involvedActorNames.join(", ")}` : ""}</div>}
              </div>
            </article>
          ) : <div style={{ padding: 28, color: "rgba(11,26,42,.55)" }}>Sélectionnez une opportunité.</div>}
        </div>
      </div>
    </div>
  );
}
