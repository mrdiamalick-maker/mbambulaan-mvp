"use client";

// CollectiveNeedDossier — LOT 2 (mandat "Vertical Slice Kayar : du besoin
// dispersé à l'opportunité de programme de développement"). Dossier de
// lecture d'un besoin collectif, construit sur le même principe que la
// signature "pourquoi Mbàmbulaan vous le signale" introduite pour Joal
// (LOT 1) — mêmes helpers génériques (resolveSourceRefDisplay,
// describeFindingTrust, situation-narrative.ts), pas de seconde logique de
// résolution des KnowledgeSourceRef. Vocabulaire produit uniquement
// (mandat §20) : "Besoin collectif", "Constat Mbàmbulaan", jamais
// "CollectiveNeed"/"Finding" à l'écran.
import { useState } from "react";
import { CircleHelp, Compass, MapPinned, Sparkles, UsersRound } from "lucide-react";
import type { CollectiveNeed, ProductState } from "@/domain/types";
import { collectiveNeedStatusLabels, fieldMissionStatusLabels, observationNatureLabels } from "@/domain/types";
import { describeFindingTrust, findingsReferencedBy, resolveFindings, resolveSourceRefDisplay } from "@/domain/situation-narrative";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgramOpportunityForm } from "@/components/coordination/ProgramOpportunityForm";
import { FieldMissionForm } from "@/components/coordination/FieldMissionForm";

// Traduction métier du statut (mandat §6 : "traduit en métier", pas
// l'identifiant technique brut) — distincte de collectiveNeedStatusLabels
// (le nom court déjà utilisé pour les badges) : une phrase complète pour
// le corps du dossier.
const statusExplanation: Record<CollectiveNeed["status"], string> = {
  emerging: "Un premier signal de besoin partagé vient d'apparaître — pas encore assez d'éléments pour conclure.",
  qualifying: "Les éléments disponibles sont en cours d'examen pour confirmer qu'il s'agit bien d'un besoin partagé.",
  qualified: "Suffisamment documenté pour envisager une opportunité de développement.",
  not_confirmed: "Les éléments recueillis n'ont pas confirmé un besoin partagé — traité au cas par cas plutôt.",
  converted: "Déjà transformé en opportunité de développement — le dossier se poursuit à cette étape.",
  monitored: "Maintenu sous observation, sans qualification suffisante à ce stade pour aller plus loin."
};

const statusBadgeVariant: Record<CollectiveNeed["status"], "marine" | "amber" | "success" | "outline"> = {
  emerging: "outline",
  qualifying: "marine",
  qualified: "amber",
  not_confirmed: "outline",
  converted: "success",
  monitored: "outline"
};

export function CollectiveNeedDossier({ need, state, onDone }: { need: CollectiveNeed; state: ProductState; onDone: () => void }) {
  const [openingOpportunity, setOpeningOpportunity] = useState(false);
  const [organizingMission, setOrganizingMission] = useState(false);
  const territories = need.territoryIds.map((id) => state.territories.find((item) => item.id === id)?.name ?? id);
  const explainingFindings = findingsReferencedBy(state, need.sourceRefs);
  const sources = need.sourceRefs.map((ref) => resolveSourceRefDisplay(state, ref)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  // Ce que nous devons encore comprendre (mandat §9) — priorité au(x)
  // Finding(s) "connaissance manquante" formalisé(s) (plus riches :
  // statement + explanation), repli sur le texte libre knowledgeGaps
  // seulement s'il n'existe aucun Finding de ce type, jamais les deux à la
  // fois (pas de duplication de la même information sous deux formes).
  const knowledgeGapFindings = resolveFindings(state, need.knowledgeGapFindingIds);
  // LOT 3 — missions terrain déjà organisées pour ce besoin, lues à la
  // demande (filtrage sur collectiveNeedId), aucune duplication locale des
  // données de mission dans CollectiveNeed lui-même (mandat §26).
  const relatedMissions = state.fieldMissions.filter((item) => item.collectiveNeedId === need.id);

  if (openingOpportunity) {
    return <ProgramOpportunityForm need={need} state={state} onDone={onDone} onCancel={() => setOpeningOpportunity(false)} />;
  }
  if (organizingMission && knowledgeGapFindings[0]) {
    return <FieldMissionForm need={need} knowledgeGap={knowledgeGapFindings[0]} state={state} onDone={() => setOrganizingMission(false)} onCancel={() => setOrganizingMission(false)} />;
  }

  return (
    <div className="space-y-6 px-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ce qui émerge</p>
        <h2 className="mt-2 text-lg font-semibold leading-6">{need.title}</h2>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><UsersRound size={13} /> {territories.join(" · ")}</p>
      </div>

      {explainingFindings.length > 0 && (
        <div className="rounded-xl border bg-muted/40 p-4">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#1d4468]"><Sparkles size={13} /> Pourquoi Mbàmbulaan pense que ce besoin dépasse les cas individuels</p>
          {explainingFindings.map((finding) => (
            <div key={finding.id} className="mt-3 space-y-2.5">
              <p className="text-sm font-medium leading-6">{finding.statement}</p>
              <p className="text-sm leading-6 text-muted-foreground">{finding.explanation}</p>
              <p className="text-xs text-muted-foreground">{describeFindingTrust(finding)}</p>
            </div>
          ))}
          {sources.length > 0 && (
            <div className="mt-3 border-t pt-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Éléments observés</p>
              <ul className="mt-1.5 space-y-1">
                {sources.map((item) => (
                  <li key={`${item.ref.objectType}-${item.ref.objectId}`} className="text-xs leading-4">
                    <span className="font-semibold">{item.label}</span>{item.detail ? <span className="text-muted-foreground"> — {item.detail}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Qui est potentiellement concerné</p>
        {/* affectedPopulation est un texte libre volontairement imprécis
            (mandat §6 : "le modèle dit explicitement que le nombre exact
            n'est pas établi" — jamais un chiffre fabriqué ici). */}
        <p className="mt-1.5 text-sm leading-6">{need.affectedPopulation}</p>
      </div>

      {/* FAITS — conséquences réellement observées, style neutre. */}
      {need.consequences.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Conséquences observées</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm leading-5">
            {need.consequences.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}

      {/* HYPOTHÈSES — mandat §7 : jamais dans le même style visuel que les
          faits ci-dessus (bordure pointillée + italique + libellé explicite
          "hypothèse", pas une liste à puces neutre). */}
      {need.hypotheses.length > 0 && (
        <div className="rounded-lg border border-dashed p-3.5">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"><CircleHelp size={12} /> Hypothèses — pas des causes établies</p>
          <ul className="mt-2 space-y-1.5 text-sm italic leading-5 text-muted-foreground">
            {need.hypotheses.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ce que nous devons encore comprendre</p>
        {knowledgeGapFindings.length > 0 ? (
          <div className="mt-2 space-y-3">
            {knowledgeGapFindings.map((finding) => (
              <div key={finding.id} className="rounded-lg border bg-muted/30 p-3">
                <p className="text-sm font-medium leading-5">{finding.statement}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{finding.explanation}</p>
              </div>
            ))}
            <p className="text-xs font-semibold text-muted-foreground">Qualification nécessaire avant conception d’une intervention.</p>
            {/* LOT 3 (mandat §4/§5/§9) : la vérification terrain devient un
                vrai parcours plutôt qu'un texte honnête sans suite — sur
                décision humaine explicite seulement, jamais automatique. */}
            <Button variant="outline" className="w-full" onClick={() => setOrganizingMission(true)}>
              <MapPinned size={15} /> Organiser une vérification terrain
            </Button>
          </div>
        ) : need.knowledgeGaps.length > 0 ? (
          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm leading-5 text-muted-foreground">
            {need.knowledgeGaps.map((item) => <li key={item}>{item}</li>)}
          </ul>
        ) : (
          <p className="mt-1.5 text-sm text-muted-foreground">Aucun angle mort formalisé pour ce dossier à ce stade.</p>
        )}
      </div>

      {relatedMissions.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nouveaux éléments terrain</p>
          <div className="mt-2 space-y-3">
            {relatedMissions.map((mission) => {
              const missionObservations = state.observations.filter((item) => item.missionId === mission.id);
              return (
                <div key={mission.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium leading-5">{mission.title}</p>
                    <Badge variant="outline">{fieldMissionStatusLabels[mission.status]}</Badge>
                  </div>
                  {missionObservations.length > 0 ? (
                    <ul className="mt-2 space-y-1.5">
                      {missionObservations.map((observation) => (
                        <li key={observation.id} className="text-xs leading-5 text-muted-foreground">
                          <span className="font-semibold text-foreground">{observationNatureLabels[observation.nature]}</span> — {observation.content}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1.5 text-xs text-muted-foreground">Aucune observation enregistrée pour l’instant.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t pt-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">État de qualification</p>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge variant={statusBadgeVariant[need.status]}>{collectiveNeedStatusLabels[need.status]}</Badge>
          </div>
          <p className="mt-1.5 max-w-sm text-xs leading-5 text-muted-foreground">{statusExplanation[need.status]}</p>
        </div>
      </div>

      {need.status === "qualified" ? (
        <Button className="w-full" onClick={() => setOpeningOpportunity(true)}><Compass size={15} /> Examiner comme opportunité de développement</Button>
      ) : (
        <p className="rounded-lg border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">Ce besoin doit d’abord être qualifié avant de pouvoir être examiné comme opportunité de développement.</p>
      )}
    </div>
  );
}
