"use client";

// Restylé en D9 (Lot 4, étape 2/4) — même logique et mêmes commandes
// qu'avant (availableAction, run()) : aucun changement de comportement,
// seule la palette change (sarcelle → marine/terre-cuite).
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
  coordinate: "Prendre en charge",
  start_intervention: "Démarrer l’intervention",
  resume: "Reprendre l’intervention",
  record_result: "Enregistrer le résultat",
  close: "Clôturer la situation"
} as const;

const outcomes = {
  qualify: "Le signal sera recoupé et passera au niveau Vérifiée.",
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
      <Card className="border-[#1d8a5f]/25 bg-[#1d8a5f]/[0.06]">
        <CardContent className="flex items-center gap-2 p-4 text-sm font-semibold text-[#1d8a5f]">
          <CheckCircle2 size={17} /> Aucune action requise. La situation est réglée.
        </CardContent>
      </Card>
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
    <Card className="border-primary/25 bg-gradient-to-br from-primary/[0.07] via-primary/[0.02] to-transparent">
      <CardContent className="p-5">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary"><ResultatIcon size={14} color="#b6522f" /> Action recommandée</p>
        <h3 className="mt-2 text-lg font-semibold">{labels[action]}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{outcomes[action]}</p>
        {mode ? (
          <form onSubmit={submit} className="mt-5 space-y-4 border-t pt-4">
            {mode === "wait" ? (
              <label className="block text-xs font-semibold">
                Pourquoi l’intervention est-elle bloquée ?
                <textarea required rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              </label>
            ) : action === "record_result" ? (
              <>
                <label className="block text-xs font-semibold">
                  Résultat constaté
                  <textarea required rows={3} value={result} onChange={(e) => setResult(e.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                </label>
                <label className="block text-xs font-semibold">
                  Élément de confirmation
                  <input required value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                </label>
              </>
            ) : <p className="text-sm text-muted-foreground">Confirmez l’action pour mettre à jour la situation et son historique.</p>}
            <div className="flex flex-wrap gap-2">
              <Button type="submit"><CheckCircle2 size={16} /> Confirmer</Button>
              <Button type="button" variant="ghost" onClick={() => setMode(null)}>Annuler</Button>
            </div>
          </form>
        ) : (
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={() => setMode("primary")}>{action === "resume" ? <PlayCircle size={17} /> : <ArrowRight size={17} />} {labels[action]}</Button>
            {situation.status === "intervention" && <Button variant="outline" onClick={() => setMode("wait")}><PauseCircle size={17} /> Signaler un blocage</Button>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
