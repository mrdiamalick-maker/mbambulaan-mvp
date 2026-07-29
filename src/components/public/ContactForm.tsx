"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSent(true);
  };
  if (sent) return <div className="border border-[#b9dfd2] bg-[#e9f7f1] p-6"><CheckCircle2 className="text-[#126b58]" /><h2 className="mt-4 text-xl font-bold">Demande préparée dans cette démonstration</h2><p className="mt-2 text-sm leading-6 text-[#60737a]">Aucun envoi externe n’a été simulé. Vous pouvez maintenant explorer l’application et le périmètre des offres.</p><div className="mt-5 flex flex-wrap gap-2"><Link href="/demo" className="bg-[#075466] px-4 py-2.5 text-sm font-bold text-white">Voir la démonstration</Link><Link href="/offres" className="border border-[#075466] px-4 py-2.5 text-sm font-bold text-[#075466]">Comparer les offres</Link></div></div>;
  return <form onSubmit={submit} className="surface space-y-4 p-5 md:p-7"><label className="block"><span className="text-sm font-bold">Organisation</span><input required className="mt-2 w-full border border-[#c8d7da] p-3" /></label><label className="block"><span className="text-sm font-bold">Votre rôle</span><select className="mt-2 w-full border border-[#c8d7da] bg-white p-3"><option>Organisation professionnelle</option><option>Territoire ou site</option><option>Institution</option><option>Partenaire</option><option>Entreprise</option></select></label><label className="block"><span className="text-sm font-bold">Besoin prioritaire</span><textarea required className="mt-2 min-h-32 w-full border border-[#c8d7da] p-3" /></label><label className="block"><span className="text-sm font-bold">Contact</span><input required type="email" className="mt-2 w-full border border-[#c8d7da] p-3" placeholder="nom@organisation.sn" /></label><button className="w-full bg-[#075466] px-5 py-3 font-bold text-white">Préparer la demande</button><p className="text-xs leading-5 text-[#60737a]">En démonstration, ces données restent dans le navigateur et ne sont pas transmises.</p></form>;
}
