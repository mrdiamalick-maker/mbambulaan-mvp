"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";

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
  return (
    <main className="grid min-h-screen place-items-center bg-[#062d36] p-5">
      <div className="w-full max-w-md bg-white p-6 md:p-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#075466]"><ArrowLeft size={16} /> Accueil</Link>
        <KeyRound className="mt-8 text-[#087287]" />
        <h1 className="mt-4 text-2xl font-bold text-[#062d36]">Accès institutionnel</h1>
        <p className="mt-2 text-sm leading-6 text-[#60737a]">{step === "contact" ? "Saisissez le contact associé à votre mandat." : "En démonstration locale, utilisez le code 246810."}</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {step === "contact" ? <label className="block"><span className="text-sm font-bold">Téléphone ou e-mail</span><input required value={contact} onChange={(e) => setContact(e.target.value)} className="mt-2 w-full border border-[#bfcfd2] p-3" placeholder="+221…" /></label> : <label className="block"><span className="text-sm font-bold">Code à 6 chiffres</span><input required value={code} onChange={(e) => setCode(e.target.value)} className="mt-2 w-full border border-[#bfcfd2] p-3" inputMode="numeric" maxLength={6} /></label>}
          {error && <p className="text-sm font-semibold text-[#c94f3d]">{error}</p>}
          <button className="w-full bg-[#075466] px-5 py-3 font-bold text-white">{step === "contact" ? "Recevoir un code" : "Ouvrir mon espace"}</button>
        </form>
        <p className="mt-6 border-t border-[#d8e1e2] pt-4 text-xs leading-5 text-[#60737a]">Aucun envoi SMS ou WhatsApp réel n’est simulé. Le branchement d’un fournisseur de messagerie reste nécessaire en production.</p>
      </div>
    </main>
  );
}
