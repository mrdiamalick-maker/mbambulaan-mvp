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
    return <div className="rounded-2xl border border-[#b9dfd2] bg-[#e9f7f1] p-7"><span className="grid size-12 place-items-center rounded-full bg-white text-[#126b58]"><CheckCircle2 /></span><h2 className="mt-5 text-2xl font-[740] tracking-[-.035em]">Votre cadrage de pilote est prêt.</h2><p className="mt-3 text-sm leading-6 text-[#536f67]">Aucun message externe n’a été envoyé dans cette démonstration. Le parcours montre la qualification attendue avant toute proposition commerciale.</p><div className="mt-6 flex flex-wrap gap-2"><Link href="/demo" className="btn-primary">Voir la plateforme <ArrowRight size={15}/></Link><Link href="/offres" className="btn-secondary">Comparer les offres</Link></div></div>;
  }

  return (
    <form onSubmit={submit} className="surface overflow-hidden">
      <div className="border-b border-[#d9e3e3] bg-[#f7faf9] p-6"><p className="label">Cadrage initial · 5 minutes</p><h2 className="mt-2 text-2xl font-[740] tracking-[-.035em]">Définissons d’abord la valeur à créer.</h2><p className="mt-2 text-sm leading-6 text-[#667b81]">Une équipe Mbàmbulaan ne propose un pilote qu’après avoir identifié le problème, le mandat et le résultat attendu.</p></div>
      <div className="grid gap-5 p-6 md:grid-cols-2">
        <label className="block"><span className="text-xs font-bold">Organisation</span><input required className={fieldClass} placeholder="Nom de votre organisation" /></label>
        <label className="block"><span className="text-xs font-bold">Votre mandat</span><select className={fieldClass}><option>Organisation professionnelle</option><option>Territoire ou site de débarquement</option><option>Institution publique</option><option>Programme ou partenaire</option><option>Opérateur technique</option></select></label>
        <label className="block"><span className="text-xs font-bold">Territoire concerné</span><input required className={fieldClass} placeholder="Ex. Petite-Côte, Joal, national…" /></label>
        <label className="block"><span className="text-xs font-bold">Résultat prioritaire</span><select className={fieldClass}><option>Réduire un délai de coordination</option><option>Fiabiliser un flux d’information</option><option>Piloter des infrastructures</option><option>Structurer un programme ou financement</option><option>Produire des rapports vérifiables</option></select></label>
        <label className="block md:col-span-2"><span className="text-xs font-bold">Problème concret à résoudre</span><textarea required className={`${fieldClass} min-h-32 resize-y`} placeholder="Que se passe-t-il aujourd’hui, qui est concerné et qu’est-ce qui bloque ?" /></label>
        <label className="block"><span className="text-xs font-bold">Horizon souhaité</span><select className={fieldClass}><option>Explorer dans les 3 mois</option><option>Lancer dans les 6 mois</option><option>Intégrer à un programme annuel</option></select></label>
        <label className="block"><span className="text-xs font-bold">Contact professionnel</span><input required type="email" className={fieldClass} placeholder="nom@organisation.sn" /></label>
        <button className="btn-primary justify-center md:col-span-2">Préparer le cadrage <ArrowRight size={16}/></button>
        <p className="flex items-start gap-2 text-xs leading-5 text-[#718489] md:col-span-2"><LockKeyhole size={14} className="mt-0.5 shrink-0"/> En démonstration, ces informations restent dans le navigateur et ne sont transmises à aucun service externe.</p>
      </div>
    </form>
  );
}
