"use client";

// /app/initiatives — LOT 2 (mandat "Vertical Slice Kayar : du besoin
// dispersé à l'opportunité de programme de développement"). Route inchangée
// (mandat §5 : "le nom de route peut rester /app/initiatives pendant ce
// lot"), mais la page ne commence plus par le portefeuille budgets — elle
// remonte en amont du programme : ce qui émerge du terrain (Besoins
// collectifs), ce qui mérite d'être examiné comme opportunité de
// développement (ProgramOpportunities), puis les programmes en
// conception/en action (Initiatives, portefeuille existant repositionné
// plus bas, non reconstruit). CollectiveNeedsPanel (ancien seuil "≥ 2
// demandes similaires → Programme") est retiré : la page consomme
// désormais state.collectiveNeeds/state.programOpportunities directement
// — le Core reste seul responsable de l'intelligence métier (mandat §14).
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Banknote, ChevronDown, ChevronUp, CircleDollarSign, Compass, Flag, Layers, Target, UsersRound } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { ExportActions } from "@/components/reporting/ExportActions";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CollectiveNeedDossier } from "@/components/coordination/CollectiveNeedDossier";
import { ProgramOpportunityDossier } from "@/components/coordination/ProgramOpportunityDossier";
import { ResultForm } from "@/components/impact/ResultForm";
import { OutcomeForm } from "@/components/impact/OutcomeForm";
import { ImpactForm } from "@/components/impact/ImpactForm";
import { LearningForm } from "@/components/impact/LearningForm";
import type { CollectiveNeed, Funding, Initiative, Outcome, ProductState, ProgramOpportunity } from "@/domain/types";
import { attributionLevelLabels, collectiveNeedStatusLabels, impactStatusLabels, programOpportunityMaturityLabels, programOpportunityStatusLabels } from "@/domain/types";

const money = new Intl.NumberFormat("fr-FR", { notation: "compact", style: "currency", currency: "XOF", maximumFractionDigits: 0 });

// XXL-RC1 (§4) — mêmes 3 éléments par défaut que les teneurs "3 + Voir
// tout" déjà en place ailleurs dans le produit (État, Aujourd'hui) : pas
// un chiffre choisi au hasard pour cette page précise.
const PROGRAMS_VISIBLE_COUNT = 3;

const initiativeStatusLabel: Record<Initiative["status"], string> = {
  cadrage: "Cadrage",
  financee: "Financée",
  execution: "Exécution",
  terminee: "Terminée"
};
const initiativeStatusVariant: Record<Initiative["status"], "marine" | "amber" | "success"> = {
  cadrage: "marine",
  financee: "amber",
  execution: "amber",
  terminee: "success"
};
const fundingStatusLabel: Record<Funding["status"], string> = {
  a_mobiliser: "À mobiliser",
  en_instruction: "En instruction",
  confirme: "Confirmé"
};
const fundingStatusVariant: Record<Funding["status"], "marine" | "amber" | "success"> = {
  a_mobiliser: "marine",
  en_instruction: "amber",
  confirme: "success"
};
const budgetStatusCaption: Record<Initiative["budgetStatus"], string> = {
  a_estimer: "budget non encore chiffré",
  estime: "budget estimé, à confirmer",
  valide: "budget simulé à titre indicatif"
};

// XXL-R5 (§13) — "chaque territoire doit être ouvrable vers Atlas" :
// remplace les jointures de texte brut (territories.join(" · ")) par des
// liens réels vers /app/atlas?territoire=<id> (même deep-link que R4),
// réutilisé partout où cette page affiche des territoires.
function TerritoryTags({ territoryIds, state }: { territoryIds: string[]; state: ProductState }) {
  const territories = territoryIds.map((id) => state.territories.find((item) => item.id === id)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  if (territories.length === 0) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5">
      {territories.map((territory, index) => (
        <span key={territory.id}>
          <Link href={`/app/atlas?territoire=${territory.id}`} className="font-semibold text-[#1d4468] hover:underline">{territory.name}</Link>
          {index < territories.length - 1 ? " ·" : ""}
        </span>
      ))}
    </span>
  );
}

const needStatusVariant: Record<CollectiveNeed["status"], "marine" | "amber" | "success" | "outline"> = {
  emerging: "outline",
  qualifying: "marine",
  qualified: "amber",
  not_confirmed: "outline",
  converted: "success",
  monitored: "outline"
};

const opportunityStatusVariant: Record<ProgramOpportunity["status"], "marine" | "amber" | "success" | "outline"> = {
  detected: "marine",
  qualifying: "marine",
  qualified: "amber",
  designing: "amber",
  converted_to_program: "success",
  rejected: "outline",
  paused: "outline"
};

// Lot 5 (mandat "Atlas & Territoire", §16 — "chaque lien doit mener vers
// la vraie source") : le dossier territorial peut désormais ouvrir
// directement un Besoin collectif ou une Opportunité de programme via
// ?need=/?opportunity= plutôt que de se contenter d'atterrir sur la page
// sans le dossier déjà ouvert. useSearchParams exige un Suspense (Next.js)
// — même repli que /connexion (déjà en place dans ce dépôt).
export default function InitiativesPage() {
  return (
    <Suspense fallback={null}>
      <InitiativesPageContent />
    </Suspense>
  );
}

function InitiativesPageContent() {
  const { state } = useProduct();
  const searchParams = useSearchParams();
  const [territoryFilter, setTerritoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<Initiative["status"] | "all">("all");
  // XXL-RC1 (§4) — progressive disclosure : le contre-audit visuel (Pass 2,
  // §4/§9) constate que la section 3 devient longue et répétitive dès que
  // le portefeuille compte plusieurs programmes (chaque InitiativeCard est
  // un bloc complet — hero + métriques + progression — pas une ligne).
  // Aucune donnée cachée en permanence : PROGRAMS_VISIBLE_COUNT ne
  // détermine que le rendu initial, "Voir tout"/"Réduire" révèle/replie la
  // même liste déjà filtrée (filteredInitiatives), jamais un second appel
  // ni une priorité fabriquée. Même seuil que les teneurs "3 + Voir tout"
  // déjà en place ailleurs dans le produit (État, Aujourd'hui).
  const [programsExpanded, setProgramsExpanded] = useState(false);
  // Identifiants, pas les objets eux-mêmes : après une action dans le
  // dossier ouvert (qualifier une opportunité, par ex.), state se
  // rafraîchit via useProduct — dériver l'objet affiché à chaque rendu
  // évite que le tiroir reste figé sur une version périmée de l'objet.
  // Initialisés depuis ?need=/?opportunity= (Lot 5, deep-link depuis le
  // dossier territorial) quand le paramètre est présent.
  const [needDrawerId, setNeedDrawerId] = useState<string | null>(() => searchParams.get("need"));
  const [opportunityDrawerId, setOpportunityDrawerId] = useState<string | null>(() => searchParams.get("opportunity"));
  if (!state) return null;
  const needDrawer = needDrawerId ? state.collectiveNeeds.find((item) => item.id === needDrawerId) ?? null : null;
  const opportunityDrawer = opportunityDrawerId ? state.programOpportunities.find((item) => item.id === opportunityDrawerId) ?? null : null;

  // 1 — Ce qui émerge du terrain : tous les besoins collectifs qui n'ont
  // pas encore donné lieu à une opportunité (mandat §16 — un besoin
  // "converti" a graduué vers la section 2, il ne se lit plus deux fois).
  const emergingNeeds = state.collectiveNeeds.filter((item) => item.status !== "converted");

  // 2 — Opportunités de développement à examiner : le Demo World n'en
  // contient aucune au chargement (mandat §10) — n'apparaît qu'après une
  // action humaine explicite depuis un dossier Besoin collectif.
  const opportunities = state.programOpportunities;

  const portfolioRows = state.initiatives.flatMap((initiative) => initiative.funding.map((fund) => ({
    Initiative: initiative.title,
    Territoires: initiative.territoryIds.map((id) => state.territories.find((item) => item.id === id)?.name ?? id).join(", "),
    "Budget FCFA": initiative.budgetFcfa ?? "À estimer",
    "Financement FCFA": fund.amountFcfa,
    Statut: fund.status.replaceAll("_", " "),
    Partenaire: state.actors.find((item) => item.id === fund.partnerId)?.name ?? fund.partnerId,
    Condition: fund.condition
  })));
  const chiffredInitiatives = state.initiatives.filter((item) => item.budgetFcfa !== undefined);
  const totalBudget = chiffredInitiatives.reduce((sum, item) => sum + (item.budgetFcfa ?? 0), 0);
  const toEstimateCount = state.initiatives.length - chiffredInitiatives.length;
  const filteredInitiatives = state.initiatives.filter((item) =>
    (!territoryFilter || item.territoryIds.includes(territoryFilter)) &&
    (statusFilter === "all" || item.status === statusFilter)
  );
  const focusTerritoryName = territoryFilter ? state.territories.find((item) => item.id === territoryFilter)?.name ?? territoryFilter : undefined;

  return (
    <div className="shadcn-scope space-y-10 bg-background p-5 pb-16 lg:p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Programmes &amp; développement</p>
        {/* XXL-RC1 (§5.C) — mb-page-title (mb-foundations.css, display
            serif partagé Landing/Public/État/Aujourd'hui) remplace le
            sans-serif ad hoc : seul le vrai titre de page, jamais les
            sous-titres de section ni les titres de carte plus bas — même
            discipline "modérée" que le reste de ce lot. */}
        <h1 className="mb-page-title mt-2">Des besoins collectifs aux interventions structurées</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Mbàmbulaan transforme les besoins collectifs documentés en interventions structurées, sans confondre problème identifié et solution décidée.</p>
      </div>

      {/* 1 — CE QUI ÉMERGE DU TERRAIN */}
      <section>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1d4468]">
          <Layers size={14} /> 1 — Ce qui émerge du terrain
        </div>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">Des remontées dispersées — signaux, demandes — que Mbàmbulaan a rapprochées en un besoin potentiellement partagé, avant toute conception d’intervention.</p>
        {emergingNeeds.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Aucun besoin collectif émergent identifié pour le moment.</p>
        ) : (
          <div className="mt-4 divide-y border-y">
            {emergingNeeds.map((need) => {
              return (
                <div key={need.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={needStatusVariant[need.status]}>{collectiveNeedStatusLabels[need.status]}</Badge>
                      <p className="truncate text-sm font-semibold">{need.title}</p>
                    </div>
                    <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"><UsersRound size={13} /> <TerritoryTags territoryIds={need.territoryIds} state={state} /></p>
                  </div>
                  <button onClick={() => setNeedDrawerId(need.id)} className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-[#1d4468] hover:text-[#1d4468]/70">Ouvrir le dossier <ArrowRight size={14} /></button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 2 — À EXAMINER COMME OPPORTUNITÉS DE DÉVELOPPEMENT */}
      <section>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#b6522f]">
          <Compass size={14} /> 2 — À examiner comme opportunités de développement
        </div>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">Un besoin collectif qualifié, examiné explicitement — pas encore un programme, ni une solution déjà choisie.</p>
        {opportunities.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Aucune opportunité de développement examinée pour le moment.</p>
        ) : (
          <div className="mt-4 divide-y border-y">
            {opportunities.map((opportunity) => {
              return (
                <div key={opportunity.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={opportunityStatusVariant[opportunity.status]}>{programOpportunityStatusLabels[opportunity.status]}</Badge>
                      <Badge variant="outline">Maturité {programOpportunityMaturityLabels[opportunity.maturity].toLowerCase()}</Badge>
                      <p className="truncate text-sm font-semibold">{opportunity.problem}</p>
                    </div>
                    <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"><UsersRound size={13} /> <TerritoryTags territoryIds={opportunity.territoryIds} state={state} /></p>
                  </div>
                  <button onClick={() => setOpportunityDrawerId(opportunity.id)} className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-[#b6522f] hover:text-[#b6522f]/70">Ouvrir le dossier <ArrowRight size={14} /></button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3 — EN CONCEPTION / EN ACTION — portefeuille existant, repositionné
          plus bas (mandat §5/§21 : "ne pas reconstruire, repositionner sa
          hiérarchie"), non modifié dans son contenu propre. */}
      <section className="space-y-6 border-t pt-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <Target size={14} /> 3 — En conception / en action
        </div>

        <section className="flex flex-col gap-4 border-y py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Portefeuille présenté en mode démonstration</p>
            <h2 className="mt-2 text-xl font-bold"><NumberTicker value={state.initiatives.length} /> programmes · {money.format(totalBudget)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Besoins, conditions et statuts restent distincts des engagements fermes.{toEstimateCount > 0 ? ` Total chiffré hors ${toEstimateCount} programme(s) au budget encore à estimer.` : ""}</p>
          </div>
          <ExportActions filename="mbambulaan-programmes-financements" rows={portfolioRows} compact />
        </section>

        <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-4 print:hidden">
          <div className="flex flex-wrap items-center gap-6">
            <label className="block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Territoire</p>
              <select
                value={territoryFilter}
                onChange={(event) => setTerritoryFilter(event.target.value)}
                className="mt-1 rounded-md border bg-background py-1 pl-0 pr-6 text-sm font-semibold outline-none focus:border-primary"
              >
                <option value="">Sénégal entier</option>
                {[...state.territories].sort((a, b) => a.name.localeCompare(b.name)).map((territory) => (
                  <option key={territory.id} value={territory.id}>{territory.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Statut</p>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as Initiative["status"] | "all")}
                className="mt-1 rounded-md border bg-background py-1 pl-0 pr-6 text-sm font-semibold outline-none focus:border-primary"
              >
                <option value="all">Tous les statuts</option>
                {(["cadrage", "financee", "execution", "terminee"] as const).map((status) => (
                  <option key={status} value={status}>{initiativeStatusLabel[status]}</option>
                ))}
              </select>
            </label>
          </div>
          <p className="text-sm text-muted-foreground">{filteredInitiatives.length} programme(s){focusTerritoryName ? ` · ${focusTerritoryName}` : ""}{statusFilter !== "all" ? ` · ${initiativeStatusLabel[statusFilter]}` : ""} sur {state.initiatives.length} au total.</p>
        </div>

        <div className="space-y-10 print:hidden">
          {filteredInitiatives.length === 0 && <p className="text-sm text-muted-foreground">Aucun programme ne correspond à ce filtre pour le moment.</p>}
          {(programsExpanded ? filteredInitiatives : filteredInitiatives.slice(0, PROGRAMS_VISIBLE_COUNT)).map((initiative) => (
            <InitiativeCard key={initiative.id} initiative={initiative} state={state} />
          ))}
          {/* XXL-RC1 (§4) — "Voir tout"/"Réduire" : bascule d'affichage sur
              la même liste déjà filtrée (filteredInitiatives), jamais un
              second calcul ni une page distincte — les programmes au-delà
              du seuil restent les mêmes objets réels, seulement pas
              encore affichés par défaut. */}
          {filteredInitiatives.length > PROGRAMS_VISIBLE_COUNT && (
            <button
              type="button"
              onClick={() => setProgramsExpanded((value) => !value)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border py-3 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
            >
              {programsExpanded ? (
                <>Réduire <ChevronUp size={14} /></>
              ) : (
                <>Voir les {filteredInitiatives.length - PROGRAMS_VISIBLE_COUNT} autres programmes <ChevronDown size={14} /></>
              )}
            </button>
          )}
        </div>

        <div className="hidden space-y-10 print:block">
          {state.initiatives.map((initiative) => <InitiativeCard key={initiative.id} initiative={initiative} state={state} />)}
        </div>
      </section>

      {/* 4 — CE QUE NOUS APPRENONS — placeholder volontairement léger
          (mandat §21 : "pas de gros nouveau chantier"). Aucun Learning réel
          n'est aujourd'hui rattaché à une Initiative ou une
          ProgramOpportunity (Learning.situationId existant reste un
          apprentissage opérationnel, pas programmatique) — pas de donnée
          fabriquée pour remplir cette section. */}
      <section className="flex gap-3 border-t border-l-2 border-[#1d4468]/30 pt-8 pl-4">
        <Target className="mt-0.5 shrink-0 text-[#1d4468]" size={20} />
        <div>
          <h2 className="font-semibold">4 — Ce que nous apprenons</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Cette étape s’enrichira quand des programmes auront produit des résultats mesurés — chaque financement reste relié aux situations qui l’ont justifié et aux indicateurs qui permettront de mesurer le changement.</p>
        </div>
      </section>

      <Sheet open={needDrawer !== null} onOpenChange={(open) => !open && setNeedDrawerId(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Besoin collectif</SheetTitle>
            <SheetDescription>Ce que Mbàmbulaan a rapproché, ce qui reste à comprendre, et ce que cela permet d’examiner.</SheetDescription>
          </SheetHeader>
          {needDrawer && <CollectiveNeedDossier need={needDrawer} state={state} onDone={() => setNeedDrawerId(null)} />}
        </SheetContent>
      </Sheet>

      <Sheet open={opportunityDrawer !== null} onOpenChange={(open) => !open && setOpportunityDrawerId(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Opportunité de développement</SheetTitle>
            <SheetDescription>Un problème documenté et plusieurs pistes à étudier — pas encore un programme financé.</SheetDescription>
          </SheetHeader>
          {opportunityDrawer && <ProgramOpportunityDossier opportunity={opportunityDrawer} state={state} onDone={() => setOpportunityDrawerId(null)} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Extrait tel quel de la version précédente (mandat §21 : ne pas
// reconstruire le portefeuille) — inchangé.
function InitiativeCard({ initiative, state }: { initiative: Initiative; state: ProductState }) {
  const secured = initiative.funding.filter((item) => item.status === "confirme").reduce((sum, item) => sum + item.amountFcfa, 0);
  const instructed = initiative.funding.filter((item) => item.status === "en_instruction").reduce((sum, item) => sum + item.amountFcfa, 0);
  const owner = state.actors.find((item) => item.id === initiative.ownerId);
  const linkedSituations = initiative.situationIds
    .map((id) => state.situations.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  // LOT 4 (mandat "de l'action à la valeur démontrable", §16) — "mesurer
  // sans faire un ERP bailleur" : Results/Outcomes propres à ce programme,
  // lus à la demande (filtrage par sourceRef/sourceResultIds), aucune
  // duplication locale dans Initiative lui-même.
  const initiativeResults = state.results.filter((item) => item.sourceRef.objectType === "initiative" && item.sourceRef.objectId === initiative.id);
  const initiativeResultIds = initiativeResults.map((item) => item.id);
  const initiativeOutcomes = state.outcomes.filter((item) => item.sourceResultIds.some((id) => initiativeResultIds.includes(id)));
  const initiativeOutcomeIds = initiativeOutcomes.map((item) => item.id);
  const initiativeImpacts = state.impactEvidences.filter((item) => initiativeOutcomeIds.includes(item.outcomeId));
  const initiativeLearnings = state.learnings.filter((item) => item.initiativeId === initiative.id);
  const outcomesWithoutImpact = initiativeOutcomes.filter((outcome) => !initiativeImpacts.some((impact) => impact.outcomeId === outcome.id));

  const [resultFormOpen, setResultFormOpen] = useState(false);
  const [outcomeFormOpen, setOutcomeFormOpen] = useState(false);
  const [learningFormOpen, setLearningFormOpen] = useState(false);
  const [impactFormOutcome, setImpactFormOutcome] = useState<Outcome | null>(null);

  const ownerOrganization = owner ? state.organizations.find((item) => item.id === owner.organizationId) : undefined;

  return (
    // XXL-R5 (§14) — ancre stable pour un deep-link direct depuis le
    // profil Réseau d'une organisation reliée (OrganizationProfileSheet).
    <section id={`initiative-${initiative.id}`} className="scroll-mt-6 overflow-hidden rounded-2xl border">
      <div className="bg-sidebar p-6 text-sidebar-foreground">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-sidebar-foreground/60">Programme · {initiative.territoryIds.length} territoire(s)</p>
            <h2 className="mt-2 max-w-3xl text-xl font-semibold tracking-tight">{initiative.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-sidebar-foreground/70">{initiative.objective}</p>
            {/* XXL-R5 (§13) — territoires du programme, ouvrables vers l'Atlas. */}
            <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-sidebar-foreground/70">
              {initiative.territoryIds.map((tid, index) => {
                const territory = state.territories.find((item) => item.id === tid);
                if (!territory) return null;
                return (
                  <span key={tid}>
                    <Link href={`/app/atlas?territoire=${territory.id}`} className="font-semibold text-sidebar-foreground underline decoration-sidebar-foreground/30 underline-offset-2 hover:decoration-sidebar-foreground">{territory.name}</Link>
                    {index < initiative.territoryIds.length - 1 ? " ·" : ""}
                  </span>
                );
              })}
            </p>
          </div>
          <Badge variant={initiativeStatusVariant[initiative.status]} className="w-fit">{initiativeStatusLabel[initiative.status]}</Badge>
        </div>
      </div>

      <div className="grid border-b sm:grid-cols-2 xl:grid-cols-4">
        <div className="p-5"><Banknote size={19} className="text-[#1d4468]" /><p className="mt-3 text-2xl font-bold">{initiative.budgetFcfa !== undefined ? money.format(initiative.budgetFcfa) : "À estimer"}</p><p className="text-xs text-muted-foreground">{budgetStatusCaption[initiative.budgetStatus]}</p></div>
        <div className="p-5 sm:border-l"><CircleDollarSign size={19} className="text-[#1d4468]" /><p className="mt-3 text-2xl font-bold">{money.format(secured + instructed)}</p><p className="text-xs text-muted-foreground">confirmé ou en instruction</p></div>
        <div className="p-5 xl:border-l"><Flag size={19} className="text-[#1d4468]" /><p className="mt-3 text-2xl font-bold">{initiative.territoryIds.length}</p><p className="text-xs text-muted-foreground">territoires reliés</p></div>
        {/* XXL-R5 (§14) — responsable relié à son organisation, ouvrable
            vers son profil Réseau quand elle est connue (jamais inféré). */}
        <div className="p-5 sm:border-l"><UsersRound size={19} className="text-[#1d4468]" />
          {ownerOrganization ? (
            <Link href={`/app/organisation?organisation=${ownerOrganization.id}`} className="mt-3 block font-bold text-[#1d4468] hover:underline">{owner?.name}</Link>
          ) : (
            <p className="mt-3 font-bold">{owner?.name}</p>
          )}
          <p className="text-xs text-muted-foreground">responsable de l’initiative{ownerOrganization ? ` · ${ownerOrganization.name}` : ""}</p>
        </div>
      </div>

      <div className="grid gap-8 p-5 lg:grid-cols-2 lg:p-6">
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Progression vers les résultats</p>
          <div className="mt-4 space-y-5">
            {initiative.indicators.map((indicator) => {
              const progress = Math.min(100, Math.round((indicator.current / indicator.target) * 100));
              return (
                <div key={indicator.label}>
                  <div className="flex justify-between gap-4 text-sm"><span className="font-semibold">{indicator.label}</span><strong>{indicator.current}{indicator.unit} / {indicator.target}{indicator.unit}</strong></div>
                  <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-[#1d4468]" style={{ width: `${progress}%` }} /></div>
                  <p className="mt-1 text-xs text-muted-foreground">Référence initiale : {indicator.baseline}{indicator.unit}</p>
                </div>
              );
            })}
            {initiative.indicators.length === 0 && <p className="text-sm text-muted-foreground">Aucun indicateur défini pour le moment — programme en cadrage.</p>}
          </div>
        </section>

        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Instruction financière</p>
          <div className="mt-4 divide-y border-y">
            {initiative.funding.map((fund) => {
              const partner = state.actors.find((item) => item.id === fund.partnerId);
              const partnerOrganization = partner ? state.organizations.find((item) => item.id === partner.organizationId) : undefined;
              return (
                <div key={fund.id} className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    {partnerOrganization ? (
                      <Link href={`/app/organisation?organisation=${partnerOrganization.id}`} className="text-sm font-bold text-[#1d4468] hover:underline">{partner?.name}</Link>
                    ) : (
                      <strong className="text-sm">{partner?.name}</strong>
                    )}
                    <Badge variant={fundingStatusVariant[fund.status]}>{fundingStatusLabel[fund.status]}</Badge>
                  </div>
                  <p className="mt-2 text-lg font-bold">{money.format(fund.amountFcfa)}</p>
                  <p className="mt-2 text-sm leading-5 text-muted-foreground">{fund.condition}</p>
                </div>
              );
            })}
            {initiative.funding.length === 0 && <p className="py-4 text-sm text-muted-foreground">Aucun financement engagé pour le moment.</p>}
          </div>
        </section>
      </div>

      <section className="border-t p-5 lg:p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Situations liées</p>
        <div className="mt-4 space-y-2">
          {linkedSituations.map((situation) => {
            const territory = state.territories.find((item) => item.id === situation.territoryId);
            return (
              <Link key={situation.id} href={`/app/situations/${situation.id}`} className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3 text-sm transition hover:bg-muted">
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{situation.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{territory?.name ?? situation.territoryId}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#1d4468]">Ouvrir la situation <ArrowRight size={13} /></span>
              </Link>
            );
          })}
          {linkedSituations.length === 0 && <p className="text-sm text-muted-foreground">Aucune situation liée documentée pour ce programme.</p>}
        </div>
      </section>

      {/* LOT 4 (mandat "de l'action à la valeur démontrable", §16) —
          "mesurer sans faire un ERP bailleur" : ce que le programme visait
          (indicateurs, déjà affichés plus haut) reste distinct de ce qui a
          été réalisé (Result), ce qui a changé (Outcome), ce qui reste à
          mesurer (Impact) et ce que le programme en retient (Learning). */}
      <section className="border-t p-5 lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ce qui a été réalisé</p>
          <button onClick={() => setResultFormOpen(true)} className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-[#1d4468] hover:text-[#1d4468]/70">Enregistrer un résultat <ArrowRight size={13} /></button>
        </div>
        {initiativeResults.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Aucun résultat enregistré pour ce programme à ce stade.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {initiativeResults.map((result) => (
              <div key={result.id} className="rounded-lg border p-3">
                <p className="text-sm font-semibold">{result.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{result.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border-t p-5 lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ce qui a changé</p>
          <button
            onClick={() => setOutcomeFormOpen(true)}
            disabled={initiativeResults.length === 0}
            className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-[#1d4468] hover:text-[#1d4468]/70 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Documenter un changement <ArrowRight size={13} />
          </button>
        </div>
        {initiativeOutcomes.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Effet opérationnel à confirmer — aucun changement documenté pour le moment.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {initiativeOutcomes.map((outcome) => (
              <div key={outcome.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{outcome.title}</p>
                  <Badge variant="outline">{attributionLevelLabels[outcome.attribution]}</Badge>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{outcome.statement}</p>
                {outcome.attributionJustification && <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground"><span className="font-semibold text-foreground">Justification · </span>{outcome.attributionJustification}</p>}
                {outcome.limits && <p className="mt-1 text-[11px] leading-4 text-muted-foreground"><span className="font-semibold text-foreground">Limites · </span>{outcome.limits}</p>}
                <p className="mt-1.5 text-[11px] text-muted-foreground">{outcome.baseline ?? "Baseline insuffisante pour mesurer précisément l’évolution."}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border-t p-5 lg:p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ce qui reste à mesurer</p>
        {initiativeOutcomes.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Impact non encore mesuré — aucun changement documenté ne permet pour l’instant d’évaluer un effet plus large.</p>
        ) : outcomesWithoutImpact.length === 0 && initiativeImpacts.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Impact non encore mesuré pour les changements documentés.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {initiativeImpacts.map((impact) => (
              <div key={impact.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{impact.title}</p>
                  <Badge variant="outline">{impactStatusLabels[impact.status]}</Badge>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{impact.statement}</p>
                {/* Micro-correctif Product (post-LOT 4) : la justification
                    d'une attribution directe doit rester visible partout où
                    l'Impact est affiché. */}
                {impact.attributionJustification && <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground"><span className="font-semibold text-foreground">Justification · </span>{impact.attributionJustification}</p>}
              </div>
            ))}
            {outcomesWithoutImpact.map((outcome) => (
              <div key={outcome.id} className="flex items-center justify-between gap-3 rounded-lg border border-dashed p-3">
                <p className="text-xs text-muted-foreground">Impact non encore mesuré pour « {outcome.title} ».</p>
                <button onClick={() => setImpactFormOutcome(outcome)} className="shrink-0 text-xs font-bold text-[#1d4468] hover:text-[#1d4468]/70">Renseigner</button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border-t p-5 lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ce que nous apprenons</p>
          <button onClick={() => setLearningFormOpen(true)} className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-[#1d4468] hover:text-[#1d4468]/70">Enregistrer un apprentissage <ArrowRight size={13} /></button>
        </div>
        {initiativeLearnings.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Aucun apprentissage enregistré pour ce programme à ce stade.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {initiativeLearnings.map((learning) => (
              <div key={learning.id} className="rounded-lg border p-3">
                <p className="text-sm font-semibold">{learning.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{learning.summary}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <Sheet open={resultFormOpen} onOpenChange={setResultFormOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>Enregistrer un résultat</SheetTitle><SheetDescription>Ce qui a effectivement été produit ou réalisé pour ce programme.</SheetDescription></SheetHeader>
          <ResultForm initiativeId={initiative.id} onDone={() => setResultFormOpen(false)} onCancel={() => setResultFormOpen(false)} />
        </SheetContent>
      </Sheet>

      <Sheet open={outcomeFormOpen} onOpenChange={setOutcomeFormOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>Documenter le changement observé</SheetTitle><SheetDescription>Une activité réalisée n’est pas un changement en soi — décrivez ce qui a réellement évolué, avec son niveau d’attribution.</SheetDescription></SheetHeader>
          {initiativeResults.length > 0 && <OutcomeForm results={initiativeResults} onDone={() => setOutcomeFormOpen(false)} onCancel={() => setOutcomeFormOpen(false)} />}
        </SheetContent>
      </Sheet>

      <Sheet open={impactFormOutcome !== null} onOpenChange={(open) => !open && setImpactFormOutcome(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>Impact</SheetTitle><SheetDescription>« À mesurer » reste un état honnête — ne jamais extrapoler un changement local en effet national.</SheetDescription></SheetHeader>
          {impactFormOutcome && <ImpactForm outcome={impactFormOutcome} onDone={() => setImpactFormOutcome(null)} onCancel={() => setImpactFormOutcome(null)} />}
        </SheetContent>
      </Sheet>

      <Sheet open={learningFormOpen} onOpenChange={setLearningFormOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>Enregistrer un apprentissage</SheetTitle><SheetDescription>Que devons-nous faire différemment ou réutiliser ailleurs ?</SheetDescription></SheetHeader>
          <LearningForm initiativeId={initiative.id} onDone={() => setLearningFormOpen(false)} onCancel={() => setLearningFormOpen(false)} />
        </SheetContent>
      </Sheet>
    </section>
  );
}
