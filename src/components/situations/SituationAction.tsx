"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, PauseCircle, PlayCircle } from "lucide-react";
import type { Situation } from "@/domain/types";
import { availableAction } from "@/domain/rules";
import { useProduct } from "@/components/providers/ProductProvider";
import { ResultatIcon } from "@/components/etat/MotifIcons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const labels = {
  qualify: "Qualifier le signal",
  prioritize: "Confirmer la priorité",
  coordinate: "Organiser la prise en charge",
  start_intervention: "Démarrer l’intervention",
  resume: "Reprendre l’intervention",
  record_result: "Enregistrer le résultat",
  close: "Clôturer la situation"
} as const;

const outcomes = {
  qualify: "Le signal sera recoupé. S’il est confirmé, son niveau de confiance passera à « Vérifiée ».",
  prioritize: "La priorité sera enregistrée et la mobilisation pourra commencer.",
  coordinate: "Un responsable, une échéance et un suivi seront attachés à la situation.",
  start_intervention: "L’exécution deviendra visible pour tous les acteurs autorisés.",
  resume: "Le blocage sera levé et l’intervention redeviendra active.",
  record_result: "Le résultat et son élément de confirmation prépareront la clôture.",
  close: "La situation sera réglée et alimentera les apprentissages."
} as const;

export function SituationAction({ situation }: { situation: Situation }) {
  const { run } = useProduct();
  const action = availableAction(situation.status);
  const [mode, setMode] = useState<"primary" | "wait" | null>(null);
  const [reason, setReason] = useState("");
  const [result, setResult] = useState("Production de glace rétablie et lots sécurisés");
  const [confirmation, setConfirmation] = useState("Constat terrain signé par le poste de quai");

  if (!action) {
    return (
      <div className="flex items-center gap-2 border-y py-4 text-sm font-semibold text-[#146144]">
        <CheckCircle2 size={17} /> Situation réglée · aucune action requise.
      </div>
    );
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (mode === "wait") {
      if (await run({ type: "wait", situationId: situation.id, reason })) setMode(null);
      return;
    }
    const command = action === "record_result"
      ? { type: action, situationId: situation.id, result, confirmation } as const
      : { type: action, situationId: situation.id } as const;
    if (await run(command)) setMode(null);
  };

  return (
    <Card className="overflow-hidden border-none bg-[#b6522f] text-white">
      <CardContent className="p-6">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/80"><ResultatIcon size={14} color="#fff8f2" /> Action recommandée</p>
        <h3 className="mt-2 text-xl font-semibold">{labels[action]}</h3>
        <p className="mt-2 text-sm leading-6 text-white/75">{outcomes[action]}</p>
        {mode ? (
          <form onSubmit={submit} className="mt-5 space-y-4 border-t border-white/15 pt-4">
            {mode === "wait" ? (
              <label className="block text-xs font-semibold">
                Pourquoi l’intervention est-elle bloquée ?
                <textarea required rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1.5 w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-foreground outline-none" />
              </label>
            ) : action === "record_result" ? (
              <>
                <label className="block text-xs font-semibold">
                  Résultat constaté
                  <textarea required rows={3} value={result} onChange={(e) => setResult(e.target.value)} className="mt-1.5 w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-foreground outline-none" />
                </label>
                <label className="block text-xs font-semibold">
                  Élément de confirmation
                  <input required value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className="mt-1.5 w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-foreground outline-none" />
                </label>
              </>
            ) : <p className="text-sm text-white/75">Confirmez l’action pour mettre à jour la situation et son historique.</p>}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="secondary"><CheckCircle2 size={16} /> Confirmer</Button>
              <Button type="button" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={() => setMode(null)}>Annuler</Button>
            </div>
          </form>
        ) : (
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setMode("primary")}>{action === "resume" ? <PlayCircle size={17} /> : <ArrowRight size={17} />} {labels[action]}</Button>
            {situation.status === "intervention" && <Button variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={() => setMode("wait")}><PauseCircle size={17} /> Signaler un blocage</Button>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
