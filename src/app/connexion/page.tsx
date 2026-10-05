"use client";

// Écran de connexion — Public V2, iso-design depuis Mbambulaan_Public_V2.html
// (Claude Design, 09 Espace privé). Remplace la composition split-screen
// V1 par l'écran centré sombre du HTML V2 — logique d'authentification
// réellement inchangée (submit() ci-dessous reste identique : POST
// /api/auth/login puis redirection vers next ?? /app).
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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
    <main style={{ fontFamily: "var(--font-instrument-sans), system-ui, sans-serif" }}>
      <div style={{ background: "#0B1A2A", color: "#F7F3E9", minHeight: "100vh", display: "flex", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: 440, margin: "0 auto", padding: "56px 24px", display: "flex", flexDirection: "column", gap: 22 }}>
          <Link href="/" style={{ alignSelf: "flex-start", fontSize: 13.5, fontWeight: 600, color: "rgba(247,243,233,.7)", textDecoration: "none" }}>← Retour au site public</Link>
          <h1 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: 44, lineHeight: 1.05 }}>Espace privé</h1>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: "rgba(247,243,233,.78)" }}>Réservé aux partenaires, organisations et institutions disposant d’un accès.</p>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 8, fontWeight: 600, fontSize: 14.5 }}>
              Identifiant
              <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} style={{ minHeight: 50, padding: "0 14px", border: "1px solid rgba(247,243,233,.3)", borderRadius: 2, background: "transparent", color: "#F7F3E9", font: "400 16px var(--font-instrument-sans), sans-serif" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 8, fontWeight: 600, fontSize: 14.5 }}>
              Mot de passe
              <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} style={{ minHeight: 50, padding: "0 14px", border: "1px solid rgba(247,243,233,.3)", borderRadius: 2, background: "transparent", color: "#F7F3E9", font: "400 16px var(--font-instrument-sans), sans-serif" }} />
            </label>
            {error ? <p role="alert" style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: "#E8927A" }}>{error}</p> : null}
            <button disabled={pending} style={{ minHeight: 52, background: "#F7F3E9", color: "#0B1A2A", border: 0, borderRadius: 2, font: "600 15.5px var(--font-instrument-sans), sans-serif", cursor: pending ? "default" : "pointer", opacity: pending ? .7 : 1 }}>
              {pending ? "Connexion…" : "Se connecter"}
            </button>
          </form>
          <p style={{ margin: 0, fontSize: 14.5, color: "rgba(247,243,233,.7)" }}>Pas d’accès ? <Link href="/contact?profil=organisation" style={{ color: "#E8A07F", fontWeight: 600 }}>Nous contacter</Link></p>
        </div>
      </div>
    </main>
  );
}
