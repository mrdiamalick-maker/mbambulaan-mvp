"use client";

import { useEffect, useRef, useState } from "react";
import { getArbitrageItems, getDecidedArbitrages } from "../../lib/arbitrages-bridge";
import { getArbitragePrimaryAction } from "../../data/roles";
import { buildDecisionCommand } from "../../lib/situations-bridge";
import { useDomainRuntime } from "../../lib/domain-runtime";
import { V3_FONT_MONO, V3_FONT_SANS, V3_FONT_SERIF } from "../../theme";
import type { AppState } from "../../state";

type Patch = (p: Partial<AppState>) => void;

export function Arbitrages({
  state,
  patch,
  onOpenSituation,
  onOpenProgramme
}: {
  state: AppState;
  patch: Patch;
  onOpenSituation: (id: number) => void;
  onOpenProgramme: (id: number) => void;
}) {
  const runtime = useDomainRuntime();
  const liveState = runtime.state;

  // G2.2 §2 — une seule question : "qu'est-ce qui nécessite une décision ?"
  // getArbitrageItems fusionne les fixtures situation-anchorées non encore
  // décidées et les ProgramOpportunity réellement pending_arbitration
  // (moteur canonique G1), sans deuxième logique d'arbitrage. §6 — filtre
  // territorial partagé, posé depuis Territoires.tsx, lisible et
  // supprimable, jamais une permission.
  const allItems = liveState ? getArbitrageItems(liveState) : [];
  // decidedItems (B3, section "Déjà rendus · consultables") — symétrique
  // réel de allItems (arbitrages-bridge.ts, getDecidedArbitrages), jamais
  // une liste fabriquée pour imiter le référentiel Claude Design.
  const decidedItems = liveState ? getDecidedArbitrages(liveState) : [];
  const territoryFilterName = liveState && state.territoryFilterId
    ? liveState.territories.find((t) => t.id === state.territoryFilterId)?.name
    : undefined;
  const items = state.territoryFilterId ? allItems.filter((item) => item.territoryId === state.territoryFilterId) : allItems;

  const sel = items.length === 0 ? 0 : Math.min(Math.max(state.arbSel ?? 0, 0), items.length - 1);
  const a = items[sel];
  const openIdx = a && state.arbOpt != null && state.arbOpt.id === sel ? state.arbOpt.i : null;
  const chosen = a && openIdx != null ? a.options[openIdx] : null;
  const primaryAction = getArbitragePrimaryAction(state.role);
  const [modalOpen, setModalOpen] = useState(false);
  const [rationale, setRationale] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // canDispatch — ce dossier précis a un objet de décision canonique
  // compatible (Situation réelle ou ProgramOpportunity réelle). Le seul
  // cas honnêtement sans objet compatible aujourd'hui reste l'arbitrage
  // de portefeuille (programme), qui n'a pas d'ancrage Decision direct.
  const canDispatch = a ? (a.kind === "opportunity" ? Boolean(a.opportunityId) : Boolean(a.situationId)) : false;

  useEffect(() => {
    setModalOpen(false);
    setRationale("");
    setSubmitError(null);
  }, [sel, openIdx]);

  useEffect(() => {
    if (!modalOpen) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalOpen]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function confirmDecision() {
    if (!chosen || !a || !runtime.state) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (a.kind === "situation" && a.situationId) {
        const result = buildDecisionCommand(runtime.state, a.situationId, chosen.decisionType ?? "informer", rationale);
        if ("error" in result) {
          setSubmitError(result.error);
          setSubmitting(false);
          return;
        }
        await runtime.dispatch(result.command);
      } else if (a.kind === "opportunity" && a.opportunityId) {
        if (!rationale.trim()) {
          setSubmitError("La justification de la décision est obligatoire.");
          setSubmitting(false);
          return;
        }
        // Dispatch du moteur canonique G1 — exactement la même commande
        // qu'un arbitrage situation-anchoré dispatche create_decision :
        // aucune deuxième logique d'arbitrage créée pour ce type.
        await runtime.dispatch({
          type: "arbitrate_program_opportunity",
          programOpportunityId: a.opportunityId,
          outcome: openIdx === 0 ? "retenir" : "ecarter",
          rationale: rationale.trim()
        });
      } else {
        setSubmitting(false);
        return;
      }
      setModalOpen(false);
      setToast(`Décision enregistrée : ${chosen.label}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Décision refusée.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!liveState) {
    return (
      <div style={{ padding: "24px 30px 60px" }} className="pv3-rise">
        <p style={{ fontSize: 13, color: runtime.error ? "#C8452B" : "rgba(11,26,42,.6)" }}>
          {runtime.error ? `Connexion au domaine réel impossible : ${runtime.error}` : "Connexion au domaine réel Mbàmbulaan…"}
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 30px 60px" }} className="pv3-rise">
      <div style={{ display: "flex", alignItems: "flex-end", gap: 26, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "#B6522F", marginBottom: 9 }}>Arbitrages</div>
          <h1 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 32, lineHeight: 1.15, margin: 0, maxWidth: "32ch" }}>
            Qu’est-ce qui nécessite une décision aujourd’hui ?
          </h1>
        </div>
        <div style={{ flex: "none", maxWidth: 290, fontSize: 12.5, lineHeight: 1.55, color: "rgba(11,26,42,.65)", borderLeft: "2px solid #B6522F", paddingLeft: 14 }}>
          Une décision n’efface pas l’incertitude. Mbàmbulaan l’enregistre avec elle, pour que la relecture soit honnête.
        </div>
      </div>

      {territoryFilterName && (
        <div style={{ marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => patch({ territoryFilterId: null, arbSel: 0, arbOpt: null })}
            style={{ border: "1px solid #B6522F", background: "rgba(182,82,47,.08)", color: "#B6522F", cursor: "pointer", borderRadius: 999, padding: "5px 10px 5px 12px", fontSize: 11.5, fontFamily: V3_FONT_SANS, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            Territoire : {territoryFilterName} <span aria-hidden>✕</span>
          </button>
        </div>
      )}

      {items.length > 0 && (
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, marginBottom: 14, flexWrap: "wrap", fontSize: 12.5 }}>
          <span>{items.length} arbitrage{items.length > 1 ? "s" : ""} attend{items.length > 1 ? "ent" : ""} une décision</span>
          <span style={{ color: "rgba(11,26,42,.55)" }}>Perspective {state.role === "ministre" ? "Ministre" : state.role === "programme" ? "Direction de programme" : "Coordination territoriale"} · action : {primaryAction.label}</span>
        </div>
      )}

      {items.length === 0 ? (
        <div style={{ border: "1px solid rgba(11,26,42,.12)", background: "#FFFFFF", padding: "26px 24px", fontSize: 13, lineHeight: 1.6, color: "rgba(11,26,42,.65)" }}>
          {territoryFilterName
            ? `Aucun arbitrage n’attend de décision pour ${territoryFilterName} aujourd’hui.`
            : "Aucun arbitrage n’attend de décision aujourd’hui."}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "334px 1fr", gap: 0, border: "1px solid rgba(11,26,42,.12)", alignItems: "start" }}>
          <div style={{ background: "#FFFFFF", borderRight: "1px solid rgba(11,26,42,.12)", alignSelf: "stretch" }}>
            {items.map((x, i) => (
              <button
                type="button"
                key={x.key}
                onClick={() => patch({ arbSel: i, arbOpt: null })}
                style={{
                  display: "block", width: "100%", textAlign: "left", border: 0, borderBottom: "1px solid rgba(11,26,42,.07)",
                  background: sel === i ? "rgba(182,82,47,.07)" : "transparent", cursor: "pointer", padding: "15px 17px",
                  boxShadow: sel === i ? "inset 3px 0 0 #B6522F" : "none", transition: "background .2s"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                  <span style={{ fontFamily: V3_FONT_MONO, fontSize: 14, color: x.dueColor }}>{x.dueLabel}</span>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: x.dueColor }}>{x.urgencyLabel}</span>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.4 }}>{x.title}</div>
                <div style={{ fontSize: 11, color: "rgba(11,26,42,.55)", marginTop: 7 }}>{x.metaLabel}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                  {(x.kind === "opportunity" ? Boolean(x.opportunityId) : Boolean(x.situationId)) ? (
                    <span style={{ border: "1px solid rgba(11,26,42,.18)", borderRadius: 999, padding: "2px 8px", fontSize: 10, color: "rgba(11,26,42,.6)" }}>Rattaché à une situation</span>
                  ) : (
                    <span style={{ border: "1px solid rgba(182,82,47,.3)", background: "rgba(182,82,47,.06)", borderRadius: 999, padding: "2px 8px", fontSize: 10, color: "#B6522F" }}>sans objet de décision compatible</span>
                  )}
                </div>
              </button>
            ))}
            {/* Déjà rendus · consultables (B3) — décidés réels
                (arbitrages-bridge.ts, getDecidedArbitrages), jamais une
                phrase générique : chaque entrée ouvre la vraie situation. */}
            <div style={{ padding: "14px 17px 8px", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(11,26,42,.45)", background: "rgba(11,26,42,.03)" }}>Déjà rendus · consultables</div>
            {decidedItems.length > 0 ? (
              decidedItems.map((d) => (
                <button
                  type="button"
                  key={d.key}
                  onClick={() => onOpenSituation(d.situationRowId)}
                  className="pv3-row-hover-04"
                  style={{ display: "block", width: "100%", textAlign: "left", border: 0, background: "rgba(11,26,42,.03)", cursor: "pointer", padding: "9px 17px 14px" }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.4 }}>{d.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(11,26,42,.55)", marginTop: 4 }}>{d.decisionTypeLabel} · {d.decidedAtLabel} · {d.decider}</div>
                  <div style={{ fontSize: 11, color: "#B6522F", marginTop: 4 }}>Voir la situation →</div>
                </button>
              ))
            ) : (
              <div style={{ padding: "0 17px 16px", fontSize: 11.5, lineHeight: 1.55, color: "rgba(11,26,42,.55)", background: "rgba(11,26,42,.03)" }}>
                Aucun arbitrage n’a encore été rendu.
              </div>
            )}
          </div>

          <div style={{ background: "#FFFFFF", alignSelf: "stretch" }}>
            <div style={{ padding: "20px 24px 18px", borderBottom: "1px solid rgba(11,26,42,.1)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                <h2 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 26, lineHeight: 1.2, margin: "0 0 11px", maxWidth: "36ch", flex: 1 }}>{a.title}</h2>
                {a.kind === "situation" && a.arbIndex != null && (
                  <button
                    onClick={() => patch({ docOpen: { type: "decision", arbitrageIndex: a.arbIndex! } })}
                    style={{ flex: "none", border: "1px solid rgba(11,26,42,.22)", background: "transparent", color: "#0B1A2A", cursor: "pointer", borderRadius: 4, padding: "8px 14px", fontSize: 12, fontFamily: "inherit", fontWeight: 500 }}
                  >
                    Générer la note de décision
                  </button>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "rgba(11,26,42,.78)", maxWidth: "80ch" }}>{a.context}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(11,26,42,.08)" }}>
                <div>
                  <div style={{ fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(11,26,42,.45)", marginBottom: 4 }}>Territoire</div>
                  <div style={{ fontSize: 12.5 }}>{a.territoryLabel}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(11,26,42,.45)", marginBottom: 4 }}>Décideur</div>
                  <div style={{ fontSize: 12.5 }}>{a.decider}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(11,26,42,.45)", marginBottom: 4 }}>Pourquoi maintenant</div>
                  <div style={{ fontSize: 12.5 }}>{a.dueLabel === "—" ? a.urgencyLabel : `Échéance ${a.dueLabel} — ${a.urgencyLabel}.`}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "rgba(11,26,42,.1)", borderBottom: "1px solid rgba(11,26,42,.1)" }}>
              <div style={{ background: "#FFFFFF", padding: "16px 20px" }}>
                <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#4E7B5A", marginBottom: 10 }}>Ce qui est établi</div>
                {a.known.length > 0 ? (
                  a.known.map((k, i) => (
                    <div key={i} style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgba(11,26,42,.82)", marginBottom: 9, paddingLeft: 11, borderLeft: "2px solid rgba(78,123,90,.32)" }}>{k}</div>
                  ))
                ) : (
                  <div style={{ fontSize: 12, color: "rgba(11,26,42,.5)" }}>Aucun fait établi documenté à ce stade.</div>
                )}
              </div>
              <div style={{ background: "#FFFFFF", padding: "16px 20px" }}>
                <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#B6522F", marginBottom: 10 }}>Ce qui reste inconnu</div>
                {a.unknown.length > 0 ? (
                  a.unknown.map((u, i) => (
                    <div key={i} style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgba(11,26,42,.82)", marginBottom: 9, paddingLeft: 11, borderLeft: "2px solid rgba(182,82,47,.32)" }}>{u}</div>
                  ))
                ) : (
                  <div style={{ fontSize: 12, color: "rgba(11,26,42,.5)" }}>Aucune incertitude distincte documentée.</div>
                )}
              </div>
              <div style={{ background: "#F7F3E9", padding: "16px 20px" }}>
                <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginBottom: 10 }}>Si rien n’est décidé</div>
                <div style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(11,26,42,.82)" }}>{a.inaction}</div>
              </div>
            </div>

            <div style={{ padding: "20px 24px 26px" }}>
              <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginBottom: 13 }}>
                Options — sélectionnez pour comparer les conséquences
              </div>
              {a.options.map((o, i) => {
                const open = openIdx === i;
                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => patch({ arbOpt: { id: sel, i } })}
                    className="pv3-border-hover-dark"
                    style={{
                      display: "block", width: "100%", textAlign: "left", border: `1px solid ${open ? "#0B1A2A" : "rgba(11,26,42,.14)"}`,
                      background: open ? "rgba(182,82,47,.05)" : "transparent", cursor: "pointer", padding: "14px 17px", marginBottom: 9, transition: "all .2s"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                      <span style={{ width: 15, height: 15, borderRadius: "50%", border: `1.5px solid ${open ? "#B6522F" : "rgba(11,26,42,.28)"}`, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: open ? "#B6522F" : "transparent" }} />
                      </span>
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{o.label}</span>
                      <span style={{ fontFamily: V3_FONT_MONO, fontSize: 11.5, color: "rgba(11,26,42,.55)" }}>{o.cost}</span>
                    </div>
                    {open && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(11,26,42,.1)" }} className="pv3-rise-fast">
                        <div>
                          <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "#4E7B5A", marginBottom: 7 }}>Ce que cela résout</div>
                          <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "rgba(11,26,42,.8)" }}>{o.pro}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "#B6522F", marginBottom: 7 }}>Ce que cela laisse ouvert</div>
                          <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "rgba(11,26,42,.8)" }}>{o.con}</div>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
              {chosen && (
                <div style={{ marginTop: 16, padding: "17px 20px", background: "#0B1A2A", color: "#F7F3E9" }} className="pv3-rise-fast">
                  <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#DE9C74", marginBottom: 9 }}>Option retenue pour examen</div>
                  <div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>{chosen.label}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, paddingTop: 13, borderTop: "1px solid rgba(247,243,233,.14)", fontSize: 12, lineHeight: 1.55, color: "rgba(247,243,233,.72)" }}>
                    <div>Décideur, horodatage, et l’état exact de la connaissance à cet instant — y compris ce qui restait inconnu.</div>
                    <div>Le résultat effectif sera documenté séparément, sans réécriture rétrospective de la décision.</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 15 }}>
                    <button
                      type="button"
                      onClick={() => primaryAction.mode === "decision" ? setModalOpen(true) : patch({ docOpen: a.kind === "situation" && a.arbIndex != null ? { type: "decision", arbitrageIndex: a.arbIndex } : undefined })}
                      disabled={primaryAction.mode !== "decision" && (a.kind !== "situation" || a.arbIndex == null)}
                      style={{ border: "1px solid #DE9C74", background: "#DE9C74", color: "#0B1A2A", cursor: "pointer", borderRadius: 4, padding: "9px 16px", fontSize: 12.5, fontFamily: V3_FONT_SANS, fontWeight: 600 }}
                    >
                      {primaryAction.label}
                    </button>
                    {primaryAction.mode !== "decision" && (
                      <span style={{ fontSize: 11.5, color: "rgba(247,243,233,.62)" }}>Ouvre un projet de note ; aucune transmission ni décision n’est automatique.</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dossier · relations enregistrées dans le domaine (B3) —
                a.related (arbitrages-bridge.ts) : uniquement des liens
                réellement résolus (Situation/Programme), jamais un lien
                fabriqué par seule proximité territoriale ou textuelle. */}
            {(a.related.situationRowId != null || a.related.programmeFixtureId != null || a.related.opportunityId != null) && (
              <div style={{ padding: "20px 24px 26px", borderTop: "1px solid rgba(11,26,42,.1)" }}>
                <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginBottom: 14 }}>Dossier · relations enregistrées dans le domaine</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 18 }}>
                  {a.related.situationRowId != null && (
                    <div>
                      <div style={{ fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(11,26,42,.45)", marginBottom: 6 }}>Situation</div>
                      <button type="button" onClick={() => onOpenSituation(a.related.situationRowId!)} style={{ border: 0, background: "transparent", color: "#B6522F", cursor: "pointer", padding: 0, font: "inherit", fontSize: 13, fontWeight: 500, textAlign: "left" }}>
                        {a.related.situationTitle ?? "Ouvrir la situation"}
                      </button>
                    </div>
                  )}
                  {a.territoryId && (
                    <div>
                      <div style={{ fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(11,26,42,.45)", marginBottom: 6 }}>Territoire</div>
                      <button type="button" onClick={() => patch({ screen: "territoires", terrView: "detail", terrSel: a.territoryId, terrFromAtlas: false })} style={{ border: 0, background: "transparent", color: "#B6522F", cursor: "pointer", padding: 0, font: "inherit", fontSize: 13, fontWeight: 500, textAlign: "left" }}>
                        {a.territoryLabel} — fiche territoire
                      </button>
                    </div>
                  )}
                  {a.related.programmeFixtureId != null && (
                    <div>
                      <div style={{ fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(11,26,42,.45)", marginBottom: 6 }}>Programmes</div>
                      <button type="button" onClick={() => onOpenProgramme(a.related.programmeFixtureId!)} style={{ border: 0, background: "transparent", color: "#B6522F", cursor: "pointer", padding: 0, font: "inherit", fontSize: 13, fontWeight: 500, textAlign: "left" }}>
                        {a.related.programmeTitle ?? "Ouvrir le programme"}
                      </button>
                    </div>
                  )}
                  {a.related.opportunityId != null && (
                    <div>
                      <div style={{ fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(11,26,42,.45)", marginBottom: 6 }}>Opportunité</div>
                      <button type="button" onClick={() => patch({ oppOpen: a.related.opportunityId! })} style={{ border: 0, background: "transparent", color: "#B6522F", cursor: "pointer", padding: 0, font: "inherit", fontSize: 13, fontWeight: 500, textAlign: "left" }}>
                        {a.related.opportunityTitle ?? "Ouvrir l’opportunité"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {modalOpen && chosen && a && (
        <div role="dialog" aria-modal="true" aria-labelledby="pv3-arbitrage-modal-title" style={{ position: "fixed", inset: 0, zIndex: 260, background: "rgba(11,26,42,.58)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
          <div style={{ width: "min(620px,100%)", maxHeight: "calc(100vh - 36px)", overflowY: "auto", background: "#FFFFFF", border: "1px solid rgba(11,26,42,.16)", boxShadow: "0 24px 70px rgba(0,0,0,.32)" }}>
            <div style={{ padding: "18px 22px", background: "#0B1A2A", color: "#F7F3E9", display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "#DE9C74", marginBottom: 7 }}>Décision humaine</div>
                <h2 id="pv3-arbitrage-modal-title" style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 24, lineHeight: 1.25, margin: 0 }}>{a.title}</h2>
              </div>
              <button ref={closeButtonRef} type="button" onClick={() => setModalOpen(false)} aria-label="Fermer le modal de décision" style={{ border: "1px solid rgba(247,243,233,.3)", borderRadius: 999, background: "transparent", color: "#F7F3E9", cursor: "pointer", width: 32, height: 32 }}>×</button>
            </div>
            <div style={{ padding: "20px 22px 22px" }}>
              <div style={{ padding: "13px 15px", background: "#F7F3E9", borderLeft: "3px solid #B6522F", fontSize: 13, lineHeight: 1.55 }}>{chosen.label}</div>
              {canDispatch ? (
                <>
                  <label htmlFor="pv3-arbitrage-rationale" style={{ display: "block", marginTop: 18, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(11,26,42,.55)" }}>Justification de la décision (obligatoire)</label>
                  <textarea id="pv3-arbitrage-rationale" value={rationale} onChange={(event) => setRationale(event.target.value)} rows={4} placeholder="Pourquoi cette option est-elle retenue maintenant ?" style={{ width: "100%", boxSizing: "border-box", marginTop: 8, resize: "vertical", border: "1px solid rgba(11,26,42,.2)", borderRadius: 4, padding: "10px 11px", fontFamily: V3_FONT_SANS, fontSize: 13 }} />
                  <p style={{ margin: "8px 0 0", fontSize: 11.5, lineHeight: 1.5, color: "rgba(11,26,42,.58)" }}>
                    {a.kind === "opportunity"
                      ? "La décision sera rattachée à l’opportunité réelle du dossier (arbitrage canonique), avec auteur et horodatage issus de la session."
                      : "La décision sera rattachée à la Situation réelle du dossier, avec auteur et horodatage issus de la session."}
                  </p>
                  <button type="button" onClick={confirmDecision} disabled={submitting || !rationale.trim() || !runtime.state} style={{ marginTop: 15, border: 0, borderRadius: 4, background: submitting || !rationale.trim() || !runtime.state ? "rgba(182,82,47,.45)" : "#B6522F", color: "#FFFFFF", cursor: submitting || !rationale.trim() || !runtime.state ? "default" : "pointer", padding: "10px 17px", fontSize: 12.5, fontFamily: V3_FONT_SANS, fontWeight: 600 }}>{submitting ? "Enregistrement…" : "Valider et enregistrer"}</button>
                  {submitError && <div role="alert" style={{ marginTop: 10, fontSize: 12, color: "#C8452B" }}>{submitError}</div>}
                </>
              ) : (
                <div style={{ marginTop: 18, padding: "13px 15px", border: "1px solid rgba(182,82,47,.25)", background: "rgba(182,82,47,.05)", fontSize: 12.5, lineHeight: 1.6 }}>
                  Cet arbitrage porte sur un statut de programme, mais le domaine ne possède pas encore d’objet de décision Programme compatible. Aucune décision ne sera fabriquée ni rattachée à une Situation sans lien réel.
                  <div><button type="button" onClick={() => { setModalOpen(false); if (a.kind === "situation" && a.arbIndex != null) patch({ docOpen: { type: "decision", arbitrageIndex: a.arbIndex } }); }} style={{ marginTop: 11, border: "1px solid #0B1A2A", background: "#0B1A2A", color: "#F7F3E9", cursor: "pointer", borderRadius: 4, padding: "8px 14px", fontSize: 12, fontFamily: V3_FONT_SANS }}>Ouvrir le projet de note</button></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && <div role="status" aria-live="polite" style={{ position: "fixed", right: 22, bottom: 22, zIndex: 320, maxWidth: 420, padding: "12px 15px", background: "#0B1A2A", color: "#F7F3E9", borderLeft: "3px solid #4E7B5A", boxShadow: "0 12px 36px rgba(0,0,0,.25)", fontSize: 12.5, lineHeight: 1.5 }}>{toast}</div>}
    </div>
  );
}
