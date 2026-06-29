"use client";

import { useState } from "react";
import { PageHero, PremiumShell, SectionIntro } from "@/components/premium/PremiumExperience";

type LeadFormPageProps = {
  kind: "demo" | "devis";
};

export function LeadFormPage({ kind }: LeadFormPageProps) {
  const [submitted, setSubmitted] = useState(false);
  const isDemo = kind === "demo";

  return (
    <PremiumShell mode="public">
      <PageHero
        kicker={isDemo ? "Demande de démo" : "Demande de devis"}
        title={isDemo ? "Recevoir une démonstration adaptée à votre organisation." : "Cadrer une proposition adaptée à votre territoire."}
        text={
          isDemo
            ? "La démo montre un scénario pertinent pour votre rôle. Elle ne donne pas d'accès immédiat aux espaces privés."
            : "Le devis dépend du territoire, du type d'organisation, du périmètre de coordination et du niveau d'accompagnement souhaité."
        }
        ctaHref="/demo"
        ctaLabel="Voir le parcours démo"
      />

      <section className="premium-section premium-grid-2">
        <div>
          <SectionIntro kicker="Accès cadré" title="Mbàmbulaan se déploie par démo, pilote, convention ou forfait." />
          <p className="premium-muted">
            Votre demande sera traitée comme une demande commerciale ou partenariale. Aucun accès réel au produit n'est ouvert automatiquement.
          </p>
          <div className="premium-card-stack">
            <div className="premium-form-note">PUBLIC : désir et crédibilité.</div>
            <div className="premium-form-note">DÉMO : projection personnalisée.</div>
            <div className="premium-form-note">PRIVÉ : valeur achetée et utilisée.</div>
          </div>
        </div>

        <div className="premium-card">
          {submitted ? (
            <div>
              <span className="premium-eyebrow">Demande enregistrée localement</span>
              <h3>Merci, votre demande est prête à être traitée.</h3>
              <p>
                Dans cette version sans backend, aucune donnée n'est envoyée. Le parcours montre simplement l'état de confirmation attendu.
              </p>
            </div>
          ) : (
            <form
              className="premium-form"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
              }}
            >
              <div className="premium-form-grid">
                <Field label="Nom" name="name" required />
                <Field label="Organisation" name="organization" required />
                <Field label="Rôle" name="role" required />
                <Field label="Email" name="email" type="email" required />
                <Field label="Téléphone" name="phone" />
                <label className="premium-field">
                  Type d'organisation
                  <select name="organizationType" required defaultValue="">
                    <option value="" disabled>Choisir</option>
                    <option>Collectivité</option>
                    <option>Organisation professionnelle</option>
                    <option>Entreprise</option>
                    <option>Institution</option>
                    <option>ONG / programme</option>
                    <option>Investisseur</option>
                  </select>
                </label>
                <Field label="Objectif" name="objective" required />
                <Field label="Territoire concerné" name="territory" />
              </div>
              <label className="premium-field">
                Message
                <textarea name="message" placeholder="Décrivez le contexte, le territoire ou le scénario que vous souhaitez voir." />
              </label>
              <button className="premium-button premium-button-primary" type="submit">
                {isDemo ? "Envoyer la demande de démo" : "Envoyer la demande de devis"}
              </button>
            </form>
          )}
        </div>
      </section>
    </PremiumShell>
  );
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <label className="premium-field">
      {label}
      <input name={name} required={required} type={type} />
    </label>
  );
}
