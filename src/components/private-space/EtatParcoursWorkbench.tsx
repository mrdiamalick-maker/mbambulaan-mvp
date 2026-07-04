"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ministryRegionalQuays, ministryRegions, type MinistryRegionName } from "@/data/ministryRegionalSpace";

type JourneyKind = "coordination" | "note-arbitrage" | "financement" | "verification-terrain";

type JourneyConfig = {
  kicker: string;
  title: string;
  promise: string;
  primary: string;
  accent: string;
  fields: string[];
  checklist: string[];
  finalTrace: string;
};

const configs: Record<JourneyKind, JourneyConfig> = {
  coordination: {
    kicker: "Point de coordination",
    title: "Préparer un point institutionnel complet",
    promise: "Transformer la lecture de l’espace État en point de coordination prêt à partager : priorités, acteurs, décisions, pièces et trace.",
    primary: "Valider le point de coordination",
    accent: "from-cyan-800 via-teal-700 to-emerald-600",
    fields: ["Objet du point", "Faits saillants", "Priorités à trancher", "Acteurs concernés", "Décisions attendues"],
    checklist: ["Périmètre confirmé", "Priorités relues", "Acteurs identifiés", "Pièces jointes vérifiées", "Validation humaine effectuée"],
    finalTrace: "Point de coordination validé et archivé dans les traces institutionnelles."
  },
  "note-arbitrage": {
    kicker: "Note d’arbitrage",
    title: "Créer une note structurée pour décision humaine",
    promise: "Passer d’un signal ou d’un financement à une note exploitable : contexte, problème, données, option recommandée, risque et validation.",
    primary: "Valider la note d’arbitrage",
    accent: "from-cyan-900 via-sky-700 to-teal-600",
    fields: ["Titre de la note", "Contexte", "Problème observé", "Données utilisées", "Décision proposée", "Risques et réserves"],
    checklist: ["Données vérifiées", "Référent associé", "Décision relue", "Pièces attachées", "Validation humaine effectuée"],
    finalTrace: "Note d’arbitrage validée, export simulé disponible et trace conservée."
  },
  financement: {
    kicker: "Arbitrage financement",
    title: "Instruire une demande de financement terrain",
    promise: "Donner une suite réelle à une demande : objet financé, montant, urgence, justificatif, décision possible, note liée et trace.",
    primary: "Valider l’arbitrage financement",
    accent: "from-amber-600 via-cyan-700 to-emerald-600",
    fields: ["Objet financé", "Montant", "Programme rattaché", "Justificatif attendu", "Décision proposée", "Commentaire d’arbitrage"],
    checklist: ["Montant contrôlé", "Justificatif demandé", "Urgence qualifiée", "Référent affecté", "Trace de décision générée"],
    finalTrace: "Arbitrage financement préparé, pièce demandée et décision humaine tracée."
  },
  "verification-terrain": {
    kicker: "Vérification terrain",
    title: "Demander et suivre une vérification terrain",
    promise: "Transformer une preuve partielle ou un doute en mission de vérification : consigne, référent, délai, pièce attendue et clôture.",
    primary: "Clôturer la vérification simulée",
    accent: "from-teal-800 via-cyan-700 to-blue-700",
    fields: ["Raison de la vérification", "Élément à vérifier", "Consigne terrain", "Pièce attendue", "Délai", "Compte rendu attendu"],
    checklist: ["Référent assigné", "Consigne envoyée", "Pièce attendue précisée", "Retour terrain reçu", "Clôture validée"],
    finalTrace: "Vérification terrain clôturée, pièce simulée reçue et trace conservée."
  }
};

const inputClass = "w-full rounded-2xl border border-cyan-100 bg-white/90 px-4 py-3 text-sm font-bold text-cyan-950 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100";
const labelClass = "text-[0.68rem] font-black uppercase tracking-[0.14em] text-cyan-800";

export function EtatParcoursWorkbench({ kind }: { kind: JourneyKind }) {
  const config = configs[kind];
  const searchParams = useSearchParams();
  const initialRegion = (searchParams.get("region") as MinistryRegionName | null) ?? "Tout";
  const initialQuayId = searchParams.get("quai") ?? "th-joal";
  const [region, setRegion] = useState<MinistryRegionName>(ministryRegions.includes(initialRegion) ? initialRegion : "Tout");
  const filteredQuays = useMemo(() => ministryRegionalQuays.filter((quay) => region === "Tout" || quay.region === region), [region]);
  const [quayId, setQuayId] = useState(initialQuayId);
  const activeQuay = filteredQuays.find((quay) => quay.id === quayId) ?? filteredQuays[0] ?? ministryRegionalQuays[0];
  const [fields, setFields] = useState<Record<string, string>>(() => Object.fromEntries(config.fields.map((field, index) => [field, defaultValue(field, index, activeQuay.name)])));
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [files, setFiles] = useState<string[]>([]);
  const [validated, setValidated] = useState(false);

  function updateField(field: string, value: string) {
    setFields((items) => ({ ...items, [field]: value }));
  }

  function resetForRegion(next: MinistryRegionName) {
    const nextQuay = ministryRegionalQuays.find((quay) => next === "Tout" || quay.region === next) ?? ministryRegionalQuays[0];
    setRegion(next);
    setQuayId(nextQuay.id);
  }

  const completion = Math.round(((Object.values(checked).filter(Boolean).length + (files.length ? 1 : 0) + (validated ? 1 : 0)) / (config.checklist.length + 2)) * 100);

  return <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,0.18),transparent_32%),linear-gradient(180deg,#eefbf8_0%,#f8fbfa_44%,#fff6e4_100%)] text-slate-950">
    <header className="border-b border-cyan-100 bg-white/90 px-4 py-5 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-[94rem] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/espace-prive/etat" className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-800 text-sm font-black text-white">Mb</Link>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Espace État · parcours complet</p>
            <h1 className="text-2xl font-black tracking-tight">{config.title}</h1>
          </div>
        </div>
        <Link href="/espace-prive/etat" className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-950 shadow-sm">Retour cockpit État</Link>
      </div>
    </header>

    <section className="mx-auto grid max-w-[94rem] gap-5 px-4 py-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)] sm:px-6">
      <section className="grid gap-5">
        <div className={`overflow-hidden rounded-[2.2rem] bg-gradient-to-br ${config.accent} p-6 text-white shadow-[0_24px_90px_rgba(8,145,178,0.22)]`}>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100">{config.kicker}</p>
          <h2 className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl">Suite métier, pièces, validation et trace</h2>
          <p className="mt-4 max-w-3xl text-sm font-bold leading-6 text-cyan-50">{config.promise}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {["Signal", "Instruction", "Validation", "Trace"].map((step, index) => <div key={step} className="rounded-2xl bg-white/14 p-3 ring-1 ring-white/20"><p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-50">0{index + 1}</p><p className="mt-1 font-black">{step}</p></div>)}
          </div>
        </div>

        <section className="rounded-[2rem] border border-cyan-100 bg-white/92 p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-3">
            <label className="grid gap-2"><span className={labelClass}>Région</span><select value={region} onChange={(event) => resetForRegion(event.target.value as MinistryRegionName)} className={inputClass}>{ministryRegions.map((item) => <option key={item} value={item}>{item === "Tout" ? "Toutes les régions" : item}</option>)}</select></label>
            <label className="grid gap-2"><span className={labelClass}>Quai / périmètre</span><select value={activeQuay.id} onChange={(event) => setQuayId(event.target.value)} className={inputClass}>{filteredQuays.map((quay) => <option key={quay.id} value={quay.id}>{quay.name}</option>)}</select></label>
            <label className="grid gap-2"><span className={labelClass}>Référent proposé</span><input value={activeQuay.referents[0] ?? "Référent terrain"} readOnly className={inputClass} /></label>
          </div>
        </section>

        <section className="rounded-[2rem] border border-cyan-100 bg-white/92 p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div><p className={labelClass}>Formulaire d’instruction</p><h3 className="text-2xl font-black text-cyan-950">Champs métier à compléter</h3></div>
            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-950 ring-1 ring-cyan-100">Données mockées · validation humaine</span>
          </div>
          <div className="grid gap-4">
            {config.fields.map((field, index) => <label key={field} className="grid gap-2"><span className={labelClass}>{field}</span>{index < 2 ? <input value={fields[field] ?? ""} onChange={(event) => updateField(field, event.target.value)} className={inputClass} /> : <textarea value={fields[field] ?? ""} onChange={(event) => updateField(field, event.target.value)} rows={index === config.fields.length - 1 ? 4 : 3} className={inputClass} />}</label>)}
          </div>
        </section>

        <section className="rounded-[2rem] border border-cyan-100 bg-white/92 p-5 shadow-sm">
          <p className={labelClass}>Pièces à joindre</p>
          <div className="mt-3 rounded-[1.5rem] border border-dashed border-cyan-300 bg-cyan-50/60 p-6 text-center">
            <p className="text-lg font-black text-cyan-950">Déposer des pièces justificatives</p>
            <p className="mt-2 text-sm font-bold text-slate-600">Upload simulé MVP : les noms de fichiers alimentent la trace de démonstration.</p>
            <input type="file" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []).map((file) => file.name))} className="mt-4 text-sm font-bold" />
          </div>
          {files.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{files.map((file) => <span key={file} className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-cyan-950 ring-1 ring-cyan-100">{file}</span>)}</div>}
        </section>
      </section>

      <aside className="grid gap-5 self-start lg:sticky lg:top-5">
        <section className="rounded-[2rem] border border-cyan-100 bg-white/94 p-5 shadow-[0_18px_60px_rgba(8,145,178,0.10)]">
          <p className={labelClass}>Progression</p>
          <div className="mt-3 flex items-end justify-between"><p className="text-5xl font-black text-cyan-950">{completion}%</p><p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">prêt démo</p></div>
          <div className="mt-4 h-3 rounded-full bg-cyan-50"><div className="h-full rounded-full bg-gradient-to-r from-cyan-700 via-teal-500 to-emerald-400" style={{ width: `${completion}%` }} /></div>
        </section>

        <section className="rounded-[2rem] border border-cyan-100 bg-white/94 p-5 shadow-sm">
          <p className={labelClass}>Checklist de validation</p>
          <div className="mt-4 grid gap-2">{config.checklist.map((item) => <label key={item} className="flex items-center gap-3 rounded-2xl bg-cyan-50/65 p-3 text-sm font-black text-cyan-950"><input type="checkbox" checked={!!checked[item]} onChange={() => setChecked((items) => ({ ...items, [item]: !items[item] }))} className="h-4 w-4 accent-cyan-700" />{item}</label>)}</div>
        </section>

        <section className="rounded-[2rem] border border-cyan-100 bg-white/94 p-5 shadow-sm">
          <p className={labelClass}>Trace finale</p>
          <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-700">{validated ? config.finalTrace : "La trace sera générée après validation humaine du parcours."}</p>
          <button onClick={() => setValidated(true)} className="mt-4 w-full rounded-full bg-gradient-to-r from-cyan-700 via-teal-600 to-emerald-600 px-5 py-3 text-sm font-black text-white shadow-[0_14px_35px_rgba(8,145,178,0.20)]">{config.primary}</button>
          <Link href="/espace-prive/etat" className="mt-3 block w-full rounded-full border border-cyan-200 bg-cyan-50 px-5 py-3 text-center text-sm font-black text-cyan-950">Retourner au cockpit</Link>
        </section>
      </aside>
    </section>
  </main>;
}

function defaultValue(field: string, index: number, quayName: string) {
  const defaults = [
    `${field} · ${quayName}`,
    `Situation à instruire pour ${quayName}`,
    "Données issues du cockpit État : tension, financement, preuve et référent.",
    "Décision humaine attendue après vérification des pièces.",
    "Risque principal : arbitrage sans justificatif complet.",
    "Trace à conserver dans Mbàmbulaan."
  ];
  return defaults[index] ?? "";
}
