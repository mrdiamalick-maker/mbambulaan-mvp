"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import type { Role } from "@/domain/types";

const demoAccounts: Array<{ role: Role; label: string }> = [
  { role: "institution", label: "Institution" },
  { role: "coordinateur", label: "Coordination territoriale" },
  { role: "operateur", label: "Opérateur de quai" },
  { role: "capitaine", label: "Capitaine" },
  { role: "mareyeur", label: "Mareyage" },
  { role: "transformateur", label: "Transformation" },
  { role: "prestataire", label: "Prestataire" },
  { role: "gestionnaire_organisation", label: "Organisation professionnelle" },
  { role: "partenaire", label: "Partenaire / bailleur" },
  { role: "administrateur", label: "Administration Mbàmbulaan" }
];

export default function LoginPage() {
  const router = useRouter();
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"contact" | "code">("contact");
  const [error, setError] = useState("");
  const [demoRole, setDemoRole] = useState<Role>("institution");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const endpoint = step === "contact" ? "/api/auth/request-otp" : "/api/auth/verify-otp";
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(step === "contact" ? { contact } : { code }) });
    const payload = await response.json();
    if (!response.ok) return setError(payload.error);
    if (step === "contact") { setStep("code"); setError(""); } else router.push("/app/travail");
  };

  const openDemo = async () => {
    await fetch("/api/demo/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: demoRole }) });
    router.push("/app/travail");
  };

  return (
    <main className="min-h-screen bg-[#eef4f3] p-4 md:grid md:place-items-center md:p-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-[24px] bg-white shadow-[0_30px_90px_rgba(4,43,52,.16)]">
        <div className="grid lg:grid-cols-[.92fr_1.08fr]">
          <section className="relative overflow-hidden bg-[#062f38] p-7 text-white md:p-10">
            <div className="absolute inset-0 opacity-40 ocean-grid" />
            <div className="relative flex min-h-[360px] flex-col">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#bcd6da]"><ArrowLeft size={16} /> Retour au site public</Link>
              <div className="my-auto py-12">
                <span className="grid size-12 place-items-center rounded-2xl bg-[#4fd7c3]/15 text-[#64decd]"><ShieldCheck size={24} /></span>
                <p className="mt-6 text-xs font-black uppercase tracking-[.16em] text-[#64decd]">Espace professionnel</p>
                <h1 className="mt-3 text-4xl font-black leading-tight">Votre périmètre de coordination, sécurisé et partagé.</h1>
                <p className="mt-5 max-w-md text-sm leading-7 text-[#bcd6da]">Accédez uniquement aux territoires, données et actions correspondant à votre mandat.</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#9cbfc4]"><LockKeyhole size={14} /> Droits d’accès et historique des actions visibles</div>
            </div>
          </section>

          <section className="p-7 md:p-10">
            <div className="flex items-center gap-2 text-[#087287]"><KeyRound size={19} /><p className="label">Connexion</p></div>
            <h2 className="mt-4 text-3xl font-black text-[#07323c]">Ouvrir votre espace</h2>
            <p className="mt-2 text-sm leading-6 text-[#667b81]">{step === "contact" ? "Saisissez le contact associé à votre mandat." : "Saisissez le code reçu. En environnement de présentation : 246810."}</p>
            <form onSubmit={submit} className="mt-7 space-y-4">
              {step === "contact" ? <label className="block"><span className="text-sm font-bold">Téléphone ou e-mail</span><input required value={contact} onChange={(event) => setContact(event.target.value)} className="mt-2 w-full rounded-xl border border-[#bfcfd2] p-3.5" placeholder="+221…" /></label> : <label className="block"><span className="text-sm font-bold">Code à 6 chiffres</span><input required value={code} onChange={(event) => setCode(event.target.value)} className="mt-2 w-full rounded-xl border border-[#bfcfd2] p-3.5" inputMode="numeric" maxLength={6} /></label>}
              {error && <p className="text-sm font-semibold text-[#c94f3d]">{error}</p>}
              <button className="btn-primary w-full">{step === "contact" ? "Recevoir un code" : "Accéder à Mbàmbulaan"} <ArrowRight size={16} /></button>
            </form>

            <div className="my-7 flex items-center gap-3 text-xs font-bold uppercase tracking-[.12em] text-[#8a9b9f]"><span className="h-px flex-1 bg-[#dce5e5]" /> Présentation <span className="h-px flex-1 bg-[#dce5e5]" /></div>
            <div className="rounded-2xl border border-[#d5e2e2] bg-[#f6faf9] p-4">
              <p className="text-sm font-black text-[#07323c]">Prévisualiser une vue métier</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row"><select value={demoRole} onChange={(event) => setDemoRole(event.target.value as Role)} className="min-h-11 flex-1 rounded-xl border border-[#c5d6d6] bg-white px-3 text-sm font-bold">{demoAccounts.map((account) => <option key={account.role} value={account.role}>{account.label}</option>)}</select><button type="button" onClick={() => void openDemo()} className="btn-secondary">Ouvrir la vue</button></div>
              <p className="mt-3 text-xs leading-5 text-[#718489]">Données déterministes de présentation. Aucun SMS, WhatsApp ou paiement réel n’est déclenché.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
