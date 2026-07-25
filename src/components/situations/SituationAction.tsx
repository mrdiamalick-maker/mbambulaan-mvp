"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, PauseCircle, PlayCircle } from "lucide-react";
import type { Situation } from "@/domain/types";
import { availableAction } from "@/domain/rules";
import { useProduct } from "@/components/providers/ProductProvider";

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

  if (!action) return <div className="border border-[#b9dfd2] bg-[#e9f7f1] p-4 text-sm font-semibold text-[#126b58]"><CheckCircle2 className="mr-2 inline" size={17} />Aucune action requise. La situation est réglée.</div>;

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
    <div className="border-l-4 border-[#18a394] bg-[#f1faf7] p-5">
      <p className="label">Action recommandée</p>
      <h3 className="mt-2 text-lg font-bold">{labels[action]}</h3>
      <p className="mt-2 text-sm leading-6 text-[#52666d]">{outcomes[action]}</p>
      {mode ? (
        <form onSubmit={submit} className="mt-5 space-y-4 border-t border-[#cce4dd] pt-4">
          {mode === "wait" ? (
            <label className="block"><span className="text-sm font-bold">Pourquoi l’intervention est-elle bloquée ?</span><textarea required rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className="mt-2 w-full border border-[#aacdc5] bg-white p-3" /></label>
          ) : action === "record_result" ? (
            <>
              <label className="block"><span className="text-sm font-bold">Résultat constaté</span><textarea required rows={3} value={result} onChange={(e) => setResult(e.target.value)} className="mt-2 w-full border border-[#aacdc5] bg-white p-3" /></label>
              <label className="block"><span className="text-sm font-bold">Élément de confirmation</span><input required value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className="mt-2 w-full border border-[#aacdc5] bg-white p-3" /></label>
            </>
          ) : <p className="text-sm">Confirmez l’action pour mettre à jour la situation et son historique.</p>}
          <div className="flex flex-wrap gap-2"><button className="inline-flex items-center gap-2 bg-[#075466] px-4 py-2.5 text-sm font-bold text-white"><CheckCircle2 size={16} /> Confirmer</button><button type="button" onClick={() => setMode(null)} className="px-4 py-2.5 text-sm font-bold text-[#60737a]">Annuler</button></div>
        </form>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={() => setMode("primary")} className="inline-flex items-center gap-2 bg-[#075466] px-4 py-2.5 text-sm font-bold text-white">{action === "resume" ? <PlayCircle size={17} /> : <ArrowRight size={17} />}{labels[action]}</button>
          {situation.status === "intervention" && <button onClick={() => setMode("wait")} className="inline-flex items-center gap-2 border border-[#d8b65c] bg-white px-4 py-2.5 text-sm font-bold text-[#725b25]"><PauseCircle size={17} /> Signaler un blocage</button>}
        </div>
      )}
    </div>
  );
}
