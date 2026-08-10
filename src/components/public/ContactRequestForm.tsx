"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { PublicRequestActorType, PublicRequestChannel, PublicRequestIntent } from "@/domain/public/request";

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

export interface ContactRequestFormProps {
  intent: PublicRequestIntent;
  category?: string;
  descriptionLabel?: string;
  descriptionPlaceholder?: string;
  descriptionRequired?: boolean;
  source?: string;
  context?: Record<string, string | undefined>;
}

export function ContactRequestForm({
  intent,
  category,
  descriptionLabel = "Votre message",
  descriptionPlaceholder = "Expliquez votre situation, votre projet ou votre question.",
  descriptionRequired = true,
  source = "web",
  context
}: ContactRequestFormProps) {
  const [description, setDescription] = useState("");
  const [territory, setTerritory] = useState("");
  const [actorType, setActorType] = useState<PublicRequestActorType | "">("");
  const [organization, setOrganization] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [channel, setChannel] = useState<PublicRequestChannel>("whatsapp");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (descriptionRequired && description.trim().length < 8) {
      setError("Merci de préciser votre demande en quelques mots.");
      return;
    }
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
          intent,
          category,
          territory: territory || undefined,
          description: description.trim() || "Demande de rappel sans précision complémentaire.",
          actorType: actorType || "autre",
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
    } catch {
      setError("Connexion impossible. Vérifiez votre réseau puis réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  if (reference) {
    return (
      <div className="pub-card p-7 md:p-9">
        <span className="grid size-12 place-items-center rounded-full bg-[#e9f7f1] text-[#126b58]"><CheckCircle2 /></span>
        <h2 className="mt-5 text-2xl font-[740] tracking-[-.035em] text-[var(--pub-deep-900)]">Votre demande {reference} est enregistrée.</h2>
        <p className="mt-3 text-sm leading-6 text-[#536f67]">Mbàmbulaan revient vers vous par {channel === "whatsapp" ? "WhatsApp" : channel === "telephone" ? "téléphone" : "e-mail"}. Conservez cette référence pour tout échange avec l’équipe.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/decouvrir" className="pub-btn pub-btn-primary">Continuer à découvrir <ArrowRight size={15} /></Link>
          <Link href="/atlas" className="pub-btn pub-btn-outline">Explorer l’Atlas</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="pub-card overflow-hidden">
      <div className="grid gap-5 p-6 md:grid-cols-2 md:p-8">
        <label className="block md:col-span-2">
          <span className="text-xs font-bold">{descriptionLabel}{descriptionRequired ? "" : " (optionnel)"}</span>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder={descriptionPlaceholder} className="mt-2 min-h-32 w-full resize-y rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#58b8ad] focus:ring-3 focus:ring-[#58b8ad]/10" />
        </label>
        <label className="block"><span className="text-xs font-bold">Territoire concerné (optionnel)</span><input value={territory} onChange={(event) => setTerritory(event.target.value)} placeholder="Ex. Joal, Mbour, national…" className="mt-2 w-full rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#58b8ad]" /></label>
        <label className="block">
          <span className="text-xs font-bold">Vous êtes</span>
          <select value={actorType} onChange={(event) => setActorType(event.target.value as PublicRequestActorType)} className="mt-2 w-full rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#58b8ad]">
            <option value="">Choisissez…</option>
            {actorTypes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <label className="block"><span className="text-xs font-bold">Organisation (si applicable)</span><input value={organization} onChange={(event) => setOrganization(event.target.value)} className="mt-2 w-full rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#58b8ad]" /></label>
        <label className="block"><span className="text-xs font-bold">Canal préféré</span>
          <select value={channel} onChange={(event) => setChannel(event.target.value as PublicRequestChannel)} className="mt-2 w-full rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#58b8ad]">
            <option value="whatsapp">WhatsApp</option>
            <option value="telephone">Téléphone</option>
            <option value="email">E-mail</option>
          </select>
        </label>
        <label className="block"><span className="text-xs font-bold">Nom et prénom</span><input required value={contactName} onChange={(event) => setContactName(event.target.value)} className="mt-2 w-full rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#58b8ad]" /></label>
        <label className="block"><span className="text-xs font-bold">Téléphone</span><input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+221 …" className="mt-2 w-full rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#58b8ad]" /></label>
        <label className="block md:col-span-2"><span className="text-xs font-bold">E-mail (optionnel)</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#58b8ad]" /></label>
        <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} className="hidden" aria-hidden />

        <label className="flex items-start gap-2 text-xs leading-5 text-[#718489] md:col-span-2">
          <input required type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1" />
          <span>J’accepte que Mbàmbulaan utilise ces informations pour traiter ma demande et me recontacter.</span>
        </label>
        {error && <p className="text-sm font-semibold text-[#c24545] md:col-span-2">{error}</p>}
        <button disabled={submitting} className="pub-btn pub-btn-primary justify-center disabled:opacity-60 md:col-span-2">{submitting ? "Envoi…" : "Envoyer"} <ArrowRight size={16} /></button>
      </div>
    </form>
  );
}
