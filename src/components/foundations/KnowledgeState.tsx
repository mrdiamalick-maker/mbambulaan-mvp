import type { ReactNode } from "react";
import { HelpCircle } from "lucide-react";

type KnowledgeLevel = "connu" | "incomplet" | "a_verifier" | "non_etabli";

const levelLabel: Record<KnowledgeLevel, string> = {
  connu: "Connu",
  incomplet: "Incomplet",
  a_verifier: "À vérifier",
  non_etabli: "Non établi"
};

// XXL-R1, primitive 9/9 (§18.9) — connu / incomplet / à vérifier / non
// établi, présenté avec élégance plutôt que comme une erreur système
// (mandat explicite : un Knowledge Gap n'est pas un défaut, c'est une
// honnêteté). Registre discret (Evidence + icône fine), jamais un
// bandeau d'alerte rouge — l'absence de connaissance a la même dignité
// visuelle que la connaissance elle-même.
export function KnowledgeState({
  level,
  children
}: {
  level: KnowledgeLevel;
  children?: ReactNode;
}) {
  const isKnown = level === "connu";
  return (
    <p className="mb-body flex items-start gap-1.5 text-[13px]" style={{ color: "var(--mb-stone-600)" }}>
      {!isKnown && <HelpCircle size={13} className="mt-0.5 shrink-0" style={{ color: "var(--mb-stone-400)" }} aria-hidden="true" />}
      <span>
        <span className="mb-evidence" style={{ color: isKnown ? "var(--mb-success)" : "var(--mb-stone-500)" }}>{levelLabel[level]}</span>
        {children && <> — {children}</>}
      </span>
    </p>
  );
}
