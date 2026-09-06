// TrustGlyph — signature de confiance Mbàmbulaan (P2.DESIGN-1A.2, North
// Star Claude Design, §10 du mandat) : ○ Déclarée / ◐ Observée /
// ● Vérifiée, un seul endroit où ces 3 glyphes et leurs 3 libellés sont
// définis, réutilisé partout dans l'Espace État (sidebar, registres,
// dossier territorial) — jamais un second lexique de confiance inventé
// pour un écran précis.
//
// Mappage vers le modèle réel (pas une nouvelle valeur de domaine) :
// TrustLevel existant (domain/types.ts) porte déjà 4 niveaux
// (declaree/documentee/verifiee/contestee) sur Signal/Situation/
// ActorRelationship/Organization — ce composant est un habillage visuel
// pur sur ces valeurs réelles, jamais une évolution du modèle de confiance
// pour "coller à une étiquette" (mandat, explicite). "documentee" du
// modèle se lit visuellement comme le glyphe intermédiaire ◐ (même esprit
// que "Observée" du prototype : recoupée, mais pas encore confirmée par
// un tiers) — "contestee" reste un cas à part, jamais confondu avec l'un
// des 3 niveaux de progression de confiance.
import type { TrustLevel } from "@/domain/types";

export type TrustGlyphLevel = "declaree" | "observee" | "verifiee";

const glyphChar: Record<TrustGlyphLevel, string> = { declaree: "○", observee: "◐", verifiee: "●" };
const glyphClass: Record<TrustGlyphLevel, string> = {
  declaree: "etat-trust-glyph--declaree",
  observee: "etat-trust-glyph--observee",
  verifiee: "etat-trust-glyph--verifiee"
};
export const trustGlyphLabel: Record<TrustGlyphLevel, string> = { declaree: "Déclarée", observee: "Observée", verifiee: "Vérifiée" };

// Conversion honnête depuis le TrustLevel réel du Core (10 valeurs,
// domain/types.ts) vers les 3 glyphes du prototype — un habillage, jamais
// une nouvelle hiérarchie de confiance. "declaree"/"observee"/"verifiee"
// correspondent déjà mot pour mot ; les 7 autres sont classées par
// prudence, jamais par optimisme : en cas de doute, le niveau le plus bas
// visuellement l'emporte (mieux vaut sous-représenter une confiance que
// la sur-représenter, doctrine déjà appliquée ailleurs dans le Produit).
export function trustGlyphFromLevel(level: TrustLevel): TrustGlyphLevel {
  switch (level) {
    case "declaree": return "declaree";
    case "observee": return "observee";
    case "verifiee": return "verifiee";
    // Recoupée avec une autre source mais pas encore confirmée par un
    // tiers habilité — le même palier qu'"observée".
    case "documentee": return "observee";
    case "rapprochee": return "observee";
    // Synthèse post-vérification / source à mandat officiel — le palier
    // le plus élevé, jamais au-dessus de "vérifiée".
    case "consolidee": return "verifiee";
    case "officielle": return "verifiee";
    // Une estimation ou une confiance contestée/expirée ne doit jamais
    // se lire comme confirmée — repli sur le palier le plus prudent.
    case "estimee": return "declaree";
    case "contestee": return "declaree";
    case "expiree": return "declaree";
    default: return "declaree";
  }
}

export function TrustGlyph({ level, onDark = false, className }: { level: TrustGlyphLevel; onDark?: boolean; className?: string }) {
  return (
    <span
      className={`etat-trust-glyph ${glyphClass[level]} ${onDark ? "etat-trust-glyph--on-dark" : ""} ${className ?? ""}`}
      aria-hidden="true"
    >
      {glyphChar[level]}
    </span>
  );
}

// Variante composée "glyphe + libellé", utilisée partout où le prototype
// affiche les deux ensemble (registre Arbitrages, provenance du dossier
// territorial).
export function TrustGlyphLabel({ level, onDark = false, className }: { level: TrustGlyphLevel; onDark?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <TrustGlyph level={level} onDark={onDark} />
      {trustGlyphLabel[level]}
    </span>
  );
}
