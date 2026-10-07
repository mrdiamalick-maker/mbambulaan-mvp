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
export function OpportunityPanel({ oppId, patch, onClose }: { oppId: string; patch: (p: Partial<AppState>) => void; onClose: () => void }) {
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

  const ctaLabel = detail.status === "detected" ? "Ouvrir l’instruction" : detail.status === "qualifying" ? "Transmettre pour qualification" : "Instruction qualifiée";
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
          background: "#fff", boxShadow: "-8px 0 30px rgba(11,26,42,.2)", padding: "24px 26px 40px", fontFamily: V3_FONT_SANS
        }}
        className="pv3-opp-panel"
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "rgba(11,26,42,.5)" }}>Opportunité · {detail.territoryNames.join(", ")}</div>
          <button type="button" onClick={onClose} aria-label="Fermer" style={{ border: 0, background: "transparent", cursor: "pointer", fontSize: 20, lineHeight: 1, color: "rgba(11,26,42,.5)" }}>×</button>
        </div>

        <h2 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 24, margin: "0 0 6px" }}>{detail.problem}</h2>
        <div style={{ fontSize: 12.5, color: "rgba(11,26,42,.55)", marginBottom: 16 }}>{detail.subLabel}</div>

        <div style={{ display: "flex", gap: 2, marginBottom: 18 }}>
          {OPPORTUNITY_UI_STEPS.map((step, i) => (
            <div key={step} style={{ flex: 1 }}>
              <div style={{ height: 2, background: i <= detail.uiStepIndex ? "#B6522F" : "rgba(11,26,42,.15)", marginBottom: 6 }} />
              <div style={{ fontSize: 11, fontWeight: i === detail.uiStepIndex ? 600 : 400, color: i === detail.uiStepIndex ? "#0B1A2A" : "#4C5566" }}>{step}</div>
            </div>
          ))}
        </div>

        <div style={{ border: "1px solid #B6522F", background: "rgba(182,82,47,.05)", padding: "10px 14px", fontSize: 12.5, lineHeight: 1.5, marginBottom: 18 }}>
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
            sinon un constat honnête, jamais un programme fabriqué. */}
        {detail.outcome === "retenue" && (
          <PanelSection title="Initiative">
            {detail.initiativeId ? (
              <button
                type="button"
                onClick={() => patch({ screen: "programmes" as AppState["screen"], initiativeFocusId: detail.initiativeId!, oppOpen: null })}
                style={{ border: "1px solid #0B1A2A", background: "#0B1A2A", color: "#F7F3E9", cursor: "pointer", borderRadius: 4, padding: "9px 16px", fontSize: 13, fontWeight: 500 }}
              >
                Voir l’Initiative →
              </button>
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
            Rattacher à un arbitrage
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
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}
