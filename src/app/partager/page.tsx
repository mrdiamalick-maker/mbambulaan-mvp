"use client";

// Partager une information — Public V2, écran "07 Partager une information".
// Assistant à 4 étapes (quoi → où → description → coordonnées ou anonyme),
// branché sur le backend réel /api/public/requests (createPublicRequest) :
// aucune nouvelle table, le champ "anonymous" de la route autorise une
// soumission sans nom ni téléphone en forçant contactName="Anonyme" côté
// serveur, quoi que le client ait pu envoyer.
import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { SINCE_OPTIONS, SITUATION_KINDS, TERRITORIES, WHO_OPTIONS, type SituationKind } from "@/data/public-v2-content";
import type { PublicRequestIntent } from "@/domain/public/request";

const KIND_INTENT: Record<SituationKind, PublicRequestIntent> = {
  quai: "organisation",
  conservation: "conservation",
  besoin: "equipement",
  infra: "maintenance",
  environnement: "autre",
  opportunite: "debouches",
  autre: "autre"
};

const STEP_NAMES = ["Quoi", "Où", "Description", "Coordonnées"];

function btnStyle(active: boolean): React.CSSProperties {
  return { minHeight: 44, padding: "0 14px", border: `1px solid ${active ? "#0B1A2A" : "rgba(11,26,42,.3)"}`, background: active ? "#0B1A2A" : "#fff", color: active ? "#F7F3E9" : "#0B1A2A", borderRadius: 2, cursor: "pointer", font: "500 14.5px var(--font-instrument-sans), sans-serif" };
}

export default function PartagerPage() {
  return (
    <Suspense fallback={null}>
      <PartagerForm />
    </Suspense>
  );
}

function PartagerForm() {
  const searchParams = useSearchParams();
  const prefTerritoire = searchParams.get("territoire") ?? "";

  const [step, setStep] = useState(1);
  const [kind, setKind] = useState<SituationKind | null>(null);
  const [territoire, setTerritoire] = useState(prefTerritoire);
  const [lieu, setLieu] = useState("");
  const [desc, setDesc] = useState("");
  const [since, setSince] = useState<string | null>(null);
  const [who, setWho] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [anon, setAnon] = useState(false);
  const [nom, setNom] = useState("");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const progress = useMemo(() => `${(step / 4) * 100}%`, [step]);

  function toggleWho(label: string) {
    setWho((prev) => (prev.includes(label) ? prev.filter((w) => w !== label) : [...prev, label]));
  }

  function back() {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  }

  function next() {
    setError("");
    if (step === 1 && !kind) return setError("Choisissez ce qui se passe.");
    if (step === 2 && !territoire) return setError("Choisissez un territoire, ou « Autre lieu ».");
    if (step === 3 && desc.trim().length < 8) return setError("Décrivez en quelques mots ce que vous avez observé.");
    if (step < 4) return setStep((s) => s + 1);
    void submit();
  }

  async function submit() {
    if (!anon) {
      const hasPhone = tel.replace(/[^0-9+]/g, "").length >= 8;
      const hasEmail = /^\S+@\S+\.\S+$/.test(email);
      if (!hasPhone && !hasEmail) {
        setError("Indiquez un téléphone ou un e-mail, ou cochez « Je préfère rester anonyme ».");
        return;
      }
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/public/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "web",
          intent: kind ? KIND_INTENT[kind] : "autre",
          category: kind ? SITUATION_KINDS.find(([k]) => k === kind)?.[1] : undefined,
          territory: territoire === "autre" ? undefined : territoire,
          description: desc.trim(),
          actorType: role === "Organisation / institution" ? "institution" : role === "Autre" ? "autre" : "particulier",
          anonymous: anon,
          contactName: nom.trim(),
          phone: tel.trim(),
          email: email.trim() || undefined,
          preferredChannel: tel.trim() ? "whatsapp" : email.trim() ? "email" : "whatsapp",
          consent: true,
          context: { page: "partager", lieu: lieu.trim() || undefined, since: since ?? undefined, who: who.length ? who.join(", ") : undefined, role: role || undefined },
          attachmentNote: fileName ? `Pièce jointe annoncée par la personne (non transmise techniquement à ce stade) : ${fileName}` : undefined
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Une erreur est survenue.");
        return;
      }
      setReference(payload.reference);
    } catch {
      setError("La connexion a échoué. Merci de réessayer.");
    } finally {
      setPending(false);
    }
  }

  function reset() {
    setStep(1);
    setKind(null);
    setTerritoire("");
    setLieu("");
    setDesc("");
    setSince(null);
    setWho([]);
    setFileName(null);
    setAnon(false);
    setNom("");
    setTel("");
    setEmail("");
    setRole("");
    setError("");
    setReference(null);
  }

  return (
    <main style={{ fontFamily: "var(--font-instrument-sans), system-ui, sans-serif", color: "#1E2A38", background: "#F7F3E9" }}>
      <PublicHeader />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(40px,5vw,72px) clamp(20px,4vw,48px) clamp(56px,7vw,96px)", display: "flex", flexWrap: "wrap", gap: "clamp(32px,5vw,80px)", alignItems: "flex-start" }}>
        <aside style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 20 }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(38px,4.4vw,58px)", lineHeight: 1.02, letterSpacing: "-.02em" }}>Partager une information</h1>
          <p style={{ margin: 0, fontSize: 17.5, lineHeight: 1.6, color: "#3A4556" }}>Un problème sur un quai, un besoin, une opportunité, une situation que d’autres devraient connaître ? Dites-le simplement. Quelques minutes suffisent.</p>
          <p style={{ margin: 0, paddingTop: 18, borderTop: "1px solid rgba(11,26,42,.15)", fontSize: 14.5, lineHeight: 1.6, color: "#4C5566" }}>Partager une information ne la rend pas officielle. Les informations reçues peuvent être vérifiées, complétées ou recoupées avant d’être utilisées par Mbàmbulaan.</p>
        </aside>

        <div style={{ flex: "2 1 520px", background: "#fff", padding: "clamp(24px,4vw,48px)", display: "flex", flexDirection: "column", gap: 28, minWidth: 0 }}>
          {!reference ? (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, fontWeight: 600, color: "#4C5566" }}>
                  <span>Étape {step} sur 4</span><span>{STEP_NAMES[step - 1]}</span>
                </div>
                <div style={{ height: 3, background: "rgba(11,26,42,.1)" }}><div style={{ height: "100%", width: progress, background: "#B6522F", transition: "width .3s" }} /></div>
              </div>

              {step === 1 && (
                <fieldset style={{ border: 0, margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 18 }}>
                  <legend style={{ padding: 0, marginBottom: 18, fontFamily: "var(--font-newsreader), serif", fontSize: 32, lineHeight: 1.15 }}>Que se passe-t-il ?</legend>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,220px),1fr))", gap: 10 }}>
                    {SITUATION_KINDS.map(([k, label, hint]) => (
                      <button key={k} type="button" onClick={() => setKind(k)} aria-pressed={kind === k} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, minHeight: 84, padding: "14px 16px", textAlign: "left", border: `1px solid ${kind === k ? "#0B1A2A" : "rgba(11,26,42,.25)"}`, background: kind === k ? "#0B1A2A" : "#fff", color: kind === k ? "#F7F3E9" : "#0B1A2A", borderRadius: 2, cursor: "pointer", font: "inherit" }}>
                        <span style={{ fontWeight: 600, fontSize: 16 }}>{label}</span>
                        <span style={{ fontSize: 13.5, lineHeight: 1.4, opacity: 0.75 }}>{hint}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {step === 2 && (
                <fieldset style={{ border: 0, margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 20 }}>
                  <legend style={{ padding: 0, marginBottom: 18, fontFamily: "var(--font-newsreader), serif", fontSize: 32, lineHeight: 1.15 }}>Où ?</legend>
                  <label style={{ display: "flex", flexDirection: "column", gap: 8, fontWeight: 600, fontSize: 15 }}>
                    Territoire
                    <select value={territoire} onChange={(e) => setTerritoire(e.target.value)} style={{ minHeight: 50, padding: "0 12px", border: "1px solid rgba(11,26,42,.3)", borderRadius: 2, background: "#fff", font: "400 16px var(--font-instrument-sans), sans-serif", color: "#0B1A2A" }}>
                      <option value="">Choisir un territoire</option>
                      {TERRITORIES.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
                      <option value="autre">Autre lieu</option>
                    </select>
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 8, fontWeight: 600, fontSize: 15 }}>
                    Lieu précis <span style={{ fontWeight: 400, color: "#4C5566", fontSize: 14 }}>Quai, plage, marché, quartier… (facultatif)</span>
                    <input value={lieu} onChange={(e) => setLieu(e.target.value)} placeholder="Ex. : quai de pêche, côté marché" style={{ minHeight: 50, padding: "0 14px", border: "1px solid rgba(11,26,42,.3)", borderRadius: 2, font: "400 16px var(--font-instrument-sans), sans-serif", color: "#0B1A2A" }} />
                  </label>
                </fieldset>
              )}

              {step === 3 && (
                <fieldset style={{ border: 0, margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 24 }}>
                  <legend style={{ padding: 0, marginBottom: 18, fontFamily: "var(--font-newsreader), serif", fontSize: 32, lineHeight: 1.15 }}>Décrivez simplement</legend>
                  <label style={{ display: "flex", flexDirection: "column", gap: 8, fontWeight: 600, fontSize: 15 }}>
                    Ce que vous avez observé
                    <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={5} placeholder="Avec vos mots : ce qui se passe, ce que cela change pour les personnes concernées." style={{ padding: "12px 14px", border: "1px solid rgba(11,26,42,.3)", borderRadius: 2, font: "400 16px/1.5 var(--font-instrument-sans), sans-serif", color: "#0B1A2A", resize: "vertical" }} />
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>Depuis quand ? <span style={{ fontWeight: 400, color: "#4C5566", fontSize: 14 }}>si vous le savez</span></span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {SINCE_OPTIONS.map((o) => (
                        <button key={o} type="button" onClick={() => setSince(o)} aria-pressed={since === o} style={btnStyle(since === o)}>{o}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>Qui est concerné ? <span style={{ fontWeight: 400, color: "#4C5566", fontSize: 14 }}>facultatif, plusieurs choix possibles</span></span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {WHO_OPTIONS.map((o) => (
                        <button key={o} type="button" onClick={() => toggleWho(o)} aria-pressed={who.includes(o)} style={btnStyle(who.includes(o))}>{o}</button>
                      ))}
                    </div>
                  </div>
                  <label style={{ display: "flex", flexDirection: "column", gap: 8, fontWeight: 600, fontSize: 15 }}>
                    Photo ou document <span style={{ fontWeight: 400, color: "#4C5566", fontSize: 14 }}>facultatif · JPG, PNG ou PDF</span>
                    <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, minHeight: 56, padding: "0 16px", border: "1px dashed rgba(11,26,42,.35)", borderRadius: 2, fontWeight: 400, color: "#3A4556", cursor: "pointer" }}>
                      <span style={{ fontWeight: 600, color: "#B6522F" }}>Ajouter un fichier</span>
                      <span style={{ fontSize: 14, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName ?? "Aucun fichier choisi"}</span>
                      <input type="file" accept="image/*,.pdf" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} />
                    </span>
                  </label>
                </fieldset>
              )}

              {step === 4 && (
                <fieldset style={{ border: 0, margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 20 }}>
                  <legend style={{ padding: 0, marginBottom: 10, fontFamily: "var(--font-newsreader), serif", fontSize: 32, lineHeight: 1.15 }}>Comment pouvons-nous vous recontacter ?</legend>
                  <p style={{ margin: 0, fontSize: 15.5, color: "#3A4556" }}>Facultatif. Cela nous permet de vous poser une question si besoin. Vos coordonnées ne sont jamais publiées.</p>
                  <label style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15.5, cursor: "pointer" }}>
                    <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} style={{ width: 20, height: 20, accentColor: "#B6522F" }} />
                    Je préfère rester anonyme
                  </label>
                  {!anon && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 16 }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: 8, fontWeight: 600, fontSize: 15 }}>Nom<input value={nom} onChange={(e) => setNom(e.target.value)} style={{ minHeight: 50, padding: "0 14px", border: "1px solid rgba(11,26,42,.3)", borderRadius: 2, font: "400 16px var(--font-instrument-sans), sans-serif" }} /></label>
                      <label style={{ display: "flex", flexDirection: "column", gap: 8, fontWeight: 600, fontSize: 15 }}>Téléphone / WhatsApp<input value={tel} onChange={(e) => setTel(e.target.value)} inputMode="tel" placeholder="+221" style={{ minHeight: 50, padding: "0 14px", border: "1px solid rgba(11,26,42,.3)", borderRadius: 2, font: "400 16px var(--font-instrument-sans), sans-serif" }} /></label>
                      <label style={{ display: "flex", flexDirection: "column", gap: 8, fontWeight: 600, fontSize: 15 }}>E-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ minHeight: 50, padding: "0 14px", border: "1px solid rgba(11,26,42,.3)", borderRadius: 2, font: "400 16px var(--font-instrument-sans), sans-serif" }} /></label>
                      <label style={{ display: "flex", flexDirection: "column", gap: 8, fontWeight: 600, fontSize: 15 }}>Vous êtes
                        <select value={role} onChange={(e) => setRole(e.target.value)} style={{ minHeight: 50, padding: "0 12px", border: "1px solid rgba(11,26,42,.3)", borderRadius: 2, background: "#fff", font: "400 16px var(--font-instrument-sans), sans-serif" }}>
                          <option value="">—</option>
                          <option>Professionnel·le de la filière</option>
                          <option>Habitant·e</option>
                          <option>Organisation / institution</option>
                          <option>Autre</option>
                        </select>
                      </label>
                    </div>
                  )}
                </fieldset>
              )}

              {error && <p role="alert" style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: "#B3261E" }}>{error}</p>}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, paddingTop: 20, borderTop: "1px solid rgba(11,26,42,.1)" }}>
                {step > 1 ? <button type="button" onClick={back} style={{ minHeight: 48, padding: "0 4px", background: "none", border: 0, font: "600 15px var(--font-instrument-sans), sans-serif", color: "#4C5566", cursor: "pointer" }}>← Retour</button> : <span />}
                <span style={{ flex: 1 }} />
                <button type="button" onClick={next} disabled={pending} className="pv2-btn-rust" style={{ minHeight: 52, padding: "0 26px", background: "#B6522F", color: "#fff", border: 0, borderRadius: 2, font: "600 15.5px var(--font-instrument-sans), sans-serif", cursor: pending ? "default" : "pointer", opacity: pending ? 0.7 : 1 }}>
                  {pending ? "Envoi…" : step < 4 ? "Continuer" : "Envoyer"}
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <span style={{ width: 52, height: 52, borderRadius: "50%", background: "#0B1A2A", color: "#E8A07F", display: "grid", placeItems: "center", fontSize: 22 }}>✓</span>
              <h2 style={{ margin: 0, fontFamily: "var(--font-newsreader), serif", fontWeight: 400, fontSize: "clamp(30px,3.4vw,42px)", lineHeight: 1.1 }}>Merci, votre information a bien été reçue.</h2>
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: "#3A4556" }}>Conservez cette référence si vous souhaitez nous en reparler : <strong style={{ color: "#0B1A2A" }}>{reference}</strong></p>
              <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8, fontSize: 16, lineHeight: 1.55, color: "#1E2A38" }}>
                <li>Notre équipe lit chaque information reçue.</li>
                <li>Elle peut être vérifiée, complétée ou recoupée avec d’autres sources.</li>
                <li>Si vous avez laissé vos coordonnées, nous pourrons vous recontacter.</li>
              </ol>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, paddingTop: 8 }}>
                <button type="button" onClick={reset} style={{ minHeight: 50, padding: "0 22px", background: "#0B1A2A", color: "#fff", border: 0, borderRadius: 2, font: "600 15px var(--font-instrument-sans), sans-serif", cursor: "pointer" }}>Partager autre chose</button>
                <Link href="/atlas" style={{ display: "inline-flex", alignItems: "center", minHeight: 50, padding: "0 22px", border: "1px solid #0B1A2A", color: "#0B1A2A", fontWeight: 600, fontSize: 15, textDecoration: "none", borderRadius: 2 }}>Explorer l’Atlas</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <PublicFooter />

      <style>{`.pv2-btn-rust:hover { background: #9E431F; }`}</style>
    </main>
  );
}
