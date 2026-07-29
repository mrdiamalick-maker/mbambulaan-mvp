"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, KeyRound, UsersRound } from "lucide-react";
import type { Role } from "@/domain/types";

const demoAccounts: Array<{ role: Role; label: string; access: string }> = [
  { role: "capitaine", label: "Capitaine", access: "Retour et opérations" },
  { role: "operateur", label: "Opérateur de quai", access: "Débarquement et pesée" },
  { role: "mareyeur", label: "Mareyeuse", access: "Besoins et opportunités" },
  { role: "transformateur", label: "Transformatrice", access: "Approvisionnement" },
  { role: "prestataire", label: "Prestataire", access: "Capacités et intervention" },
  { role: "gestionnaire_organisation", label: "Gestionnaire", access: "Organisation et actifs" },
  { role: "coordinateur", label: "Coordinateur", access: "Coordination complète" },
  { role: "institution", label: "Institution", access: "Atlas et pilotage" },
  { role: "partenaire", label: "Partenaire", access: "Initiatives et résultats" },
  { role: "administrateur", label: "Mbàmbulaan Ops", access: "Supervision" }
];

export default function LoginPage() {
  const router = useRouter();
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"contact" | "code">("contact");
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const endpoint = step === "contact" ? "/api/auth/request-otp" : "/api/auth/verify-otp";
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(step === "contact" ? { contact } : { code }) });
    const payload = await response.json();
    if (!response.ok) return setError(payload.error);
    if (step === "contact") { setStep("code"); setError(""); } else router.push("/app/travail");
  };
  const openDemo = async (role: Role) => {
    await fetch("/api/demo/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role })
    });
    router.push("/app/travail");
  };
  return (
    <main className="grid min-h-screen place-items-center bg-[#062d36] p-5">
      <div className="w-full max-w-4xl bg-white p-6 md:p-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#075466]"><ArrowLeft size={16} /> Accueil</Link>
        <KeyRound className="mt-8 text-[#087287]" />
        <h1 className="mt-4 text-2xl font-bold text-[#062d36]">Accès institutionnel</h1>
        <p className="mt-2 text-sm leading-6 text-[#60737a]">{step === "contact" ? "Saisissez le contact associé à votre mandat." : "En démonstration locale, utilisez le code 246810."}</p>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <form onSubmit={submit} className="space-y-4">
          {step === "contact" ? <label className="block"><span className="text-sm font-bold">Téléphone ou e-mail</span><input required value={contact} onChange={(e) => setContact(e.target.value)} className="mt-2 w-full border border-[#bfcfd2] p-3" placeholder="+221…" /></label> : <label className="block"><span className="text-sm font-bold">Code à 6 chiffres</span><input required value={code} onChange={(e) => setCode(e.target.value)} className="mt-2 w-full border border-[#bfcfd2] p-3" inputMode="numeric" maxLength={6} /></label>}
          {error && <p className="text-sm font-semibold text-[#c94f3d]">{error}</p>}
          <button className="w-full bg-[#075466] px-5 py-3 font-bold text-white">{step === "contact" ? "Recevoir un code" : "Ouvrir mon espace"}</button>
        </form>
        <section className="border-t border-[#d8e1e2] pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <div className="flex items-center gap-2 text-[#075466]"><UsersRound size={18} /><p className="label">Comptes de recette</p></div>
          <p className="mt-2 text-sm leading-6 text-[#60737a]">Ouvrez directement une vue de démonstration. Tous les profils travaillent sur les mêmes objets.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {demoAccounts.map((account) => <button type="button" onClick={() => void openDemo(account.role)} key={account.role} className="border border-[#c8d7da] p-3 text-left hover:border-[#087287] hover:bg-[#f4fbfc]"><span className="block text-sm font-bold">{account.label}</span><span className="mt-1 block text-xs text-[#60737a]">{account.access}</span></button>)}
          </div>
        </section>
        </div>
        <p className="mt-6 border-t border-[#d8e1e2] pt-4 text-xs leading-5 text-[#60737a]">Aucun envoi SMS ou WhatsApp réel n’est simulé. Le branchement d’un fournisseur de messagerie reste nécessaire en production.</p>
      </div>
    </main>
  );
}
