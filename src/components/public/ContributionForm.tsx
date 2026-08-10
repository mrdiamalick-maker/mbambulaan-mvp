"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { PublicContributionActorType } from "@/domain/public/contribution";
import { trackPublicEvent } from "@/lib/public-analytics";

const actorTypes: { id: PublicContributionActorType; label: string }[] = [
  { id: "entreprise", label: "Entreprise / prestataire" },
  { id: "transporteur", label: "Transport / logistique" },
  { id: "transformateur", label: "Transformation" },
  { id: "fournisseur", label: "Fournisseur / équipementier" },
  { id: "acheteur", label: "Acheteur / débouché" },
  { id: "centre_formation", label: "Formation / expertise" },
  { id: "ong_bailleur", label: "ONG / programme / financeur" },
  { id: "organisation_professionnelle", label: "Organisation professionnelle" },
  { id: "expert", label: "Expert / chercheur indépendant" },
  { id: "institution", label: "Institution" },
  { id: "autre", label: "Autre" }
];

export function ContributionForm() {
  const [actorType, setActorType] = useState<PublicContributionActorType | "">("");
  const [services, setServices] = useState("");
  const [territories, setTerritories] = useState("");
  const [capacity, setCapacity] = useState("");
  const [organization, setOrganization] = useState("");
  const [website, setWebsite] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/public/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorType,
          services,
          territories,
          capacity: capacity || undefined,
          organization: organization || undefined,
          website: website || undefined,
          contactName,
          phone,
          email: email || undefined,
          notes: notes || undefined,
          website_url: honeypot
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "La proposition n’a pas pu être envoyée.");
        return;
      }
      setReference(payload.reference);
      trackPublicEvent("network_submission", { actorType });
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
        <h2 className="mt-5 text-2xl font-[740] tracking-[-.035em] text-[var(--pub-deep-900)]">Votre proposition {reference} est enregistrée.</h2>
        <p className="mt-3 text-sm leading-6 text-[#536f67]">Mbàmbulaan examine votre capacité et vous recontacte si une opportunité correspond. Cette soumission n’entraîne aucun référencement public automatique.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/opportunites" className="pub-btn pub-btn-primary">Voir les opportunités <ArrowRight size={15} /></Link>
          <Link href="/atlas" className="pub-btn pub-btn-outline">Explorer l’Atlas</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="pub-card overflow-hidden">
      <div className="grid gap-5 p-6 md:grid-cols-2 md:p-8">
        <label className="block md:col-span-2">
          <span className="text-xs font-bold">Type d’acteur</span>
          <select required value={actorType} onChange={(event) => setActorType(event.target.value as PublicContributionActorType)} className="mt-2 w-full rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#58b8ad]">
            <option value="">Choisissez…</option>
            {actorTypes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="text-xs font-bold">Services / capacités proposés</span>
          <textarea required value={services} onChange={(event) => setServices(event.target.value)} placeholder="Ex. transport réfrigéré, fabrication de glace, formation en transformation, financement d’équipements collectifs…" className="mt-2 min-h-28 w-full resize-y rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#58b8ad]" />
        </label>
        <label className="block"><span className="text-xs font-bold">Territoires couverts</span><input required value={territories} onChange={(event) => setTerritories(event.target.value)} placeholder="Ex. Petite-Côte, national…" className="mt-2 w-full rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#58b8ad]" /></label>
        <label className="block"><span className="text-xs font-bold">Capacité approximative (optionnel)</span><input value={capacity} onChange={(event) => setCapacity(event.target.value)} placeholder="Ex. 2 véhicules, 5 tonnes/jour…" className="mt-2 w-full rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#58b8ad]" /></label>
        <label className="block"><span className="text-xs font-bold">Organisation (si applicable)</span><input value={organization} onChange={(event) => setOrganization(event.target.value)} className="mt-2 w-full rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#58b8ad]" /></label>
        <label className="block"><span className="text-xs font-bold">Site web (optionnel)</span><input value={website} onChange={(event) => setWebsite(event.target.value)} className="mt-2 w-full rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#58b8ad]" /></label>
        <label className="block"><span className="text-xs font-bold">Nom et prénom</span><input required value={contactName} onChange={(event) => setContactName(event.target.value)} className="mt-2 w-full rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#58b8ad]" /></label>
        <label className="block"><span className="text-xs font-bold">Téléphone</span><input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+221 …" className="mt-2 w-full rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#58b8ad]" /></label>
        <label className="block md:col-span-2"><span className="text-xs font-bold">E-mail (optionnel)</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#58b8ad]" /></label>
        <label className="block md:col-span-2"><span className="text-xs font-bold">Précisions utiles (optionnel)</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 min-h-20 w-full resize-y rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#58b8ad]" /></label>
        <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} className="hidden" aria-hidden />

        {error && <p className="text-sm font-semibold text-[#c24545] md:col-span-2">{error}</p>}
        <p className="text-xs leading-5 text-[#718489] md:col-span-2">Cette soumission n’entraîne aucun référencement ou statut « partenaire » automatique. Mbàmbulaan qualifie chaque capacité avant toute mobilisation.</p>
        <button disabled={submitting} className="pub-btn pub-btn-primary justify-center disabled:opacity-60 md:col-span-2">{submitting ? "Envoi…" : "Envoyer ma proposition"} <ArrowRight size={16} /></button>
      </div>
    </form>
  );
}
