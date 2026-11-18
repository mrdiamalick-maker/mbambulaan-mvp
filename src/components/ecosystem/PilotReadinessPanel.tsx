"use client";

// PilotReadinessPanel — Sprint T04 ("Live Pilot Readiness + Commercial
// Validation", docs/product/CURRENT_SPRINT.md §3/§8/§9/§10/§12). Composant
// séparé plutôt qu'ajouté dans TerrainMatchingWorkspace.tsx (même
// discipline que ce dernier vis-à-vis de CoordinationWorkspace.tsx) :
// isolé et revu indépendamment, monté sur la page Administration
// (déjà réservée à l'administrateur côté serveur, layout.tsx) — jamais un
// CRM, jamais un tableau de bord BI (mandat §8/§9, "do not build a CRM" /
// "do not fabricate analytics precision").
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, RefreshCw, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProduct } from "@/components/providers/ProductProvider";
import { buildPilotActorRows, buildPilotScorecard } from "@/domain/pilot";
import { buildTerrainValueEvidence } from "@/domain/terrain-matching";
import type { WhatsappConfigurationStatus } from "@/channels/whatsapp-health";
import type { ProductState, WillingnessToPayResponse } from "@/domain/types";
import { willingnessToPayResponseLabels } from "@/domain/types";

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

// ConfigurationStatusRow — jamais la valeur d'un secret, uniquement la
// présence (mandat §3, "never expose secret values in UI/logs").
function ConfigurationStatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 border-t py-2 text-sm first:border-t-0">
      <span>{label}</span>
      <Badge variant={ok ? "outline" : "secondary"}>{ok ? "Configuré" : "Non configuré"}</Badge>
    </div>
  );
}

function WhatsappHealthSection() {
  const [status, setStatus] = useState<WhatsappConfigurationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/whatsapp-health")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Vérification indisponible."))))
      .then((payload) => {
        if (active) setStatus(payload as WhatsappConfigurationStatus);
      })
      .catch(() => {
        if (active) setError("Vérification indisponible.");
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm font-semibold">Configuration live (WhatsApp / IA)</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Aucune valeur de secret n’est jamais affichée ici — uniquement la présence ou l’absence de chaque configuration requise.
        </p>
        {error && <p className="mt-2 text-xs text-amber-700">{error}</p>}
        {status && (
          <div className="mt-2">
            <ConfigurationStatusRow label="Webhook entrant (vérification + signature)" ok={status.inboundConfigured} />
            <ConfigurationStatusRow label="Envoi sortant WhatsApp" ok={status.outboundConfigured} />
            <ConfigurationStatusRow label="Téléchargement de média" ok={status.mediaConfigured} />
            <ConfigurationStatusRow label="Fournisseur IA (Anthropic — texte/image)" ok={status.anthropicConfigured} />
            <ConfigurationStatusRow label="Fournisseur de transcription (OpenAI Whisper — voix)" ok={status.whisperConfigured} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PilotScorecardSection({ state }: { state: ProductState }) {
  const scorecard = buildPilotScorecard(state);
  const entries: Array<[string, number]> = [
    ["Acteurs onboardés", scorecard.onboardedActors],
    ["Utilisateurs actifs", scorecard.activeUsers],
    ["Interactions substantielles", scorecard.substantiveInteractions],
    ["Besoins déclarés", scorecard.needCount],
    ["Capacités déclarées", scorecard.capacityCount],
    ["Correspondances proposées", scorecard.matchesProposed],
    ["Coordinations initiées", scorecard.coordinationsInitiated],
    ["Coordinations réussies", scorecard.successfulCoordinations],
    ["Organisations fournisseurs ayant reçu une opportunité", scorecard.providerOrganizationsReceivingOpportunities]
  ];
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm font-semibold">Tableau de bord pilote</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Chaque nombre est un compte exact de données pilote réelles (aucune donnée de démonstration n’y entre — voir IMPLEMENTATION_LOG.md).
        </p>
        <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-3">
          {entries.map(([label, value]) => (
            <div key={label} className="rounded-md border p-3">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PilotActorsSection({ state }: { state: ProductState }) {
  const rows = buildPilotActorRows(state);
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-[#1d4468]" />
          <p className="text-sm font-semibold">Acteurs pilotes réels ({rows.length})</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Uniquement les contacts passés par l’onboarding WhatsApp — aucun acteur de démonstration.</p>
        {rows.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Aucun acteur pilote réel pour le moment.</p>
        ) : (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-xs">
              <thead className="bg-muted/60 uppercase text-muted-foreground">
                <tr>
                  <th className="p-2">Nom</th>
                  <th className="p-2">Téléphone</th>
                  <th className="p-2">Rôle</th>
                  <th className="p-2">Site</th>
                  <th className="p-2">Onboarding</th>
                  <th className="p-2">Dernière interaction</th>
                  <th className="p-2">Interactions</th>
                  <th className="p-2">Besoins</th>
                  <th className="p-2">Capacités</th>
                  <th className="p-2">Coordinations</th>
                  <th className="p-2">Valeur reçue</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.actorId} className="border-t">
                    <td className="p-2 font-semibold">{row.name}</td>
                    <td className="p-2">{row.phone}</td>
                    <td className="p-2">{row.role}</td>
                    <td className="p-2">{row.territoryLabel}</td>
                    <td className="p-2">{row.onboardingComplete ? "Complet" : "En cours"}</td>
                    <td className="p-2">{formatDate(row.lastInteractionAt)}</td>
                    <td className="p-2">{row.substantiveInteractions}</td>
                    <td className="p-2">{row.needsCreated}</td>
                    <td className="p-2">{row.capacitiesCreated}</td>
                    <td className="p-2">
                      {row.coordinationsCompleted}/{row.coordinationsInitiated}
                    </td>
                    <td className="p-2">{row.receivedProviderValue ? "Oui" : "Non"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ProviderResearchRow — une ligne de recherche commerciale par fournisseur
// pilote réel (déduit des capacités déclarées, mandat §10). Clé par
// organizationId si connue, sinon par actorId (l'immense majorité des
// fournisseurs pilotes aujourd'hui — T01, aucune organisation fabriquée).
function ProviderResearchRow({ state, organizationId, actorId, label }: { state: ProductState; organizationId?: string; actorId?: string; label: string }) {
  const { run } = useProduct();
  const existing = state.commercialResearchRecords.find((item) =>
    organizationId ? item.organizationId === organizationId : item.actorId === actorId
  );
  const [contactedForPilot, setContactedForPilot] = useState(existing?.contactedForPilot ?? false);
  const [pilotParticipationAccepted, setPilotParticipationAccepted] = useState(existing?.pilotParticipationAccepted ?? false);
  const [willingnessToPayAsked, setWillingnessToPayAsked] = useState(existing?.willingnessToPayAsked ?? false);
  const [willingnessToPayResponse, setWillingnessToPayResponse] = useState<WillingnessToPayResponse | "">(existing?.willingnessToPayResponse ?? "");
  const [indicativeAmountFcfa, setIndicativeAmountFcfa] = useState(existing?.indicativeAmountFcfa?.toString() ?? "");
  const [note, setNote] = useState(existing?.note ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    await run({
      type: "record_commercial_research",
      organizationId,
      providerActorId: organizationId ? undefined : actorId,
      contactedForPilot,
      pilotParticipationAccepted,
      willingnessToPayAsked,
      willingnessToPayResponse: willingnessToPayResponse || undefined,
      indicativeAmountFcfa: indicativeAmountFcfa ? Number(indicativeAmountFcfa) : undefined,
      note: note.trim() || undefined
    });
    setBusy(false);
  }

  return (
    <div className="rounded-md border p-3">
      <p className="text-sm font-semibold">{label}</p>
      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs">
        <label className="flex items-center gap-1"><input type="checkbox" checked={contactedForPilot} onChange={(event) => setContactedForPilot(event.target.checked)} /> Contacté</label>
        <label className="flex items-center gap-1"><input type="checkbox" checked={pilotParticipationAccepted} onChange={(event) => setPilotParticipationAccepted(event.target.checked)} /> Participation acceptée</label>
        <label className="flex items-center gap-1"><input type="checkbox" checked={willingnessToPayAsked} onChange={(event) => setWillingnessToPayAsked(event.target.checked)} /> Disposition à payer demandée</label>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <select className="rounded-md border bg-background px-2 py-1" value={willingnessToPayResponse} onChange={(event) => setWillingnessToPayResponse(event.target.value as WillingnessToPayResponse | "")}>
          <option value="">Réponse disposition à payer —</option>
          {Object.entries(willingnessToPayResponseLabels).map(([value, text]) => (
            <option key={value} value={value}>{text}</option>
          ))}
        </select>
        <input className="w-32 rounded-md border bg-background px-2 py-1" placeholder="Montant FCFA indicatif" value={indicativeAmountFcfa} onChange={(event) => setIndicativeAmountFcfa(event.target.value)} />
        <input className="flex-1 rounded-md border bg-background px-2 py-1" placeholder="Note" value={note} onChange={(event) => setNote(event.target.value)} />
        <Button type="button" size="sm" disabled={busy} onClick={() => void save()}>Enregistrer</Button>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">Recherche commerciale uniquement — aucune facture ni abonnement n’est créé par cet enregistrement.</p>
    </div>
  );
}

function CommercialResearchSection({ state }: { state: ProductState }) {
  const providerActorIds = [...new Set(state.terrainCapacities.map((item) => item.actorId))];
  const providers = providerActorIds.map((actorId) => {
    const actor = state.actors.find((item) => item.id === actorId);
    return { actorId, organizationId: actor?.organizationId, label: actor?.name ?? "Fournisseur inconnu" };
  });
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm font-semibold">Recherche commerciale (fournisseurs pilotes)</p>
        <p className="mt-1 text-xs text-muted-foreground">Mandat D013 : la disposition à payer doit être validée avec de vrais acteurs avant toute automatisation de facturation.</p>
        {providers.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Aucun fournisseur pilote (capacité déclarée) pour le moment.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {providers.map((provider) => (
              <ProviderResearchRow key={provider.actorId} state={state} organizationId={provider.organizationId} actorId={provider.organizationId ? undefined : provider.actorId} label={provider.label} />
            ))}
          </div>
        )}
        {buildTerrainValueEvidence(state).length === 0 && providers.length > 0 && (
          <p className="mt-2 text-[11px] text-amber-700">
            Aucun fournisseur pilote n’a encore d’organisation réelle rattachée : « valeur reçue » restera à « Non » dans le tableau des acteurs tant qu’aucun rattachement n’existe (limite connue, voir IMPLEMENTATION_LOG.md).
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function OperationalResilienceSection({ state }: { state: ProductState }) {
  const { run } = useProduct();
  const [busyId, setBusyId] = useState<string | null>(null);

  const failedInteractions = state.terrainInteractions.filter((item) => item.processingStatus === "echec_traitement");
  const needsReview = state.terrainInteractions.filter((item) => item.interpretation?.needsHumanReview);
  const failedNotifications = state.terrainCoordinations.flatMap((coordination) =>
    coordination.notifications.filter((notification) => notification.status === "echec").map((notification) => ({ coordination, notification }))
  );
  const unresolvedFailures = state.operationalFailures.filter((item) => !item.resolved);

  async function retryNotification(coordinationId: string, target: "demandeur" | "fournisseur") {
    setBusyId(`${coordinationId}-${target}`);
    await run({ type: "retry_coordination_notification", coordinationId, target });
    setBusyId(null);
  }

  async function resolveFailure(failureId: string) {
    setBusyId(failureId);
    await run({ type: "mark_operational_failure_resolved", failureId });
    setBusyId(null);
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-[#1d4468]" />
          <p className="text-sm font-semibold">Résilience opérationnelle</p>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-md border p-3"><p className="text-xl font-bold">{failedInteractions.length}</p><p className="text-xs text-muted-foreground">Échecs de traitement IA</p></div>
          <div className="rounded-md border p-3"><p className="text-xl font-bold">{needsReview.length}</p><p className="text-xs text-muted-foreground">En attente de revue humaine</p></div>
          <div className="rounded-md border p-3"><p className="text-xl font-bold">{failedNotifications.length}</p><p className="text-xs text-muted-foreground">Notifications de coordination en échec</p></div>
          <div className="rounded-md border p-3"><p className="text-xl font-bold">{unresolvedFailures.length}</p><p className="text-xs text-muted-foreground">Échecs opérationnels non résolus</p></div>
        </div>

        {failedNotifications.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Notifications en échec</p>
            {failedNotifications.map(({ coordination, notification }) => (
              <div key={`${coordination.id}-${notification.target}`} className="flex items-center justify-between gap-2 rounded-md border p-2 text-xs">
                <span>Coordination {coordination.id} · {notification.target} · {notification.failureReason ?? "raison inconnue"}</span>
                <Button type="button" size="sm" variant="outline" disabled={busyId === `${coordination.id}-${notification.target}`} onClick={() => void retryNotification(coordination.id, notification.target)}>
                  <RefreshCw size={12} /> Réessayer
                </Button>
              </div>
            ))}
          </div>
        )}

        {unresolvedFailures.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Échecs opérationnels (envoi/traitement inattendu)</p>
            {unresolvedFailures.map((failure) => (
              <div key={failure.id} className="flex items-center justify-between gap-2 rounded-md border p-2 text-xs">
                <span>{formatDate(failure.occurredAt)} · {failure.channel} · {failure.reason}</span>
                <Button type="button" size="sm" variant="outline" disabled={busyId === failure.id} onClick={() => void resolveFailure(failure.id)}>
                  <CheckCircle2 size={12} /> Marquer comme résolu
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PilotReadinessPanel() {
  const { state } = useProduct();
  if (!state) return null;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Pilote en conditions réelles</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">Préparation du pilote WhatsApp</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configuration live, acteurs pilotes réels, mesures pilote et résilience opérationnelle — jamais un CRM, jamais une plateforme d’observabilité complète.
        </p>
      </div>
      <WhatsappHealthSection />
      <PilotScorecardSection state={state} />
      <PilotActorsSection state={state} />
      <CommercialResearchSection state={state} />
      <OperationalResilienceSection state={state} />
    </div>
  );
}
