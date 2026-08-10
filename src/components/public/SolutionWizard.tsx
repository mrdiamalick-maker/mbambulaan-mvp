"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Compass,
  GraduationCap,
  Handshake,
  MapPinned,
  MessageCircle,
  PackageSearch,
  PhoneCall,
  Snowflake,
  Store,
  Truck,
  Wrench
} from "lucide-react";
import type { PublicRequestActorType, PublicRequestChannel, PublicRequestIntent } from "@/domain/public/request";

interface IntentOption {
  id: PublicRequestIntent;
  title: string;
  description: string;
  icon: typeof Truck;
  quickOptions?: string[];
}

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

const actorTypes: { id: PublicRequestActorType; label: string }[] = [
  { id: "particulier", label: "Particulier / acteur de terrain" },
  { id: "entreprise", label: "Entreprise" },
  { id: "transporteur", label: "Transporteur / logisticien" },
  { id: "transformateur", label: "Transformateur" },
  { id: "organisation_professionnelle", label: "Organisation professionnelle" },
  { id: "ong_bailleur", label: "ONG / bailleur / programme" },
  { id: "institution", label: "Institution / collectivité" },
  { id: "centre_formation", label: "Centre de formation" },
  { id: "autre", label: "Autre" }
];

const channels: { id: PublicRequestChannel; label: string; icon: typeof MessageCircle }[] = [
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "telephone", label: "Téléphone", icon: PhoneCall },
  { id: "email", label: "E-mail", icon: Check }
];

type Step = "intent" | "territory" | "context" | "description" | "contact" | "channel" | "done";
const stepOrder: Step[] = ["intent", "territory", "context", "description", "contact", "channel", "done"];

export interface SolutionWizardProps {
  initialIntent?: PublicRequestIntent;
  initialCategory?: string;
  initialTerritory?: string;
  source?: string;
  context?: Record<string, string | undefined>;
}

export function SolutionWizard({ initialIntent, initialCategory, initialTerritory, source = "web", context }: SolutionWizardProps) {
  const [step, setStep] = useState<Step>(initialIntent ? "territory" : "intent");
  const [intentId, setIntentId] = useState<PublicRequestIntent | undefined>(initialIntent);
  const [quickTag, setQuickTag] = useState<string | undefined>(initialCategory);
  const [territory, setTerritory] = useState(initialTerritory ?? "");
  const [description, setDescription] = useState("");
  const [attachmentNote, setAttachmentNote] = useState("");
  const [actorType, setActorType] = useState<PublicRequestActorType | "">("");
  const [organization, setOrganization] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [channel, setChannel] = useState<PublicRequestChannel | "">("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  const intent = useMemo(() => intents.find((item) => item.id === intentId), [intentId]);
  const stepIndex = stepOrder.indexOf(step);
  const progressSteps: Step[] = stepOrder.filter((item) => item !== "done");

  function goTo(next: Step) {
    setError("");
    setStep(next);
  }

  function back() {
    const currentIndex = progressSteps.indexOf(step);
    if (currentIndex > 0) goTo(progressSteps[currentIndex - 1]);
  }

  function selectIntent(option: IntentOption) {
    setIntentId(option.id);
    setQuickTag(undefined);
    goTo(option.quickOptions?.length ? "territory" : "territory");
  }

  function afterTerritory() {
    if (intent?.quickOptions?.length) goTo("context");
    else goTo("description");
  }

  async function submit() {
    if (!consent) {
      setError("Merci d’accepter que Mbàmbulaan utilise ces informations pour traiter votre demande.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/public/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          context,
          intent: intentId,
          category: quickTag,
          territory,
          description,
          attachmentNote: attachmentNote || undefined,
          actorType,
          organization: organization || undefined,
          contactName,
          phone,
          email: email || undefined,
          preferredChannel: channel,
          consent,
          website_url: honeypot
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "La demande n’a pas pu être envoyée.");
        return;
      }
      setReference(payload.reference);
      setStep("done");
    } catch {
      setError("Connexion impossible. Vérifiez votre réseau puis réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "done") {
    return (
      <div className="surface p-7 md:p-9">
        <span className="grid size-12 place-items-center rounded-full bg-[#e9f7f1] text-[#126b58]"><CheckCircle2 /></span>
        <h2 className="mt-5 text-2xl font-[740] tracking-[-.035em] text-[#102e37]">Votre demande {reference} est enregistrée.</h2>
        <p className="mt-3 text-sm leading-6 text-[#536f67]">Mbàmbulaan qualifie votre besoin et reprend contact par {channel === "whatsapp" ? "WhatsApp" : channel === "telephone" ? "téléphone" : "e-mail"}. Conservez cette référence pour tout échange avec l’équipe.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/atlas" className="btn-primary">Explorer l’Atlas <ArrowRight size={15} /></Link>
          <Link href="/decouvrir" className="btn-secondary">Continuer à découvrir</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="surface overflow-hidden">
      <div className="flex items-center gap-1.5 border-b border-[#d9e3e3] bg-[#f7faf9] px-6 py-4">
        {progressSteps.map((item, index) => (
          <span key={item} className={`h-1.5 flex-1 rounded-full transition ${index <= stepIndex ? "bg-[#0a6d68]" : "bg-[#dbe6e4]"}`} />
        ))}
      </div>

      <div className="p-6 md:p-8">
        {step === "intent" && (
          <fieldset>
            <legend className="label">Que souhaitez-vous faire ?</legend>
            <p className="mt-2 text-sm leading-6 text-[#667b81]">Commencez par le résultat recherché. Vous n’avez pas besoin de connaître la solution technique.</p>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {intents.map((option) => (
                <button key={option.id} type="button" onClick={() => selectIntent(option)} className="flex items-start gap-3 rounded-2xl border border-[#d9e3e3] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#8fc3bd]">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e5f7f3] text-[#075568]"><option.icon size={18} /></span>
                  <span>
                    <strong className="block text-sm font-bold text-[#102e37]">{option.title}</strong>
                    <span className="mt-1 block text-xs leading-5 text-[#718489]">{option.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === "territory" && (
          <fieldset>
            <legend className="label">Quel territoire est concerné ?</legend>
            <p className="mt-2 text-sm leading-6 text-[#667b81]">Un quai, une localité, une région, ou « national » si votre besoin n’est pas localisé.</p>
            <input
              autoFocus
              value={territory}
              onChange={(event) => setTerritory(event.target.value)}
              placeholder="Ex. Joal, Mbour, Kayar, national…"
              className="mt-5 w-full rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#58b8ad] focus:ring-3 focus:ring-[#58b8ad]/10"
            />
            <div className="mt-6 flex justify-between">
              <button type="button" onClick={back} className="btn-secondary"><ArrowLeft size={15} /> Retour</button>
              <button type="button" disabled={!territory.trim()} onClick={afterTerritory} className="btn-primary disabled:opacity-50">Continuer <ArrowRight size={15} /></button>
            </div>
          </fieldset>
        )}

        {step === "context" && intent?.quickOptions && (
          <fieldset>
            <legend className="label">Précisez si possible</legend>
            <p className="mt-2 text-sm leading-6 text-[#667b81]">Cette précision aide Mbàmbulaan à orienter votre demande plus vite. Vous pouvez passer cette étape.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {intent.quickOptions.map((option) => (
                <button key={option} type="button" onClick={() => setQuickTag(option)} className={`rounded-full border px-4 py-2 text-sm font-bold transition ${quickTag === option ? "border-[#10373a] bg-[#10373a] text-white" : "border-[#d9e3e3] bg-white text-[#60737a] hover:border-[#8fc3bd]"}`}>
                  {option}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-between">
              <button type="button" onClick={back} className="btn-secondary"><ArrowLeft size={15} /> Retour</button>
              <button type="button" onClick={() => goTo("description")} className="btn-primary">Continuer <ArrowRight size={15} /></button>
            </div>
          </fieldset>
        )}

        {step === "description" && (
          <fieldset>
            <legend className="label">Décrivez votre besoin</legend>
            <textarea
              autoFocus
              required
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Expliquez simplement ce que vous cherchez à accomplir : contexte, volume approximatif, délai, contraintes…"
              className="mt-4 min-h-36 w-full resize-y rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#58b8ad] focus:ring-3 focus:ring-[#58b8ad]/10"
            />
            <label className="mt-4 block">
              <span className="text-xs font-bold text-[#536f74]">Lien vers un document utile (optionnel)</span>
              <input value={attachmentNote} onChange={(event) => setAttachmentNote(event.target.value)} placeholder="Vous pourrez aussi l’envoyer par WhatsApp ou e-mail" className="mt-2 w-full rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#58b8ad] focus:ring-3 focus:ring-[#58b8ad]/10" />
            </label>
            <div className="mt-6 flex justify-between">
              <button type="button" onClick={back} className="btn-secondary"><ArrowLeft size={15} /> Retour</button>
              <button type="button" disabled={description.trim().length < 8} onClick={() => goTo("contact")} className="btn-primary disabled:opacity-50">Continuer <ArrowRight size={15} /></button>
            </div>
          </fieldset>
        )}

        {step === "contact" && (
          <fieldset>
            <legend className="label">Vos coordonnées</legend>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-xs font-bold">Vous êtes</span>
                <select value={actorType} onChange={(event) => setActorType(event.target.value as PublicRequestActorType)} className="mt-2 w-full rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#58b8ad]">
                  <option value="">Choisissez…</option>
                  {actorTypes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </label>
              <label className="block"><span className="text-xs font-bold">Organisation (si applicable)</span><input value={organization} onChange={(event) => setOrganization(event.target.value)} className="mt-2 w-full rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#58b8ad]" /></label>
              <label className="block"><span className="text-xs font-bold">Nom et prénom</span><input required value={contactName} onChange={(event) => setContactName(event.target.value)} className="mt-2 w-full rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#58b8ad]" /></label>
              <label className="block"><span className="text-xs font-bold">Téléphone</span><input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+221 …" className="mt-2 w-full rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#58b8ad]" /></label>
              <label className="block"><span className="text-xs font-bold">E-mail (optionnel)</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#58b8ad]" /></label>
              <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} className="hidden" aria-hidden />
            </div>
            <div className="mt-6 flex justify-between">
              <button type="button" onClick={back} className="btn-secondary"><ArrowLeft size={15} /> Retour</button>
              <button type="button" disabled={!actorType || !contactName.trim() || phone.trim().length < 8} onClick={() => goTo("channel")} className="btn-primary disabled:opacity-50">Continuer <ArrowRight size={15} /></button>
            </div>
          </fieldset>
        )}

        {step === "channel" && (
          <fieldset>
            <legend className="label">Canal préféré pour la suite</legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {channels.map((item) => (
                <button key={item.id} type="button" onClick={() => setChannel(item.id)} className={`flex items-center gap-2 rounded-xl border p-4 text-sm font-bold transition ${channel === item.id ? "border-[#10373a] bg-[#10373a] text-white" : "border-[#d9e3e3] bg-white text-[#60737a] hover:border-[#8fc3bd]"}`}>
                  <item.icon size={17} /> {item.label}
                </button>
              ))}
            </div>
            <label className="mt-6 flex items-start gap-2 text-xs leading-5 text-[#718489]">
              <input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1" />
              <span>J’accepte que Mbàmbulaan utilise ces informations pour traiter ma demande et me recontacter. Aucune coordonnée n’est publiée ni revendue.</span>
            </label>
            {error && <p className="mt-3 text-sm font-semibold text-[#c24545]">{error}</p>}
            <div className="mt-6 flex justify-between">
              <button type="button" onClick={back} className="btn-secondary"><ArrowLeft size={15} /> Retour</button>
              <button type="button" disabled={!channel || submitting} onClick={() => void submit()} className="btn-primary disabled:opacity-50">{submitting ? "Envoi…" : "Envoyer ma demande"} <ArrowRight size={15} /></button>
            </div>
          </fieldset>
        )}
      </div>
    </div>
  );
}
