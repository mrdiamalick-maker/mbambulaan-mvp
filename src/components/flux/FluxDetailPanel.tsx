"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import {
  incomingMessageDismissReasonLabels,
  signalCategoryLabels,
  type IncomingMessage,
  type IncomingMessageDismissReason,
  type ProductState,
  type Signal
} from "@/domain/types";
import { projectFluxContext, resolveReportedByActor, resolveTerritoryFromHint } from "@/domain/incoming-message";
import { channelMeta, trustLabels } from "@/lib/status-tokens";
import { useProduct } from "@/components/providers/ProductProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// LOT V3.3 (mandat §5/§6/§7) — panneau de détail progressif de la file
// d'entrée. Réutilise EXACTEMENT les deux commandes réelles déjà
// exposées par IncomingMessageThread (CoordinationWorkspace.tsx) —
// convert_message_to_signal / dismiss_incoming_message, mêmes champs,
// même validation — habillées ici dans la composition maître-détail
// Claude Design V3 plutôt que le fil de bulles existant. Aucune 3e
// commande, aucun geste fabriqué (mandat §7 : "Qualifier en intelligence
// programme"/"Transférer hors périmètre"/"Rattacher à la situation
// existante" de la maquette V3 n'ont pas de commande réelle correspondante
// à ce stade — omis plutôt qu'imités).
export function FluxDetailPanel({ state, message }: { state: ProductState; message: IncomingMessage }) {
  const { run } = useProduct();
  const [mode, setMode] = useState<"closed" | "qualify" | "dismiss">("closed");
  const [territoryId, setTerritoryId] = useState(() => resolveTerritoryFromHint(state, message.territoryHint)?.id ?? "");
  const [category, setCategory] = useState<Signal["category"]>("production");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(message.body);
  const [reportedByActorId, setReportedByActorId] = useState(message.reportedByActorId ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const [dismissReason, setDismissReason] = useState<IncomingMessageDismissReason>("doublon");
  const [dismissNote, setDismissNote] = useState("");
  const [duplicateOfSignalId, setDuplicateOfSignalId] = useState("");
  const [dismissPending, setDismissPending] = useState(false);
  const [dismissError, setDismissError] = useState("");

  const meta = channelMeta[message.channel];
  const declarantActor = resolveReportedByActor(state, message);
  const { matched, missing } = projectFluxContext(state, message);
  const converted = message.status === "converti";
  const dismissed = message.status === "ecarte";
  const settled = converted || dismissed;
  const resultingSignal = converted && message.resultingSignalId ? state.signals.find((item) => item.id === message.resultingSignalId) : undefined;
  const duplicateSignal = message.duplicateOfSignalId ? state.signals.find((item) => item.id === message.duplicateOfSignalId) : undefined;

  const submitQualify = async (event: FormEvent) => {
    event.preventDefault();
    if (!territoryId || !title.trim() || !description.trim()) {
      setError("Territoire, titre et description sont requis.");
      return;
    }
    setError("");
    setPending(true);
    try {
      const ok = await run({
        type: "convert_message_to_signal",
        messageId: message.id,
        territoryId,
        category,
        title,
        description,
        reportedByActorId: reportedByActorId || undefined
      });
      if (!ok) setError("La qualification en signal a échoué.");
      else setMode("closed");
    } finally {
      setPending(false);
    }
  };

  const submitDismiss = async (event: FormEvent) => {
    event.preventDefault();
    setDismissError("");
    setDismissPending(true);
    try {
      const ok = await run({
        type: "dismiss_incoming_message",
        messageId: message.id,
        reason: dismissReason,
        note: dismissNote.trim() || undefined,
        duplicateOfSignalId: dismissReason === "doublon" && duplicateOfSignalId ? duplicateOfSignalId : undefined
      });
      if (!ok) setDismissError("L’écartement a échoué.");
      else setMode("closed");
    } finally {
      setDismissPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[rgba(11,26,42,.12)]">
        <div className="border-b border-[rgba(11,26,42,.1)] p-5">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-semibold uppercase tracking-wide text-primary">{meta.label}</span>
            <span className="text-muted-foreground">
              {message.reportedBy}
              {declarantActor && <> · <Badge variant="outline" className="ml-1">Déclarant connu</Badge></>}
              {message.territoryHint && ` · ${message.territoryHint}`} · reçu {new Date(message.receivedAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <blockquote className="mt-3 rounded-md border-l-2 border-[rgba(11,26,42,.2)] bg-[#f7f3e9] px-4 py-3 text-sm leading-6 text-[rgba(11,26,42,.85)]">
            « {message.body} »
          </blockquote>
        </div>

        <div className="grid gap-px bg-[rgba(11,26,42,.1)] sm:grid-cols-2">
          <div className="bg-background p-4">
            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ce que le système a pu rattacher</p>
            {matched.length === 0 ? (
              <p className="text-xs text-muted-foreground">Rien de rattachable de façon défendable pour le moment.</p>
            ) : (
              <ul className="space-y-2">
                {matched.map((item) => (
                  <li key={item.key} className="flex items-center gap-2 border-b border-[rgba(11,26,42,.06)] pb-2 text-xs">
                    <span aria-hidden="true" className="text-[12px]" style={{ color: "#4e7b5a" }}>●</span>
                    <span className="flex-1 font-medium">{item.label}</span>
                    <span className="text-muted-foreground">{item.value}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-background p-4">
            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-primary">Ce qui manque pour qualifier</p>
            {missing.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucune information manquante identifiée.</p>
            ) : (
              <ul className="space-y-2">
                {missing.map((item) => (
                  <li key={item.key} className="flex items-center gap-2 border-b border-[rgba(11,26,42,.06)] pb-2 text-xs">
                    <span aria-hidden="true" className="text-[12px] text-primary">○</span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="p-5">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Qualification — une seule personne décide, la trace reste</p>

          {settled ? (
            <div className="flex items-start gap-2.5 rounded-md bg-[#0b1a2a] p-4 text-sm text-white">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <div>
                {converted ? (
                  <p className="font-medium">Signal créé depuis cette remontée{resultingSignal ? ` · « ${resultingSignal.title} »` : ""}.</p>
                ) : (
                  <p className="font-medium">
                    Écarté · {message.dismissedReason ? incomingMessageDismissReasonLabels[message.dismissedReason] : ""}
                    {duplicateSignal ? ` — doublon de « ${duplicateSignal.title} »` : ""}
                    {message.dismissedNote ? ` — ${message.dismissedNote}` : ""}
                  </p>
                )}
              </div>
            </div>
          ) : mode === "qualify" ? (
            <form onSubmit={submitQualify} className="space-y-3 rounded-md border border-dashed p-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block text-xs font-semibold text-muted-foreground">
                  Territoire
                  <select required value={territoryId} onChange={(event) => setTerritoryId(event.target.value)} className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm font-semibold text-foreground">
                    <option value="">À choisir…</option>
                    {state.territories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </label>
                <label className="block text-xs font-semibold text-muted-foreground">
                  Catégorie
                  <select value={category} onChange={(event) => setCategory(event.target.value as Signal["category"])} className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm font-semibold text-foreground">
                    {Object.entries(signalCategoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="block text-xs font-semibold text-muted-foreground">
                  Titre du signal
                  <input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm font-semibold text-foreground" placeholder="Ex. Production de glace ralentie au quai" />
                </label>
              </div>
              <label className="block text-xs font-semibold text-muted-foreground">
                Description
                <textarea required rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm font-semibold text-foreground" />
              </label>
              <label className="block text-xs font-semibold text-muted-foreground">
                Déclarant réel — si connu (facultatif)
                <select value={reportedByActorId} onChange={(event) => setReportedByActorId(event.target.value)} className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm font-semibold text-foreground">
                  <option value="">Personne non encore référencée</option>
                  {state.actors.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={pending} size="sm">{pending ? "Qualification…" : "Convertir en signal"} <ArrowRight size={15} /></Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setMode("closed")}>Annuler</Button>
              </div>
            </form>
          ) : mode === "dismiss" ? (
            <form onSubmit={submitDismiss} className="space-y-3 rounded-md border border-dashed p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-muted-foreground">
                  Raison
                  <select value={dismissReason} onChange={(event) => setDismissReason(event.target.value as IncomingMessageDismissReason)} className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm font-semibold text-foreground">
                    {Object.entries(incomingMessageDismissReasonLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                {dismissReason === "doublon" && (
                  <label className="block text-xs font-semibold text-muted-foreground">
                    Signal existant (facultatif)
                    <select value={duplicateOfSignalId} onChange={(event) => setDuplicateOfSignalId(event.target.value)} className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm font-semibold text-foreground">
                      <option value="">Non identifié précisément</option>
                      {state.signals.slice(0, 50).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                    </select>
                  </label>
                )}
              </div>
              <label className="block text-xs font-semibold text-muted-foreground">
                Note (facultative)
                <input value={dismissNote} onChange={(event) => setDismissNote(event.target.value)} className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm font-semibold text-foreground" placeholder="Contexte court, si utile — jamais obligatoire" />
              </label>
              {dismissError && <p className="text-xs font-semibold text-destructive">{dismissError}</p>}
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={dismissPending} size="sm" variant="outline">{dismissPending ? "Écartement…" : "Confirmer l’écartement"}</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setMode("closed")}>Annuler</Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setMode("qualify")}>Convertir en signal <ArrowRight size={15} /></Button>
              <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setMode("dismiss")}>Écarter</Button>
            </div>
          )}

          {!settled && (
            <p className="mt-4 border-l-2 border-[rgba(11,26,42,.15)] pl-3 text-xs leading-5 text-muted-foreground">
              Tant qu’un élément reste ici, il n’existe nulle part ailleurs dans Mbàmbulaan — c’est ce qui permet d’afficher un chiffre sans le qualifier à chaque fois.
            </p>
          )}
        </div>
      </div>

      {/* Provenance (mandat §11/§12) — la confiance n'est jamais celle du
          Signal produit tant qu'il n'existe pas encore : montrer un badge
          "vérifié" ici serait confondre traitement et vérification. */}
      <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="font-semibold uppercase tracking-wide">Confiance</span>
        {resultingSignal ? <>{trustLabels[resultingSignal.trust]} — celle du signal créé, pas de la remontée elle-même.</> : "Non applicable — une remontée non qualifiée n’a pas encore de niveau de confiance produit."}
      </p>
    </div>
  );
}
