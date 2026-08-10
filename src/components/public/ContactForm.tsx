"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";

const fieldClass = "mt-2 w-full rounded-xl border border-[#c8d7da] bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#58b8ad] focus:ring-3 focus:ring-[#58b8ad]/10";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-[#b9dfd2] bg-[#e9f7f1] p-7">
        <span className="grid size-12 place-items-center rounded-full bg-white text-[#126b58]"><CheckCircle2 /></span>
        <h2 className="mt-5 text-2xl font-[740] tracking-[-.035em]">Votre demande est prête à être qualifiée.</h2>
        <p className="mt-3 text-sm leading-6 text-[#536f67]">Dans cette démonstration, aucun message externe n’est envoyé. En production, Mbàmbulaan reprendrait votre contexte, votre besoin et votre canal préféré pour organiser la suite.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/atlas" className="btn-primary">Explorer l’Atlas <ArrowRight size={15}/></Link>
          <Link href="/decouvrir" className="btn-secondary">Continuer à découvrir</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="surface overflow-hidden">
      <div className="border-b border-[#d9e3e3] bg-[#f7faf9] p-6">
        <p className="label">Parler à Mbàmbulaan</p>
        <h2 className="mt-2 text-2xl font-[740] tracking-[-.035em]">Quel est votre besoin ?</h2>
        <p className="mt-2 text-sm leading-6 text-[#667b81]">Choisissez l’intention la plus proche. Mbàmbulaan qualifie ensuite le contexte avant d’organiser la réponse.</p>
      </div>
      <div className="grid gap-5 p-6 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="text-xs font-bold">Votre demande</span>
          <select className={fieldClass}>
            <option>J’ai un besoin</option>
            <option>Je propose mes services ou capacités</option>
            <option>Je représente une organisation, une ONG ou une entreprise</option>
            <option>Je souhaite devenir partenaire</option>
            <option>Presse, recherche ou information</option>
            <option>Autre demande</option>
          </select>
        </label>
        <label className="block"><span className="text-xs font-bold">Organisation</span><input className={fieldClass} placeholder="Nom de votre organisation, si applicable" /></label>
        <label className="block"><span className="text-xs font-bold">Territoire concerné</span><input className={fieldClass} placeholder="Ex. Joal, Mbour, national…" /></label>
        <label className="block md:col-span-2"><span className="text-xs font-bold">Décrivez votre besoin ou votre proposition</span><textarea required className={`${fieldClass} min-h-32 resize-y`} placeholder="Expliquez simplement ce que vous cherchez à accomplir, proposer ou comprendre." /></label>
        <label className="block"><span className="text-xs font-bold">Votre nom</span><input required className={fieldClass} placeholder="Nom et prénom" /></label>
        <label className="block"><span className="text-xs font-bold">Téléphone</span><input required type="tel" className={fieldClass} placeholder="+221 …" /></label>
        <label className="block"><span className="text-xs font-bold">Email</span><input type="email" className={fieldClass} placeholder="nom@organisation.sn" /></label>
        <label className="block"><span className="text-xs font-bold">Canal préféré</span><select className={fieldClass}><option>WhatsApp</option><option>Téléphone</option><option>Email</option></select></label>
        <label className="flex items-start gap-2 text-xs leading-5 text-[#718489] md:col-span-2"><input required type="checkbox" className="mt-1"/><span>J’accepte que Mbàmbulaan utilise ces informations pour traiter ma demande et me recontacter.</span></label>
        <button className="btn-primary justify-center md:col-span-2">Envoyer ma demande <ArrowRight size={16}/></button>
        <p className="flex items-start gap-2 text-xs leading-5 text-[#718489] md:col-span-2"><LockKeyhole size={14} className="mt-0.5 shrink-0"/> Les informations de contact ne sont pas publiées et ne servent pas à constituer un annuaire public.</p>
      </div>
    </form>
  );
}
