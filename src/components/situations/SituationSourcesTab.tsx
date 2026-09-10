"use client";

import { useState } from "react";
import type { ProductState, Situation } from "@/domain/types";
import { evidenceTypeLabels } from "@/domain/types";
import { collectSituationSignals } from "@/domain/situation-narrative";
import { channelMeta, trustLabels } from "@/lib/status-tokens";
import { TrustGlyph, trustGlyphFromLevel } from "@/components/etat/TrustGlyph";
import { EvidenceLine } from "@/components/foundations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EvidenceForm } from "@/components/situations/EvidenceForm";
import type { CoordinationSpace } from "@/domain/types";

// LOT V3.2 (mandat §6, "Sources / Evidence") — provenance inspectable,
// jamais réduite à un chiffre ("5 sources") : chaque Signal réel
// (collectSituationSignals, déjà réutilisé par SituationRoom avant ce
// lot) et chaque Evidence réelle (state.evidences) restent listés avec
// leur type, leur trust réel et leur description — jamais agrégés en un
// score. "Enregistrer une preuve" reste la même commande réelle
// (record_evidence, EvidenceForm réutilisé sans modification) : ajouter
// une source RESTE une action, mais elle vit ici plutôt que dans l'onglet
// Action — une preuve EST une source, pas une décision.
export function SituationSourcesTab({ state, situation, commitments }: { state: ProductState; situation: Situation; commitments: CoordinationSpace["commitments"] }) {
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const signals = collectSituationSignals(state, situation);
  const evidences = state.evidences
    .filter((item) => item.situationId === situation.id)
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

  return (
    <div className="space-y-7">
      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Signaux à l’origine du dossier</p>
        {signals.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Aucun signal source identifié.</p>
        ) : (
          <div className="mt-3 divide-y border-y">
            {signals.map((signal) => {
              const Icon = channelMeta[signal.channel].icon;
              return (
                <div key={signal.id} className="flex items-start gap-3 py-3">
                  <span className="mt-0.5 shrink-0"><TrustGlyph level={trustGlyphFromLevel(signal.trust)} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{signal.title}</p>
                      <Badge variant="marine">{trustLabels[signal.trust]}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{signal.description}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground/70"><Icon size={12} /> {channelMeta[signal.channel].label}{signal.source ? ` · ${signal.source}` : ""}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="border-t pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Preuves enregistrées</p>
          <Button variant="outline" size="sm" onClick={() => setEvidenceOpen(true)}>Enregistrer une preuve</Button>
        </div>
        {evidences.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Aucune preuve enregistrée pour cette situation pour le moment.</p>
        ) : (
          <div className="mt-3 divide-y border-y">
            {evidences.map((evidence) => {
              const author = state.actors.find((item) => item.id === evidence.recordedByActorId);
              return (
                <div key={evidence.id} className="py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <TrustGlyph level={trustGlyphFromLevel(evidence.trust)} />
                    <p className="text-sm font-semibold">{evidenceTypeLabels[evidence.type]} — {evidence.label}</p>
                    {evidence.commitmentId && <Badge variant="marine">Engagement lié</Badge>}
                  </div>
                  <p className="mt-0.5 pl-[22px] text-xs text-muted-foreground">{evidence.detail}</p>
                  <div className="pl-[22px]">
                    <EvidenceLine className="mt-1" source={new Date(evidence.recordedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })} detail={author?.name} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <p className="border-t pt-5 text-[11.5px] leading-5 text-muted-foreground">
        Une situation ne change de niveau de connaissance que lorsqu’une source secondaire la confirme. Mbàmbulaan n’élève jamais une déclaration au rang de fait vérifié sans trace.
      </p>

      <Sheet open={evidenceOpen} onOpenChange={setEvidenceOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>Enregistrer une preuve</SheetTitle><SheetDescription>Photo, document, mesure ou appel consigné — rattaché à la situation ou à un engagement précis.</SheetDescription></SheetHeader>
          <EvidenceForm situationId={situation.id} commitments={commitments} onDone={() => setEvidenceOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
