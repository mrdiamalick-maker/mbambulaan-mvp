import { Sparkles, ShieldCheck } from "lucide-react";
import type { Finding } from "@/domain/types";
import type { ResolvedSource, ValueTrailStep } from "@/domain/situation-narrative";
import { describeFindingTrust } from "@/domain/situation-narrative";
import { NarrativeFlow, type NarrativeFlowStep, EvidenceLine } from "@/components/foundations";

// XXL-R3 (§17-18, §21-22) — bloc de signature "pourquoi Mbàmbulaan vous le
// signale" PARTAGÉ entre la Situation Room (Coordinateur) et le drawer
// Situation de l'Espace État : jusqu'ici, seul le drawer l'affichait
// (etat/shared.tsx) — la personne qui agit réellement sur le dossier
// (Coordinateur, Room) ne voyait jamais pourquoi Mbàmbulaan avait retenu sa
// situation. Structure demandée CONSTATER / FONDEMENT / CONFIANCE, mêmes
// données réelles (Finding), rien de fabriqué : s'efface silencieusement
// sans Finding (situations issues des wrappers legacy), comme avant.
export function WhyMbambulaan({ finding, sources }: { finding?: Finding; sources: ResolvedSource[] }) {
  if (!finding) return null;
  return (
    <div className="rounded-xl border p-5" style={{ borderColor: "var(--mb-hairline)", background: "var(--mb-cream-200)" }}>
      <p className="mb-evidence flex items-center gap-1.5" style={{ color: "var(--mb-navy-800)" }}>
        <Sparkles size={13} /> Pourquoi Mbàmbulaan vous le signale
      </p>
      <div className="mt-3">
        <p className="mb-evidence" style={{ color: "var(--mb-stone-400)" }}>Constater</p>
        <p className="mt-1 mb-body text-[14px] font-medium" style={{ color: "var(--mb-navy-950)" }}>{finding.statement}</p>
      </div>
      <div className="mt-3">
        <p className="mb-evidence" style={{ color: "var(--mb-stone-400)" }}>Fondement</p>
        <p className="mt-1 mb-body text-[13.5px]">{finding.explanation}</p>
        {sources.length > 0 && (
          <ul className="mt-2 space-y-1">
            {sources.map((item) => (
              <li key={`${item.ref.objectType}-${item.ref.objectId}`}>
                <EvidenceLine source={item.label} detail={item.detail} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-3 flex items-start gap-1.5 border-t pt-3" style={{ borderColor: "var(--mb-hairline)" }}>
        <ShieldCheck size={13} className="mt-0.5 shrink-0" style={{ color: "var(--mb-navy-600)" }} />
        <div>
          <p className="mb-evidence" style={{ color: "var(--mb-stone-400)" }}>Confiance</p>
          <p className="mt-0.5 mb-body text-[13px]">{describeFindingTrust(finding)}</p>
        </div>
      </div>
    </div>
  );
}

// ValueTrailSection — même mise en récit (NarrativeFlow, §18.8) partagée
// par Room et le drawer : jusqu'ici Room utilisait déjà NarrativeFlow
// (XXL-R1) mais le drawer redessinait sa propre liste de cercles numérotés
// pour exactement la même donnée (buildValueTrail) — deux rendus distincts
// d'un seul et même récit. Extrait ici pour que les deux convergent.
export function ValueTrailSection({ steps, title }: { steps: ValueTrailStep[]; title?: string }) {
  return (
    <div>
      {title && <p className="mb-evidence mb-3" style={{ color: "var(--mb-stone-400)" }}>{title}</p>}
      <NarrativeFlow
        steps={steps.map((step): NarrativeFlowStep => ({
          id: step.key,
          label: step.label,
          state: step.proven ? "done" : "pending",
          content: (
            <>
              {step.detail}
              {!step.proven && <span className="ml-1.5" style={{ color: "var(--mb-stone-400)" }}>— à confirmer</span>}
            </>
          )
        }))}
      />
    </div>
  );
}
