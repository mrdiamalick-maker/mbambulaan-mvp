"use client";

// DocumentView — générateur documentaire réel, mandat "Intégration /etat
// V5 + Corrections Produit" §11/§12. Un document à la fois, ouvert en
// recouvrement depuis l'écran d'origine (jamais un nouveau module de
// navigation permanent). Pagination laissée au navigateur (break-inside
// évité par section, aucun compteur "Page X" fabriqué — c'est précisément
// le bug que le mandat demande de corriger). Impression via
// window.print() : pas de faux PDF backend.
import { useEffect, useRef, useState } from "react";
import { X, Printer } from "lucide-react";
import { buildDocument, type DocumentRequest } from "../lib/document-bridge";
import { useDomainRuntime } from "../lib/domain-runtime";
import { V3_FONT_MONO, V3_FONT_SANS, V3_FONT_SERIF } from "../theme";

export function DocumentView({ request, onClose }: { request: DocumentRequest; onClose: () => void }) {
  // runtime canonique (etat-v5 checkpoint E) — mêmes deux routes que
  // Arbitrages.tsx (GET /api/state, POST /api/actions) : le document
  // reflète l'état réel de la session dès qu'il est chargé, jamais la
  // seule copie statique DEMO_STATE (document-bridge.ts garde ce
  // fallback pour l'état initial le temps du chargement, et pour les
  // tests domaine).
  const runtime = useDomainRuntime();
  const [humanNote, setHumanNote] = useState("");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  // §18 du mandat — focus déplacé à l'ouverture, puis rendu à l'élément
  // qui avait le focus avant l'ouverture (jamais perdu dans la page).
  useEffect(() => {
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    return () => lastFocusedRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const doc = buildDocument(request, humanNote, runtime.state ?? undefined);
  const sectionBg: Record<string, string> = { fact: "#FFFFFF", gap: "#F7F3E9", note: "#FFFFFF" };
  const sectionAccent: Record<string, string> = { fact: "#0B1A2A", gap: "#B6522F", note: "rgba(11,26,42,.4)" };

  return (
    <div role="dialog" aria-modal="true" aria-label={doc.title} className="pv3-doc-overlay" style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(11,26,42,.55)", display: "flex", justifyContent: "center", overflowY: "auto", padding: "32px 16px" }}>
      <style>{`
        @media print {
          /* A4 explicite (etat-v5 checkpoint E) — sans cette règle, la
             taille de page imprimée dépend des réglages d'imprimante/
             locale du poste, jamais garantie en A4 malgré "PROJET — À
             VALIDER" annoncé comme tel. */
          @page { size: A4; margin: 16mm 14mm; }
          body * { visibility: hidden; }
          .pv3-doc-print, .pv3-doc-print * { visibility: visible; }
          .pv3-doc-print { position: absolute; left: 0; top: 0; width: 100%; }
          .pv3-doc-no-print { display: none !important; }
          .pv3-doc-section { break-inside: avoid; }
        }
      `}</style>
      <div className="pv3-doc-print" style={{ background: "#FFFFFF", width: "100%", maxWidth: 760, borderRadius: 3, boxShadow: "0 20px 60px rgba(0,0,0,.35)", overflow: "hidden" }}>
        <div className="pv3-doc-no-print" style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", background: "#0B1A2A", color: "#F7F3E9", position: "sticky", top: 0, zIndex: 2 }}>
          <span style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#DE9C74", flex: 1 }}>{doc.typeLabel}</span>
          <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid rgba(247,243,233,.3)", background: "transparent", color: "#F7F3E9", cursor: "pointer", borderRadius: 4, padding: "6px 12px", fontSize: 12, fontFamily: V3_FONT_SANS }}>
            <Printer size={14} /> Imprimer / exporter en PDF
          </button>
          <button ref={closeButtonRef} onClick={onClose} aria-label="Fermer le document" style={{ border: "1px solid rgba(247,243,233,.3)", background: "transparent", color: "#F7F3E9", cursor: "pointer", borderRadius: 999, padding: 6, display: "flex" }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "28px 34px 10px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 10px", border: "1px solid #B6522F", borderRadius: 999, fontSize: 10.5, fontWeight: 600, color: "#B6522F", marginBottom: 14 }}>
            PROJET — À VALIDER
          </div>
          <div style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(11,26,42,.5)" }}>{doc.typeLabel} · généré le {doc.generatedAtLabel}</div>
          <h1 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 26, lineHeight: 1.2, margin: "8px 0 0" }}>{doc.title}</h1>
          {doc.subtitle && <div style={{ fontSize: 12.5, color: "rgba(11,26,42,.6)", marginTop: 6 }}>{doc.subtitle}</div>}
          <div style={{ marginTop: 12, padding: "9px 12px", background: "#F7F3E9", fontSize: 11, lineHeight: 1.5, color: "rgba(11,26,42,.65)" }}>
            Document construit à partir des données du Demo World Mbàmbulaan. Les montants et volumes non marqués « réel » restent des données de démonstration et ne constituent pas des statistiques officielles. Mbàmbulaan n’émet aucune recommandation institutionnelle automatique.
          </div>
        </div>

        <div style={{ padding: "6px 34px 30px" }}>
          {doc.sections.map((section) => (
            <div key={section.heading} className="pv3-doc-section" style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid rgba(11,26,42,.1)", background: sectionBg[section.kind] }}>
              <div style={{ fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: sectionAccent[section.kind], marginBottom: 9, fontWeight: 600 }}>{section.heading}</div>
              {section.lines.map((line, i) => (
                <p key={i} style={{ margin: "0 0 8px", fontSize: 13, lineHeight: 1.6, color: section.kind === "gap" ? "rgba(11,26,42,.6)" : "rgba(11,26,42,.85)" }}>{line}</p>
              ))}
            </div>
          ))}

          {request.type === "decision" && (
            <div className="pv3-doc-no-print" style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid rgba(11,26,42,.1)" }}>
              {doc.hasCanonicalDecision ? (
                // hasCanonicalDecision (etat-v5 checkpoint E) — une Decision
                // réelle est déjà enregistrée pour cette situation (section
                // "Décision humaine" ci-dessus) : plus de champ de saisie
                // libre, qui n'aurait plus aucun effet sur le document et
                // laisserait croire qu'il pourrait réécrire une décision
                // déjà prise.
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: "rgba(11,26,42,.55)" }}>
                  Une décision a déjà été enregistrée pour cette situation (voir « Décision humaine » ci-dessus) : elle fait foi et ne peut pas être remplacée par une note libre dans ce document.
                </p>
              ) : (
                <>
                  <label style={{ display: "block", fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginBottom: 8 }} htmlFor="pv3-doc-human-note">
                    Décision humaine à consigner (facultatif — jamais pré-remplie par Mbàmbulaan)
                  </label>
                  <textarea
                    id="pv3-doc-human-note"
                    value={humanNote}
                    onChange={(event) => setHumanNote(event.target.value)}
                    rows={3}
                    placeholder="Ex. : option retenue, décideur, date, justification…"
                    style={{ width: "100%", boxSizing: "border-box", resize: "vertical", border: "1px solid rgba(11,26,42,.2)", borderRadius: 4, padding: "9px 11px", fontFamily: V3_FONT_SANS, fontSize: 13 }}
                  />
                </>
              )}
            </div>
          )}

          <div style={{ marginTop: 24, paddingTop: 14, borderTop: "1px solid rgba(11,26,42,.1)", fontFamily: V3_FONT_MONO, fontSize: 10.5, color: "rgba(11,26,42,.4)" }}>
            Mbàmbulaan — document généré, non signé.
          </div>
        </div>
      </div>
    </div>
  );
}
