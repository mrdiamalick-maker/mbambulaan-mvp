"use client";

// Contact — Public V2, écran "08 Contact". Remplace entièrement le
// sélecteur V1 (Agir/Construire avec Mbàmbulaan/Échanger + bloc omnicanal)
// par le sélecteur de profil à 6 entrées du HTML, avec champs conditionnels
// selon le profil choisi. Branché sur le même backend réel que /partager
// (/api/public/requests) ; le profil "signaler" ne soumet rien ici, il
// redirige vers le formulaire dédié.
import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { CONTACT_FIELDS, CONTACT_MSG_LABEL, CONTACT_PROFILES, TERRITORIES, type ContactProfileKey } from "@/data/public-v2-content";
import type { PublicRequestActorType, PublicRequestIntent } from "@/domain/public/request";

const PROFILE_INTENT: Record<ContactProfileKey, PublicRequestIntent> = {
  pro: "autre",
  organisation: "organisation",
  signaler: "autre",
  collaboration: "partenariat",
  info: "programme",
  autre: "autre"
};
const PROFILE_ACTOR: Record<ContactProfileKey, PublicRequestActorType> = {
  pro: "particulier",
  organisation: "institution",
  signaler: "particulier",
  collaboration: "organisation_professionnelle",
  info: "particulier",
  autre: "autre"
};

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactForm />
    </Suspense>
  );
}

function ContactForm() {
  const searchParams = useSearchParams();
  const initial = (searchParams.get("profil") as ContactProfileKey | null) ?? null;

  const [profile, setProfile] = useState<ContactProfileKey | null>(initial);
  const [metier, setMetier] = useState("");
  const [terr, setTerr] = useState("");
  const [org, setOrg] = useState("");
  const [orgType, setOrgType] = useState("");
  const [fonction, setFonction] = useState("");
  const [collab, setCollab] = useState("");
  const [sujet, setSujet] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const fields = profile ? CONTACT_FIELDS[profile] : [];

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!profile) return;
    const hasPhone = tel.replace(/[^0-9+]/g, "").length >= 8;
    const hasEmail = /^\S+@\S+\.\S+$/.test(email);
    if (!nom.trim() || (!hasPhone && !hasEmail) || msg.trim().length < 3) {
      setError(true);
      return;
    }
    setError(false);
    setPending(true);
    try {
      const response = await fetch("/api/public/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "web",
          intent: PROFILE_INTENT[profile],
          category: CONTACT_PROFILES.find(([k]) => k === profile)?.[1],
          territory: terr === "autre" ? undefined : terr || undefined,
          description: msg.trim(),
          actorType: PROFILE_ACTOR[profile],
          organization: org.trim() || undefined,
          contactName: nom.trim(),
          phone: tel.trim(),
          email: email.trim() || undefined,
          preferredChannel: hasPhone ? "whatsapp" : "email",
          consent: true,
          context: { page: "contact", profile, metier: metier || undefined, orgType: orgType || undefined, fonction: fonction.trim() || undefined, collab: collab || undefined, sujet: sujet || undefined }
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(true);
        return;
      }
      setReference(payload.reference);
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  function reset() {
    setProfile(null);
    setMetier(""); setTerr(""); setOrg(""); setOrgType(""); setFonction(""); setCollab(""); setSujet("");
    setNom(""); setEmail(""); setTel(""); setMsg(""); setError(false); setReference(null);
  }

  return (
    <main style={{ fontFamily: "var(--font-instrument-sans), system-ui, sans-serif", color: "#1E2A38", background: "#fff" }}>
      <PublicHeader />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(40px,5vw,72px) clamp(20px,4vw,48px) clamp(56px,7vw,96px)", display: "flex", flexWrap: "wrap", gap: "clamp(32px,5vw,80px)", alignItems: "flex-start" }}>
        <aside style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 20 }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(40px,4.8vw,64px)", lineHeight: 1, letterSpacing: "-.02em" }}>Nous contacter</h1>
          <p style={{ margin: 0, fontSize: 17.5, lineHeight: 1.6, color: "#3A4556" }}>Dites-nous qui vous êtes : votre message sera orienté vers la bonne personne.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 18, borderTop: "1px solid rgba(11,26,42,.15)", fontSize: 15, color: "#3A4556" }}>
            <a href="mailto:contact@mbambulaan.sn" style={{ fontWeight: 600, textDecoration: "none", color: "#3A4556" }}>contact@mbambulaan.sn</a>
            <span>Dakar, Sénégal</span>
          </div>
        </aside>

        <div style={{ flex: "2 1 520px", display: "flex", flexDirection: "column", gap: 32, minWidth: 0 }}>
          {reference ? (
            <div style={{ background: "#F7F3E9", padding: "clamp(24px,4vw,48px)", display: "flex", flexDirection: "column", gap: 18 }}>
              <span style={{ width: 52, height: 52, borderRadius: "50%", background: "#0B1A2A", color: "#E8A07F", display: "grid", placeItems: "center", fontSize: 22 }}>✓</span>
              <h2 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(30px,3.4vw,42px)", lineHeight: 1.1 }}>Merci, votre message est bien parti.</h2>
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: "#3A4556" }}>Nous vous répondrons dans les meilleurs délais. Référence : <strong style={{ color: "#0B1A2A" }}>{reference}</strong></p>
              <button type="button" onClick={reset} style={{ alignSelf: "flex-start", minHeight: 48, padding: "0 20px", background: "#0B1A2A", color: "#fff", border: 0, borderRadius: 2, font: "600 15px var(--font-instrument-sans), sans-serif", cursor: "pointer" }}>Nouveau message</button>
            </div>
          ) : (
            <>
              <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                <legend style={{ padding: 0, marginBottom: 14, fontWeight: 600, fontSize: 15 }}>Vous êtes…</legend>
                <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid rgba(11,26,42,.14)" }}>
                  {CONTACT_PROFILES.map(([key, label, hint]) => {
                    const active = profile === key;
                    return (
                      <button key={key} type="button" onClick={() => setProfile(key)} aria-pressed={active} style={{ display: "flex", alignItems: "center", gap: 16, minHeight: 64, padding: "12px 16px", background: active ? "#F7F3E9" : "transparent", color: "#0B1A2A", border: 0, borderBottom: "1px solid rgba(11,26,42,.14)", textAlign: "left", cursor: "pointer", font: "inherit" }}>
                        <span style={{ flex: "none", width: 18, height: 18, borderRadius: "50%", border: `1.5px solid ${active ? "#B6522F" : "rgba(11,26,42,.4)"}`, display: "grid", placeItems: "center" }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#B6522F", opacity: active ? 1 : 0 }} />
                        </span>
                        <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, lineHeight: 1.2 }}>{label}</span>
                          {hint && <span style={{ fontSize: 14, opacity: 0.75 }}>{hint}</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {profile === "signaler" && (
                <div style={{ background: "#F7F3E9", padding: 28, display: "flex", flexDirection: "column", gap: 14 }}>
                  <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55 }}>Pour signaler une situation, utilisez le formulaire dédié : il vous guide en quelques étapes simples.</p>
                  <Link href="/partager" style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", minHeight: 50, padding: "0 24px", background: "#B6522F", color: "#fff", fontWeight: 600, fontSize: 15, textDecoration: "none", borderRadius: 2 }}>Partager une information →</Link>
                </div>
              )}

              {profile && profile !== "signaler" && (
                <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18, background: "#F7F3E9", padding: "clamp(22px,3vw,36px)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 16 }}>
                    {fields.includes("metier") && (
                      <label style={{ display: "flex", flexDirection: "column", gap: 8, fontWeight: 600, fontSize: 15 }}>Votre métier
                        <select value={metier} onChange={(e) => setMetier(e.target.value)} style={{ minHeight: 50, padding: "0 12px", border: "1px solid rgba(11,26,42,.3)", borderRadius: 2, background: "#fff", font: "400 16px var(--font-instrument-sans), sans-serif" }}>
                          <option value="">—</option>
                          <option>Pêcheur</option><option>Mareyeur·se</option><option>Transformatrice·teur</option><option>Commerçant·e</option><option>Propriétaire de pirogue</option><option>Autre métier</option>
                        </select>
                      </label>
                    )}
                    {fields.includes("terr") && (
                      <label style={{ display: "flex", flexDirection: "column", gap: 8, fontWeight: 600, fontSize: 15 }}>Territoire
                        <select value={terr} onChange={(e) => setTerr(e.target.value)} style={{ minHeight: 50, padding: "0 12px", border: "1px solid rgba(11,26,42,.3)", borderRadius: 2, background: "#fff", font: "400 16px var(--font-instrument-sans), sans-serif" }}>
                          <option value="">—</option>
                          {TERRITORIES.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
                          <option value="autre">Autre</option>
                        </select>
                      </label>
                    )}
                    {fields.includes("org") && (
                      <label style={{ display: "flex", flexDirection: "column", gap: 8, fontWeight: 600, fontSize: 15 }}>Organisation
                        <input value={org} onChange={(e) => setOrg(e.target.value)} style={{ minHeight: 50, padding: "0 14px", border: "1px solid rgba(11,26,42,.3)", borderRadius: 2, font: "400 16px var(--font-instrument-sans), sans-serif" }} />
                      </label>
                    )}
                    {fields.includes("orgType") && (
                      <label style={{ display: "flex", flexDirection: "column", gap: 8, fontWeight: 600, fontSize: 15 }}>Type d’organisation
                        <select value={orgType} onChange={(e) => setOrgType(e.target.value)} style={{ minHeight: 50, padding: "0 12px", border: "1px solid rgba(11,26,42,.3)", borderRadius: 2, background: "#fff", font: "400 16px var(--font-instrument-sans), sans-serif" }}>
                          <option value="">—</option>
                          <option>Institution publique</option><option>Collectivité territoriale</option><option>Organisation professionnelle</option><option>ONG / association</option><option>Entreprise</option><option>Partenaire technique ou financier</option><option>Recherche / université</option>
                        </select>
                      </label>
                    )}
                    {fields.includes("fonction") && (
                      <label style={{ display: "flex", flexDirection: "column", gap: 8, fontWeight: 600, fontSize: 15 }}>Votre fonction
                        <input value={fonction} onChange={(e) => setFonction(e.target.value)} style={{ minHeight: 50, padding: "0 14px", border: "1px solid rgba(11,26,42,.3)", borderRadius: 2, font: "400 16px var(--font-instrument-sans), sans-serif" }} />
                      </label>
                    )}
                    {fields.includes("collab") && (
                      <label style={{ display: "flex", flexDirection: "column", gap: 8, fontWeight: 600, fontSize: 15 }}>Nature de la collaboration
                        <select value={collab} onChange={(e) => setCollab(e.target.value)} style={{ minHeight: 50, padding: "0 12px", border: "1px solid rgba(11,26,42,.3)", borderRadius: 2, background: "#fff", font: "400 16px var(--font-instrument-sans), sans-serif" }}>
                          <option value="">—</option>
                          <option>Projet territorial</option><option>Formation</option><option>Recherche / connaissance</option><option>Contenus / médias</option><option>Financement</option><option>Autre</option>
                        </select>
                      </label>
                    )}
                    {fields.includes("sujet") && (
                      <label style={{ display: "flex", flexDirection: "column", gap: 8, fontWeight: 600, fontSize: 15 }}>Sujet
                        <select value={sujet} onChange={(e) => setSujet(e.target.value)} style={{ minHeight: 50, padding: "0 12px", border: "1px solid rgba(11,26,42,.3)", borderRadius: 2, background: "#fff", font: "400 16px var(--font-instrument-sans), sans-serif" }}>
                          <option value="">—</option>
                          <option>Le programme Mbàmbulaan</option><option>L’Atlas</option><option>Les contenus</option><option>Presse</option><option>Autre</option>
                        </select>
                      </label>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: 16 }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: 8, fontWeight: 600, fontSize: 15 }}>Nom<input value={nom} onChange={(e) => setNom(e.target.value)} style={{ minHeight: 50, padding: "0 14px", border: "1px solid rgba(11,26,42,.3)", borderRadius: 2, font: "400 16px var(--font-instrument-sans), sans-serif" }} /></label>
                    <label style={{ display: "flex", flexDirection: "column", gap: 8, fontWeight: 600, fontSize: 15 }}>E-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ minHeight: 50, padding: "0 14px", border: "1px solid rgba(11,26,42,.3)", borderRadius: 2, font: "400 16px var(--font-instrument-sans), sans-serif" }} /></label>
                    <label style={{ display: "flex", flexDirection: "column", gap: 8, fontWeight: 600, fontSize: 15 }}>Téléphone<input value={tel} onChange={(e) => setTel(e.target.value)} placeholder="+221" style={{ minHeight: 50, padding: "0 14px", border: "1px solid rgba(11,26,42,.3)", borderRadius: 2, font: "400 16px var(--font-instrument-sans), sans-serif" }} /></label>
                  </div>
                  <label style={{ display: "flex", flexDirection: "column", gap: 8, fontWeight: 600, fontSize: 15 }}>{CONTACT_MSG_LABEL[profile]}
                    <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={5} style={{ padding: "12px 14px", border: "1px solid rgba(11,26,42,.3)", borderRadius: 2, font: "400 16px/1.5 var(--font-instrument-sans), sans-serif", resize: "vertical" }} />
                  </label>
                  {error && <p role="alert" style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: "#B3261E" }}>Merci d’indiquer votre nom, un moyen de contact (e-mail ou téléphone) et votre message.</p>}
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                    <span style={{ fontSize: 13.5, color: "#4C5566", maxWidth: 380 }}>Vos coordonnées servent uniquement à vous répondre.</span>
                    <button type="submit" disabled={pending} className="pv2-btn-rust" style={{ minHeight: 52, padding: "0 26px", background: "#B6522F", color: "#fff", border: 0, borderRadius: 2, font: "600 15.5px var(--font-instrument-sans), sans-serif", cursor: pending ? "default" : "pointer", opacity: pending ? 0.7 : 1 }}>{pending ? "Envoi…" : "Envoyer"}</button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      <PublicFooter />

      <style>{`.pv2-btn-rust:hover { background: #9E431F; }`}</style>
    </main>
  );
}
