"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  ClipboardCheck,
  Factory,
  Handshake,
  Inbox,
  MapPin,
  MessageSquare,
  Network,
  Route,
  Search,
  Snowflake,
} from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { CommandButton } from "@/components/ui/CommandButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TensionGlyph } from "@/components/etat/TensionGlyph";
import { TrustBadge } from "@/components/shared/StatusBadges";
import { channelMeta, glyphBorderColor, priorityLabels, priorityToTag } from "@/lib/status-tokens";
import type { PublicRequest, PublicRequestIntent } from "@/domain/public/request";
import { serviceRequestIntentLabels, type CatchLine, type IncomingMessage, type ProductState, type ServiceRequestIntent, type Signal } from "@/domain/types";

type View = "besoins" | "capacites" | "rapprochements" | "missions" | "demandes_publiques" | "messages_entrants";

const views: Array<{ id: View; label: string; icon: typeof Boxes }> = [
  { id: "besoins", label: "Besoins à couvrir", icon: Boxes },
  { id: "capacites", label: "Capacités mobilisables", icon: Factory },
  { id: "rapprochements", label: "Rapprochements", icon: Network },
  { id: "missions", label: "Missions en cours", icon: ClipboardCheck },
  { id: "demandes_publiques", label: "Demandes publiques", icon: Inbox },
  { id: "messages_entrants", label: "Messages entrants", icon: MessageSquare }
];

// Canal → libellé lisible, pour l'affichage de la file de messages
// entrants (simulés — aucune connexion WhatsApp/SMS/téléphonie réelle).
const messageChannelLabel: Record<IncomingMessage["channel"], string> = {
  terrain: "Terrain",
  telephone: "Téléphone",
  whatsapp_structure: "WhatsApp",
  poste_quai: "Poste de quai"
};

// Catégories Signal, y compris "conformite" (arbitrage CEO 13/08/2026) —
// pas de choix pré-rempli automatique : un message brut n'est jamais
// pré-catégorisé, c'est un choix explicite du coordinateur à la conversion.
const signalCategoryLabel: Record<Signal["category"], string> = {
  infrastructure: "Infrastructure",
  production: "Production",
  marche: "Marché",
  qualite: "Qualité",
  securite: "Sécurité",
  conformite: "Conformité"
};

// Étiquettes lisibles pour PublicRequestIntent — n'existaient nulle part
// sous forme réutilisable (SolutionWizard.tsx a ses propres libellés
// internes, non exportés). Pont PublicRequest → Produit, étape 2/3
// (2026-08-12) : ce sont les demandes que /solutions écrit et que
// personne ne relisait jusqu'ici (gap analysis Task 2).
const publicIntentLabel: Record<PublicRequestIntent, string> = {
  transport: "Transport",
  conservation: "Conservation / froid",
  transformation: "Transformation",
  equipement: "Équipement",
  maintenance: "Maintenance",
  formation: "Formation",
  debouches: "Débouchés",
  programme: "Programme",
  sourcing: "Sourcing / approvisionnement",
  "comprendre-territoire": "Comprendre un territoire",
  financement: "Financement",
  organisation: "Organisation",
  partenariat: "Partenariat",
  presse: "Presse",
  callback: "Rappel souhaité",
  autre: "Autre"
};

// Pré-remplissage de l'intention lors de la conversion (étape 3/3) — les
// deux enums ne se recouvrent pas complètement (PublicRequestIntent porte
// des intentions hors-filière : presse, partenariat, comprendre-territoire…
// qui n'ont pas d'équivalent ServiceRequestIntent). Un simple best-effort,
// jamais figé : le coordinateur qui convertit voit ce choix dans le
// formulaire et peut le corriger avant de créer la demande — ce n'est pas
// une décision automatique silencieuse.
const serviceRequestIntentFromPublic: Record<PublicRequestIntent, ServiceRequestIntent> = {
  transport: "transport",
  conservation: "conservation",
  transformation: "transformation",
  equipement: "equipement",
  maintenance: "maintenance",
  formation: "formation",
  debouches: "autre",
  programme: "autre",
  sourcing: "sourcing",
  "comprendre-territoire": "autre",
  financement: "financement",
  organisation: "autre",
  partenariat: "autre",
  presse: "autre",
  callback: "autre",
  autre: "autre"
};

// Âge d'une entrée d'inbox (C12) — relatif plutôt qu'une date absolue,
// cohérent avec le traitement "à qualifier maintenant" des deux vues
// d'inbox (Demandes publiques, Messages entrants).
function formatAge(iso: string) {
  const diffMinutes = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  return `Il y a ${Math.floor(diffHours / 24)} j`;
}

export function CoordinationWorkspace() {
  const { state } = useProduct();
  const [view, setView] = useState<View>("besoins");
  const [territoryId, setTerritoryId] = useState("all");
  const [query, setQuery] = useState("");
  const [pendingPublicRequests, setPendingPublicRequests] = useState<PublicRequest[]>([]);
  const [pendingPublicRequestsLoading, setPendingPublicRequestsLoading] = useState(true);
  const [pendingPublicRequestsError, setPendingPublicRequestsError] = useState("");

  // Pont PublicRequest → Produit, étape 2/3 — lit ce que /solutions écrit
  // depuis toujours sans que personne ne le relise (gap analysis Task 2,
  // 2026-08-12). Chargé une fois au montage : cette liste change par
  // action humaine (conversion, étape 3), pas par un flux temps réel à
  // suivre en continu.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/coordination/public-requests")
      .then(async (response) => {
        const payload = await response.json();
        if (cancelled) return;
        if (!response.ok) {
          setPendingPublicRequestsError(payload.error ?? "Impossible de charger les demandes publiques.");
          return;
        }
        setPendingPublicRequests(payload.requests ?? []);
      })
      .catch(() => {
        if (!cancelled) setPendingPublicRequestsError("Connexion impossible. Vérifiez votre réseau puis réessayez.");
      })
      .finally(() => {
        if (!cancelled) setPendingPublicRequestsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!state) return null;

  // Contrairement à pendingPublicRequests (repository séparé, fetch
  // dédié), incomingMessages vit dans ProductState comme le reste des
  // données de démonstration : pas de chargement/erreur à suivre ici.
  const pendingIncomingMessages = state.incomingMessages.filter((item) => item.status === "nouveau");
  const openNeeds = state.serviceRequests.filter((item) => item.status === "ouvert");
  const availableCapacities = state.capacities.filter((item) => item.status === "disponible");
  const activeMissions = state.coordinationSpaces.filter((item) => item.commitments.some((commitment) => commitment.status !== "terminee") || item.commitments.length === 0);
  const urgentNeed = openNeeds.find((item) => item.priority === "critique") ?? openNeeds[0];
  const urgentTerritory = state.territories.find((item) => item.id === urgentNeed?.territoryId);
  const urgentSpecies = state.species.find((item) => item.id === urgentNeed?.speciesId);
  const selectedView = views.find((item) => item.id === view) ?? views[0];

  const filteredNeeds = openNeeds.filter((need) => {
    const species = state.species.find((item) => item.id === need.speciesId)?.name ?? "";
    return (territoryId === "all" || need.territoryId === territoryId) && `${species} ${need.intent} ${need.source}`.toLowerCase().includes(query.toLowerCase());
  });

  const filteredCapacities = availableCapacities.filter((capacity) => {
    const infrastructure = state.infrastructures.find((item) => item.id === capacity.infrastructureId);
    return (territoryId === "all" || infrastructure?.territoryId === territoryId) && `${infrastructure?.name ?? ""} ${capacity.type}`.toLowerCase().includes(query.toLowerCase());
  });

  // C06 — indicateur de tension par vue (marine neutre partout ailleurs) :
  // un point terracotta dans la navigation seulement si la vue contient
  // une tension ou une attente réelle, jamais une simple décoration.
  const viewTension: Record<View, boolean> = {
    besoins: openNeeds.some((item) => item.priority === "critique"),
    capacites: filteredCapacities.some((item) => {
      const infra = state.infrastructures.find((entry) => entry.id === item.infrastructureId);
      return infra?.theoreticalCapacity ? infra.availableCapacity / infra.theoreticalCapacity < 0.3 : false;
    }),
    rapprochements: false,
    missions: activeMissions.some((space) => space.commitments.some((item) => item.status === "bloquee")),
    demandes_publiques: pendingPublicRequests.length > 0,
    messages_entrants: pendingIncomingMessages.length > 0
  };

  return (
    <div className="space-y-8">
      {/* C03 — hero D9 : fond marine, aucun turquoise, accent terracotta
          réservé au CTA/action. */}
      <Card className="relative overflow-hidden border-none bg-sidebar text-sidebar-foreground">
        <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_88%_-10%,rgba(182,82,47,.16),transparent_45%)]" aria-hidden="true" />
        <CardContent className="relative p-6 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <TensionGlyph status={urgentNeed ? priorityToTag[urgentNeed.priority] : "neutral"} size={90} pulse={urgentNeed?.priority === "critique"} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary"><Handshake size={15} /> Mission prioritaire</div>
              <h2 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight md:text-3xl">
                {urgentNeed ? `Couvrir ${urgentNeed.quantityKg} kg de ${urgentSpecies?.name ?? "produit"} à ${urgentTerritory?.name}.` : "Maintenir les capacités et engagements opérationnels."}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-sidebar-foreground/70">
                Un besoin n’est jamais un simple signal : Mbàmbulaan identifie la capacité utile, explicite les conditions, désigne les responsables et suit le résultat.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setView("rapprochements")}>Voir la réponse proposée <ArrowRight /></Button>
                <Button variant="ghost" className="hover:bg-white/10 hover:text-white" asChild><Link href="/app/atlas"><MapPin /> Lire le territoire</Link></Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* C04 — boucle de valeur, bande compacte sous le hero (plus de
          panneau sombre séparé). */}
      <div className="grid grid-cols-2 divide-x divide-y rounded-xl border bg-card/40 sm:grid-cols-4 sm:divide-y-0">
        <div className="px-4 py-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">Besoins ouverts</p><p className="mt-1.5 text-2xl font-bold tracking-tight text-[#0b1a2a]">{openNeeds.length}</p></div>
        <div className="px-4 py-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">Capacités mobilisables</p><p className="mt-1.5 text-2xl font-bold tracking-tight text-[#0b1a2a]">{availableCapacities.length}</p></div>
        <div className="px-4 py-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">Rapprochements</p><p className="mt-1.5 text-2xl font-bold tracking-tight text-[#0b1a2a]">{state.opportunities.length}</p></div>
        <div className="px-4 py-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">Résultats</p><p className="mt-1.5 text-2xl font-bold tracking-tight text-[#0b1a2a]">{state.situations.filter((item) => item.status === "reglee").length}</p></div>
      </div>

      {/* C05 — plus de grande Card qui enferme tout le workspace : un
          chapitre ouvert directement sur le canvas, même principe que
          l'Atlas État. C06/C07 : navigation horizontale calme, filtres
          sur tokens D9. */}
      <section className="w-full min-w-0 space-y-5 border-t pt-7">
        {/* Grille plutôt que flex pour cette ligne : la colonne
            minmax(0,1fr) est le correctif fiable pour un enfant
            défilant horizontalement (ici les 6 onglets) qui ne doit
            jamais forcer son parent à s'élargir — contrairement à un
            item flex, dont le min-width: auto par défaut résiste au
            rétrécissement même avec overflow-x-auto + min-w-0 posés
            dessus (vérifié : sans effet ici, la largeur remonte via
            l'ancêtre <main> qui utilise un dimensionnement intrinsèque). */}
        <div className="grid w-full min-w-0 gap-4 xl:grid-cols-[auto_minmax(0,1fr)] xl:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Salle de coordination</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{selectedView.label}</h2>
          </div>
          <nav className="-mx-1 flex min-w-0 gap-1 overflow-x-auto px-1 pb-1" aria-label="Changer de vue de coordination">
            {views.map(({ id, label, icon: Icon }) => {
              const active = view === id;
              return (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold transition ${active ? "border-[#0b1a2a] text-[#0b1a2a]" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  <Icon size={15} className={active ? "" : "opacity-70"} />
                  {label}
                  {viewTension[id] && <span className="size-1.5 rounded-full bg-[#b6522f]" aria-hidden="true" />}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="grid gap-2 sm:grid-cols-[minmax(190px,.55fr)_minmax(230px,1fr)]">
          <label className="relative block">
            <MapPin size={15} className="pointer-events-none absolute left-3 top-3 text-muted-foreground" />
            <select value={territoryId} onChange={(event) => setTerritoryId(event.target.value)} className="h-10 w-full appearance-none rounded-lg border bg-card px-9 text-sm font-semibold" aria-label="Filtrer par territoire">
              <option value="all">Tous les territoires</option>{state.territories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-3 text-muted-foreground" />
          </label>
          <label className="relative block">
            <Search size={15} className="pointer-events-none absolute left-3 top-3 text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 w-full rounded-lg border bg-card px-9 text-sm font-semibold" placeholder="Rechercher une espèce, une capacité ou une mission…" />
          </label>
        </div>

        {/* C08 — Besoins à couvrir : registre continu, rail de priorité. */}
        {view === "besoins" && (
          filteredNeeds.length ? (
            <div className="divide-y border-y">
              {filteredNeeds.map((need) => {
                const species = state.species.find((item) => item.id === need.speciesId);
                const territory = state.territories.find((item) => item.id === need.territoryId);
                const actor = state.actors.find((item) => item.id === need.actorId);
                const tag = priorityToTag[need.priority];
                return (
                  <div key={need.id} className="relative flex flex-col gap-3 py-5 pl-5 md:flex-row md:flex-wrap md:items-center md:justify-between">
                    <span className="absolute inset-y-4 left-0 w-1 rounded-full" style={{ backgroundColor: glyphBorderColor[tag] }} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={tag === "critique" ? "terracotta" : tag === "vigilance" ? "amber" : "marine"}>{priorityLabels[need.priority]}</Badge>
                        <span className="text-xs font-semibold text-muted-foreground">{need.intent} · {territory?.name}</span>
                      </div>
                      <p className="mt-1.5 text-sm font-semibold">{species?.name} · {need.quantityKg.toLocaleString("fr-FR")} kg · Classe {need.quality}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Demandé par {actor?.name} · {need.source} · <span className="capitalize">{need.status}</span></p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setView("rapprochements")}>Chercher une réponse <ArrowRight /></Button>
                  </div>
                );
              })}
            </div>
          ) : <Empty label="Aucun besoin ne correspond aux filtres." />
        )}

        {/* C09 — Capacités mobilisables : palette de disponibilité
            corrigée (terracotta/ambre/marine, plus de turquoise). */}
        {view === "capacites" && (
          filteredCapacities.length ? (
            <div className="divide-y border-y">
              {filteredCapacities.map((capacity) => {
                const infrastructure = state.infrastructures.find((item) => item.id === capacity.infrastructureId);
                const territory = state.territories.find((item) => item.id === infrastructure?.territoryId);
                const rate = infrastructure?.theoreticalCapacity ? Math.round(infrastructure.availableCapacity / infrastructure.theoreticalCapacity * 100) : 0;
                const barColor = rate < 30 ? "#b6522f" : rate < 65 ? "#c68a2c" : "#0b1a2a";
                return (
                  <div key={capacity.id} className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-muted-foreground">{capacity.type} · {territory?.name}</p>
                      <p className="mt-1.5 text-sm font-semibold">{infrastructure?.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Disponible jusqu’au {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(capacity.validUntil))}</p>
                    </div>
                    <div className="w-full md:max-w-xs">
                      <div className="flex justify-between text-xs font-semibold"><span className="text-muted-foreground">{capacity.availableQuantity} {capacity.unit} disponible(s)</span><strong>{rate}%</strong></div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full" style={{ width: `${rate}%`, backgroundColor: barColor }} /></div>
                    </div>
                    <Button size="sm" variant="outline" asChild><Link href="/app/atlas">Voir sur l’Atlas <ArrowRight /></Link></Button>
                  </div>
                );
              })}
            </div>
          ) : <Empty label="Aucune capacité mobilisable ne correspond aux filtres." />
        )}

        {/* C10 — Rapprochements : les raisons passent devant, le score
            devient un indice de lecture (petit badge), plus l'objet
            dominant. */}
        {view === "rapprochements" && (
          state.opportunities.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {state.opportunities.map((opportunity) => {
                const lot = state.lots.find((item) => item.id === opportunity.lotId);
                const need = state.serviceRequests.find((item) => item.id === opportunity.serviceRequestId);
                const species = state.species.find((item) => item.id === lot?.speciesId);
                const territory = state.territories.find((item) => item.id === opportunity.territoryId);
                return (
                  <Card key={opportunity.id}>
                    <CardContent className="p-5 lg:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{territory?.name} · à valider</p>
                          <h3 className="mt-1.5 text-lg font-semibold">{species?.name} · {need?.quantityKg} kg</h3>
                        </div>
                        <Badge variant="marine" title="Indice de correspondance, pas une décision">{opportunity.score}/100</Badge>
                      </div>
                      <div className="mt-4 space-y-1.5">
                        {opportunity.reasons.map((reason) => <p key={reason} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#1d8a5f]" /> {reason}</p>)}
                      </div>
                      <p className="mt-4 text-xs leading-5 text-muted-foreground">Le score explique le rapprochement ; il ne décide jamais à la place des acteurs.</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {["detectee", "proposee"].includes(opportunity.status) && <CommandButton command={{ type: "accept_opportunity", opportunityId: opportunity.id }}>Valider l’engagement</CommandButton>}
                        {opportunity.status === "engagee" && <CommandButton command={{ type: "complete_logistics", opportunityId: opportunity.id }}>Confirmer le résultat</CommandButton>}
                        {opportunity.status === "executee" && <Badge variant="success"><CheckCircle2 size={13} /> Résultat enregistré</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : <Empty label="Aucun rapprochement explicable n’est disponible." />
        )}

        {/* C11 — Missions en cours : registre continu, progression en
            marine, terracotta réservé au blocage/retard réel. */}
        {view === "missions" && (
          activeMissions.length ? (
            <div className="divide-y border-y">
              {activeMissions.map((space) => {
                const situation = state.situations.find((item) => item.id === space.situationId);
                const done = space.commitments.filter((item) => item.status === "terminee").length;
                const progress = space.commitments.length ? Math.round(done / space.commitments.length * 100) : 0;
                // Pas de comparaison à Date.now() : les dates du jeu de
                // démonstration sont fixes (2026-07-29/30), donc "en
                // retard" par rapport à l'horloge réelle n'importe quel
                // jour où la démo est ouverte — un signal non fiable.
                // Seul un blocage réel (donnée, pas horloge) déclenche le
                // terracotta.
                const blocked = space.commitments.some((item) => item.status === "bloquee");
                return (
                  <div key={space.id} className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mission coordonnée</span>
                        {situation && <TrustBadge trust={situation.trust} />}
                        {blocked && <Badge variant="terracotta">Blocage à résoudre</Badge>}
                      </div>
                      <h3 className="mt-1.5 text-base font-semibold">{space.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{space.objective}</p>
                    </div>
                    <div className="w-full lg:w-56">
                      <div className="flex justify-between text-xs font-semibold"><span className="text-muted-foreground">{space.participantIds.length} acteurs mobilisés</span><span>{progress}%</span></div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-[#0b1a2a]" style={{ width: `${Math.max(progress, 5)}%` }} /></div>
                      <p className="mt-2 text-[11px] text-muted-foreground">Prochaine revue : {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(space.nextReviewAt))}</p>
                    </div>
                    <Button size="sm" variant="outline" asChild><Link href={`/app/coordination/${space.id}`}>Ouvrir la mission <ArrowRight /></Link></Button>
                  </div>
                );
              })}
            </div>
          ) : <Empty label="Aucune mission active sur ce périmètre." />
        )}

        {/* C12 — Demandes publiques / Messages entrants : grammaire
            d'inbox distincte (origine/canal, âge, contenu, action
            explicite), pas la même identité que les 4 vues précédentes. */}
        {view === "demandes_publiques" && (
          pendingPublicRequestsLoading ? (
            <div className="grid min-h-44 place-items-center p-8 text-center text-sm text-muted-foreground">Chargement des demandes publiques…</div>
          ) : pendingPublicRequestsError ? (
            <div className="grid min-h-44 place-items-center p-8 text-center text-sm font-semibold text-destructive">{pendingPublicRequestsError}</div>
          ) : (
            <div className="divide-y">{pendingPublicRequests.length ? pendingPublicRequests.map((request) => (
              <PublicRequestRow
                key={request.id}
                request={request}
                state={state}
                onConverted={() => setPendingPublicRequests((current) => current.filter((item) => item.id !== request.id))}
              />
            )) : <Empty label="Aucune demande publique en attente pour le moment." />}</div>
          )
        )}

        {view === "messages_entrants" && (
          <div className="divide-y">{pendingIncomingMessages.length ? pendingIncomingMessages.map((message) => (
            <IncomingMessageRow key={message.id} message={message} state={state} />
          )) : <Empty label="Aucun message entrant en attente pour le moment." />}</div>
        )}
      </section>

      {/* C13 — bande finale : légende métier calme, plus les 4 blocs à
          icônes turquoise. */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-6 text-sm">
        {[
          [CircleAlert, "Besoin qualifié"],
          [Factory, "Capacité vérifiée"],
          [Handshake, "Engagement humain"],
          [Route, "Résultat observé"]
        ].map(([Icon, label], index, array) => {
          const StepIcon = Icon as typeof CircleAlert;
          const isLast = index === array.length - 1;
          return (
            <div key={String(label)} className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-full bg-[#0b1a2a]/[.07] text-[#0b1a2a]"><StepIcon size={14} /></span>
              <span className="font-semibold text-[#0b1a2a]">{String(label)}</span>
              {!isLast && <ArrowRight size={14} className="ml-1 text-[#b6522f]/55" aria-hidden="true" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="grid min-h-44 place-items-center rounded-xl border border-dashed bg-card/40 p-8 text-center"><div><Snowflake className="mx-auto text-muted-foreground" /><p className="mt-3 text-sm font-semibold text-muted-foreground">{label}</p></div></div>;
}

// Ligne + action de conversion — pont PublicRequest → Produit, étape 3/3
// (2026-08-12). L'actorId de la ServiceRequest créée est celui du
// coordinateur qui convertit (pas un acteur public synthétique — aurait
// exigé d'étendre l'enum Role fermé, cf. gap analysis Task 2) ; l'identité
// du demandeur public reste portée par contactName/phone/email/organization,
// déjà optionnels sur ServiceRequest. Territoire et espèce ne sont jamais
// déduits silencieusement : PublicRequest.territory est un champ texte
// libre (SolutionWizard.tsx), aucune garantie qu'il corresponde à un
// territoire réel — la sélection reste un choix explicite du coordinateur,
// seulement pré-rempli quand une correspondance de nom est sans ambiguïté.
function PublicRequestRow({
  request,
  state,
  onConverted
}: {
  request: PublicRequest;
  state: ProductState;
  onConverted: () => void;
}) {
  const { run } = useProduct();
  const [open, setOpen] = useState(false);
  const [territoryId, setTerritoryId] = useState(() => {
    const needle = (request.territory ?? "").toLowerCase().trim();
    if (!needle) return "";
    const matches = state.territories.filter((item) => item.name.toLowerCase().includes(needle) || needle.includes(item.name.toLowerCase()));
    return matches.length === 1 ? matches[0].id : "";
  });
  const [speciesId, setSpeciesId] = useState("");
  const [quantityKg, setQuantityKg] = useState("");
  const [quality, setQuality] = useState<CatchLine["quality"]>("A");
  const [intent, setIntent] = useState<ServiceRequestIntent>(serviceRequestIntentFromPublic[request.intent]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const quantity = Number(quantityKg);
    if (!territoryId || !speciesId || !Number.isFinite(quantity) || quantity <= 0) {
      setError("Territoire, espèce et quantité (kg) sont requis.");
      return;
    }
    setError("");
    setPending(true);
    try {
      const ok = await run({
        type: "create_service_request",
        territoryId,
        speciesId,
        quantityKg: quantity,
        quality,
        intent,
        channel: request.source,
        contactName: request.contactName,
        phone: request.phone,
        email: request.email,
        organization: request.organization
      });
      if (!ok) {
        setError("La création de la demande a échoué.");
        return;
      }
      await fetch(`/api/coordination/public-requests/${request.id}`, { method: "PATCH" });
      onConverted();
    } finally {
      setPending(false);
    }
  };

  return (
    <article className="py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 gap-3">
          <Badge variant="marine" className="mt-0.5 shrink-0">{publicIntentLabel[request.intent]}</Badge>
          <div className="min-w-0">
            <p className="text-sm font-semibold">{request.territory ?? "Territoire non précisé"} · {request.reference}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{request.description}</p>
            <p className="mt-1.5 text-xs text-muted-foreground">Demandé par {request.contactName}{request.organization ? ` · ${request.organization}` : ""} · {request.phone}{request.email ? ` · ${request.email}` : ""}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
          <span className="text-xs font-semibold text-muted-foreground">{formatAge(request.createdAt)}</span>
          {!open && <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Qualifier <ArrowRight /></Button>}
        </div>
      </div>

      {open && (
        <form onSubmit={submit} className="mt-4 space-y-3 rounded-lg border bg-card p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block text-xs font-semibold text-muted-foreground">
              Territoire
              <select required value={territoryId} onChange={(event) => setTerritoryId(event.target.value)} className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm font-semibold text-foreground">
                <option value="">À choisir…</option>
                {state.territories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold text-muted-foreground">
              Espèce
              <select required value={speciesId} onChange={(event) => setSpeciesId(event.target.value)} className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm font-semibold text-foreground">
                <option value="">À choisir…</option>
                {state.species.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold text-muted-foreground">
              Quantité (kg)
              <input required type="number" min={1} step={1} value={quantityKg} onChange={(event) => setQuantityKg(event.target.value)} className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm font-semibold text-foreground" placeholder="Ex. 200" />
            </label>
            <label className="block text-xs font-semibold text-muted-foreground">
              Qualité
              <select value={quality} onChange={(event) => setQuality(event.target.value as CatchLine["quality"])} className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm font-semibold text-foreground">
                <option value="A">A</option><option value="B">B</option><option value="C">C</option>
              </select>
            </label>
          </div>
          <label className="block text-xs font-semibold text-muted-foreground">
            Intention
            <select value={intent} onChange={(event) => setIntent(event.target.value as ServiceRequestIntent)} className="mt-1.5 h-10 w-full max-w-xs rounded-md border bg-background px-3 text-sm font-semibold text-foreground">
              {Object.entries(serviceRequestIntentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <p className="text-[11px] text-muted-foreground">Intention pré-remplie à partir de la demande publique ({publicIntentLabel[request.intent]}) — à ajuster si besoin. Coordonnées ({request.contactName}, {request.phone}) reportées automatiquement sur la demande créée.</p>
          {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending} size="sm">{pending ? "Conversion…" : "Créer la demande"} <ArrowRight /></Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Annuler</Button>
          </div>
        </form>
      )}
    </article>
  );
}

// Ligne + action de conversion — file "Messages entrants" (simulée, gap
// analysis "Messages entrants", arbitrage CEO 13/08/2026). Contrairement à
// PublicRequestRow, pas de callback onConverted : incomingMessages vit
// dans ProductState, la file se met à jour au prochain rendu via run()
// (setState global côté ProductProvider), pas de fetch/PATCH séparé à
// orchestrer — c'est précisément la différence actée par le gap analysis
// entre un contenu 100% simulé et une vraie source externe (PublicRequest).
function IncomingMessageRow({
  message,
  state
}: {
  message: IncomingMessage;
  state: ProductState;
}) {
  const { run } = useProduct();
  const [open, setOpen] = useState(false);
  const [territoryId, setTerritoryId] = useState(() => {
    const needle = (message.territoryHint ?? "").toLowerCase().trim();
    if (!needle) return "";
    const matches = state.territories.filter((item) => item.name.toLowerCase().includes(needle) || needle.includes(item.name.toLowerCase()));
    return matches.length === 1 ? matches[0].id : "";
  });
  const [category, setCategory] = useState<Signal["category"]>("production");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(message.body);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const meta = channelMeta[message.channel];

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!territoryId || !title.trim() || !description.trim()) {
      setError("Territoire, titre et description sont requis.");
      return;
    }
    setError("");
    setPending(true);
    try {
      const ok = await run({
        type: "convert_message_to_signal",
        messageId: message.id,
        territoryId,
        category,
        title,
        description
      });
      if (!ok) {
        setError("La conversion en signal a échoué.");
        return;
      }
      setOpen(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <article className="py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 gap-3">
          <Badge variant="marine" className="mt-0.5 shrink-0"><meta.icon size={12} /> {messageChannelLabel[message.channel]}</Badge>
          <div className="min-w-0">
            <p className="text-sm font-semibold">{message.reportedBy}{message.territoryHint ? ` · ${message.territoryHint}` : ""}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{message.body}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
          <span className="text-xs font-semibold text-muted-foreground">{formatAge(message.receivedAt)}</span>
          {!open && <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Convertir <ArrowRight /></Button>}
        </div>
      </div>

      {open && (
        <form onSubmit={submit} className="mt-4 space-y-3 rounded-lg border bg-card p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block text-xs font-semibold text-muted-foreground">
              Territoire
              <select required value={territoryId} onChange={(event) => setTerritoryId(event.target.value)} className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm font-semibold text-foreground">
                <option value="">À choisir…</option>
                {state.territories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold text-muted-foreground">
              Catégorie
              <select value={category} onChange={(event) => setCategory(event.target.value as Signal["category"])} className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm font-semibold text-foreground">
                {Object.entries(signalCategoryLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold text-muted-foreground">
              Titre du signal
              <input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm font-semibold text-foreground" placeholder="Ex. Production de glace ralentie au quai" />
            </label>
          </div>
          <label className="block text-xs font-semibold text-muted-foreground">
            Description
            <textarea required rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm font-semibold text-foreground" />
          </label>
          <p className="text-[11px] text-muted-foreground">Description pré-remplie à partir du message — à ajuster si besoin. Aucune catégorie n’est déduite automatiquement : c’est un choix du coordinateur à la conversion.</p>
          {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending} size="sm">{pending ? "Conversion…" : "Créer le signal"} <ArrowRight /></Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Annuler</Button>
          </div>
        </form>
      )}
    </article>
  );
}
