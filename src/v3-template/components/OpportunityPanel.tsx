"use client";

import { useEffect, useState } from "react";
import type { AppState } from "../state";
import { V3_FONT_SANS, V3_FONT_SERIF, paper_a } from "../theme";
import { useDomainRuntime } from "../lib/domain-runtime";
import { getOpportunityDetail, OPPORTUNITY_UI_STEPS } from "../lib/opportunity-bridge";

// OpportunityPanel (G2.1) — panneau compact partagé entre la fiche
// territoire et l'écran Opportunités (mandat §5 : "side panel compact,
// plein écran mobile"), même discipline d'overlay que DocumentView/
// PresentationView (App.tsx) : une capability en recouvrement, pas un
// nouvel écran. Les deux seules transitions réellement actionnables
// depuis ce panneau (Repérée → En instruction → Qualifiée) dispatchent
// update_program_opportunity_status, déjà autorisée pour le rôle
// "institution" (server/permissions.ts) — jamais une mutation locale qui
// ne vivrait que dans le state React (doctrine domain-runtime.ts).
// Au-delà de "Qualifiée", l'arbitrage réel se fait sur Arbitrages (lien),
// pas depuis ce panneau (mandat : ne pas refondre Arbitrages).
export function OpportunityPanel({
  oppId,
  patch,
  onClose,
  onOpenProgramme
}: {
  oppId: string;
  patch: (p: Partial<AppState>) => void;
  onClose: () => void;
  onOpenProgramme: (progId: number) => void;
}) {
  const runtime = useDomainRuntime();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const detail = getOpportunityDetail(oppId, runtime.state ?? undefined);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!detail) return null;

  const advance = async () => {
    if (detail.status !== "detected" && detail.status !== "qualifying") return;
    setBusy(true);
    setError(null);
    try {
      await runtime.dispatch({
        type: "update_program_opportunity_status",
        programOpportunityId: oppId,
        status: detail.status === "detected" ? "qualifying" : "qualified",
        note: detail.status === "detected" ? "Instruction ouverte." : "Transmise pour qualification."
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action refusée.");
    } finally {
      setBusy(false);
    }
  };

  // ctaLabel (RC1, audit de fonctionnalité) — "Instruction qualifiée"
  // couvrait jusqu'ici indifféremment qualified/pending_arbitration/
  // designing/converted_to_program/rejected/paused : un dossier réellement
  // rejeté ou en pause s'affichait comme simplement "qualifié", ce qui
  // laissait croire l'instruction toujours en cours. detail.statusLabel
  // (programOpportunityStatusLabels, domain/types.ts) porte déjà le
  // libellé honnête par statut réel, jamais un texte fabriqué ici.
  const ctaLabel = detail.status === "detected" ? "Ouvrir l’instruction" : detail.status === "qualifying" ? "Transmettre pour qualification" : detail.statusLabel;
  const ctaDisabled = detail.status !== "detected" && detail.status !== "qualifying";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(11,26,42,.45)" }} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Opportunité · ${detail.territoryNames[0] ?? ""}`}
        style={{
          position: "relative", width: "min(560px,92vw)", maxWidth: "100vw", height: "100vh", overflowY: "auto",
          background: "#fff", boxShadow: "-8px 0 30px rgba(11,26,42,.2)", padding: "26px clamp(20px,4vw,30px) 42px", fontFamily: V3_FONT_SANS
        }}
        className="pv3-opp-panel"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, paddingBottom: 14, borderBottom: "1px solid rgba(11,26,42,.12)", marginBottom: 20 }}>
          <div style={{ fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "#B6522F", fontWeight: 700 }}>Opportunité · {detail.territoryNames.join(", ")}</div>
          <button type="button" onClick={onClose} aria-label="Fermer" style={{ border: "1px solid rgba(11,26,42,.18)", width: 32, height: 32, background: "#fff", cursor: "pointer", fontSize: 20, lineHeight: 1, color: "rgba(11,26,42,.65)" }}>×</button>
        </div>

        <h2 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 650, fontSize: 28, lineHeight: 1.12, letterSpacing: "-.025em", margin: "0 0 8px" }}>{detail.problem}</h2>
        <div style={{ fontSize: 12.5, lineHeight: 1.45, color: "rgba(11,26,42,.55)", marginBottom: 20 }}>{detail.subLabel}</div>

        <div style={{ display: "flex", gap: 2, marginBottom: 18 }}>
          {OPPORTUNITY_UI_STEPS.map((step, i) => (
            <div key={step} style={{ flex: 1 }}>
              <div style={{ height: 2, background: i <= detail.uiStepIndex ? "#B6522F" : "rgba(11,26,42,.15)", marginBottom: 6 }} />
              <div style={{ fontSize: 11, fontWeight: i === detail.uiStepIndex ? 600 : 400, color: i === detail.uiStepIndex ? "#0B1A2A" : "#4C5566" }}>{step}</div>
            </div>
          ))}
        </div>

        <div style={{ border: "1px dashed #B6522F", background: "rgba(182,82,47,.045)", padding: "11px 14px", fontSize: 12.5, lineHeight: 1.5, marginBottom: 22 }}>
          <strong style={{ color: "#B6522F" }}>Hypothèse à instruire.</strong> Faisabilité, volumes, emplois et rentabilité ne sont pas établis. Ils restent « à qualifier » jusqu’à instruction.
        </div>

        <PanelSection title="Hypothèse"><p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>{detail.justification}</p></PanelSection>

        {detail.establishedFacts.length > 0 && (
          <PanelSection title="Établi à ce jour">
            {detail.establishedFacts.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, lineHeight: 1.5, marginBottom: 6 }}>
                <span style={{ color: "rgba(11,26,42,.5)" }}>○</span>
                <span>{f}</span>
              </div>
            ))}
          </PanelSection>
        )}

        {detail.potentialValueHypothesis && (
          <PanelSection title="Valeur potentielle">
            <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: "rgba(11,26,42,.75)" }}>{detail.potentialValueHypothesis}</p>
          </PanelSection>
        )}

        {detail.knowledgeGaps.length > 0 && (
          <PanelSection title="Informations manquantes">
            {detail.knowledgeGaps.map((g, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(11,26,42,.07)" }}>
                <span style={{ fontSize: 13, color: "rgba(11,26,42,.8)" }}>{g}</span>
              </div>
            ))}
          </PanelSection>
        )}

        {(detail.territoryIds.length > 0 || detail.situationTitles.length > 0 || detail.siteNames.length > 0) && (
          <PanelSection title="Objets liés">
            {detail.territoryIds.map((territoryId, index) => (
              <button
                key={territoryId}
                type="button"
                onClick={() => patch({ screen: "territoires", terrView: "detail", terrSel: territoryId, terrFromAtlas: false, oppOpen: null })}
                style={{ display: "block", width: "100%", textAlign: "left", border: "1px solid rgba(11,26,42,.16)", background: "#fff", color: "#0B1A2A", cursor: "pointer", padding: "9px 11px", marginBottom: 6, fontSize: 12.5, fontWeight: 600 }}
              >
                Territoire · {detail.territoryNames[index] ?? territoryId} →
              </button>
            ))}
            {detail.siteNames.map((site) => <div key={site} style={{ fontSize: 12, color: "rgba(11,26,42,.62)", padding: "4px 0" }}>Site · {site}</div>)}
            {detail.situationTitles.map((situation) => <div key={situation} style={{ fontSize: 12, color: "rgba(11,26,42,.62)", padding: "4px 0" }}>Situation · {situation}</div>)}
          </PanelSection>
        )}

        {detail.involvedActorNames.length > 0 && (
          <PanelSection title="Acteurs à associer">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {detail.involvedActorNames.map((a) => (
                <span key={a} style={{ border: "1px solid rgba(11,26,42,.2)", borderRadius: 4, padding: "5px 10px", fontSize: 12 }}>{a}</span>
              ))}
            </div>
          </PanelSection>
        )}

        <PanelSection title="Rôle de Mbàmbulaan">
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "rgba(11,26,42,.75)" }}>
            Mbàmbulaan documente la piste, réunit les informations et met les acteurs en relation. Il ne porte pas l’activité lui-même.
          </p>
        </PanelSection>

        {detail.decision && (
          <PanelSection title="Décision d’arbitrage">
            <div style={{ background: paper_a(1), border: "1px solid rgba(11,26,42,.1)", padding: "10px 14px", fontSize: 12.5, lineHeight: 1.5 }}>
              <strong>{detail.decision.label}</strong> — {detail.decision.rationale}
            </div>
          </PanelSection>
        )}

        {/* G2.3 §3 — "retenue ≠ exécutée" : une opportunité réellement
            retenue (designing/converted_to_program) n'implique pas
            qu'une Initiative existe déjà. Le lien n'apparaît QUE si
            initiativeId est réel (Initiative.programOpportunityId) ;
            sinon un constat honnête, jamais un programme fabriqué.
            Correction B (fix/etat-ux-b1b2-regressions) — initiativeId
            seul ne suffisait pas : screen:"programmes" route vers
            Portfolio/ProgrammeDetail depuis Architecture Recovery R1, qui
            ne lisent jamais initiativeFocusId (seul Initiatives.tsx, non
            routé, le lit) — le clic atterrissait sur le Portfolio
            générique sans l'Initiative visée. programmeFixtureId est
            l'identifiant réel que comprend onOpenProgramme ; sans lui, le
            constat honnête reste affiché plutôt qu'un bouton mort. */}
        {detail.outcome === "retenue" && (
          <PanelSection title="Initiative">
            {detail.programmeFixtureId != null ? (
              <button
                type="button"
                onClick={() => {
                  onOpenProgramme(detail.programmeFixtureId!);
                  patch({ oppOpen: null });
                }}
                style={{ border: "1px solid #0B1A2A", background: "#0B1A2A", color: "#F7F3E9", cursor: "pointer", borderRadius: 4, padding: "9px 16px", fontSize: 13, fontWeight: 500 }}
              >
                Voir l’Initiative →
              </button>
            ) : detail.initiativeId ? (
              <div style={{ background: paper_a(1), border: "1px solid rgba(11,26,42,.1)", padding: "10px 14px", fontSize: 12.5, lineHeight: 1.5, color: "rgba(11,26,42,.7)" }}>
                Initiative réelle enregistrée, mais non reliée au portefeuille de programmes affiché ici.
              </div>
            ) : (
              <div style={{ background: paper_a(1), border: "1px solid rgba(11,26,42,.1)", padding: "10px 14px", fontSize: 12.5, lineHeight: 1.5, color: "rgba(11,26,42,.7)" }}>
                Initiative à structurer — retenue ne signifie pas encore exécutée. Aucune Initiative n’est créée automatiquement.
              </div>
            )}
          </PanelSection>
        )}

        {error && <div style={{ color: "#A63A22", fontSize: 12.5, marginBottom: 10 }}>{error}</div>}

        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            type="button"
            onClick={() => patch({ screen: "arbitrages" as AppState["screen"], oppOpen: null })}
            style={{ border: "1px solid rgba(11,26,42,.25)", background: "#fff", color: "#0B1A2A", cursor: "pointer", borderRadius: 4, padding: "10px 16px", fontSize: 13, fontWeight: 500 }}
          >
            Voir dans Arbitrages
          </button>
          <button
            type="button"
            disabled={ctaDisabled || busy}
            onClick={advance}
            style={{
              border: "1px solid #B6522F", background: ctaDisabled ? "#4C5566" : "#B6522F", borderColor: ctaDisabled ? "#4C5566" : "#B6522F",
              color: "#F7F3E9", cursor: ctaDisabled || busy ? "default" : "pointer", borderRadius: 4, padding: "11px 16px", fontSize: 13.5, fontWeight: 600, opacity: busy ? 0.7 : 1
            }}
          >
            {busy ? "…" : ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 10, letterSpacing: ".11em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", fontWeight: 650, marginBottom: 9 }}>{title}</div>
      {children}
    </section>
  );
}
