"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ministryRegionalQuays, ministryRegions, type MinistryRegionName } from "@/data/ministryRegionalSpace";

type JourneyKind = "coordination" | "note-arbitrage" | "financement" | "verification-terrain";
type ActorKind = "referent" | "mareyeur" | "ong" | "institution" | "prive";

type JourneyConfig = {
  kicker: string;
  title: string;
  promise: string;
  primary: string;
  accent: string;
  fields: string[];
  checklist: string[];
  destination: ActorKind;
  destinationLabel: string;
  outboundType: string;
  expectedPiece: string;
  expectedDelay: string;
  aiReason: string;
  aiNextBestAction: string;
  finalTrace: string;
};

const configs: Record<JourneyKind, JourneyConfig> = {
  coordination: {
    kicker: "Point de coordination",
    title: "Préparer un point institutionnel complet",
    promise: "Transformer la lecture de l’espace État en coordination sortante : acteurs ciblés, décisions à prendre, demande transmise et retour attendu.",
    primary: "Confirmer et envoyer la coordination",
    accent: "from-cyan-800 via-teal-700 to-emerald-600",
    fields: ["Objet du point", "Faits saillants", "Priorités à trancher", "Acteurs concernés", "Décisions attendues"],
    checklist: ["Périmètre confirmé", "Priorités relues", "Acteurs identifiés", "Pièces jointes prêtes", "Envoi autorisé par l’agent État"],
    destination: "ong",
    destinationLabel: "ONG / partenaire terrain",
    outboundType: "Point de coordination partagé",
    expectedPiece: "Compte rendu d’activité ou retour de coordination",
    expectedDelay: "72h",
    aiReason: "Mbàmbulaan rapproche les quais sous tension, les programmes en cours et les acteurs déjà mobilisables.",
    aiNextBestAction: "Partager le point aux partenaires terrain puis attendre leurs retours dans l’espace ONG.",
    finalTrace: "Coordination envoyée à l’ONG partenaire, retour attendu sous 72h et journal État mis à jour."
  },
  "note-arbitrage": {
    kicker: "Note d’arbitrage",
    title: "Créer une note structurée pour décision humaine",
    promise: "Passer d’un signal ou d’un financement à une note exploitable, puis créer une action de suivi visible dans l’espace destinataire.",
    primary: "Valider la note et transmettre la suite",
    accent: "from-cyan-900 via-sky-700 to-teal-600",
    fields: ["Titre de la note", "Contexte", "Problème observé", "Données utilisées", "Décision proposée", "Risques et réserves"],
    checklist: ["Données vérifiées", "Référent associé", "Décision relue", "Pièces attachées", "Transmission autorisée par l’agent État"],
    destination: "institution",
    destinationLabel: "Institution / programme public",
    outboundType: "Note transmise pour instruction",
    expectedPiece: "Avis d’instruction ou accusé de réception programme",
    expectedDelay: "7 jours",
    aiReason: "L’IA rapproche tension, preuves disponibles, financement en attente et précédent de programme.",
    aiNextBestAction: "Transmettre la note à l’institution concernée et demander un avis d’instruction.",
    finalTrace: "Note transmise à l’institution, avis d’instruction attendu et décision conservée dans le journal Mbàmbulaan."
  },
  financement: {
    kicker: "Arbitrage financement",
    title: "Instruire une demande de financement terrain",
    promise: "Donner une suite réelle à une demande : objet financé, justificatif attendu, destinataire, délai et visibilité dans l’espace partenaire.",
    primary: "Envoyer la demande de pièce",
    accent: "from-amber-600 via-cyan-700 to-emerald-600",
    fields: ["Objet financé", "Montant", "Programme rattaché", "Justificatif attendu", "Décision proposée", "Commentaire d’arbitrage"],
    checklist: ["Montant contrôlé", "Justificatif qualifié", "Urgence qualifiée", "Destinataire confirmé", "Demande de pièce autorisée"],
    destination: "prive",
    destinationLabel: "Privé / fournisseur / programme",
    outboundType: "Demande de pièce financement",
    expectedPiece: "Devis, planning, rapport d’exécution ou justificatif",
    expectedDelay: "5 jours",
    aiReason: "Mbàmbulaan détecte un financement en attente avec preuve incomplète et moyen terrain critique.",
    aiNextBestAction: "Demander la pièce au partenaire concerné avant arbitrage final.",
    finalTrace: "Demande de pièce envoyée au partenaire privé/programme, retour attendu et arbitrage État en attente."
  },
  "verification-terrain": {
    kicker: "Vérification terrain",
    title: "Demander et suivre une vérification terrain",
    promise: "Transformer une preuve partielle ou un doute en mission terrain envoyée à un référent, avec retour attendu dans son futur espace.",
    primary: "Envoyer la mission au référent",
    accent: "from-teal-800 via-cyan-700 to-blue-700",
    fields: ["Raison de la vérification", "Élément à vérifier", "Consigne terrain", "Pièce attendue", "Délai", "Compte rendu attendu"],
    checklist: ["Référent assigné", "Consigne relue", "Pièce attendue précisée", "Délai confirmé", "Mission autorisée par l’agent État"],
    destination: "referent",
    destinationLabel: "Référent pêcheur / relais terrain",
    outboundType: "Mission de vérification terrain",
    expectedPiece: "Photo, relevé, commentaire ou compte rendu terrain",
    expectedDelay: "24h",
    aiReason: "L’IA signale que la preuve est partielle et que la décision serait fragile sans retour terrain.",
    aiNextBestAction: "Envoyer une mission courte au référent et attendre la pièce terrain.",
    finalTrace: "Mission envoyée au référent terrain, pièce attendue sous 24h et suivi visible côté État."
  }
};

const actorLinks: Record<ActorKind, string> = {
  referent: "/espace-prive/referent",
  mareyeur: "/espace-prive/mareyeur",
  ong: "/espace-prive/ong",
  institution: "/espace-prive/institution",
  prive: "/espace-prive/prive"
};

const inputClass = "w-full rounded-2xl border border-cyan-100 bg-white/90 px-4 py-3 text-sm font-bold text-cyan-950 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100";
const labelClass = "text-[0.68rem] font-black uppercase tracking-[0.14em] text-cyan-800";

export function EtatParcoursWorkbench({ kind, initialRegion = "Tout", initialQuayId = "th-joal" }: { kind: JourneyKind; initialRegion?: MinistryRegionName; initialQuayId?: string }) {
  const config = configs[kind];
  const [region, setRegion] = useState<MinistryRegionName>(ministryRegions.includes(initialRegion) ? initialRegion : "Tout");
  const filteredQuays = useMemo(() => ministryRegionalQuays.filter((quay) => region === "Tout" || quay.region === region), [region]);
  const [quayId, setQuayId] = useState(initialQuayId);
  const activeQuay = filteredQuays.find((quay) => quay.id === quayId) ?? filteredQuays[0] ?? ministryRegionalQuays[0];
  const [fields, setFields] = useState<Record<string, string>>(() => Object.fromEntries(config.fields.map((field, index) => [field, defaultValue(field, index, activeQuay.name)])));
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [files, setFiles] = useState<string[]>([]);
  const [validated, setValidated] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);

  function updateField(field: string, value: string) {
    setFields((items) => ({ ...items, [field]: value }));
  }

  function resetForRegion(next: MinistryRegionName) {
    const nextQuay = ministryRegionalQuays.find((quay) => next === "Tout" || quay.region === next) ?? ministryRegionalQuays[0];
    setRegion(next);
    setQuayId(nextQuay.id);
  }

  function applyAiSuggestion() {
    setFields((items) => ({
      ...items,
      [config.fields[0]]: `${config.kicker} · ${activeQuay.name}`,
      [config.fields[1]]: `Signal prioritaire sur ${activeQuay.name} (${activeQuay.region}) : tension ${activeQuay.tension}, preuve ${activeQuay.proofLevel}, financement ${activeQuay.pendingFunding}.`,
      [config.fields[2]]: config.aiReason,
      [config.fields[3]]: `Données utilisées : ${activeQuay.tonnage} t, ${activeQuay.landings} débarquement(s), ${activeQuay.incidents} incident(s), ${activeQuay.conflicts} conflit(s), ressources ${activeQuay.resources.join(", ")}.`,
      [config.fields[4]]: config.aiNextBestAction,
      [config.fields[5]]: `Risque si action sans retour : décision fragile, pièce manquante ou coordination non confirmée.`
    }));
  }

  const completion = Math.round(((Object.values(checked).filter(Boolean).length + (files.length ? 1 : 0) + (validated ? 1 : 0)) / (config.checklist.length + 2)) * 100);

  return <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,0.18),transparent_32%),linear-gradient(180deg,#eefbf8_0%,#f8fbfa_44%,#fff6e4_100%)] text-slate-950">
    <header className="border-b border-cyan-100 bg-white/90 px-4 py-5 backdrop-blur sm:px-6"><div className="mx-auto flex max-w-[94rem] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-center gap-4"><Link href="/espace-prive/etat" className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-800 text-sm font-black text-white">Mb</Link><div><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Espace État · parcours complet</p><h1 className="text-2xl font-black tracking-tight">{config.title}</h1></div></div><Link href="/espace-prive/etat" className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-950 shadow-sm">Retour cockpit État</Link></div></header>

    <section className="mx-auto grid max-w-[94rem] gap-5 px-4 py-6 lg:grid-cols-[minmax(0,1.22fr)_minmax(20rem,0.78fr)] sm:px-6">
      <section className="grid gap-5">
        <div className={`overflow-hidden rounded-[2.2rem] bg-gradient-to-br ${config.accent} p-6 text-white shadow-[0_24px_90px_rgba(8,145,178,0.22)]`}><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100">{config.kicker}</p><h2 className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl">Décider, envoyer, suivre le retour</h2><p className="mt-4 max-w-3xl text-sm font-bold leading-6 text-cyan-50">{config.promise}</p><div className="mt-6 grid gap-3 sm:grid-cols-4">{["Signal qualifié", "Suite préparée", "Action envoyée", "Retour attendu"].map((step, index) => <div key={step} className="rounded-2xl bg-white/14 p-3 ring-1 ring-white/20"><p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-50">0{index + 1}</p><p className="mt-1 font-black">{step}</p></div>)}</div></div>

        <section className="rounded-[2rem] border border-cyan-100 bg-white/92 p-5 shadow-sm"><div className="grid gap-4 lg:grid-cols-3"><label className="grid gap-2"><span className={labelClass}>Région</span><select value={region} onChange={(event) => resetForRegion(event.target.value as MinistryRegionName)} className={inputClass}>{ministryRegions.map((item) => <option key={item} value={item}>{item === "Tout" ? "Toutes les régions" : item}</option>)}</select></label><label className="grid gap-2"><span className={labelClass}>Quai / périmètre</span><select value={activeQuay.id} onChange={(event) => setQuayId(event.target.value)} className={inputClass}>{filteredQuays.map((quay) => <option key={quay.id} value={quay.id}>{quay.name}</option>)}</select></label><label className="grid gap-2"><span className={labelClass}>Référent proposé</span><input value={activeQuay.referents[0] ?? "Référent terrain"} readOnly className={inputClass} /></label></div></section>

        <section className="rounded-[2rem] border border-cyan-100 bg-white/92 p-5 shadow-sm"><div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between"><div><p className={labelClass}>Assistance Mbàmbulaan</p><h3 className="text-2xl font-black text-cyan-950">Plus-value IA visible</h3><p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-slate-600">Sans IA, l’agent complète le formulaire. Avec IA, Mbàmbulaan prépare une proposition, explique les données utilisées et recommande la suite sortante, sans décider.</p></div><button onClick={() => setAiEnabled((value) => !value)} className={aiEnabled ? "rounded-full bg-cyan-800 px-4 py-2 text-sm font-black text-white" : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600"}>{aiEnabled ? "IA activée" : "IA désactivée"}</button></div>{aiEnabled ? <div className="grid gap-3 lg:grid-cols-3"><InfoCard title="Pourquoi" value={config.aiReason} /><InfoCard title="Données utilisées" value={`${activeQuay.tonnage} t · ${activeQuay.proofLevel} · ${activeQuay.pendingFunding} · ${activeQuay.tension}`} /><InfoCard title="Prochaine action" value={config.aiNextBestAction} /><button onClick={applyAiSuggestion} className="lg:col-span-3 rounded-full bg-gradient-to-r from-cyan-700 via-teal-600 to-emerald-600 px-5 py-3 text-sm font-black text-white shadow-[0_14px_35px_rgba(8,145,178,0.20)]">Pré-remplir avec Mbàmbulaan IA</button></div> : <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-600">Mode manuel : aucune recommandation automatique. L’agent renseigne lui-même la suite, les destinataires et les pièces attendues.</p>}</section>

        <section className="rounded-[2rem] border border-cyan-100 bg-white/92 p-5 shadow-sm"><div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className={labelClass}>Formulaire d’instruction</p><h3 className="text-2xl font-black text-cyan-950">Champs métier à compléter</h3></div><span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-950 ring-1 ring-cyan-100">Validation humaine obligatoire</span></div><div className="grid gap-4">{config.fields.map((field, index) => <label key={field} className="grid gap-2"><span className={labelClass}>{field}</span>{index < 2 ? <input value={fields[field] ?? ""} onChange={(event) => updateField(field, event.target.value)} className={inputClass} /> : <textarea value={fields[field] ?? ""} onChange={(event) => updateField(field, event.target.value)} rows={index === config.fields.length - 1 ? 4 : 3} className={inputClass} />}</label>)}</div></section>

        <section className="rounded-[2rem] border border-cyan-100 bg-white/92 p-5 shadow-sm"><p className={labelClass}>Pièces à joindre</p><div className="mt-3 rounded-[1.5rem] border border-dashed border-cyan-300 bg-cyan-50/60 p-6 text-center"><p className="text-lg font-black text-cyan-950">Déposer des pièces justificatives</p><p className="mt-2 text-sm font-bold text-slate-600">Upload simulé MVP : les noms de fichiers alimentent le journal de coordination.</p><input type="file" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []).map((file) => file.name))} className="mt-4 text-sm font-bold" /></div>{files.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{files.map((file) => <span key={file} className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-cyan-950 ring-1 ring-cyan-100">{file}</span>)}</div>}</section>
      </section>

      <aside className="grid gap-5 self-start lg:sticky lg:top-5">
        <section className="rounded-[2rem] border border-cyan-100 bg-white/94 p-5 shadow-[0_18px_60px_rgba(8,145,178,0.10)]"><p className={labelClass}>Progression</p><div className="mt-3 flex items-end justify-between"><p className="text-5xl font-black text-cyan-950">{completion}%</p><p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">prêt envoi</p></div><div className="mt-4 h-3 rounded-full bg-cyan-50"><div className="h-full rounded-full bg-gradient-to-r from-cyan-700 via-teal-500 to-emerald-400" style={{ width: `${completion}%` }} /></div></section>
        <section className="rounded-[2rem] border border-cyan-100 bg-white/94 p-5 shadow-sm"><p className={labelClass}>Contrôle avant envoi</p><div className="mt-4 grid gap-2">{config.checklist.map((item) => <label key={item} className="flex items-center gap-3 rounded-2xl bg-cyan-50/65 p-3 text-sm font-black text-cyan-950"><input type="checkbox" checked={!!checked[item]} onChange={() => setChecked((items) => ({ ...items, [item]: !items[item] }))} className="h-4 w-4 accent-cyan-700" />{item}</label>)}</div></section>
        <section className="rounded-[2rem] border border-cyan-100 bg-white/94 p-5 shadow-sm"><p className={labelClass}>Coordination générée</p><div className="mt-3 grid gap-2 text-sm font-bold text-slate-700"><Row label="Action sortante" value={config.outboundType} /><Row label="Destinataire" value={config.destinationLabel} /><Row label="Espace cible" value={actorLinks[config.destination]} /><Row label="Pièce attendue" value={config.expectedPiece} /><Row label="Délai attendu" value={config.expectedDelay} /><Row label="Statut" value={validated ? "Envoyé · en attente de retour" : "Préparé · non envoyé"} /></div><p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-700">{validated ? config.finalTrace : "Après confirmation, une action sortante sera visible dans le futur espace destinataire et suivie côté État."}</p><button onClick={() => setValidated(true)} className="mt-4 w-full rounded-full bg-gradient-to-r from-cyan-700 via-teal-600 to-emerald-600 px-5 py-3 text-sm font-black text-white shadow-[0_14px_35px_rgba(8,145,178,0.20)]">{config.primary}</button><Link href={actorLinks[config.destination]} className="mt-3 block w-full rounded-full border border-cyan-200 bg-cyan-50 px-5 py-3 text-center text-sm font-black text-cyan-950">Voir l’espace destinataire</Link><Link href="/espace-prive/etat" className="mt-3 block w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-center text-sm font-black text-slate-700">Retourner au cockpit</Link></section>
      </aside>
    </section>
  </main>;
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return <div className="rounded-2xl border border-cyan-100 bg-cyan-50/65 p-4"><p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-cyan-800">{title}</p><p className="mt-2 text-sm font-bold leading-6 text-cyan-950">{value}</p></div>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 border-b border-slate-100 py-2"><span className="text-slate-500">{label}</span><span className="max-w-[12rem] text-right text-cyan-950">{value}</span></div>;
}

function defaultValue(field: string, index: number, quayName: string) {
  const defaults = [`${field} · ${quayName}`, `Situation à instruire pour ${quayName}`, "Données issues du cockpit État : tension, financement, preuve et référent.", "Décision humaine attendue après vérification des pièces.", "Action sortante proposée vers le bon espace acteur.", "Risque principal : arbitrage sans justificatif complet ou retour terrain." ];
  return defaults[index] ?? "";
}
