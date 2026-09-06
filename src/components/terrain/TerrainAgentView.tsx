"use client";

// TerrainAgentView — LOT 3 (mandat "Terrain — observer, vérifier et
// fiabiliser la réalité"). Expérience "Aujourd'hui" de la Fonction Terrain
// Mbàmbulaan (agent/relais — mandat §2, distincte de TerrainCaptainView,
// conservée inchangée pour l'Acteur de la filière). Mobile-first, un geste
// à la fois : mission prioritaire → Démarrer → OBSERVER/DOCUMENTER/
// QUALIFIER (mandat §9/§10), jamais un formulaire administratif à 40
// champs. "Signaler autre chose" reste un geste explicitement distinct
// d'une observation demandée par la mission (mandat §10) : un nouveau
// Signal (create_signal), pas une Observation.
import { FormEvent, useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardList, MapPin, PlayCircle, Radio } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { EvidenceType, FieldMission, ObservationNature, ProductState } from "@/domain/types";
import { evidenceTypeLabels, fieldMissionStatusLabels, observationNatureLabels } from "@/domain/types";

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

const ACTIVE_STATUSES: FieldMission["status"][] = ["a_preparer", "planifiee", "en_cours"];

export function TerrainAgentView({ state, actorId }: { state: ProductState; actorId: string }) {
  const { run } = useProduct();
  const actor = state.actors.find((item) => item.id === actorId);
  const myMissions = state.fieldMissions
    .filter((item) => item.responsibleActorId === actorId && ACTIVE_STATUSES.includes(item.status))
    .sort((a, b) => {
      if (a.status === "en_cours" && b.status !== "en_cours") return -1;
      if (b.status === "en_cours" && a.status !== "en_cours") return 1;
      const dueA = a.dueAt ? new Date(a.dueAt).getTime() : Infinity;
      const dueB = b.dueAt ? new Date(b.dueAt).getTime() : Infinity;
      return dueA - dueB;
    });
  const priorityMission = myMissions[0];
  const otherMissions = myMissions.slice(1);

  const [signaling, setSignaling] = useState(false);
  const [signalTitle, setSignalTitle] = useState("");
  const [signalDetail, setSignalDetail] = useState("");
  const [signalSent, setSignalSent] = useState(false);

  const submitOtherSignal = async () => {
    if (!priorityMission || !signalTitle.trim() || !signalDetail.trim()) return;
    const ok = await run({
      type: "create_signal",
      territoryId: priorityMission.territoryIds[0],
      title: signalTitle.trim(),
      description: signalDetail.trim(),
      channel: "terrain"
    });
    if (ok) {
      setSignalSent(true);
      setSignalTitle("");
      setSignalDetail("");
      setSignaling(false);
    }
  };

  if (!priorityMission) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Aujourd’hui</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">Bonjour {actor?.name?.split(" ")[0] ?? "Agent"}.</h1>
        </div>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Aucune mission terrain ne vous est assignée pour le moment.</p></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Aujourd’hui</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">Bonjour {actor?.name?.split(" ")[0] ?? "Agent"}.</h1>
      </div>

      <MissionCard state={state} mission={priorityMission} />

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary"><AlertTriangle size={14} /> Signaler autre chose</div>
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">Quelque chose de nouveau, sans rapport avec cette mission ? Ce n’est pas une observation de mission — c’est un nouveau signal.</p>
          {!signaling ? (
            <Button variant="outline" className="mt-3 w-full" onClick={() => setSignaling(true)}>Signaler</Button>
          ) : (
            <div className="mt-3 space-y-2.5">
              <input value={signalTitle} onChange={(event) => setSignalTitle(event.target.value)} placeholder="Ex. Quai encombré" className="w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
              <textarea value={signalDetail} onChange={(event) => setSignalDetail(event.target.value)} rows={2} placeholder="En quelques mots, ce qu’il faut savoir." className="w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => void submitOtherSignal()}>Envoyer</Button>
                <Button variant="ghost" onClick={() => setSignaling(false)}>Annuler</Button>
              </div>
            </div>
          )}
          {signalSent && !signaling && <p className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground"><Radio size={12} className="text-[#1d8a5f]" /> Signal transmis à la coordination.</p>}
        </CardContent>
      </Card>

      {otherMissions.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Autres missions à venir</p>
          <div className="mt-2 space-y-2">
            {otherMissions.map((mission) => (
              <div key={mission.id} className="rounded-lg border bg-card p-3">
                <p className="text-sm font-semibold">{mission.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{fieldMissionStatusLabels[mission.status]} · échéance {formatDate(mission.dueAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MissionCard({ state, mission }: { state: ProductState; mission: FieldMission }) {
  const { run } = useProduct();
  const [starting, setStarting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const territories = mission.territoryIds.map((id) => state.territories.find((item) => item.id === id)?.name ?? id);
  const observations = state.observations.filter((item) => item.missionId === mission.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const startMission = async () => {
    setStarting(true);
    try {
      await run({ type: "update_field_mission_status", missionId: mission.id, status: "en_cours" });
    } finally {
      setStarting(false);
    }
  };

  const finishMission = async () => {
    setFinishing(true);
    try {
      await run({ type: "update_field_mission_status", missionId: mission.id, status: "realisee", note: "Mission réalisée depuis l'expérience terrain" });
    } finally {
      setFinishing(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-sidebar p-5 text-sidebar-foreground">
        <div className="flex items-center gap-2 text-sidebar-foreground/60"><MapPin size={16} /><p className="text-xs font-bold uppercase tracking-widest">{territories.join(" · ")}</p></div>
        <p className="mt-2 text-lg font-semibold leading-6">{mission.title}</p>
        <p className="mt-1 text-sm text-sidebar-foreground/70">{mission.objective}</p>
      </div>
      <CardContent className="space-y-4 p-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pourquoi cette mission</p>
          <p className="mt-1 text-sm leading-5">{mission.reason}</p>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Échéance {formatDate(mission.dueAt)}</span>
          <Badge variant={mission.status === "en_cours" ? "amber" : "outline"}>{fieldMissionStatusLabels[mission.status]}</Badge>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Éléments à vérifier</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm leading-5">
            {mission.observationPoints.map((point) => <li key={point}>{point}</li>)}
          </ul>
        </div>

        {mission.status !== "en_cours" ? (
          <Button size="lg" className="h-14 w-full text-base" disabled={starting} onClick={() => void startMission()}>
            <PlayCircle size={18} /> {starting ? "Démarrage…" : "Démarrer la mission"}
          </Button>
        ) : (
          <>
            <ObservationForm mission={mission} state={state} />
            <Button variant="outline" className="w-full" disabled={finishing} onClick={() => void finishMission()}>
              <CheckCircle2 size={15} /> {finishing ? "Confirmation…" : "Terminer la mission"}
            </Button>
          </>
        )}

        {observations.length > 0 && (
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"><ClipboardList size={12} /> Observations déjà enregistrées</p>
            <div className="mt-2 space-y-2">
              {observations.map((observation) => (
                <div key={observation.id} className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold">{observationNatureLabels[observation.nature]}</span>
                    <span className="text-[10px] text-muted-foreground">{formatDate(observation.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{observation.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ObservationForm — OBSERVER (content) + QUALIFIER (nature) + DOCUMENTER
// (preuve facultative, réutilise Evidence). "Déclaration" vs "Observation
// documentée" (mandat §13) : une simple bascule plutôt que 2 parcours
// séparés — documentée exige une preuve, déclaration n'en exige aucune.
function ObservationForm({ mission, state }: { mission: FieldMission; state: ProductState }) {
  const { run } = useProduct();
  const [content, setContent] = useState("");
  const [nature, setNature] = useState<ObservationNature | "">("");
  // Micro-correctif Product (post-LOT 3, "territoire réel de
  // l'observation") : mission mono-territoire → préremplie, cachée à
  // l'agent (expérience extrêmement simple) ; multi-territoires → choix
  // explicite obligatoire avant d'enregistrer.
  const [territoryId, setTerritoryId] = useState(mission.territoryIds.length === 1 ? mission.territoryIds[0] : "");
  const [documented, setDocumented] = useState(false);
  const [evidenceType, setEvidenceType] = useState<EvidenceType>("photo");
  const [evidenceLabel, setEvidenceLabel] = useState("");
  const [evidenceDetail, setEvidenceDetail] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [justSent, setJustSent] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!content.trim()) { setError("Décrivez ce que vous constatez."); return; }
    if (!nature) { setError("Précisez ce que cette observation apporte (confirme, nuance, contredit, ou ne permet pas de conclure)."); return; }
    if (!territoryId) { setError("Précisez le territoire sur lequel cette observation a été réalisée."); return; }
    if (documented && (!evidenceLabel.trim() || !evidenceDetail.trim())) { setError("Une observation documentée doit préciser la preuve jointe (libellé et détail)."); return; }

    setPending(true);
    try {
      const ok = await run({
        type: "record_observation",
        missionId: mission.id,
        territoryId,
        content: content.trim(),
        nature,
        trust: documented ? "observee" : "declaree",
        evidence: documented ? { evidenceType, label: evidenceLabel.trim(), detail: evidenceDetail.trim() } : undefined
      });
      if (ok) {
        setContent("");
        setNature("");
        setDocumented(false);
        setEvidenceLabel("");
        setEvidenceDetail("");
        setJustSent(true);
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border bg-muted/20 p-4">
      {mission.territoryIds.length > 1 && (
        <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Territoire de cette observation
          <select required value={territoryId} onChange={(event) => setTerritoryId(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2.5 text-sm font-normal normal-case outline-none focus:border-primary">
            <option value="">Choisir…</option>
            {mission.territoryIds.map((id) => <option key={id} value={id}>{state.territories.find((item) => item.id === id)?.name ?? id}</option>)}
          </select>
        </label>
      )}

      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Observer</p>
      <textarea required rows={3} value={content} onChange={(event) => { setContent(event.target.value); setJustSent(false); }} placeholder="Que constatez-vous ?" className="w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />

      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Qualifier</p>
      <div className="grid grid-cols-2 gap-2">
        {(Object.entries(observationNatureLabels) as [ObservationNature, string][]).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setNature(value)}
            className={`rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${nature === value ? "border-primary bg-primary text-primary-foreground" : "bg-background"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 text-xs font-semibold">
        <input type="checkbox" checked={documented} onChange={(event) => setDocumented(event.target.checked)} />
        Documenter avec une preuve (photo, document, mesure…)
      </label>
      {documented && (
        <div className="space-y-2 rounded-md border border-dashed p-3">
          <select value={evidenceType} onChange={(event) => setEvidenceType(event.target.value as EvidenceType)} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            {Object.entries(evidenceTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <input value={evidenceLabel} onChange={(event) => setEvidenceLabel(event.target.value)} placeholder="Libellé de la preuve" className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <textarea rows={2} value={evidenceDetail} onChange={(event) => setEvidenceDetail(event.target.value)} placeholder="Détail — ce que la preuve montre" className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
      )}

      {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
      <Button type="submit" size="lg" className="h-12 w-full" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer l'observation"}</Button>
      {justSent && <p className="text-xs text-muted-foreground">Observation enregistrée.</p>}
    </form>
  );
}
