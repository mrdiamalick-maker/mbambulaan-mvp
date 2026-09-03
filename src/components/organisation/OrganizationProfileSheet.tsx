"use client";

// OrganizationProfileSheet — LOT 7 (mandat "Actor & Trust Network", §26).
// Dossier organisation : QUI (nom/type), OÙ (territoires), QUE PEUT-ELLE
// FAIRE (services), QUE SAVONS-NOUS (provenance/confiance),
// EST-CE ACTUEL (fraîcheur), OÙ EST-ELLE DÉJÀ MOBILISÉE (engagements),
// HISTORIQUE UTILE (faits, jamais une notation). Consomme uniquement
// buildOrganizationNetworkProfile (aucune donnée recalculée ici) — pas de
// nouvelle route, ouvert en Sheet depuis /app/organisation.
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TrustBadge } from "@/components/shared/StatusBadges";
import { describeCapacityAvailability, type OrganizationNetworkProfile } from "@/domain/actor-network";
import { actorRelationshipKindLabels, verificationStatusLabels } from "@/domain/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

const organizationTypeLabel: Record<string, string> = {
  service_public: "Service public",
  collectivite: "Collectivité",
  organisation_professionnelle: "Organisation professionnelle",
  entreprise: "Entreprise",
  partenaire: "Partenaire"
};

const partnerServiceStatusLabel: Record<string, string> = {
  reference: "Référencée",
  qualifie: "Qualifiée",
  a_activer: "À activer"
};

export function OrganizationProfileSheet({ profile }: { profile: OrganizationNetworkProfile }) {
  const { organization, members, verifiedMembers, territories, services, capacities, openCommitments, closedCommitments, initiatives, relationships, engagedInitiatives } = profile;

  return (
    <div className="space-y-6 px-1">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{organizationTypeLabel[organization.type] ?? organization.type}</Badge>
          <Badge variant="outline">{verificationStatusLabels[organization.verificationStatus ?? "documentee"]}</Badge>
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">Identité déclarée, documentée ou vérifiée — jamais un score : c’est un fait à vérifier, pas une note.</p>
      </div>

      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Où</p>
        {/* XXL-R5 (§33) — territoire cliquable vers l'Atlas professionnel :
            "même objet, autre profondeur", pas un texte mort. */}
        {territories.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-x-1.5 gap-y-1 text-sm">
            {territories.map((item, index) => (
              <span key={item.id}>
                <Link href={`/app/atlas?territoire=${item.id}`} className="font-semibold text-[#1d4468] hover:underline">{item.name}</Link>
                {index < territories.length - 1 ? " ·" : ""}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Aucun territoire connu pour l’instant.</p>
        )}
      </section>

      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Que peut-elle faire — capacités documentées</p>
        {services.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Aucune capacité documentée pour cette organisation à ce stade.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {services.map((service) => (
              <div key={service.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">{service.name}</p><TrustBadge trust={service.trust} /></div>
                <p className="mt-1 text-xs text-muted-foreground">Statut · {partnerServiceStatusLabel[service.status]}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Condition d’activation · {service.activationConditions}</p>
                {/* Micro-correctif final LOT 7 (§A2) — un PartnerService
                    référencé n'est jamais une disponibilité en temps réel,
                    quelle que soit sa provenance. */}
                <p className="mt-1 text-[11px] text-muted-foreground">Capacité documentée/référencée — pas une disponibilité en temps réel.</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Disponibilité réelle (§A2) — distincte des PartnerService : ne
          s'affiche que lorsqu'une vraie Capacity existe (liée aux
          Infrastructure de l'organisation), jamais fabriquée. Une Capacity
          expirée ou non "disponible" reste honnêtement "à revérifier",
          jamais présentée comme indisponible par simple péremption. */}
      {capacities.length > 0 && (
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Disponibilité connue — infrastructures</p>
          <div className="mt-2 space-y-2">
            {capacities.map((capacity) => {
              const availability = describeCapacityAvailability(capacity);
              return (
                <div key={capacity.id} className="rounded-lg border p-3">
                  <p className="text-sm font-semibold capitalize">{capacity.type} · {capacity.availableQuantity} {capacity.unit}</p>
                  {availability.kind === "valide" ? (
                    <p className="mt-1 text-xs text-[#1d8a5f]">Disponibilité vérifiée jusqu’au {formatDate(capacity.validUntil)}.</p>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">À revérifier avant toute mobilisation (dernière validité connue : {formatDate(capacity.validUntil)}).</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Où est-elle déjà mobilisée</p>
        <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border p-3"><p className="text-lg font-bold">{openCommitments.length}</p><p className="text-xs text-muted-foreground">engagement(s) ouvert(s)</p></div>
          <div className="rounded-lg border p-3"><p className="text-lg font-bold">{closedCommitments.length}</p><p className="text-xs text-muted-foreground">engagement(s) terminé(s)</p></div>
        </div>
        {/* XXL-R5 (§34) — relation Réseau → Programme rendue visible et
            cliquable (elle existait déjà, jamais inférée) : ancre vers la
            carte du programme sur /app/initiatives (id posé sur
            InitiativeCard, cf. initiatives/page.tsx). */}
        {initiatives.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {initiatives.map((initiative) => (
              <Link key={initiative.id} href={`/app/initiatives#initiative-${initiative.id}`} className="flex items-center gap-1.5 text-xs font-semibold leading-5 text-[#1d4468] hover:text-[#1d4468]/70">
                Programme · {initiative.title} <ArrowRight size={11} />
              </Link>
            ))}
          </div>
        )}
        <p className="mt-2 text-[11px] leading-4 text-muted-foreground">Faits d’engagement, pas une note de fiabilité — un engagement terminé n’implique aucune performance calculée.</p>
      </section>

      {/* Programmes auxquels elle contribue (P2.5-B, mandat §16) — lien
          retour, distinct de "Où est-elle déjà mobilisée" ci-dessus
          (Commitment, engagements individuels de coordination) : ici,
          uniquement les ProgrammeOrganizationEngagement au statut
          "engaged" — une contribution d'organisation confirmée, jamais
          une simple candidature encore "considérée"/"contactée". */}
      {engagedInitiatives.length > 0 && (
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Programmes auxquels elle contribue</p>
          <div className="mt-2 space-y-1.5">
            {engagedInitiatives.map(({ engagement, initiative }) => (
              <Link key={engagement.id} href={initiative ? `/app/initiatives#initiative-${initiative.id}` : "/app/initiatives"} className="flex items-center gap-1.5 text-xs font-semibold leading-5 text-[#1d4468] hover:text-[#1d4468]/70">
                Programme · {initiative?.title ?? "Programme introuvable"} <ArrowRight size={11} />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Membres habilités</p>
        <p className="mt-2 flex items-center gap-1.5 text-sm">{verifiedMembers.length}/{members.length} identités vérifiées <ShieldCheck size={13} className="text-[#1d8a5f]" /></p>
      </section>

      {/* Relations déclarées (P2.2-A, mandat §13) — membre/représentant/
          relais, avec statut de vérification : distinct de "Membres
          habilités" ci-dessus (Actor.organizationId, appartenance
          primaire) — une relation documente un geste humain explicite de
          rattachement/habilitation, jamais déduite de l'appartenance.
          "Représente" n'implique jamais "Membre" (mandat §4/§20). */}
      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Relations déclarées</p>
        {relationships.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Aucune relation Membre/Représentant/Relais documentée pour cette organisation à ce stade.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {relationships.map(({ relationship, actor }) => (
              <div key={relationship.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{actor?.name ?? "Acteur introuvable"}</p>
                  {relationship.note && <p className="mt-0.5 text-xs leading-4 text-muted-foreground">{relationship.note}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Badge variant="outline">{actorRelationshipKindLabels[relationship.kind]}</Badge>
                  <Badge variant="outline">{verificationStatusLabels[relationship.verificationStatus]}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
