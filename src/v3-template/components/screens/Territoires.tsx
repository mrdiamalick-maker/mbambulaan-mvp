"use client";

import { useMemo } from "react";
import type { AppState } from "../../state";
import { V3_FONT_MONO, V3_FONT_SANS, V3_FONT_SERIF, paper_a } from "../../theme";
import { useDomainRuntime } from "../../lib/domain-runtime";
import { getTerritoryList, getTerritoryFiche, type TerritoryDecisionAction } from "../../lib/territory-fiche-bridge";
import { OPPORTUNITY_UI_STEPS } from "../../lib/opportunity-bridge";
import { buildSituationRows } from "../../lib/situations-bridge";
import { SPEC_FIELDS } from "../../data/territory-spec";

type Patch = (p: Partial<AppState>) => void;

const ZONE_ORDER = ["Grande-Côte", "Cap-Vert", "Petite-Côte", "Sine-Saloum", "Casamance"];
const SECTION_ANCHORS: Array<[string, string]> = [
  ["t-retain", "À retenir"],
  ["t-opps", "Opportunités"],
  ["t-dec", "Décisions"],
  ["t-caps", "Capacités"],
  ["t-src", "Sources"]
];

function scrollToAnchor(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 16;
  window.scrollTo({ top, behavior: "smooth" });
}

function Breadcrumb({ parts }: { parts: Array<{ label: string; onClick?: () => void }> }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(11,26,42,.55)", flexWrap: "wrap" }}>
      {parts.map((p, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {i > 0 && <span style={{ color: "rgba(11,26,42,.3)" }}>›</span>}
          {p.onClick ? (
            <button type="button" onClick={p.onClick} style={{ border: 0, background: "transparent", cursor: "pointer", padding: 0, color: "rgba(11,26,42,.55)", fontSize: 13, fontFamily: V3_FONT_SANS }}>
              {p.label}
            </button>
          ) : (
            <span style={{ color: "#0B1A2A", fontWeight: 600 }}>{p.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}

// TopActions (RC1, audit de fonctionnalité) — ne porte plus que
// "Présentation" (mode présentation réel, national, déjà utilisé par
// Brief.tsx : patch({presentOpen:true})). Le bouton "Générer une note"/
// "Note territoire" déclenchait jusqu'ici onPresent/onNote={() => undefined}
// — aucune des deux actions n'existait réellement (document-bridge.ts ne
// porte aucun DocumentRequest de type "territoire") : un CTA visible sans
// action réelle, exactement ce que le mandat RC1 interdit. Construire un
// générateur de note territoriale serait une fonctionnalité nouvelle, hors
// périmètre RC1 ("aucune nouvelle feature majeure") : retiré plutôt que
// simulé.
function TopActions({ onPresent, onAtlas }: { onPresent: () => void; onAtlas: () => void }) {
  return (
    <div style={{ display: "flex", gap: 10, flex: "none" }}>
      <button
        type="button"
        onClick={onAtlas}
        style={{ border: "1px solid #0B1A2A", background: "#0B1A2A", color: "#F7F3E9", cursor: "pointer", borderRadius: 0, padding: "9px 16px", fontSize: 12, fontFamily: V3_FONT_SANS, fontWeight: 600 }}
      >
        Atlas maritime
      </button>
      <button
        type="button"
        onClick={onPresent}
        style={{ border: "1px solid rgba(11,26,42,.22)", background: "#fff", color: "#0B1A2A", cursor: "pointer", borderRadius: 0, padding: "9px 16px", fontSize: 12, fontFamily: V3_FONT_SANS, fontWeight: 600 }}
      >
        Présentation
      </button>
    </div>
  );
}

function DemoBannerSimple({ rightLabel }: { rightLabel: string }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 14, padding: "9px 30px", background: "rgba(11,26,42,.04)",
        borderBottom: "1px solid rgba(11,26,42,.08)", fontSize: 11.5, color: "rgba(11,26,42,.6)", flexWrap: "wrap"
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4E7B5A" }} />
        Données de démonstration — structure réelle, valeurs illustratives
      </span>
      <span style={{ flex: 1 }} />
      <span>{rightLabel}</span>
    </div>
  );
}

function ConceptionNote({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ margin: "14px 30px 0", padding: "12px 16px", border: "1px dashed rgba(11,26,42,.3)", background: "rgba(182,82,47,.03)", fontSize: 12, lineHeight: 1.5, color: "rgba(11,26,42,.7)" }}>
      <strong style={{ color: "#B6522F" }}>Conception </strong>
      {children}
    </div>
  );
}

const TRUST_COLOR: Record<string, string> = { "○": "rgba(11,26,42,.55)", "◐": "#B6522F", "●": "#4E7B5A", "—": "rgba(11,26,42,.35)" };

export function Territoires({
  state,
  patch,
  onReturnToAtlas,
  showNotes = false
}: {
  state: AppState;
  patch: Patch;
  onReturnToAtlas: () => void;
  showNotes?: boolean;
}) {
  const runtime = useDomainRuntime();
  const liveState = runtime.state ?? undefined;

  const territoryRows = useMemo(() => getTerritoryList(liveState), [liveState]);
  const situationRows = useMemo(() => buildSituationRows(liveState), [liveState]);
  const zones = useMemo(
    () =>
      ZONE_ORDER.map((zone) => ({
        name: zone,
        sites: territoryRows.filter((row) => row.zone === zone)
      })),
    [territoryRows]
  );

  const go = (id: string) => {
    patch({ screen: "territoires" as AppState["screen"], terrView: "detail", terrSel: id, oppOpen: null });
    window.scrollTo(0, 0);
  };
  const toList = () => {
    patch({ terrView: "list", terrSel: null, terrFromAtlas: false });
    window.scrollTo(0, 0);
  };
  // toAtlas (ARCHITECTURE RECOVERY R1 §3) — délègue à onReturnToAtlas
  // (App.tsx), qui repasse par syncScreenUrl comme toute navigation
  // inter-écrans : un simple patch({screen:"atlas"}) local laisserait
  // l'URL ?ecran= désynchronisée de l'écran réellement affiché.
  const toAtlas = () => onReturnToAtlas();
  const openSituation = (realId: string) => {
    const row = situationRows.find((item) => item.realId === realId);
    if (!row) return;
    patch({ screen: "situations", sitOpen: row.id, territoryFilterId: null });
    window.scrollTo(0, 0);
  };

  if (state.terrView === "list" || !state.terrSel) {
    return (
      <div className="pv3-rise pv3-territories-screen">
        <div style={{ padding: "22px 30px 12px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <Breadcrumb parts={[{ label: "Espace État" }, { label: "Territoires" }]} />
          <TopActions onPresent={() => patch({ presentOpen: true })} onAtlas={toAtlas} />
        </div>
        <DemoBannerSimple rightLabel={`Situation au ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}`} />

        <div className="pv3-content-frame" style={{ padding: "clamp(30px,4vw,52px) clamp(20px,3vw,42px) 72px" }}>
          <div style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#B6522F", marginBottom: 8 }}>Territoires</div>
          <h1 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 620, fontSize: "clamp(30px,4vw,48px)", lineHeight: 1.05, letterSpacing: "-.035em", margin: "0 0 14px", maxWidth: 900 }}>Le littoral, du nord au sud — {territoryRows.length} sites suivis</h1>
          <p style={{ margin: "0 0 26px", fontFamily: V3_FONT_SERIF, fontSize: 15.5, lineHeight: 1.62, color: "rgba(11,26,42,.72)", maxWidth: "72ch" }}>
            Chaque site a sa fiche. Les fiches documentées montrent ce qui se passe et ce qu’il faut décider ; les autres gardent la même structure, vide tant que l’information manque.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: "0 42px" }}>
            {zones.map((zone) => (
              <div key={zone.name} style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", borderTop: "2px solid #0B1A2A", paddingTop: 10, paddingBottom: 5, marginBottom: 4 }}>
                  <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 17, fontWeight: 650 }}>{zone.name}</div>
                  <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.5)" }}>{zone.sites.length} sites</div>
                </div>
                {zone.sites.map((site) => (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => go(site.id)}
                    className="pv3-row-hover-06"
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", border: 0, borderBottom: "1px solid rgba(11,26,42,.07)", background: "transparent", cursor: "pointer", padding: "12px 4px" }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: site.statusColor, flex: "none" }} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{site.name}</div>
                      <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.5)" }}>Région de {site.region} · {site.signalsLabel}</div>
                    </span>
                    <span style={{ fontSize: 12, fontWeight: site.tag === "documentee" ? 600 : 500, color: site.tag === "documentee" ? "#0B1A2A" : "#4C5566", flex: "none" }}>{site.tagLabel}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const F = getTerritoryFiche(state.terrSel, liveState);
  if (!F) return null;

  const tabs = ["joal", "kayar", "mbour", "saint-louis"];

  return (
    <div className="pv3-rise pv3-territories-screen">
      <div style={{ padding: "22px 30px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {state.terrFromAtlas && (
            <button
              type="button"
              onClick={toAtlas}
              style={{ border: 0, background: "transparent", cursor: "pointer", padding: 0, fontSize: 12.5, fontWeight: 600, color: "#B6522F", fontFamily: V3_FONT_SANS, textAlign: "left" }}
            >
              ← Retour à l’Atlas
            </button>
          )}
          <Breadcrumb parts={[{ label: "Espace État" }, { label: "Territoires", onClick: toList }, { label: F.name }]} />
        </div>
        <TopActions onPresent={() => patch({ presentOpen: true })} onAtlas={toAtlas} />
      </div>

      <div style={{ padding: "16px 30px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", borderBottom: "1px solid rgba(11,26,42,.1)" }}>
        <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
          {tabs.map((id) => {
            const row = territoryRows.find((item) => item.id === id);
            if (!row) return null;
            const cur = id === state.terrSel;
            return (
              <button
                key={id}
                type="button"
                onClick={() => go(id)}
                style={{
                  display: "flex", alignItems: "center", gap: 7, border: 0, cursor: "pointer", padding: "8px 14px",
                  background: cur ? "#0B1A2A" : "transparent", color: cur ? "#F7F3E9" : "#0B1A2A", fontSize: 12.5, fontWeight: cur ? 600 : 500, borderRadius: "4px 4px 0 0", whiteSpace: "nowrap"
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: row.statusColor }} />
                {row.name}
              </button>
            );
          })}
          {!tabs.includes(state.terrSel) && (
            <button type="button" style={{ display: "flex", alignItems: "center", gap: 7, border: 0, padding: "8px 14px", background: "#0B1A2A", color: "#F7F3E9", fontSize: 12.5, fontWeight: 600, borderRadius: "4px 4px 0 0", whiteSpace: "nowrap" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: F.statusColor }} />
              {F.name}
            </button>
          )}
          <select aria-label="Choisir un autre territoire" value={state.terrSel} onChange={(event) => go(event.target.value)} style={{ border: "1px solid rgba(11,26,42,.18)", background: "#fff", color: "#0B1A2A", padding: "7px 30px 7px 10px", fontSize: 12, fontFamily: V3_FONT_SANS, cursor: "pointer" }}>
            {territoryRows.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 12.5, color: "rgba(11,26,42,.6)", overflowX: "auto" }}>
          {SECTION_ANCHORS.map(([id, label]) => (
            <button key={id} type="button" onClick={() => scrollToAnchor(id)} style={{ border: 0, background: "transparent", cursor: "pointer", padding: "8px 0", color: "rgba(11,26,42,.6)", fontSize: 12.5, whiteSpace: "nowrap" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <DemoBannerSimple rightLabel={`Situation au ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}`} />

      <div className="pv3-content-frame" style={{ padding: "clamp(28px,4vw,48px) clamp(20px,3vw,42px) 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, marginBottom: 10 }}>
          <span style={{ color: F.statusColor, fontSize: 15 }}>●</span>
          <span style={{ color: F.statusTextColor, fontWeight: 600 }}>{F.statusLabel}</span>
          {F.zone && (
            <>
              <span style={{ color: "rgba(11,26,42,.3)" }}>·</span>
              <span style={{ color: "rgba(11,26,42,.6)" }}>{F.zone}</span>
            </>
          )}
          <span style={{ color: "rgba(11,26,42,.3)" }}>·</span>
          <span style={{ color: "rgba(11,26,42,.6)" }}>Région de {F.region}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 22, alignItems: "start" }}>
          <div>
            <h1 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 650, fontSize: "clamp(38px,5vw,60px)", lineHeight: .98, letterSpacing: "-.045em", margin: "0 0 16px" }}>{F.name}</h1>
            <p style={{ margin: "0 0 20px", fontFamily: V3_FONT_SERIF, fontSize: 16, lineHeight: 1.62, color: "rgba(11,26,42,.72)", maxWidth: "66ch" }}>{F.synthesis}</p>

            <div style={{ fontSize: 11, color: "rgba(11,26,42,.5)", marginBottom: 8 }}>Dans le moteur Mbàmbulaan</div>
            <div className="pv3-territory-counters" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 1, background: "rgba(11,26,42,.12)", border: "1px solid rgba(11,26,42,.12)", marginBottom: 8 }}>
              {(
                [
                  ["Situations", F.counts.situations, () => patch({ screen: "situations" as AppState["screen"], territoryFilterId: F.id })],
                  ["Opportunités", F.counts.opportunities, () => scrollToAnchor("t-opps")],
                  ["Décisions", F.counts.decisions, () => scrollToAnchor("t-dec")],
                  ["Initiatives", F.counts.initiatives, () => patch({ screen: "programmes" as AppState["screen"], territoryFilterId: F.id })],
                  ["Résultats", F.counts.results, () => patch({ screen: "resultats" as AppState["screen"], territoryFilterId: F.id })]
                ] as Array<[string, number, () => void]>
              ).map(([label, n, go]) => (
                <button
                  key={label}
                  type="button"
                  onClick={go}
                  style={{ background: "#fff", padding: "10px 8px", minWidth: 0, border: 0, textAlign: "left", cursor: "pointer", font: "inherit" }}
                >
                  <div style={{ fontFamily: V3_FONT_MONO, fontSize: 19, color: n > 0 ? "#0B1A2A" : "rgba(11,26,42,.3)" }}>{n}</div>
                  <div style={{ fontSize: 10.5, color: "rgba(11,26,42,.55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>
                </button>
              ))}
            </div>
            <div style={{ fontSize: 10.5, color: "rgba(11,26,42,.4)" }}>Territoire → Situation → Opportunité → Décision → Initiative → Résultat</div>
          </div>

          <div style={{ background: paper_a(1), border: "1px solid rgba(11,26,42,.1)", padding: "16px 18px" }}>
            <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "#B6522F", marginBottom: 10 }}>Niveau de connaissance</div>
            <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
              {(["declared", "observed", "verified"] as const).map((key) => {
                const n = key === "declared" ? F.confidence.declared : key === "observed" ? F.confidence.observed : F.confidence.verified;
                const color = key === "declared" ? "#0B1A2A" : key === "observed" ? "#B6522F" : "#4E7B5A";
                return <span key={key} style={{ flex: n, minWidth: n ? 6 : 0, background: color }} />;
              })}
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: 11.5, color: "rgba(11,26,42,.7)", marginBottom: 10, flexWrap: "wrap" }}>
              <span>○ Déclarée · {F.confidence.declared}</span>
              <span>◐ Observée · {F.confidence.observed}</span>
              <span>● Vérifiée · {F.confidence.verified}</span>
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgba(11,26,42,.8)", marginBottom: 6 }}>{F.confidenceReadNote}</div>
            <div style={{ fontSize: 11, color: "rgba(11,26,42,.5)", borderTop: "1px solid rgba(11,26,42,.1)", paddingTop: 8, marginBottom: 10 }}>Dernière information : {F.updatedLabel}</div>
            {F.actors.length > 0 && (
              <>
                <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginBottom: 8 }}>Acteurs et capacités clés</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {F.actors.map((a, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12 }}>
                      <span style={{ fontWeight: 600 }}>{a.name}</span>
                      <span style={{ color: "rgba(11,26,42,.6)", textAlign: "right" }}>{a.note}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {showNotes && <ConceptionNote>L’en-tête répond à « où en est-on ? » en une lecture : statut, synthèse en deux phrases, niveau de connaissance. La rangée « moteur » garde visibles les objets métier sans les déplier.</ConceptionNote>}

      {F.isPriorityCaseToDocument && (
        <div className="pv3-content-frame" style={{ margin: "22px auto 0", padding: "18px clamp(20px,3vw,42px)", border: "1px dashed rgba(11,26,42,.3)" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "#B6522F", fontWeight: 600 }}>Cas territorial prioritaire à documenter</span>
          </div>
          <h2 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 22, margin: "0 0 8px" }}>Aucun cas G2 encore retenu pour {F.name}</h2>
          <p style={{ margin: "0 0 14px", fontSize: 13.5, lineHeight: 1.5, color: "rgba(11,26,42,.7)", maxWidth: "60ch" }}>
            Aucune opportunité ni aucun arbitrage n’a encore été qualifié pour ce territoire avec la coordination territoriale. Les données réelles déjà connues — situations, acteurs, capacités, sources — restent affichées ci-dessous : l’absence de cas G2 qualifié ne signifie pas une absence de données.
          </p>
          <div style={{ fontSize: 11, color: "rgba(11,26,42,.5)", marginBottom: 8 }}>Champs attendus pour qualifier un cas</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SPEC_FIELDS.map((f) => (
              <span key={f} style={{ border: "1px solid rgba(11,26,42,.2)", borderRadius: 4, padding: "6px 10px", fontSize: 12 }}>{f}</span>
            ))}
          </div>
        </div>
      )}

      {/* Cas territoriaux significatifs (G2.4, "Territorial Casebook") — au
          maximum 1 ou 2 cas réels par territoire (lib/territorial-casebook.ts),
          chacun explicitement qualifié. Bordure pointillée = hypothèse (même
          convention que la section 02 "Opportunités" ci-dessous) ; bordure
          pleine = fait soutenu par le domaine (même convention que "À
          retenir"). Jamais affiché pour un territoire sans cas qualifié
          (Saint-Louis), déjà couvert par le bandeau ci-dessus. */}
      {F.casebook.length > 0 && (
        <div className="pv3-content-frame" style={{ margin: "22px auto 0", padding: "0 clamp(20px,3vw,42px)" }}>
          <div style={{ fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: "#B6522F", fontWeight: 600, marginBottom: 10 }}>
            Cas territoriaux significatifs
          </div>
          {F.casebook.map((c) => {
            const accent = c.qualification === "documente" ? "#4E7B5A" : c.qualification === "a_qualifier" ? "#B6522F" : "rgba(11,26,42,.45)";
            return (
              <div
                key={c.id}
                style={{
                  border: c.qualification === "a_qualifier" ? "1px dashed rgba(11,26,42,.45)" : "1px solid rgba(11,26,42,.15)",
                  background: "#fff",
                  padding: "16px 20px",
                  marginBottom: 12
                }}
              >
                <span style={{ display: "inline-block", border: `1px solid ${accent}`, color: accent, borderRadius: 3, padding: "2px 8px", fontSize: 10.5, fontWeight: 600, marginBottom: 8 }}>
                  {c.qualificationLabel}
                </span>
                <div style={{ fontSize: 15.5, fontWeight: 600, lineHeight: 1.3, marginBottom: 6 }}>{c.title}</div>
                <p style={{ margin: "0 0 10px", fontSize: 12.5, lineHeight: 1.5, color: "rgba(11,26,42,.75)" }}>{c.summary}</p>
                {c.qualification === "a_qualifier" && c.potentialValueHypothesis && (
                  <div style={{ fontSize: 12, lineHeight: 1.5, color: "rgba(11,26,42,.7)", marginBottom: 8 }}>
                    <strong>Hypothèse de valeur · </strong>{c.potentialValueHypothesis}
                  </div>
                )}
                {c.qualification === "a_qualifier" && c.knowledgeGaps && c.knowledgeGaps.length > 0 && (
                  <div style={{ fontSize: 11.5, color: "#B6522F", marginBottom: 8 }}>Manque pour qualifier · {c.knowledgeGaps.length}</div>
                )}
                {c.sources && c.sources.length > 0 && (
                  <div style={{ fontSize: 11, color: "rgba(11,26,42,.5)", marginBottom: 8 }}>Source · {c.sources[0]}</div>
                )}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {c.linkedOpportunityId && (
                    <button
                      type="button"
                      onClick={() => patch({ oppOpen: c.linkedOpportunityId })}
                      style={{ border: "1px solid rgba(11,26,42,.25)", background: "#fff", color: "#0B1A2A", cursor: "pointer", borderRadius: 4, padding: "7px 14px", fontSize: 12, fontWeight: 500 }}
                    >
                      Voir l’opportunité
                    </button>
                  )}
                  {c.linkedInitiativeId && (
                    <button
                      type="button"
                      onClick={() => patch({ screen: "programmes" as AppState["screen"], territoryFilterId: F.id })}
                      style={{ border: "1px solid rgba(11,26,42,.25)", background: "#fff", color: "#0B1A2A", cursor: "pointer", borderRadius: 4, padding: "7px 14px", fontSize: 12, fontWeight: 500 }}
                    >
                      Voir les programmes
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div id="t-retain" className="pv3-content-frame" style={{ padding: "34px clamp(20px,3vw,42px) 0" }}>
        <SectionHeader
          n="01"
          title="À retenir"
          right={
            <button type="button" onClick={() => patch({ screen: "situations" as AppState["screen"], territoryFilterId: F.id })} style={{ border: 0, background: "transparent", cursor: "pointer", padding: 0, fontSize: 12, color: "#0B1A2A" }}>
              Toutes les situations du territoire · {F.counts.situations} →
            </button>
          }
        />
        {F.retain.length === 0 ? (
          <EmptyBox>{F.emptyRetainNote}</EmptyBox>
        ) : (
          F.retain.map((r, i) => (
            <button type="button" key={r.realId} onClick={() => openSituation(r.realId)} className="pv3-row-hover-04" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 18, width: "100%", padding: "16px 0", border: 0, borderBottom: i < F.retain.length - 1 ? "1px solid rgba(11,26,42,.08)" : undefined, background: "transparent", color: "#0B1A2A", textAlign: "left", cursor: "pointer", fontFamily: V3_FONT_SANS }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, marginBottom: 6 }}>
                  <span style={{ color: r.severityColor, fontWeight: 600 }}>{r.severityLabel}</span>
                  <span style={{ color: TRUST_COLOR[r.trustGlyph] }}>{r.trustGlyph} {r.trustLabel}</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3 }}>{r.title}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 18px", fontSize: 12.5 }}>
                <Field label="Conséquence" value={r.consequence} />
                <Field label="Action en cours" value={r.action} />
                <Field label="Responsable" value={r.owner} bold />
                <Field label="Échéance" value={r.due} />
              </div>
              <span style={{ gridColumn: "1 / -1", fontSize: 11, color: "#B6522F", textAlign: "right" }}>Ouvrir la situation →</span>
            </button>
          ))
        )}
        {showNotes && <ConceptionNote>Deux situations au plus. Le reste vit dans la vue de travail Situations, ouverte déjà filtrée. Chaque situation dit la conséquence, l’action en cours et qui en répond.</ConceptionNote>}
      </div>

      <div id="t-opps" className="pv3-content-frame" style={{ padding: "34px clamp(20px,3vw,42px) 0" }}>
        <SectionHeader n="02" title="Opportunités" right={<span style={{ fontSize: 12, color: "rgba(11,26,42,.5)" }}>Pistes à instruire — ce ne sont pas des faits établis</span>} />
        {F.opportunities.length === 0 ? (
          <EmptyBox>Aucune opportunité repérée. Une piste apparaîtra ici dès qu’elle sera signalée et rattachée au territoire — avec son statut d’instruction et ce qui manque pour la qualifier.</EmptyBox>
        ) : (
          F.opportunities.map((o) => (
            <div key={o.id} style={{ border: "1px dashed rgba(11,26,42,.45)", background: "#fff", padding: "18px 20px", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                <span style={{ border: "1px solid #B6522F", color: "#B6522F", borderRadius: 3, padding: "2px 8px", fontSize: 10.5, fontWeight: 600 }}>Hypothèse</span>
                <span style={{ fontSize: 11.5, color: "rgba(11,26,42,.6)" }}>Instruction : <strong style={{ color: "#0B1A2A" }}>{o.uiStep}</strong></span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>{o.problem}</div>
              <div style={{ fontSize: 12, color: "rgba(11,26,42,.55)", marginBottom: 12 }}>{o.subLabel}</div>
              <OppSteps index={o.uiStepIndex} />
              {o.missingCount > 0 && <div style={{ fontSize: 11.5, color: "#B6522F", marginTop: 10 }}>Manque pour instruire · {o.missingCount}</div>}
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => patch({ oppOpen: o.id })}
                  style={{ border: "1px solid rgba(11,26,42,.25)", background: "#fff", color: "#0B1A2A", cursor: "pointer", borderRadius: 4, padding: "8px 16px", fontSize: 12.5, fontWeight: 500 }}
                >
                  Fiche compacte
                </button>
              </div>
            </div>
          ))
        )}
        {showNotes && <ConceptionNote>Les opportunités ont une forme distincte (contour pointillé, étiquette « Hypothèse ») pour ne jamais être lues comme des faits. Tout chiffre non instruit est affiché « à qualifier ».</ConceptionNote>}
      </div>

      <div id="t-dec" className="pv3-content-frame" style={{ padding: "34px clamp(20px,3vw,42px) 0" }}>
        <SectionHeader
          n="03"
          title="Décisions et actions attendues"
          right={
            <button type="button" onClick={() => patch({ screen: "arbitrages" as AppState["screen"], territoryFilterId: F.id })} style={{ border: 0, background: "transparent", cursor: "pointer", padding: 0, fontSize: 12, color: "#0B1A2A" }}>
              Voir dans Arbitrages →
            </button>
          }
        />
        {F.decisionsAndActions.length === 0 ? (
          <EmptyBox>Aucune décision ni action n’est attendue sur ce territoire.</EmptyBox>
        ) : (
          F.decisionsAndActions.map((d: TerritoryDecisionAction, i: number) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 0", borderBottom: i < F.decisionsAndActions.length - 1 ? "1px solid rgba(11,26,42,.08)" : undefined }}>
              <div style={{ flex: "none", width: 64, textAlign: "center" }}>
                <div style={{ fontFamily: V3_FONT_MONO, fontSize: 17, color: d.dueColor, lineHeight: 1 }}>{d.due}</div>
                <div style={{ fontSize: 10, color: "rgba(11,26,42,.45)", marginTop: 2 }}>{d.dueSub}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".06em", color: "rgba(11,26,42,.5)", marginBottom: 2 }}>{d.kind} · {d.owner}</div>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{d.title}</div>
                {d.meta && <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.55)", marginTop: 3 }}>{d.meta}</div>}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (d.cta.kind === "opportunity") patch({ oppOpen: d.cta.opportunityId });
                  else if (d.cta.kind === "arbitrages") patch({ screen: "arbitrages" as AppState["screen"], territoryFilterId: F.id });
                  else patch({ screen: "situations" as AppState["screen"], territoryFilterId: F.id });
                }}
                style={{ flex: "none", border: "1px solid #0B1A2A", background: "#0B1A2A", color: "#F7F3E9", cursor: "pointer", borderRadius: 4, padding: "9px 16px", fontSize: 12.5, fontWeight: 500 }}
              >
                {d.ctaLabel}
              </button>
            </div>
          ))
        )}
        {showNotes && <ConceptionNote>Seulement ce qui demande un geste : décider, relancer, ouvrir. L’échéance est le premier élément lu.</ConceptionNote>}
      </div>

      <div id="t-caps" className="pv3-content-frame" style={{ padding: "34px clamp(20px,3vw,42px) 0" }}>
        <SectionHeader
          n="04"
          title="Activité et capacités"
          right={
            <>
              <span style={{ fontSize: 12, color: "rgba(11,26,42,.5)" }}>Ce qui existe, dans quel état, selon qui</span>
              <button type="button" onClick={() => patch({ screen: "flux" as AppState["screen"], territoryFilterId: F.id })} style={{ border: 0, background: "transparent", cursor: "pointer", padding: 0, fontSize: 12, color: "#0B1A2A" }}>
                Flux entrant →
              </button>
            </>
          }
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(11,26,42,.5)", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".06em" }}>Infrastructures et capacités</div>
            {F.capacities.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "rgba(11,26,42,.5)" }}>Non inventoriées.</div>
            ) : (
              F.capacities.map((c, i) => (
                <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid rgba(11,26,42,.07)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</span>
                    <span style={{ fontSize: 11.5, color: c.stateColor }}>{c.trustGlyph} {c.trustLabel}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(11,26,42,.6)", marginTop: 2 }}>{c.state}</div>
                </div>
              ))
            )}
          </div>
          <div>
            <div style={{ fontSize: 11, color: "rgba(11,26,42,.5)", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".06em" }}>Activité observée</div>
            {F.activity.map((a, i) => (
              <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid rgba(11,26,42,.07)", display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13 }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(11,26,42,.5)" }}>{a.trustGlyph} {a.source}</div>
                </div>
                <div style={{ fontFamily: V3_FONT_MONO, fontSize: 15, flex: "none" }}>{a.value}</div>
              </div>
            ))}
          </div>
        </div>
        {showNotes && <ConceptionNote>Pas de tuiles KPI : chaque ligne dit ce qui existe, son état et qui l’affirme. « Non suivi » est une réponse légitime.</ConceptionNote>}
      </div>

      <div id="t-src" className="pv3-content-frame" style={{ padding: "34px clamp(20px,3vw,42px) 72px" }}>
        <SectionHeader
          n="05"
          title="Sources et confiance"
          right={
            <button type="button" onClick={() => patch({ screen: "sources" as AppState["screen"], territoryFilterId: F.id })} style={{ border: 0, background: "transparent", cursor: "pointer", padding: 0, fontSize: 12, color: "#0B1A2A" }}>
              Sources connectées →
            </button>
          }
        />
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 24 }}>
          <div>
            {F.sources.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "rgba(11,26,42,.5)" }}>Aucune source connectée pour ce territoire.</div>
            ) : (
              F.sources.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(11,26,42,.07)" }}>
                  <span style={{ color: TRUST_COLOR[s.trustGlyph], fontSize: 14, marginTop: 2 }}>{s.trustGlyph}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.55)" }}>{s.detail}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(11,26,42,.45)" }}>{s.date}</div>
                </div>
              ))
            )}
          </div>
          {F.unknowns.length > 0 && (
            <div style={{ background: paper_a(1), border: "1px solid rgba(11,26,42,.1)", padding: "14px 16px" }}>
              <div style={{ fontSize: 11, color: "#B6522F", fontWeight: 600, marginBottom: 8 }}>Ce que nous ne savons pas</div>
              {F.unknowns.map((u, i) => (
                <div key={i} style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgba(11,26,42,.75)", paddingLeft: 10, borderLeft: "2px solid rgba(182,82,47,.35)", marginBottom: 8 }}>{u}</div>
              ))}
            </div>
          )}
        </div>
        {showNotes && <ConceptionNote>Section volontairement plus discrète. Elle reste visible, car la confiance conditionne la lecture de tout ce qui précède.</ConceptionNote>}
      </div>
    </div>
  );
}

function SectionHeader({ n, title, right }: { n: string; title: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, paddingBottom: 12, borderBottom: "1px solid rgba(11,26,42,.12)", marginBottom: 16, flexWrap: "wrap" }}>
      <span style={{ fontFamily: V3_FONT_MONO, fontSize: 11, color: "rgba(11,26,42,.4)" }}>{n}</span>
      <span style={{ fontFamily: V3_FONT_SERIF, fontSize: 21, fontWeight: 650, flex: 1 }}>{title}</span>
      {right}
    </div>
  );
}

function EmptyBox({ children }: { children?: React.ReactNode }) {
  return <div style={{ background: paper_a(1), border: "1px solid rgba(11,26,42,.1)", padding: "16px 18px", fontSize: 13, lineHeight: 1.5, color: "rgba(11,26,42,.65)", marginBottom: 14 }}>{children}</div>;
}

function Field({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", color: "rgba(11,26,42,.45)", marginBottom: 3 }}>{label}</div>
      <div style={{ fontWeight: bold ? 600 : 400, color: "rgba(11,26,42,.85)" }}>{value}</div>
    </div>
  );
}

function OppSteps({ index }: { index: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {OPPORTUNITY_UI_STEPS.map((step, i) => (
        <div key={step} style={{ flex: 1 }}>
          <div style={{ height: 2, background: i <= index ? "#B6522F" : "rgba(11,26,42,.15)", marginBottom: 6 }} />
          <div style={{ fontSize: 11, fontWeight: i === index ? 600 : 400, color: i === index ? "#0B1A2A" : "#4C5566" }}>{step}</div>
        </div>
      ))}
    </div>
  );
}
