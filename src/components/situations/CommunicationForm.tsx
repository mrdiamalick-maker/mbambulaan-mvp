"use client";

// Formulaire de communication — Lot 4, étape 4/4. Toujours simulée
// (arbitrage D5, PRODUCT_DECISION_LOG.md) : aucun envoi réel
// WhatsApp/SMS/appel, un enregistrement consigné (Communication.simulated
// = true, forcé côté domaine).
import { FormEvent, useState } from "react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Button } from "@/components/ui/button";
import { communicationChannelLabels, type Commitment, type CommunicationChannel } from "@/domain/types";

export function CommunicationForm({ situationId, commitments, onDone }: { situationId: string; commitments: Commitment[]; onDone: () => void }) {
  const { run } = useProduct();
  const [channel, setChannel] = useState<CommunicationChannel>("whatsapp");
  const [commitmentId, setCommitmentId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    try {
      const ok = await run({ type: "log_communication", situationId, channel, subject, body, commitmentId: commitmentId || undefined });
      if (ok) onDone();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 px-4">
      <label className="block text-xs font-semibold">
        Canal
        <select value={channel} onChange={(event) => setChannel(event.target.value as CommunicationChannel)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          {Object.entries(communicationChannelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      {commitments.length > 0 && (
        <label className="block text-xs font-semibold">
          Engagement concerné (facultatif)
          <select value={commitmentId} onChange={(event) => setCommitmentId(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="">Aucun — communication générale de la situation</option>
            {commitments.map((commitment) => <option key={commitment.id} value={commitment.id}>{commitment.label}</option>)}
          </select>
        </label>
      )}
      <label className="block text-xs font-semibold">
        Objet
        <input required value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Ex. Confirmation du délestage vers Mbour" />
      </label>
      <label className="block text-xs font-semibold">
        Contenu
        <textarea required rows={4} value={body} onChange={(event) => setBody(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Ce qui a été échangé." />
      </label>
      <p className="text-xs text-muted-foreground">Communication simulée — aucun envoi réel. Seul cet échange est consigné dans le dossier.</p>
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Enregistrement…" : "Consigner la communication"}</Button>
    </form>
  );
}
