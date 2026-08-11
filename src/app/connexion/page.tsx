"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, LockKeyhole, Mail, ShieldCheck, ShipWheel } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Une erreur est survenue.");
        return;
      }
      router.push(searchParams.get("next") ?? "/app");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#eaf1f0] text-[#102e37]">
      <div className="mx-auto flex min-h-screen max-w-[560px] flex-col justify-center px-5 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#46656b]"><ArrowLeft size={16} /> Retour au site public</Link>

        <div className="mt-8 overflow-hidden rounded-[28px] bg-[#031a22] text-white shadow-[0_30px_80px_rgba(3,26,34,.18)]">
          <div className="relative p-7 md:p-9">
            <div className="absolute inset-0 opacity-40 ocean-grid" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-white text-[#075568]"><ShipWheel size={19} /></span>
                <div>
                  <strong className="brand-wordmark block">Mbàmbulaan</strong>
                  <span className="text-[11px] font-semibold text-white/55">Accès professionnel</span>
                </div>
              </div>

              <p className="label-inverse mt-8">Espace réservé</p>
              <h1 className="mt-3 text-3xl font-[760] leading-[1.05] tracking-[-.04em]">Un accès par mandat, pour les équipes et partenaires Mbàmbulaan.</h1>
              <p className="mt-4 text-sm leading-6 text-white/62">Cet espace n’est pas destiné au grand public. Si vous avez une situation à décrire ou une capacité à proposer, utilisez plutôt <Link href="/solutions" className="underline decoration-white/40 underline-offset-4 hover:text-[#74e1d6]">Décrire une situation</Link> ou <Link href="/contact" className="underline decoration-white/40 underline-offset-4 hover:text-[#74e1d6]">Contact</Link>.</p>

              <form onSubmit={submit} className="mt-8 rounded-2xl border border-white/12 bg-white/[.06] p-5 backdrop-blur">
                <div className="flex items-center gap-2 text-[#74e1d6]"><LockKeyhole size={17} /><p className="text-xs font-black uppercase tracking-[.12em]">Connexion</p></div>
                <p className="mt-3 text-sm leading-6 text-white/58">Utilisez l’e-mail et le mot de passe rattachés à votre mandat.</p>
                <label className="mt-5 block">
                  <span className="text-xs font-bold text-white/72">E-mail</span>
                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/16 bg-[#052b35] px-4 focus-within:border-[#5fe0d3]">
                    <Mail size={15} className="text-white/40" />
                    <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full bg-transparent py-3.5 text-white outline-none placeholder:text-white/28" placeholder="prenom.nom@mbambulaan.sn" />
                  </div>
                </label>
                <label className="mt-4 block">
                  <span className="text-xs font-bold text-white/72">Mot de passe</span>
                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/16 bg-[#052b35] px-4 focus-within:border-[#5fe0d3]">
                    <LockKeyhole size={15} className="text-white/40" />
                    <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full bg-transparent py-3.5 text-white outline-none placeholder:text-white/28" placeholder="••••••••••" />
                  </div>
                </label>
                {error ? <p className="mt-3 text-sm font-semibold text-[#ff9c8d]">{error}</p> : null}
                <button disabled={pending} className="pub-btn pub-btn-primary mt-5 w-full justify-center disabled:opacity-60">
                  Ouvrir mon espace <ArrowRight size={16} />
                </button>
                <div className="mt-5 grid gap-2 text-[11px] text-white/44 sm:grid-cols-2">
                  <span className="inline-flex items-center gap-2"><LockKeyhole size={13} /> Données cloisonnées</span>
                  <span className="inline-flex items-center gap-2"><Check size={13} /> Accès tracé</span>
                </div>
              </form>
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-white/10 px-7 py-4 text-xs text-white/45 md:px-9">
            <ShieldCheck size={14} className="text-[#149a88]" /> Accès par mandat uniquement. Compte créé par un administrateur — aucune inscription publique.
          </div>
        </div>
      </div>
    </main>
  );
}
