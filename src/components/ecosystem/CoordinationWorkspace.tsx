"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  Network,
  Route,
  Search,
  Snowflake,
} from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { CommandButton } from "@/components/ui/CommandButton";
import { TrustBadge } from "@/components/ui/Badges";
import type { PublicRequest, PublicRequestIntent } from "@/domain/public/request";

type View = "besoins" | "capacites" | "rapprochements" | "missions" | "demandes_publiques";

const views: Array<{ id: View; label: string; icon: typeof Boxes }> = [
  { id: "besoins", label: "Besoins à couvrir", icon: Boxes },
  { id: "capacites", label: "Capacités mobilisables", icon: Factory },
  { id: "rapprochements", label: "Rapprochements", icon: Network },
  { id: "missions", label: "Missions en cours", icon: ClipboardCheck },
  { id: "demandes_publiques", label: "Demandes publiques", icon: Inbox }
];

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

  const openNeeds = state.serviceRequests.filter((item) => item.status === "ouvert");
  const availableCapacities = state.capacities.filter((item) => item.status === "disponible");
  const activeMissions = state.coordinationSpaces.filter((item) => item.commitments.some((commitment) => commitment.status !== "terminee") || item.commitments.length === 0);
  const urgentNeed = openNeeds.find((item) => item.priority === "critique") ?? openNeeds[0];
  const urgentTerritory = state.territories.find((item) => item.id === urgentNeed?.territoryId);
  const urgentSpecies = state.species.find((item) => item.id === urgentNeed?.speciesId);
  const selectedView = views.find((item) => item.id === view) ?? views[0];
  const ViewIcon = selectedView.icon;

  const filteredNeeds = openNeeds.filter((need) => {
    const species = state.species.find((item) => item.id === need.speciesId)?.name ?? "";
    return (territoryId === "all" || need.territoryId === territoryId) && `${species} ${need.intent} ${need.source}`.toLowerCase().includes(query.toLowerCase());
  });

  const filteredCapacities = availableCapacities.filter((capacity) => {
    const infrastructure = state.infrastructures.find((item) => item.id === capacity.infrastructureId);
    return (territoryId === "all" || infrastructure?.territoryId === territoryId) && `${infrastructure?.name ?? ""} ${capacity.type}`.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <section className="mission-strip">
        <div className="grid lg:grid-cols-[1.25fr_.75fr]">
          <div className="relative overflow-hidden p-6 lg:p-7">
            <div className="absolute inset-0 opacity-40 ocean-grid" />
            <div className="relative">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.15em] text-[#70e3d5]"><Handshake size={15} /> Mission prioritaire</div>
              <h2 className="mt-4 max-w-3xl text-2xl font-black tracking-[-.035em] lg:text-3xl">
                {urgentNeed ? `Couvrir ${urgentNeed.quantityKg} kg de ${urgentSpecies?.name ?? "produit"} à ${urgentTerritory?.name}.` : "Maintenir les capacités et engagements opérationnels."}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
                Un besoin n’est jamais un simple signal : Mbàmbulaan identifie la capacité utile, explicite les conditions, désigne les responsables et suit le résultat.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button onClick={() => setView("rapprochements")} className="btn-accent">Voir la réponse proposée <ArrowRight size={15} /></button>
                <Link href="/app/atlas" className="btn-on-dark"><MapPin size={15} /> Lire le territoire</Link>
              </div>
            </div>
          </div>
          <aside className="border-t border-white/10 bg-white/[.04] p-6 lg:border-l lg:border-t-0">
            <p className="text-[10px] font-black uppercase tracking-[.13em] text-white/38">Boucle de valeur</p>
            <div className="mt-4 space-y-4">
              {[
                [Boxes, `${openNeeds.length} besoins ouverts`, "Origine et échéance visibles"],
                [Factory, `${availableCapacities.length} capacités`, "Disponibilité déclarée"],
                [Network, `${state.opportunities.length} rapprochement`, "Explicable et à valider"],
                [CheckCircle2, `${state.situations.filter((item) => item.status === "reglee").length} résultat`, "Traçable jusqu’à la clôture"]
              ].map(([Icon, value, detail]) => {
                const ItemIcon = Icon as typeof Boxes;
                return <div key={String(value)} className="flex gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#70e3d5]/10 text-[#70e3d5]"><ItemIcon size={16} /></span><div><p className="text-sm font-black">{String(value)}</p><p className="mt-0.5 text-[10px] text-white/38">{String(detail)}</p></div></div>;
              })}
            </div>
          </aside>
        </div>
      </section>

      <section className="surface overflow-hidden">
        <div className="border-b border-[#d9e3e3] p-4 lg:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div><div className="flex items-center gap-2 text-[#08758a]"><ViewIcon size={17} /><p className="label">Salle de coordination</p></div><h2 className="mt-2 text-xl font-black tracking-[-.03em]">{selectedView.label}</h2></div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Changer de vue de coordination">
              {views.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setView(id)} className={`ops-lens ${view === id ? "ops-lens-active" : ""}`}><Icon size={15} /> {label}</button>)}
            </div>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-[minmax(190px,.55fr)_minmax(230px,1fr)]">
            <label className="relative">
              <MapPin size={15} className="pointer-events-none absolute left-3 top-3 text-[#71858a]" />
              <select value={territoryId} onChange={(event) => setTerritoryId(event.target.value)} className="h-10 w-full appearance-none rounded-xl border border-[#d0ddde] bg-[#f8fbfa] pl-9 pr-9 text-sm font-semibold" aria-label="Filtrer par territoire">
                <option value="all">Tous les territoires</option>{state.territories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-3 text-[#71858a]" />
            </label>
            <label className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-3 text-[#71858a]" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 w-full rounded-xl border border-[#d0ddde] bg-[#f8fbfa] pl-9 pr-3 text-sm font-semibold" placeholder="Rechercher une espèce, une capacité ou une mission…" />
            </label>
          </div>
        </div>

        {view === "besoins" && <div className="divide-y divide-[#e1e9e9]">{filteredNeeds.length ? filteredNeeds.map((need) => {
          const species = state.species.find((item) => item.id === need.speciesId);
          const territory = state.territories.find((item) => item.id === need.territoryId);
          const actor = state.actors.find((item) => item.id === need.actorId);
          return <article key={need.id} className="pro-table-row lg:grid-cols-[1fr_150px_170px_auto] lg:items-center">
            <div><div className="flex items-center gap-2"><span className={`size-2 rounded-full ${need.priority === "critique" ? "bg-[#c65242]" : "bg-[#d8951a]"}`} /><p className="text-[10px] font-black uppercase tracking-[.08em] text-[#7a8e94]">{need.intent} · {territory?.name}</p></div><h3 className="mt-1.5 font-black">{species?.name} · {need.quantityKg.toLocaleString("fr-FR")} kg</h3><p className="mt-1 text-xs text-[#667b81]">Demandé par {actor?.name} · {need.source}</p></div>
            <div><p className="text-[9px] font-black uppercase tracking-[.09em] text-[#8a9a9e]">Qualité</p><p className="mt-1 text-sm font-bold">Classe {need.quality}</p></div>
            <div><p className="text-[9px] font-black uppercase tracking-[.09em] text-[#8a9a9e]">État métier</p><p className="mt-1 text-sm font-bold capitalize text-[#075568]">{need.status}</p></div>
            <button onClick={() => setView("rapprochements")} className="btn-secondary whitespace-nowrap">Chercher une réponse <ArrowRight size={14} /></button>
          </article>;
        }) : <Empty label="Aucun besoin ne correspond aux filtres." />}</div>}

        {view === "capacites" && <div className="divide-y divide-[#e1e9e9]">{filteredCapacities.length ? filteredCapacities.map((capacity) => {
          const infrastructure = state.infrastructures.find((item) => item.id === capacity.infrastructureId);
          const territory = state.territories.find((item) => item.id === infrastructure?.territoryId);
          const rate = infrastructure?.theoreticalCapacity ? Math.round(infrastructure.availableCapacity / infrastructure.theoreticalCapacity * 100) : 0;
          return <article key={capacity.id} className="pro-table-row lg:grid-cols-[1fr_160px_210px_auto] lg:items-center">
            <div><p className="text-[10px] font-black uppercase tracking-[.08em] text-[#7a8e94]">{capacity.type} · {territory?.name}</p><h3 className="mt-1.5 font-black">{infrastructure?.name}</h3><p className="mt-1 text-xs text-[#667b81]">Disponible jusqu’au {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(capacity.validUntil))}</p></div>
            <div><p className="text-[9px] font-black uppercase tracking-[.09em] text-[#8a9a9e]">Disponible</p><p className="mt-1 text-lg font-black">{capacity.availableQuantity} {capacity.unit}</p></div>
            <div><div className="flex justify-between text-[10px] font-bold text-[#667b81]"><span>Taux de disponibilité</span><strong>{rate}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e7eeee]"><div className={`h-full rounded-full ${rate < 30 ? "bg-[#c65242]" : rate < 65 ? "bg-[#d8951a]" : "bg-[#1fb6a4]"}`} style={{ width: `${rate}%` }} /></div></div>
            <Link href="/app/atlas" className="btn-secondary whitespace-nowrap">Voir sur l’Atlas <ArrowRight size={14} /></Link>
          </article>;
        }) : <Empty label="Aucune capacité mobilisable ne correspond aux filtres." />}</div>}

        {view === "rapprochements" && <div className="grid gap-px bg-[#d9e3e3] md:grid-cols-2">{state.opportunities.length ? state.opportunities.map((opportunity) => {
          const lot = state.lots.find((item) => item.id === opportunity.lotId);
          const need = state.serviceRequests.find((item) => item.id === opportunity.serviceRequestId);
          const species = state.species.find((item) => item.id === lot?.speciesId);
          const territory = state.territories.find((item) => item.id === opportunity.territoryId);
          return <article key={opportunity.id} className="bg-white p-5 lg:p-6">
            <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#08758a]">{territory?.name} · à valider</p><h3 className="mt-2 text-lg font-black">{species?.name} · {need?.quantityKg} kg</h3></div><div className="text-right"><p className="text-[9px] font-black uppercase tracking-[.09em] text-[#8a9a9e]">Correspondance</p><span className="text-3xl font-black tracking-[-.05em] text-[#075568]">{opportunity.score}/100</span></div></div>
            <div className="mt-5 space-y-2">{opportunity.reasons.map((reason) => <div key={reason} className="flex items-center gap-2 text-xs text-[#536970]"><CheckCircle2 size={14} className="text-[#118f83]" /> {reason}</div>)}</div>
            <div className="mt-5 rounded-xl border border-[#e2d29e] bg-[#fff9ea] p-3 text-xs leading-5 text-[#76530d]">Le score explique le rapprochement ; il ne décide jamais à la place des acteurs.</div>
            <div className="mt-5 flex flex-wrap gap-2">{["detectee", "proposee"].includes(opportunity.status) && <CommandButton command={{ type: "accept_opportunity", opportunityId: opportunity.id }}>Valider l’engagement</CommandButton>}{opportunity.status === "engagee" && <CommandButton command={{ type: "complete_logistics", opportunityId: opportunity.id }}>Confirmer le résultat</CommandButton>}{opportunity.status === "executee" && <span className="inline-flex items-center gap-2 rounded-lg bg-[#e9f7f1] px-3 py-2 text-xs font-black text-[#126b58]"><CheckCircle2 size={14} /> Résultat enregistré</span>}</div>
          </article>;
        }) : <Empty label="Aucun rapprochement explicable n’est disponible." />}</div>}

        {view === "missions" && <div className="divide-y divide-[#e1e9e9]">{activeMissions.length ? activeMissions.map((space) => {
          const situation = state.situations.find((item) => item.id === space.situationId);
          const done = space.commitments.filter((item) => item.status === "terminee").length;
          const progress = space.commitments.length ? Math.round(done / space.commitments.length * 100) : 0;
          return <article key={space.id} className="p-5 lg:p-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_240px_auto] lg:items-center">
              <div><div className="flex flex-wrap items-center gap-2"><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#08758a]">Mission coordonnée</p>{situation && <TrustBadge trust={situation.trust} />}</div><h3 className="mt-2 text-lg font-black">{space.title}</h3><p className="mt-2 text-sm leading-6 text-[#667b81]">{space.objective}</p></div>
              <div><div className="flex justify-between text-xs font-bold"><span>{space.participantIds.length} acteurs mobilisés</span><span>{progress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e7eeee]"><div className="h-full rounded-full bg-[#1fb6a4]" style={{ width: `${Math.max(progress, 5)}%` }} /></div><p className="mt-2 text-[10px] text-[#71858a]">Prochaine revue : {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(space.nextReviewAt))}</p></div>
              <Link href={`/app/coordination/${space.id}`} className="btn-primary whitespace-nowrap">Ouvrir la mission <ArrowRight size={14} /></Link>
            </div>
          </article>;
        }) : <Empty label="Aucune mission active sur ce périmètre." />}</div>}

        {view === "demandes_publiques" && (
          pendingPublicRequestsLoading ? (
            <div className="grid min-h-44 place-items-center p-8 text-center text-sm text-[#667b81]">Chargement des demandes publiques…</div>
          ) : pendingPublicRequestsError ? (
            <div className="grid min-h-44 place-items-center p-8 text-center text-sm font-semibold text-[#c65242]">{pendingPublicRequestsError}</div>
          ) : (
            <div className="divide-y divide-[#e1e9e9]">{pendingPublicRequests.length ? pendingPublicRequests.map((request) => (
              <article key={request.id} className="pro-table-row lg:grid-cols-[1fr_170px_auto] lg:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="size-2 rounded-full bg-[#d8951a]" />
                    <p className="text-[10px] font-black uppercase tracking-[.08em] text-[#7a8e94]">{publicIntentLabel[request.intent]} · {request.territory ?? "Territoire non précisé"}</p>
                  </div>
                  <h3 className="mt-1.5 font-black">{request.reference}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#526970]">{request.description}</p>
                  <p className="mt-2 text-xs text-[#667b81]">Demandé par {request.contactName}{request.organization ? ` · ${request.organization}` : ""} · {request.phone}{request.email ? ` · ${request.email}` : ""}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[.09em] text-[#8a9a9e]">Reçue le</p>
                  <p className="mt-1 text-sm font-bold">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(request.createdAt))}</p>
                  <p className="mt-2 text-[9px] font-black uppercase tracking-[.09em] text-[#8a9a9e]">Canal</p>
                  <p className="mt-1 text-sm font-bold capitalize text-[#075568]">{request.source}</p>
                </div>
              </article>
            )) : <Empty label="Aucune demande publique en attente pour le moment." />}</div>
          )
        )}
      </section>

      <section className="signal-path">
        {[
          [CircleAlert, "Besoin qualifié", "Qui demande, quoi, où, quand"],
          [Factory, "Capacité vérifiée", "Disponibilité et conditions"],
          [Handshake, "Engagement humain", "Responsable et échéance"],
          [Route, "Résultat observé", "Preuve, valeur et apprentissage"]
        ].map(([Icon, title, detail], index) => {
          const StepIcon = Icon as typeof CircleAlert;
          return <div key={String(title)}><div className="flex items-center justify-between"><span className="grid size-8 place-items-center rounded-lg bg-[#e5f7f3] text-[#08758a]"><StepIcon size={15} /></span><span className="text-[10px] font-black text-[#a1b2b5]">0{index + 1}</span></div><p className="mt-3 text-sm font-black">{String(title)}</p><p className="mt-1 text-[11px] leading-5 text-[#667b81]">{String(detail)}</p></div>;
        })}
      </section>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="col-span-full grid min-h-44 place-items-center bg-white p-8 text-center"><div><Snowflake className="mx-auto text-[#9db0b4]" /><p className="mt-3 text-sm font-bold">{label}</p></div></div>;
}
