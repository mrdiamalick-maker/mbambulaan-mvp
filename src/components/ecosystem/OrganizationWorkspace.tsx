"use client";

// OrganizationWorkspace — LOT 7 (mandat "Actor & Trust Network : rendre
// l'écosystème mobilisable"). Repositionnement, route inchangée
// (/app/organisation, mandat §8) : la page répondait surtout "qui
// appartient à mon organisation et quels sont mes droits ?" — elle répond
// désormais aussi "qui existe dans l'écosystème, où, avec quelles
// capacités, et que savons-nous réellement d'eux ?". Deux niveaux
// distincts, jamais mélangés silencieusement (mandat §8/§34) :
// MON ORGANISATION (membres, capacités propres, gouvernance des accès)
// et ÉCOSYSTÈME MOBILISABLE (organisations et capacités du réseau,
// contributions publiques à qualifier). Aucun Actor/Organization/
// PartnerService recréé — uniquement des projections (actor-network.ts)
// et une commande de qualification humaine.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Factory,
  FileBarChart,
  Inbox,
  KeyRound,
  LockKeyhole,
  MapPin,
  Network,
  Radio,
  Search,
  ShieldCheck,
  UserCheck,
  UsersRound
} from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { TrustBadge } from "@/components/shared/StatusBadges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AccessSummary } from "@/components/subscription/AccessSummary";
import { buildOrganizationNetworkProfile } from "@/domain/actor-network";
import { OrganizationProfileSheet } from "@/components/organisation/OrganizationProfileSheet";
import { QualifySignalForm } from "@/components/organisation/QualifySignalForm";
import type { Report, Signal } from "@/domain/types";
import type { PublicContribution } from "@/domain/public/contribution";

const reportStatusLabel: Record<Report["status"], string> = {
  pret: "Prêt",
  a_actualiser: "À actualiser"
};

const roleNames: Record<string, string> = {
  administrateur: "Administration de la plateforme",
  operateur: "Opérations de quai",
  capitaine: "Conduite de pirogue",
  mareyeur: "Mareyage et débouchés",
  transformateur: "Transformation",
  prestataire: "Services et capacités",
  gestionnaire_organisation: "Gestion de l’organisation",
  coordinateur: "Coordination territoriale",
  institution: "Pilotage institutionnel",
  partenaire: "Partenaire d’impact"
};

// Rôles qui peuvent qualifier une contribution — même liste que
// qualify_signal_as_network_capacity dans permissions.ts, dupliquée en
// UI plutôt qu'importée (permissions.ts est server-only) : n'affiche pas
// le panneau à un rôle qui ne peut de toute façon pas agir.
const QUALIFYING_ROLES = new Set(["administrateur", "coordinateur", "gestionnaire_organisation", "institution"]);

export function OrganizationWorkspace() {
  const { state, role, actorId: sessionActorId } = useProduct();
  // XXL-R5 (§14, §33) — ?organisation=<id> permet à un profil Réseau
  // d'être ouvert directement depuis un lien externe (Programmes,
  // dossier territorial…), même discipline que ?territoire= côté Atlas
  // (R4) : lu une seule fois à l'initialisation, la sélection reste
  // ensuite un état local classique.
  const searchParams = useSearchParams();
  const [profileOrganizationId, setProfileOrganizationId] = useState<string | null>(() => searchParams.get("organisation"));
  const [networkTerritoryFilter, setNetworkTerritoryFilter] = useState("");
  // §22 — recherche centrale sur ce qui existe réellement : nom de
  // capacité, catégorie, organisation, territoire. Un seul champ texte,
  // pas quatre filtres fictifs.
  const [networkSearch, setNetworkSearch] = useState("");
  const [qualifySignal, setQualifySignal] = useState<Signal | null>(null);
  const [pendingContributions, setPendingContributions] = useState<PublicContribution[]>([]);
  const [contributionsLoading, setContributionsLoading] = useState(true);
  const [contributionsError, setContributionsError] = useState("");

  const canQualify = QUALIFYING_ROLES.has(role);

  // Pont PublicContribution → Réseau, étape 2/2 (LOT 7 clôt le follow-up
  // ouvert par LOT 6) — même discipline que le pont PublicRequest déjà en
  // place dans CoordinationWorkspace.tsx : chargé une fois au montage,
  // cette liste change par action humaine (qualification), pas un flux
  // temps réel à suivre en continu.
  useEffect(() => {
    if (!canQualify) { setContributionsLoading(false); return; }
    let cancelled = false;
    fetch("/api/coordination/public-contributions")
      .then(async (response) => {
        const payload = await response.json();
        if (cancelled) return;
        if (!response.ok) {
          setContributionsError(payload.error ?? "Impossible de charger les contributions publiques.");
          return;
        }
        setPendingContributions(payload.contributions ?? []);
      })
      .catch(() => {
        if (!cancelled) setContributionsError("Connexion impossible. Vérifiez votre réseau puis réessayez.");
      })
      .finally(() => {
        if (!cancelled) setContributionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [canQualify]);

  if (!state) return null;

  const actor = state.actors.find((item) => item.id === sessionActorId) ?? state.actors[0];
  const organization = state.organizations.find((item) => item.id === actor.organizationId);
  const subscription = state.subscriptions.find((item) => item.organizationId === organization?.id);
  const plan = state.plans.find((item) => item.id === subscription?.planId);
  const members = state.actors.filter((item) => item.organizationId === organization?.id);
  const verifiedMembers = members.filter((item) => item.verified);
  const territoryIds = new Set(members.flatMap((item) => item.territoryIds));
  const ownedInfrastructure = state.infrastructures.filter((item) => item.organizationId === organization?.id);
  // Correctif LOT 7 (audit §34) — l'ancien filtre mélangeait "mes
  // services" (tout statut) et "services d'autres organisations non
  // a_activer" sous un même "Portefeuille de capacités", présentés comme
  // si tous appartenaient à mon organisation. Deux ensembles désormais
  // explicitement distincts.
  const ownServices = state.partnerServices.filter((service) => service.organizationId === organization?.id);
  // XXL-R5 (§30, "la capacité doit devenir la matière principale du
  // Réseau") — chaque service du réseau porte désormais son organisation
  // et ses territoires résolus (jamais recalculés ailleurs), pour un
  // affichage QUI/OÙ/QUE PEUT-IL APPORTER/CONFIANCE/FRAÎCHEUR en une
  // seule ligne (§23), avant tout clic sur une organisation.
  const networkCapacities = state.partnerServices
    .filter((service) => service.organizationId !== organization?.id && service.status !== "a_activer")
    .filter((service) => !networkTerritoryFilter || service.territoryIds.includes(networkTerritoryFilter))
    .map((service) => ({
      service,
      owner: state.organizations.find((item) => item.id === service.organizationId),
      territories: service.territoryIds.map((tid) => state.territories.find((item) => item.id === tid)).filter((item): item is NonNullable<typeof item> => Boolean(item))
    }))
    .filter(({ service, owner, territories }) => {
      if (!networkSearch.trim()) return true;
      const haystack = [service.name, service.category, owner?.name, ...territories.map((item) => item.name)].join(" ").toLowerCase();
      return haystack.includes(networkSearch.trim().toLowerCase());
    });
  const openCommitments = state.coordinationSpaces.flatMap((space) => space.commitments).filter((commitment) => members.some((member) => member.id === commitment.actorId) && commitment.status !== "terminee");

  const otherOrganizations = state.organizations.filter((item) => item.id !== organization?.id);
  const profileOrganization = profileOrganizationId ? buildOrganizationNetworkProfile(state, profileOrganizationId) : undefined;

  // Contributions encore qualifiables : leur Signal Core doit exister et
  // rester "nouveau" (pas déjà qualifié par une action précédente) — une
  // contribution "pending" côté Core (convergence pas encore confirmée)
  // n'est pas encore qualifiable.
  const qualifiableContributions = pendingContributions
    .map((contribution) => ({ contribution, signal: contribution.coreSignalId ? state.signals.find((item) => item.id === contribution.coreSignalId) : undefined }))
    .filter((entry): entry is { contribution: PublicContribution; signal: Signal } => Boolean(entry.signal) && entry.signal!.disposition === "nouveau");

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl bg-sidebar p-6 text-sidebar-foreground lg:p-7">
        <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary"><Network size={15} /> Réseau &amp; capacités</div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight lg:text-3xl">{organization?.name}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-sidebar-foreground/65">Mon organisation — membres, capacités et responsabilités — et l’écosystème mobilisable : qui d’autre existe, avec quelles capacités documentées et quel niveau de confiance.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1.5 border-white/15 text-sidebar-foreground/70"><Radio size={13} /> Tenant de démonstration</Badge>
          </div>
        </div>
        <div className="mt-7 grid border-t border-white/10 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [UsersRound, "Membres habilités", `${verifiedMembers.length}/${members.length}`, "Identités vérifiées"],
            [MapPin, "Territoires couverts", String(territoryIds.size), "Selon les mandats actifs"],
            [Factory, "Capacités propres", String(ownedInfrastructure.length + ownServices.length), "Actifs et services reliés à l’organisation"],
            [CheckCircle2, "Engagements ouverts", String(openCommitments.length), "Responsabilités en cours"]
          ].map(([Icon, label, value, detail], index) => {
            const ItemIcon = Icon as typeof UsersRound;
            return <div key={String(label)} className={`py-4 ${index > 0 ? "sm:border-l sm:border-white/10 sm:pl-4" : ""}`}><ItemIcon size={16} className="text-primary" /><p className="mt-3 text-2xl font-bold tracking-tight">{String(value)}</p><p className="mt-1 text-xs font-semibold">{String(label)}</p><p className="mt-1 text-[10px] text-sidebar-foreground/45">{String(detail)}</p></div>;
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* MON ORGANISATION (mandat §8 point 1) */}
      {/* ============================================================ */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Mon organisation</p>
        <h2 className="mt-1 text-lg font-semibold">Membres, capacités propres et gouvernance des accès</h2>
      </div>

      <section className="grid gap-8 xl:grid-cols-[1.15fr_.85fr]">
        <section>
          <div className="flex items-end justify-between gap-4 border-b pb-3">
            <div><div className="flex items-center gap-2 text-[#1d4468]"><UserCheck size={18} /><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Réseau habilité</p></div><h2 className="mt-2 text-xl font-semibold">Membres actifs et mandats</h2></div>
            <span className="text-xs font-semibold text-muted-foreground">{verifiedMembers.length} vérifiés</span>
          </div>
          <div className="divide-y">{members.map((member) => {
            const territories = member.territoryIds.map((id) => state.territories.find((territory) => territory.id === id)?.name).filter(Boolean);
            const commitments = state.coordinationSpaces.flatMap((space) => space.commitments).filter((commitment) => commitment.actorId === member.id && commitment.status !== "terminee");
            return (
              <article key={member.id} className="grid gap-4 py-4 transition hover:bg-muted/30 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                <span className="grid size-10 place-items-center rounded-full bg-muted font-bold text-[#1d4468]">{member.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
                <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{member.name}</h3>{member.verified && <span title="Identité vérifiée"><ShieldCheck size={14} className="text-[#1d8a5f]" /></span>}</div><p className="mt-1 text-xs font-semibold text-muted-foreground">{roleNames[member.role] ?? member.role}</p><p className="mt-1 truncate text-[10px] text-muted-foreground">{territories.join(", ") || "Périmètre non attribué"}</p></div>
                <div className="sm:text-right"><p className="text-sm font-bold text-[#1d4468]">{commitments.length}</p><p className="text-[10px] text-muted-foreground">engagement(s) ouvert(s)</p></div>
              </article>
            );
          })}</div>
        </section>

        <section>
          <div className="flex items-center gap-2 text-[#1d4468]"><Factory size={18} /><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Capacités de mon organisation</p></div>
          <h2 className="mt-2 text-lg font-semibold">Services propres, tout statut</h2>
          <div className="mt-4 divide-y border-y">{ownServices.map((service) => (
            <article key={service.id} className="py-4">
              <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{service.category}</p><h3 className="mt-1.5 text-sm font-semibold">{service.name}</h3></div><TrustBadge trust={service.trust} /></div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">Activation : {service.activationConditions}</p>
            </article>
          ))}</div>
          {ownServices.length === 0 && <p className="mt-3 text-sm text-muted-foreground">Aucune capacité propre documentée pour le moment.</p>}
        </section>
      </section>

      {/* Gouvernance des accès — déclassée visuellement (mandat §9/§36 :
          "permissions ≠ pricing", le réseau métier devient la proposition
          principale de la page). Le moteur technique n'est pas supprimé,
          seulement replacé sous les capacités propres, en bande compacte. */}
      <section className="rounded-2xl border bg-muted/20 p-5 lg:p-6">
        <div className="flex items-center gap-2 text-[#1d4468]"><KeyRound size={18} /><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Gouvernance des accès</p></div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{plan?.value}</p>
        <div className="mt-4 flex flex-wrap gap-2">{subscription?.entitlements.map((item) => <span key={item} className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-[11px] font-semibold"><Check size={11} className="text-[#1d8a5f]" />{item.replaceAll("_", " ")}</span>)}</div>
        <p className="mt-4 flex items-start gap-2 rounded-lg bg-background/70 p-3 text-xs leading-5 text-muted-foreground"><LockKeyhole size={13} className="mt-0.5 shrink-0 text-[#1d4468]" /> Les informations et actions restent limitées au mandat de l’organisation. Une fonctionnalité visible n’est pas automatiquement une donnée accessible.</p>
      </section>

      {/* ============================================================ */}
      {/* ÉCOSYSTÈME MOBILISABLE (mandat §8 point 2) */}
      {/* ============================================================ */}
      <div className="border-t pt-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[#b6522f]">Écosystème mobilisable</p>
        <h2 className="mt-1 text-lg font-semibold">Organisations, capacités et contributions du réseau</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Réseau documenté et qualifié — jamais un annuaire complet. La mobilisation reste toujours une décision humaine.</p>
      </div>

      {canQualify && (
        <section>
          <div className="flex items-center gap-2 text-[#b6522f]"><Inbox size={18} /><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Contributions publiques à qualifier</p></div>
          {contributionsLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">Chargement…</p>
          ) : contributionsError ? (
            <p className="mt-3 text-sm text-destructive">{contributionsError}</p>
          ) : qualifiableContributions.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Aucune contribution publique en attente de qualification pour le moment.</p>
          ) : (
            <div className="mt-4 divide-y border-y">{qualifiableContributions.map(({ contribution, signal }) => (
              <div key={contribution.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground">{contribution.reference} · {contribution.actorType}</p>
                  <p className="mt-1 truncate text-sm font-semibold">{signal.description}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setQualifySignal(signal)}>Qualifier comme capacité réseau <ArrowRight size={14} /></Button>
              </div>
            ))}</div>
          )}
        </section>
      )}

      {/* XXL-R5 (§30-31, "capability-first discovery") — la capacité
          devient la matière principale : recherche + résultats structurés
          en lignes (QUI/OÙ/QUE PEUT-IL APPORTER/CONFIANCE/FRAÎCHEUR, §23)
          AVANT l'annuaire d'organisations, pas l'inverse. Une seule
          recherche texte (nom/catégorie/organisation/territoire, §22),
          plus le filtre territoire déjà existant — pas de filtres
          fictifs. */}
      <section>
        <div className="flex items-center gap-2 text-[#1d4468]"><Factory size={18} /><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Capacités du réseau</p></div>
        <h2 className="mt-2 text-lg font-semibold">Que peut apporter le réseau, où, sur quelle base ?</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={networkSearch}
              onChange={(event) => setNetworkSearch(event.target.value)}
              placeholder="Rechercher une capacité, une organisation, un territoire…"
              aria-label="Rechercher dans le réseau"
              className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm font-semibold outline-none focus:border-primary"
            />
          </label>
          <select value={networkTerritoryFilter} onChange={(event) => setNetworkTerritoryFilter(event.target.value)} aria-label="Filtrer par territoire" className="h-10 rounded-md border bg-background px-2.5 text-xs font-semibold outline-none">
            <option value="">Tous les territoires</option>
            {state.territories.map((territory) => <option key={territory.id} value={territory.id}>{territory.name}</option>)}
          </select>
        </div>

        <div className="mt-4 divide-y border-y">{networkCapacities.map(({ service, owner, territories }) => (
          <article key={service.id} className="py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{service.category}</p>
                <h3 className="mt-1.5 text-sm font-semibold">{service.name}</h3>
                {owner && <button type="button" onClick={() => setProfileOrganizationId(owner.id)} className="mt-1 text-xs font-bold text-[#1d4468] hover:text-[#1d4468]/70">{owner.name} · voir le profil</button>}
              </div>
              <TrustBadge trust={service.trust} />
            </div>
            {territories.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <MapPin size={12} className="text-muted-foreground" />
                {territories.map((territory) => (
                  <Link key={territory.id} href={`/app/atlas?territoire=${territory.id}`} className="text-xs font-semibold text-[#1d4468] hover:underline">{territory.name}</Link>
                ))}
              </div>
            )}
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Activation : {service.activationConditions}</p>
            {/* Fraîcheur (§26-27) — jamais une disponibilité temps réel : un
                PartnerService référencé reste une capacité connue, pas une
                réservation. updatedAt optionnel dans le modèle (absent pour
                les services édités directement dans le Demo World) — dit
                honnêtement plutôt que fabriqué. */}
            <p className="mt-1.5 text-[11px] text-muted-foreground">{service.updatedAt ? `Mise à jour · ${new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(service.updatedAt))}` : "Date de mise à jour non renseignée — à revérifier avant mobilisation."}</p>
          </article>
        ))}</div>
        {networkCapacities.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            {networkSearch.trim()
              ? "Nous ne disposons pas encore d’information suffisante pour cette recherche."
              : networkTerritoryFilter
                ? "Aucune capacité documentée actuellement pour ce territoire — l’absence de capacité enregistrée ne signifie pas qu’aucune n’existe réellement."
                : "Aucune capacité de réseau documentée pour le moment."}
          </p>
        )}
        <Button variant="link" className="mt-4 px-0" asChild><Link href="/app/coordination">Ouvrir la salle de coordination <ArrowRight size={14} /></Link></Button>
      </section>

      {/* Annuaire — reste disponible mais secondaire (§39, "réduire la
          cardification, résultats en lignes structurées") : la même
          recherche s'y applique pour rester cohérente avec la liste de
          capacités ci-dessus. */}
      <section className="border-t pt-8">
        <div className="flex items-center gap-2 text-[#1d4468]"><Building2 size={18} /><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Organisations du réseau</p></div>
        <div className="mt-4 divide-y border-y">{otherOrganizations.map((org) => {
          const orgServices = state.partnerServices.filter((service) => service.organizationId === org.id && (!networkTerritoryFilter || service.territoryIds.includes(networkTerritoryFilter)));
          if (networkTerritoryFilter && orgServices.length === 0) return null;
          if (networkSearch.trim() && !org.name.toLowerCase().includes(networkSearch.trim().toLowerCase())) return null;
          return (
            <button key={org.id} type="button" onClick={() => setProfileOrganizationId(org.id)} className="flex w-full items-center justify-between gap-3 py-4 text-left transition hover:bg-muted/30">
              <div className="min-w-0"><p className="truncate text-sm font-semibold">{org.name}</p><p className="mt-1 text-xs text-muted-foreground">{orgServices.length} capacité(s) documentée(s)</p></div>
              <ArrowRight size={14} className="shrink-0 text-muted-foreground" />
            </button>
          );
        })}</div>
      </section>

      <section className="border-t pt-8">
        <div className="flex items-center gap-2 text-[#1d4468]"><FileBarChart size={18} /><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Redevabilité</p></div>
        <h2 className="mt-2 text-lg font-semibold">Rapports prêts à partager</h2>
        <div className="mt-4 divide-y border-y">{state.reports.map((report) => (
          <article key={report.id} className="py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{reportStatusLabel[report.status]} · {report.period}</p><h3 className="mt-1.5 text-sm font-semibold">{report.title}</h3><p className="mt-1 text-xs text-muted-foreground">{report.metrics.length} indicateurs avec sources et limites</p></div>
              <Button size="sm" variant="outline" className="whitespace-nowrap" asChild><Link href="/app/pilotage">Consulter <ArrowRight size={14} /></Link></Button>
            </div>
          </article>
        ))}</div>
      </section>

      <AccessSummary state={state} organizationId={organization?.id ?? ""} />

      <Sheet open={profileOrganization !== undefined} onOpenChange={(open) => !open && setProfileOrganizationId(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{profileOrganization?.organization.name}</SheetTitle>
            <SheetDescription>Qui, où, que peut-elle faire, que savons-nous, où est-elle déjà mobilisée.</SheetDescription>
          </SheetHeader>
          {profileOrganization && <OrganizationProfileSheet profile={profileOrganization} />}
        </SheetContent>
      </Sheet>

      <Sheet open={qualifySignal !== null} onOpenChange={(open) => !open && setQualifySignal(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Qualifier une contribution</SheetTitle>
            <SheetDescription>Rattacher à une organisation connue, ou créer une organisation candidate — jamais automatique.</SheetDescription>
          </SheetHeader>
          {qualifySignal && <QualifySignalForm signal={qualifySignal} state={state} onDone={() => setQualifySignal(null)} onCancel={() => setQualifySignal(null)} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
