"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Building2, Check, CheckCircle2, Compass, FileText, GraduationCap, Handshake, MapPinned, MessageCircle, PackageSearch, PhoneCall, Snowflake, Store, Target, Truck, Wrench } from "lucide-react";
import type { PublicRequestActorType, PublicRequestChannel, PublicRequestIntent } from "@/domain/public/request";
import { trackPublicEvent } from "@/lib/public-analytics";

interface IntentOption { id: PublicRequestIntent; title: string; description: string; icon: typeof Truck; quickOptions?: string[]; }
type FamilyId = "circuler" | "produire" | "capacites" | "intervention" | "autre";
interface IntentFamily { id: FamilyId; title: string; description: string; icon: typeof Truck; intents: PublicRequestIntent[]; }

const intents: IntentOption[] = [
  { id: "transport", title: "Transporter / livrer", description: "Organiser un transport, une collecte ou une livraison.", icon: Truck, quickOptions: ["Ponctuel", "Récurrent", "Chaîne du froid nécessaire"] },
  { id: "conservation", title: "Conserver / refroidir", description: "Glace, froid, stockage à qualifier.", icon: Snowflake, quickOptions: ["Glace", "Chambre froide", "Stockage sec"] },
  { id: "transformation", title: "Transformer / valoriser", description: "Trouver une capacité de transformation.", icon: Building2, quickOptions: ["Séchage", "Fumage", "Salage", "Conditionnement"] },
  { id: "equipement", title: "Acheter / s’équiper", description: "Équipements, consommables ou solution technique.", icon: PackageSearch },
  { id: "maintenance", title: "Entretenir / réparer", description: "Maintenance, diagnostic ou intervention.", icon: Wrench, quickOptions: ["Diagnostic", "Réparation", "Entretien préventif"] },
  { id: "formation", title: "Former / développer des compétences", description: "Préparer une formation ou un atelier.", icon: GraduationCap },
  { id: "debouches", title: "Trouver des débouchés", description: "Écouler, vendre ou distribuer une production.", icon: Store },
  { id: "programme", title: "Déployer un projet ou programme", description: "Territoire, acteurs, besoins et organisation de terrain.", icon: Building2 },
  { id: "sourcing", title: "Identifier des acteurs ou capacités", description: "Sourcing, partenaires locaux, expertise sectorielle.", icon: Handshake },
  { id: "comprendre-territoire", title: "Comprendre un territoire", description: "Obtenir une lecture utile d’un territoire pour décider.", icon: MapPinned },
  { id: "financement", title: "Financer / soutenir une initiative", description: "Investissement, fonctionnement ou étude à cadrer.", icon: Handshake, quickOptions: ["Investissement", "Fonctionnement", "Étude / diagnostic"] },
  { id: "autre", title: "Autre besoin", description: "Décrivez simplement ce que vous cherchez à accomplir.", icon: Compass }
];
const families: IntentFamily[] = [
  { id: "circuler", title: "Faire circuler", description: "Transporter des produits ou trouver des débouchés.", icon: Truck, intents: ["transport", "debouches"] },
  { id: "produire", title: "Conserver, transformer, équiper", description: "Froid, valorisation, équipement ou maintenance.", icon: Snowflake, intents: ["conservation", "transformation", "equipement", "maintenance"] },
  { id: "capacites", title: "Développer les capacités", description: "Compétences, acteurs et expertises utiles.", icon: GraduationCap, intents: ["formation", "sourcing"] },
  { id: "intervention", title: "Structurer une intervention", description: "Programme, financement ou compréhension d’un territoire.", icon: Handshake, intents: ["programme", "financement", "comprendre-territoire"] },
  { id: "autre", title: "Autre besoin", description: "Votre situation ne rentre pas dans ces familles.", icon: Compass, intents: ["autre"] }
];
const actorTypes: { id: PublicRequestActorType; label: string }[] = [
  { id: "particulier", label: "Particulier / acteur de terrain" }, { id: "entreprise", label: "Entreprise" }, { id: "transporteur", label: "Transporteur / logisticien" }, { id: "transformateur", label: "Transformateur" }, { id: "organisation_professionnelle", label: "Organisation professionnelle" }, { id: "ong_bailleur", label: "ONG / bailleur / programme" }, { id: "institution", label: "Institution / collectivité" }, { id: "centre_formation", label: "Centre de formation" }, { id: "autre", label: "Autre" }
];
const channels: { id: PublicRequestChannel; label: string; icon: typeof MessageCircle }[] = [{ id: "whatsapp", label: "WhatsApp", icon: MessageCircle }, { id: "telephone", label: "Téléphone", icon: PhoneCall }, { id: "email", label: "E-mail", icon: Check }];
type Step = "family" | "intent" | "territory" | "situation" | "contact" | "done";
// PUB-S2 (audit Premium XXL Public, CEO 2026-08-16) : chaque étape porte
// désormais une icône et un micro-signal ("produces") — ce que l'étape fait
// avancer concrètement — plutôt qu'une simple barre de progression segmentée
// sans contexte. Pas plus de texte, juste ce que chaque étape produit.
const progressSteps: { id: Exclude<Step, "done">; label: string; produces: string; icon: typeof Compass }[] = [
  { id: "family", label: "Objectif", produces: "intention", icon: Compass },
  { id: "intent", label: "Besoin", produces: "capacité", icon: Target },
  { id: "territory", label: "Territoire", produces: "localisation", icon: MapPinned },
  { id: "situation", label: "Situation", produces: "contexte", icon: FileText },
  { id: "contact", label: "Suite", produces: "canal", icon: Handshake }
];
// PUB-S1 (audit Premium XXL Public, CEO 2026-08-16) : un choix devient une
// ligne plate séparée par une bordure légère, plutôt qu'une mini-carte
// blanche flottante — c'est ce cumul (carte flottante DANS .pub-card) que
// l'audit nomme "cartes dans carte". Partagé par les étapes Objectif
// (families) et Besoin (familyIntents) : même geste, même liste. Hissé hors
// de SolutionWizard (pas une closure locale) pour ne pas recréer un
// composant à chaque rendu — recréer la fonction à chaque rendu du parent
// changerait son identité et démonterait/remonterait la liste inutilement.
function ChoiceList<T extends { id: string; title: string; description: string; icon: typeof Truck }>({ items, onSelect }: { items: T[]; onSelect: (item: T) => void }) {
  return (
    <div className="mt-6 divide-y divide-[var(--pub-stone-150)] border-y border-[var(--pub-stone-150)]">
      {items.map((item) => (
        <button key={item.id} type="button" onClick={() => onSelect(item)} className="flex w-full items-center gap-4 py-4 text-left transition hover:bg-[var(--pub-ivory-100)]">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--pub-ivory-200)] text-[var(--pub-deep-800)]"><item.icon size={18} /></span>
          <span className="min-w-0 flex-1">
            <strong className="block text-sm font-bold text-[var(--pub-deep-900)]">{item.title}</strong>
            <span className="mt-0.5 block text-xs leading-5 text-[var(--pub-stone-500)]">{item.description}</span>
          </span>
          <ArrowRight size={15} className="shrink-0 text-[var(--pub-stone-300)]" />
        </button>
      ))}
    </div>
  );
}

export interface SolutionWizardProps { initialIntent?: PublicRequestIntent; initialCategory?: string; initialTerritory?: string; source?: string; context?: Record<string, string | undefined>; }

export function SolutionWizard({ initialIntent, initialCategory, initialTerritory, source = "web", context }: SolutionWizardProps) {
  const initialFamily = initialIntent ? families.find((f) => f.intents.includes(initialIntent))?.id : undefined;
  const [step, setStep] = useState<Step>(initialIntent ? "territory" : "family"); const [familyId, setFamilyId] = useState<FamilyId | undefined>(initialFamily); const [intentId, setIntentId] = useState<PublicRequestIntent | undefined>(initialIntent); const [quickTag, setQuickTag] = useState<string | undefined>(initialCategory); const [territory, setTerritory] = useState(initialTerritory ?? ""); const [description, setDescription] = useState(""); const [attachmentNote, setAttachmentNote] = useState(""); const [actorType, setActorType] = useState<PublicRequestActorType | "">(""); const [organization, setOrganization] = useState(""); const [contactName, setContactName] = useState(""); const [phone, setPhone] = useState(""); const [email, setEmail] = useState(""); const [channel, setChannel] = useState<PublicRequestChannel | "">(""); const [consent, setConsent] = useState(false); const [honeypot, setHoneypot] = useState(""); const [submitting, setSubmitting] = useState(false); const [error, setError] = useState(""); const [reference, setReference] = useState("");
  const intent = useMemo(() => intents.find((i) => i.id === intentId), [intentId]); const family = useMemo(() => families.find((f) => f.id === familyId), [familyId]); const familyIntents = useMemo(() => intents.filter((i) => family?.intents.includes(i.id)), [family]); const stepIndex = progressSteps.findIndex((i) => i.id === step);
  useEffect(() => { if (initialIntent) trackPublicEvent("solution_started", { intent: initialIntent }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  function goTo(next: Step, track = true) { setError(""); setStep(next); if (track) trackPublicEvent("solution_step_completed", { step: next }); }
  function back() { const index = progressSteps.findIndex((i) => i.id === step); if (index > 0) goTo(progressSteps[index - 1].id, false); }
  function selectFamily(f: IntentFamily) { setFamilyId(f.id); setIntentId(undefined); setQuickTag(undefined); if (f.intents.length === 1) { const only = intents.find((i) => i.id === f.intents[0]); if (only) { setIntentId(only.id); trackPublicEvent("solution_started", { intent: only.id }); goTo("territory"); } } else goTo("intent"); }
  function selectIntent(option: IntentOption) { setIntentId(option.id); setQuickTag(undefined); trackPublicEvent("solution_started", { intent: option.id }); goTo("territory"); }
  async function submit() { if (!consent) { setError("Merci d’accepter que Mbàmbulaan utilise ces informations pour traiter votre demande."); return; } setSubmitting(true); setError(""); try { const response = await fetch("/api/public/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source, context, intent: intentId, category: quickTag, territory, description, attachmentNote: attachmentNote || undefined, actorType, organization: organization || undefined, contactName, phone, email: email || undefined, preferredChannel: channel, consent, website_url: honeypot }) }); const payload = await response.json(); if (!response.ok) { setError(payload.error ?? "La demande n’a pas pu être envoyée."); return; } setReference(payload.reference); setStep("done"); trackPublicEvent("solution_submitted", { intent: intentId, territory }); } catch { setError("Connexion impossible. Vérifiez votre réseau puis réessayez."); } finally { setSubmitting(false); } }
  const inputClass = "mt-2 w-full rounded-xl border border-[var(--pub-stone-300)] bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[var(--pub-turquoise-500)] focus:ring-3 focus:ring-[rgba(182,82,47,.10)]";

  if (step === "done") return <div className="pub-card p-7 md:p-9"><span className="grid size-12 place-items-center rounded-full bg-[rgba(182,82,47,.10)] text-[var(--pub-turquoise-500)]"><CheckCircle2 /></span><h2 className="mt-5 text-2xl font-[740] tracking-[-.035em] text-[var(--pub-deep-900)]">Votre demande {reference} est enregistrée.</h2><p className="mt-3 text-sm leading-6 text-[var(--pub-stone-700)]">Mbàmbulaan qualifie maintenant votre besoin et reprend contact par {channel === "whatsapp" ? "WhatsApp" : channel === "telephone" ? "téléphone" : "e-mail"}. Conservez cette référence pour tout échange avec l’équipe.</p><div className="mt-6 flex flex-wrap gap-2"><Link href="/atlas" className="pub-btn pub-btn-primary">Explorer l’Atlas <ArrowRight size={15}/></Link><Link href="/decouvrir" className="pub-btn pub-btn-outline">Continuer à découvrir</Link></div></div>;

  return (
    // PUB-S1 : surface principale blanche, plus éditoriale — bordure fine +
    // filet terracotta en tête plutôt que .pub-card (overflow-hidden, ombre
    // portée, coins très arrondis) qui donnait un rendu "formulaire SaaS".
    <div className="rounded-[var(--pub-radius-lg)] border border-[var(--pub-stone-150)] bg-[var(--pub-surface)]">
      <div className="border-b border-t-2 border-b-[var(--pub-stone-150)] border-t-[var(--pub-turquoise-500)] px-6 pb-6 pt-6 md:px-9 md:pt-7">
        <div className="flex items-center">
          {progressSteps.map((item, index) => {
            const state = index < stepIndex ? "done" : index === stepIndex ? "current" : "upcoming";
            return (
              <div key={item.id} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full border transition ${state === "upcoming" ? "border-[var(--pub-stone-150)] text-[var(--pub-stone-300)]" : "border-[var(--pub-turquoise-500)] bg-[var(--pub-turquoise-500)] text-white"}`}>
                    {state === "done" ? <Check size={14} /> : <item.icon size={14} />}
                  </span>
                  <span className="hidden text-center sm:block">
                    <span className={`block text-[10px] font-bold uppercase tracking-[.06em] ${state === "upcoming" ? "text-[var(--pub-stone-500)]" : "text-[var(--pub-deep-900)]"}`}>{item.label}</span>
                    <span className="block text-[10px] text-[var(--pub-stone-500)]">{item.produces}</span>
                  </span>
                </div>
                {index < progressSteps.length - 1 && <span className={`mx-1.5 h-px flex-1 transition sm:mx-2 ${index < stepIndex ? "bg-[var(--pub-turquoise-500)]" : "bg-[var(--pub-stone-150)]"}`} />}
              </div>
            );
          })}
        </div>
      </div>
      <div className="p-6 md:p-9">
        {step === "family" && <fieldset><legend className="pub-eyebrow">Que cherchez-vous à accomplir ?</legend><p className="mt-2 text-sm leading-6 text-[var(--pub-stone-700)]">Commencez par votre objectif. Vous n’avez pas besoin de connaître la solution technique ni le prestataire.</p><ChoiceList items={families} onSelect={selectFamily} /></fieldset>}
        {step === "intent" && <fieldset><legend className="pub-eyebrow">Précisons le besoin</legend><p className="mt-2 text-sm leading-6 text-[var(--pub-stone-700)]">{family?.title} — choisissez le résultat le plus proche de votre situation.</p><ChoiceList items={familyIntents} onSelect={selectIntent} /><button type="button" onClick={back} className="pub-btn pub-btn-outline mt-6"><ArrowLeft size={15}/> Retour</button></fieldset>}
        {step === "territory" && <fieldset><legend className="pub-eyebrow">Où cela se passe-t-il ?</legend><p className="mt-2 text-sm leading-6 text-[var(--pub-stone-700)]">Un quai, une localité, une région, ou « national » si le besoin n’est pas localisé.</p><input autoFocus value={territory} onChange={(e) => setTerritory(e.target.value)} placeholder="Ex. Joal, Mbour, Kayar, national…" className={`mt-5 ${inputClass}`}/><div className="mt-6 flex justify-between">{!initialIntent ? <button type="button" onClick={back} className="pub-btn pub-btn-outline"><ArrowLeft size={15}/> Retour</button> : <span/>}<button type="button" disabled={!territory.trim()} onClick={() => goTo("situation")} className="pub-btn pub-btn-primary disabled:opacity-50">Continuer <ArrowRight size={15}/></button></div></fieldset>}
        {step === "situation" && <fieldset><legend className="pub-eyebrow">Parlez-nous de la situation</legend><p className="mt-2 text-sm leading-6 text-[var(--pub-stone-700)]">Quelques éléments concrets suffisent : ce qui se passe, le résultat recherché et les contraintes importantes.</p>{intent?.quickOptions?.length ? <div className="mt-5"><p className="text-xs font-bold text-[var(--pub-stone-700)]">Précision utile (optionnelle)</p><div className="mt-2 flex flex-wrap gap-2">{intent.quickOptions.map((option) => <button key={option} type="button" onClick={() => setQuickTag(quickTag === option ? undefined : option)} className={`rounded-full border px-4 py-2 text-sm font-bold ${quickTag === option ? "border-[var(--pub-deep-800)] bg-[var(--pub-deep-800)] text-white" : "border-[var(--pub-stone-150)] bg-white text-[var(--pub-stone-700)] hover:border-[var(--pub-turquoise-500)]"}`}>{option}</button>)}</div></div> : null}<textarea autoFocus required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez simplement la situation…" className={`mt-5 min-h-36 resize-y ${inputClass}`}/><label className="mt-4 block"><span className="text-xs font-bold text-[var(--pub-stone-700)]">Lien vers un document utile (optionnel)</span><input value={attachmentNote} onChange={(e) => setAttachmentNote(e.target.value)} className={inputClass}/></label><div className="mt-6 flex justify-between"><button type="button" onClick={back} className="pub-btn pub-btn-outline"><ArrowLeft size={15}/> Retour</button><button type="button" disabled={description.trim().length < 8} onClick={() => goTo("contact")} className="pub-btn pub-btn-primary disabled:opacity-50">Continuer <ArrowRight size={15}/></button></div></fieldset>}
        {step === "contact" && <fieldset><legend className="pub-eyebrow">Comment poursuivre avec vous ?</legend><p className="mt-2 text-sm leading-6 text-[var(--pub-stone-700)]">Indiquez qui vous êtes et le canal le plus simple pour reprendre la qualification.</p><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="md:col-span-2"><span className="text-xs font-bold">Vous êtes</span><select value={actorType} onChange={(e) => setActorType(e.target.value as PublicRequestActorType)} className={inputClass}><option value="">Choisissez…</option>{actorTypes.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}</select></label><label><span className="text-xs font-bold">Organisation (si applicable)</span><input value={organization} onChange={(e) => setOrganization(e.target.value)} className={inputClass}/></label><label><span className="text-xs font-bold">Nom et prénom</span><input value={contactName} onChange={(e) => setContactName(e.target.value)} className={inputClass}/></label><label><span className="text-xs font-bold">Téléphone</span><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass}/></label><label><span className="text-xs font-bold">E-mail (optionnel)</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass}/></label><input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="hidden" aria-hidden/></div><p className="mt-6 text-xs font-bold text-[var(--pub-stone-700)]">Canal préféré</p><div className="mt-2 grid gap-3 sm:grid-cols-3">{channels.map((i) => <button key={i.id} type="button" onClick={() => setChannel(i.id)} className={`flex items-center gap-2 rounded-xl border p-4 text-sm font-bold ${channel === i.id ? "border-[var(--pub-deep-800)] bg-[var(--pub-deep-800)] text-white" : "border-[var(--pub-stone-150)] bg-white text-[var(--pub-stone-700)] hover:border-[var(--pub-turquoise-500)]"}`}><i.icon size={17}/> {i.label}</button>)}</div><label className="mt-6 flex items-start gap-2 text-xs leading-5 text-[var(--pub-stone-500)]"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 accent-[var(--pub-turquoise-500)]"/><span>J’accepte que Mbàmbulaan utilise ces informations pour traiter ma demande et me recontacter. Aucune coordonnée n’est publiée ni revendue.</span></label>{error && <p className="mt-3 text-sm font-semibold text-[#a83f2a]">{error}</p>}<div className="mt-6 flex justify-between"><button type="button" onClick={back} className="pub-btn pub-btn-outline"><ArrowLeft size={15}/> Retour</button><button type="button" disabled={!actorType || !contactName.trim() || phone.trim().length < 8 || !channel || submitting} onClick={() => void submit()} className="pub-btn pub-btn-primary disabled:opacity-50">{submitting ? "Envoi…" : "Envoyer ma demande"} <ArrowRight size={15}/></button></div></fieldset>}
      </div>
    </div>
  );
}
