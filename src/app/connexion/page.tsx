"use client";

// Écran de connexion — Livrable 1 du mandat DA (2026-08-12). Travail
// visuel uniquement, logique d'authentification inchangée (submit() plus
// bas est identique à la version précédente, seul le rendu change).
//
// Avant : carte sombre centrée (bg-[#031a22] + ocean-grid) contenant elle-
// même une carte translucide pour le formulaire — l'effet "carte flottante
// dans une autre carte" que le mandat demande de retirer. Après : mise en
// page split-screen ~55/45 sur desktop (image à gauche, accès
// professionnel à droite, un seul niveau de surface), pas de split sur
// mobile (formulaire prioritaire, bande-image courte optionnelle en tête).
//
// Image (brief DA "login-maritime.webp") pas encore disponible : le bloc
// ImagePlaceholder ci-dessous occupe exactement l'espace que la vraie
// photo occupera (absolute inset-0, object-cover) — le remplacement futur
// n'impose aucun changement de mise en page, seulement l'ajout d'un <img>.
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Image as ImageIcon, LockKeyhole, Mail, ShieldCheck, ShipWheel } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function ImagePlaceholder({ compact }: { compact?: boolean }) {
  return (
    <div className="absolute inset-0 bg-[var(--pub-deep-900)]">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(rgba(247,243,233,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(247,243,233,.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle at 30% 20%, rgba(182,82,47,.16), transparent 45%)" }}
      />
      <div className={`relative flex h-full flex-col items-center justify-center gap-2 px-8 text-center ${compact ? "gap-1.5" : "gap-3"}`}>
        <ImageIcon size={compact ? 20 : 28} className="text-white/35" />
        <p className={`font-bold uppercase tracking-[.14em] text-white/55 ${compact ? "text-[10px]" : "text-xs"}`}>
          Placeholder — login-maritime.webp
        </p>
        {!compact && (
          <p className="max-w-[26ch] text-[11px] leading-5 text-white/30">
            Quai de pêche artisanale, Sénégal · 3:2 · remplacé par la photo définitive sans changement de mise en page
          </p>
        )}
      </div>
    </div>
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
    <main className="pub-scope min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[55fr_45fr]">
        {/* Colonne image — desktop uniquement (≥ lg), plein cadre, comme le sera la vraie photo. */}
        <div className="relative hidden overflow-hidden lg:block">
          <ImagePlaceholder />
        </div>

        {/* Bande-image courte — mobile/tablette uniquement, hauteur fixe et modeste pour ne pas repousser le formulaire. */}
        <div className="relative block h-28 overflow-hidden lg:hidden">
          <ImagePlaceholder compact />
        </div>

        {/* Colonne formulaire — un seul niveau de surface, pas de carte imbriquée. */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 md:px-14 lg:px-16 lg:py-16">
          <div className="mx-auto w-full max-w-[420px]">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-stone-500)] transition hover:text-[var(--pub-deep-900)]"><ArrowLeft size={16} /> Retour au site public</Link>

            <div className="mt-8 flex items-center gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--pub-deep-900)] text-white"><ShipWheel size={15} /></span>
              <strong className="brand-wordmark">Mbàmbulaan</strong>
            </div>

            <p className="pub-eyebrow mt-7">Espace réservé</p>
            <h1 className="pub-display mt-3 text-[2rem] leading-[1.08] text-[var(--pub-deep-900)] sm:text-[2.3rem]">
              Un accès par mandat, pour les équipes et partenaires Mbàmbulaan.
            </h1>
            <p className="mt-4 text-sm leading-6 text-[var(--pub-stone-500)]">
              Cet espace n’est pas destiné au grand public. Si vous avez une situation à décrire ou une capacité à proposer, utilisez plutôt <Link href="/solutions" className="font-semibold text-[var(--pub-deep-900)] underline decoration-[var(--pub-stone-300)] underline-offset-4 hover:text-[var(--pub-turquoise-500)]">Décrire une situation</Link> ou <Link href="/contact" className="font-semibold text-[var(--pub-deep-900)] underline decoration-[var(--pub-stone-300)] underline-offset-4 hover:text-[var(--pub-turquoise-500)]">Contact</Link>.
            </p>

            <form onSubmit={submit} className="mt-9 space-y-5">
              <label className="block">
                <span className="text-xs font-bold text-[var(--pub-stone-700)]">E-mail</span>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-[var(--pub-stone-300)] bg-white px-4 focus-within:border-[var(--pub-turquoise-500)]">
                  <Mail size={15} className="text-[var(--pub-stone-500)]" />
                  <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full bg-transparent py-3.5 text-[var(--pub-deep-900)] outline-none placeholder:text-[var(--pub-stone-300)]" placeholder="prenom.nom@mbambulaan.sn" />
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-bold text-[var(--pub-stone-700)]">Mot de passe</span>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-[var(--pub-stone-300)] bg-white px-4 focus-within:border-[var(--pub-turquoise-500)]">
                  <LockKeyhole size={15} className="text-[var(--pub-stone-500)]" />
                  <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full bg-transparent py-3.5 text-[var(--pub-deep-900)] outline-none placeholder:text-[var(--pub-stone-300)]" placeholder="••••••••••" />
                </div>
              </label>
              {error ? <p className="text-sm font-semibold text-[var(--pub-turquoise-500)]">{error}</p> : null}
              <button disabled={pending} className="pub-btn pub-btn-primary w-full justify-center disabled:opacity-60">
                Ouvrir mon espace <ArrowRight size={16} />
              </button>
              <div className="grid gap-2 pt-1 text-[11px] text-[var(--pub-stone-500)] sm:grid-cols-2">
                <span className="inline-flex items-center gap-2"><LockKeyhole size={13} /> Données cloisonnées</span>
                <span className="inline-flex items-center gap-2"><Check size={13} /> Accès tracé</span>
              </div>
            </form>

            <div className="mt-8 flex items-center gap-2 border-t border-[var(--pub-stone-150)] pt-5 text-xs text-[var(--pub-stone-500)]">
              <ShieldCheck size={14} className="text-[var(--pub-turquoise-500)]" /> Accès par mandat uniquement. Compte créé par un administrateur — aucune inscription publique.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
