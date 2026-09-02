"use client";

// OrganizationProfileSheet — LOT 7 (mandat "Actor & Trust Network", §26).
// Dossier organisation : QUI (nom/type), OÙ (territoires), QUE PEUT-ELLE
// FAIRE (services), QUE SAVONS-NOUS (provenance/confiance),
// EST-CE ACTUEL (fraîcheur), OÙ EST-ELLE DÉJÀ MOBILISÉE (engagements),
// HISTORIQUE UTILE (faits, jamais une notation). Consomme uniquement
// buildOrganizationNetworkProfile (aucune donnée recalculée ici) — pas de
// nouvelle route, ouvert en Sheet depuis /app/organisation.
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TrustBadge } from "@/components/shared/StatusBadges";
import type { OrganizationNetworkProfile } from "@/domain/actor-network";

const organizationTypeLabel: Record<string, string> = {
  service_public: "Service public",
  collectivite: "Collectivité",
  organisation_professionnelle: "Organisation professionnelle",
  entreprise: "Entreprise",
  partenaire: "Partenaire"
};

const verificationLabel: Record<string, string> = {
  declaree: "Déclarée",
  documentee: "Documentée",
  verifiee: "Vérifiée"
};

const partnerServiceStatusLabel: Record<string, string> = {
  reference: "Référencée",
  qualifie: "Qualifiée",
  a_activer: "À activer"
};

export function OrganizationProfileSheet({ profile }: { profile: OrganizationNetworkProfile }) {
  const { organization, members, verifiedMembers, territories, services, openCommitments, closedCommitments, initiatives } = profile;

  return (
    <div className="space-y-6 px-1">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{organizationTypeLabel[organization.type] ?? organization.type}</Badge>
          <Badge variant="outline">{verificationLabel[organization.verificationStatus ?? "documentee"]}</Badge>
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">Identité déclarée, documentée ou vérifiée — jamais un score : c’est un fait à vérifier, pas une note.</p>
      </div>

      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Où</p>
        <p className="mt-2 text-sm">{territories.length > 0 ? territories.map((item) => item.name).join(" · ") : "Aucun territoire connu pour l'instant."}</p>
      </section>

      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Que peut-elle faire — capacités connues</p>
        {services.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Aucune capacité documentée pour cette organisation à ce stade.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {services.map((service) => (
              <div key={service.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">{service.name}</p><TrustBadge trust={service.trust} /></div>
                <p className="mt-1 text-xs text-muted-foreground">Statut · {partnerServiceStatusLabel[service.status]}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Condition d’activation · {service.activationConditions}</p>
                {service.sourceRef && <p className="mt-1 text-[11px] text-muted-foreground">Capacité déclarée — pas une disponibilité en temps réel.</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Où est-elle déjà mobilisée</p>
        <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border p-3"><p className="text-lg font-bold">{openCommitments.length}</p><p className="text-xs text-muted-foreground">engagement(s) ouvert(s)</p></div>
          <div className="rounded-lg border p-3"><p className="text-lg font-bold">{closedCommitments.length}</p><p className="text-xs text-muted-foreground">engagement(s) terminé(s)</p></div>
        </div>
        {initiatives.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {initiatives.map((initiative) => <p key={initiative.id} className="text-xs leading-5 text-muted-foreground">Programme · {initiative.title}</p>)}
          </div>
        )}
        <p className="mt-2 text-[11px] leading-4 text-muted-foreground">Faits d’engagement, pas une note de fiabilité — un engagement terminé n’implique aucune performance calculée.</p>
      </section>

      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Membres habilités</p>
        <p className="mt-2 flex items-center gap-1.5 text-sm">{verifiedMembers.length}/{members.length} identités vérifiées <ShieldCheck size={13} className="text-[#1d8a5f]" /></p>
      </section>
    </div>
  );
}
