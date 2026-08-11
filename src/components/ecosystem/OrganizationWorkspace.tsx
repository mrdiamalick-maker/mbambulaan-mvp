"use client";

// Restylé en D9 (Lot 7, étape 2/4). mission-strip/data-chip/link-action/
// btn-secondary (classes utilitaires sarcelle) remplacées par Card et le
// dégradé marine déjà utilisé pour les héros D9 (CoordinatorHub,
// TerrainCaptainView). TrustBadge (ancien, @/components/ui/Badges)
// remplacé par le TrustBadge partagé (@/components/shared/StatusBadges).
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Factory,
  FileBarChart,
  KeyRound,
  LockKeyhole,
  MapPin,
  Network,
  Radio,
  ShieldCheck,
  UserCheck,
  UsersRound
} from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { TrustBadge } from "@/components/shared/StatusBadges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AccessSummary } from "@/components/subscription/AccessSummary";

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

export function OrganizationWorkspace() {
  const { state, actorId } = useProduct();
  if (!state) return null;
  const actor = state.actors.find((item) => item.id === actorId) ?? state.actors[0];
  const organization = state.organizations.find((item) => item.id === actor.organizationId);
  const subscription = state.subscriptions.find((item) => item.organizationId === organization?.id);
  const plan = state.plans.find((item) => item.id === subscription?.planId);
  const members = state.actors.filter((item) => item.organizationId === organization?.id);
  const verifiedMembers = members.filter((item) => item.verified);
  const territoryIds = new Set(members.flatMap((item) => item.territoryIds));
  const ownedInfrastructure = state.infrastructures.filter((item) => item.organizationId === organization?.id);
  const availableServices = state.partnerServices.filter((service) => service.organizationId === organization?.id || service.status !== "a_activer");
  const openCommitments = state.coordinationSpaces.flatMap((space) => space.commitments).filter((commitment) => members.some((member) => member.id === commitment.actorId) && commitment.status !== "terminee");

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none bg-sidebar text-sidebar-foreground shadow-lg">
        <CardContent className="p-6 lg:p-7">
          <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary"><Building2 size={15} /> Organisation active</div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight lg:text-3xl">{organization?.name}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-sidebar-foreground/65">Un périmètre de droits, de personnes, de capacités et de responsabilités. La plateforme montre qui peut agir, sur quel territoire et avec quelles preuves.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1.5 border-white/15 text-sidebar-foreground/70"><ShieldCheck size={13} /> Plan {plan?.name}</Badge>
              <Badge variant="outline" className="gap-1.5 border-white/15 text-sidebar-foreground/70"><Radio size={13} /> Tenant de démonstration</Badge>
            </div>
          </div>
          <div className="mt-7 grid gap-px overflow-hidden rounded-xl bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
            {[
              [UsersRound, "Membres habilités", `${verifiedMembers.length}/${members.length}`, "Identités vérifiées"],
              [MapPin, "Territoires couverts", String(territoryIds.size), "Selon les mandats actifs"],
              [Factory, "Capacités propres", String(ownedInfrastructure.length), "Actifs reliés à l’organisation"],
              [CheckCircle2, "Engagements ouverts", String(openCommitments.length), "Responsabilités en cours"]
            ].map(([Icon, label, value, detail]) => {
              const ItemIcon = Icon as typeof UsersRound;
              return <div key={String(label)} className="bg-sidebar p-4"><ItemIcon size={17} className="text-primary" /><p className="mt-3 text-2xl font-bold tracking-tight">{String(value)}</p><p className="mt-1 text-xs font-semibold">{String(label)}</p><p className="mt-1 text-[10px] text-sidebar-foreground/45">{String(detail)}</p></div>;
            })}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b p-5">
            <div><div className="flex items-center gap-2 text-[#1d4468]"><UserCheck size={18} /><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Réseau habilité</p></div><h2 className="mt-2 text-xl font-semibold">Membres actifs et mandats</h2></div>
            <Badge variant="success">{verifiedMembers.length} vérifiés</Badge>
          </div>
          <div className="divide-y">{members.map((member) => {
            const territories = member.territoryIds.map((id) => state.territories.find((territory) => territory.id === id)?.name).filter(Boolean);
            const commitments = state.coordinationSpaces.flatMap((space) => space.commitments).filter((commitment) => commitment.actorId === member.id && commitment.status !== "terminee");
            return (
              <article key={member.id} className="grid gap-4 p-4 transition hover:bg-muted/50 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-5">
                <span className="grid size-11 place-items-center rounded-xl bg-muted font-bold text-[#1d4468]">{member.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
                <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{member.name}</h3>{member.verified && <span title="Identité vérifiée"><ShieldCheck size={14} className="text-[#1d8a5f]" /></span>}</div><p className="mt-1 text-xs font-semibold text-muted-foreground">{roleNames[member.role] ?? member.role}</p><p className="mt-1 truncate text-[10px] text-muted-foreground">{territories.join(", ") || "Périmètre non attribué"}</p></div>
                <div className="sm:text-right"><p className="text-sm font-bold text-[#1d4468]">{commitments.length}</p><p className="text-[10px] text-muted-foreground">engagement(s) ouvert(s)</p></div>
              </article>
            );
          })}</div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b bg-muted/40 p-5"><div className="flex items-center gap-2 text-[#1d4468]"><KeyRound size={18} /><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Gouvernance des accès</p></div><h2 className="mt-2 text-xl font-semibold">Capacités autorisées</h2></div>
          <CardContent className="p-5">
            <p className="text-sm leading-6 text-muted-foreground">{plan?.value}</p>
            <div className="mt-5 space-y-2">{subscription?.entitlements.map((item) => <div key={item} className="flex items-center gap-2 rounded-md border bg-card p-3 text-xs font-semibold"><span className="grid size-6 place-items-center rounded-md bg-[#1d8a5f]/12 text-[#1d8a5f]"><Check size={12} /></span>{item.replaceAll("_", " ")}</div>)}</div>
            <p className="mt-5 flex items-start gap-2 rounded-md bg-muted p-4 text-xs leading-5 text-muted-foreground"><LockKeyhole size={14} className="mt-0.5 shrink-0" /> Les informations et actions restent limitées au mandat de l’organisation. Une fonctionnalité visible n’est pas automatiquement une donnée accessible.</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[.95fr_1.05fr]">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-[#1d4468]"><Factory size={18} /><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Portefeuille de capacités</p></div><h2 className="mt-2 text-lg font-semibold">Actifs et services mobilisables</h2></div><Network size={20} className="text-[#1d4468]" /></div>
            <div className="mt-5 space-y-3">{availableServices.map((service) => {
              const owner = state.organizations.find((item) => item.id === service.organizationId);
              return (
                <div key={service.id} className="rounded-md border bg-card p-4">
                  <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{service.category} · {owner?.name}</p><h3 className="mt-1.5 text-sm font-semibold">{service.name}</h3></div><TrustBadge trust={service.trust} /></div>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">Activation : {service.activationConditions}</p>
                </div>
              );
            })}</div>
            <Button variant="link" className="mt-5 px-0" asChild><Link href="/app/coordination">Ouvrir la salle de coordination <ArrowRight size={14} /></Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-[#1d4468]"><FileBarChart size={18} /><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Redevabilité</p></div>
            <h2 className="mt-2 text-lg font-semibold">Rapports prêts à partager</h2>
            <div className="mt-5 space-y-3">{state.reports.map((report) => (
              <div key={report.id} className="rounded-md border p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="text-[10px] font-bold uppercase tracking-widest text-[#1d8a5f]">{report.status} · {report.period}</p><h3 className="mt-1.5 text-sm font-semibold">{report.title}</h3><p className="mt-1 text-xs text-muted-foreground">{report.metrics.length} indicateurs avec sources et limites</p></div>
                  <Button size="sm" variant="outline" className="whitespace-nowrap" asChild><Link href="/app/pilotage">Consulter <ArrowRight size={14} /></Link></Button>
                </div>
              </div>
            ))}</div>
            <div className="mt-5 rounded-md border bg-muted p-4"><p className="text-xs font-semibold">La confiance est une capacité produit</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Membres, sources, actifs et rapports utilisent le même référentiel : l’organisation ne reconstruit plus manuellement son récit d’impact.</p></div>
          </CardContent>
        </Card>
      </section>

      <AccessSummary state={state} organizationId={organization?.id ?? ""} />
    </div>
  );
}
