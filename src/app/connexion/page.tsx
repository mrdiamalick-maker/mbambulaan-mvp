"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Globe2,
  Handshake,
  KeyRound,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  ShipWheel,
  UsersRound
} from "lucide-react";
import type { Role } from "@/domain/types";

type DemoAccess = {
  id: string;
  role: Role;
  label: string;
  promise: string;
  detail: string;
  destination: string;
  icon: typeof ShipWheel;
};

const demoAccesses: DemoAccess[] = [
  {
    id: "terrain",
    role: "operateur",
    label: "Opérations terrain",
    promise: "Voir ce qui exige une action aujourd’hui.",
    detail: "Capitaines, quais, mareyage, transformation et prestataires travaillent dans la même chaîne opérationnelle.",
    destination: "/app/travail",
    icon: ShipWheel
  },
  {
    id: "organisation",
    role: "gestionnaire_organisation",
    label: "Organisation professionnelle",
    promise: "Coordonner membres, actifs et services collectifs.",
    detail: "Une lecture commune des opérations, capacités, engagements, résultats et droits de l’organisation.",
    destination: "/app/organisation",
    icon: UsersRound
  },
  {
    id: "territoire",
    role: "coordinateur",
    label: "Coordination territoriale",
    promise: "Transformer un signal en réponse suivie.",
    detail: "Priorités, responsables, échéances, canaux de communication et preuves restent reliés au territoire.",
    destination: "/app/travail",
    icon: Globe2
  },
  {
    id: "institution",
    role: "institution",
    label: "Institution nationale",
    promise: "Arbitrer à partir d’une situation explicable.",
    detail: "Atlas, opérations, tensions, programmes, résultats et rapports convergent dans le même pilotage.",
    destination: "/app/pilotage",
    icon: Landmark
  },
  {
    id: "partenaire",
    role: "partenaire",
    label: "Partenaire & programme",
    promise: "Cibler un appui et en suivre la valeur.",
    detail: "Besoins qualifiés, conditions d’activation, financements, engagements et indicateurs de résultat.",
    destination: "/app/initiatives",
    icon: Handshake
  }
];

export default function LoginPage() {
  const router = useRouter();
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"contact" | "code">("contact");
  const [error, setError] = useState("");
  const [opening, setOpening] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const endpoint = step === "contact" ? "/api/auth/request-otp" : "/api/auth/verify-otp";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(step === "contact" ? { contact } : { code })
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error);
      return;
    }
    if (step === "contact") {
      setStep("code");
      setError("");
      return;
    }
    router.push("/app/travail");
  };

  const openDemo = async (access: DemoAccess) => {
    setOpening(access.id);
    setError("");
    try {
      const response = await fetch("/api/demo/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: access.role })
      });
      if (!response.ok) throw new Error("L’espace de démonstration ne peut pas être ouvert pour le moment.");
      router.push(access.destination);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Ouverture impossible.");
      setOpening(null);
    }
  };

  const openAdministration = async () => {
    const access: DemoAccess = {
      id: "administration",
      role: "administrateur",
      label: "Administration",
      promise: "",
      detail: "",
      destination: "/app/administration",
      icon: Building2
    };
    await openDemo(access);
  };

  return (
    <main className="min-h-screen bg-[#eaf1f0] text-[#102e37]">
      <div className="mx-auto min-h-screen max-w-[1600px] bg-white shadow-[0_0_90px_rgba(3,26,34,.08)] xl:my-5 xl:min-h-[calc(100vh-40px)] xl:overflow-hidden xl:rounded-[28px]">
        <header className="flex min-h-[72px] items-center justify-between border-b border-[#d9e3e3] px-5 md:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#46656b]"><ArrowLeft size={16} /> Site public</Link>
          <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-[#075568] text-white"><ShipWheel size={17} /></span><div><strong className="brand-wordmark block">Mbàmbulaan</strong><span className="hidden text-[10px] font-bold uppercase tracking-[.1em] text-[#718489] sm:block">Infrastructure de coordination</span></div></div>
          <span className="hidden items-center gap-2 text-xs font-bold text-[#547279] md:inline-flex"><ShieldCheck size={15} className="text-[#149a88]" /> Accès par mandat</span>
        </header>

        <div className="grid xl:grid-cols-[.74fr_1.26fr]">
          <section className="relative overflow-hidden bg-[#031a22] p-6 text-white md:p-10 xl:min-h-[calc(100vh-112px)] xl:p-12">
            <div className="absolute inset-0 opacity-45 ocean-grid" />
            <div className="relative flex h-full flex-col">
              <div>
                <p className="label-inverse">Accès professionnel sécurisé</p>
                <h1 className="mt-4 max-w-xl text-4xl font-[760] leading-[1.03] tracking-[-.05em] md:text-5xl">Un compte. Un mandat. Une réalité partagée.</h1>
                <p className="mt-5 max-w-lg text-sm leading-7 text-white/62">Les mêmes territoires, situations et engagements sont utilisés par tout l’écosystème. Seuls votre périmètre, vos droits et vos décisions changent.</p>
              </div>

              <form onSubmit={submit} className="mt-9 rounded-2xl border border-white/12 bg-white/[.06] p-5 backdrop-blur md:p-6">
                <div className="flex items-center gap-2 text-[#74e1d6]"><KeyRound size={18} /><p className="text-xs font-black uppercase tracking-[.12em]">Connexion à votre organisation</p></div>
                <p className="mt-3 text-sm leading-6 text-white/58">{step === "contact" ? "Utilisez le téléphone ou l’e-mail rattaché à votre mandat." : "Saisissez le code reçu. Pour cette présentation : 246810."}</p>
                {step === "contact" ? (
                  <label className="mt-5 block"><span className="text-xs font-bold text-white/72">Téléphone ou e-mail</span><input required value={contact} onChange={(event) => setContact(event.target.value)} className="mt-2 w-full rounded-xl border border-white/16 bg-[#052b35] px-4 py-3.5 text-white outline-none transition placeholder:text-white/28 focus:border-[#5fe0d3]" placeholder="+221 77 000 00 00" /></label>
                ) : (
                  <label className="mt-5 block"><span className="text-xs font-bold text-white/72">Code à 6 chiffres</span><input required value={code} onChange={(event) => setCode(event.target.value)} className="mt-2 w-full rounded-xl border border-white/16 bg-[#052b35] px-4 py-3.5 text-white outline-none transition focus:border-[#5fe0d3]" inputMode="numeric" maxLength={6} /></label>
                )}
                {error ? <p className="mt-3 text-sm font-semibold text-[#ff9c8d]">{error}</p> : null}
                <button className="btn-accent mt-4 w-full justify-center">{step === "contact" ? "Recevoir un code" : "Ouvrir mon espace"} <ArrowRight size={16} /></button>
                <div className="mt-5 grid gap-2 text-[11px] text-white/44 sm:grid-cols-2"><span className="inline-flex items-center gap-2"><LockKeyhole size={13} /> Données cloisonnées</span><span className="inline-flex items-center gap-2"><Check size={13} /> Actions historisées</span></div>
              </form>
            </div>
          </section>

          <section className="p-6 md:p-10 xl:p-12">
            <div className="max-w-3xl">
              <p className="label">Parcours de présentation</p>
              <h2 className="mt-3 text-3xl font-[760] tracking-[-.045em] md:text-4xl">Choisissez une mission, pas une mini-application.</h2>
              <p className="mt-4 text-sm leading-6 text-[#667b81]">Cinq entrées suffisent pour démontrer toute la plateforme. Les métiers spécialisés apparaissent ensuite au bon moment dans les opérations.</p>
            </div>

            <div className="mt-8 grid gap-3 lg:grid-cols-2">
              {demoAccesses.map((access, index) => {
                const Icon = access.icon;
                return (
                  <button key={access.id} type="button" disabled={opening !== null} onClick={() => void openDemo(access)} className={`group min-h-52 rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:border-[#78bbb3] hover:shadow-[0_18px_48px_rgba(5,54,64,.1)] disabled:pointer-events-none disabled:opacity-60 ${index === 0 ? "border-[#8dcac3] bg-[#edf9f6] lg:col-span-2 lg:grid lg:min-h-44 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-5" : "border-[#d9e3e3] bg-white"}`}>
                    <span className="grid size-11 place-items-center rounded-xl bg-[#075568] text-white"><Icon size={20} /></span>
                    <span className={index === 0 ? "mt-0 block" : "mt-7 block"}>
                      <span className="block text-[10px] font-black uppercase tracking-[.12em] text-[#138d7f]">{access.label}</span>
                      <strong className="mt-2 block text-lg tracking-[-.025em]">{access.promise}</strong>
                      <span className="mt-2 block text-sm leading-6 text-[#667b81]">{access.detail}</span>
                    </span>
                    <span className="mt-5 inline-flex items-center gap-2 text-xs font-black text-[#075568] lg:mt-0">{opening === access.id ? "Ouverture…" : "Ouvrir"} <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#d9e3e3] bg-[#f7faf9] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-sm font-bold">Administration de la plateforme</p><p className="mt-1 text-xs text-[#718489]">Référentiels, droits, abonnements et traçabilité technique.</p></div>
              <button type="button" disabled={opening !== null} onClick={() => void openAdministration()} className="btn-secondary shrink-0 disabled:pointer-events-none disabled:opacity-60"><Building2 size={15} /> {opening === "administration" ? "Ouverture…" : "Accès administration"}</button>
            </div>
            <p className="mt-5 text-xs leading-5 text-[#718489]">Présentation avec données simulées et non officielles. Aucun SMS, WhatsApp, paiement ou engagement financier réel n’est déclenché.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
