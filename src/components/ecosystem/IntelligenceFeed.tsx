"use client";

// IntelligenceFeed — LOT 8 (mandat "Maritime Intelligence Engine —
// détecter, expliquer, prioriser sans décider à la place de l'humain").
// Première expérience utilisateur du moteur de règles déterministe
// (src/domain/signal-crossing.ts) — jusqu'ici jamais consommé par aucune
// UI. Onglet de CoordinationWorkspace.tsx plutôt qu'une nouvelle route
// (mandat §13, "réutiliser une surface existante"), consommé par le même
// rôle que record_finding/dismiss_detection (coordinateur et assimilés).
//
// Vocabulaire imposé (mandat §34) : jamais "SignalCrossingAlert" / "Rule
// Engine" / "IA recommande" / "score d'anomalie" — toujours DÉTECTION /
// POURQUOI / SOURCES / CONFIANCE-LIMITES / SUITE PROPOSÉE. Chaque carte
// répond explicitement à "pourquoi Mbàmbulaan m'affiche cela ?" (§16) —
// jamais un score opaque, toujours la règle, les faits et les sources.
//
// Ce composant ne décide jamais rien : il affiche des détections
// (calculées, jamais stockées) et deux gestes humains possibles —
// "Enregistrer comme constat Mbàmbulaan" (record_finding) ou "Écarter
// cette occurrence" (dismiss_detection, avec une raison courte, mandat
// §31). Aucun des deux ne crée de Situation, Decision, Mission ou
// Programme (mandat §20) — seul un Finding "proposed" ou "rejected" en
// résulte ; la promotion éventuelle reste un geste ultérieur, séparé.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Info, ShieldQuestion } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { canRole } from "@/server/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrustBadge } from "@/components/shared/StatusBadges";
import { computeIntelligenceFeed, type IntelligenceFeedItem } from "@/domain/intelligence-feed";
import { computeIntelligenceObservability } from "@/domain/intelligence-feed";
import { INTELLIGENCE_RULE_REGISTRY } from "@/domain/signal-crossing";
import { findingRejectionReasonLabels, type FindingRejectionReason, type ProductState, type Role } from "@/domain/types";

// actorId n'est pas nécessaire ici : useProduct().run() rattache déjà la
// commande au véritable acteur de session (même mécanisme que le reste
// du produit) — jamais reconstruit localement.

const attentionBadge: Record<"critique" | "vigilance", "terracotta" | "amber"> = {
  critique: "terracotta",
  vigilance: "amber"
};

const attentionLabel: Record<"critique" | "vigilance", string> = {
  critique: "Attention critique",
  vigilance: "Vigilance"
};

const rejectionReasons: FindingRejectionReason[] = ["faux_positif", "information_deja_connue", "donnee_trop_ancienne", "contexte_non_pertinent", "doublon"];

function Empty({ label }: { label: string }) {
  return <div className="grid min-h-32 place-items-center p-8 text-center text-sm text-muted-foreground">{label}</div>;
}

// XXL-R0 (Demo Integrity, correctif n°6) — cause vérifiée de la répétition
// verbatim signalée par l'Audit Maritime Intelligence : chaque détection
// reste un objet réel et distinct (35 capacités différentes pour la seule
// règle de fraîcheur, dans le jeu de démonstration — vérifié), mais la
// carte repliée n'affichait que item.alert.title, identique pour toutes
// les occurrences d'une même règle générique. Ce n'est ni une donnée
// dupliquée ni un rendu React incorrect : c'est un intitulé commun affiché
// une fois par occurrence plutôt qu'une seule fois pour le groupe.
// Correction demandée par le mandat : "information commune affichée une
// fois, puis sources/listes en dessous" — sans jamais masquer une source
// individuelle (chaque occurrence garde ses faits, ses sources et ses
// actions propres, disponibles au clic). Pas un redesign du Feed :
// aucune nouvelle donnée, aucun nouveau geste, seulement un regroupement
// d'affichage sur le même intitulé.
export function groupFeedItems(items: IntelligenceFeedItem[]): { title: string; items: IntelligenceFeedItem[] }[] {
  const order: string[] = [];
  const byTitle = new Map<string, IntelligenceFeedItem[]>();
  for (const item of items) {
    const key = item.alert.title;
    if (!byTitle.has(key)) {
      byTitle.set(key, []);
      order.push(key);
    }
    byTitle.get(key)!.push(item);
  }
  return order.map((title) => ({ title, items: byTitle.get(title)! }));
}

// Bloc "détail" (faits / sources / confiance-limites / suite proposée /
// actions) — extrait tel quel de l'unique carte d'origine (aucun contenu
// ni geste retiré) pour être réutilisé à la fois par une détection seule
// et par chaque occurrence d'un groupe (cf. groupFeedItems ci-dessus).
function FeedItemDetail({
  item,
  canAct,
  dismissingId,
  pendingId,
  onDismissStart,
  onDismissCancel,
  onDismiss,
  onRegister,
  compact = false
}: {
  item: IntelligenceFeedItem;
  canAct: boolean;
  dismissingId: string | null;
  pendingId: string | null;
  onDismissStart: (id: string) => void;
  onDismissCancel: () => void;
  onDismiss: (item: IntelligenceFeedItem, reason: FindingRejectionReason) => void;
  onRegister: (item: IntelligenceFeedItem) => void;
  compact?: boolean;
}) {
  const sourceCounts = item.alert.sourceRefs.reduce<Record<string, number>>((acc, ref) => {
    acc[ref.objectType] = (acc[ref.objectType] ?? 0) + 1;
    return acc;
  }, {});
  return (
    <div className={compact ? "mt-3 space-y-3" : "mt-4 space-y-4 border-t pt-4"}>
      <section>
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Pourquoi cela mérite votre attention</p>
        <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
          {item.alert.facts.map((fact) => (
            <li key={fact.code}>{fact.label} : <strong className="text-foreground">{String(fact.value)}{fact.unit ? ` ${fact.unit}` : ""}</strong></li>
          ))}
        </ul>
      </section>
      <section>
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Sources</p>
        <p className="mt-1.5 text-xs text-muted-foreground">{Object.entries(sourceCounts).map(([type, count]) => `${count} ${type}`).join(" · ")}</p>
      </section>
      <section>
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Confiance et limites</p>
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{item.alert.disclaimer} {item.alert.decisionBoundary}</p>
      </section>
      <section>
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Suite proposée</p>
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{item.draft.nextStep}</p>
      </section>

      {canAct && (
        <div className="space-y-2 border-t pt-3">
          {dismissingId === item.alert.id ? (
            <div className="space-y-2 rounded-lg border border-dashed p-3">
              <p className="text-[11px] font-semibold text-muted-foreground">Pourquoi écarter cette occurrence ?</p>
              <div className="flex flex-wrap gap-1.5">
                {rejectionReasons.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    disabled={pendingId === item.alert.id}
                    onClick={() => onDismiss(item, reason)}
                    className="rounded-full border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:border-primary hover:text-foreground"
                  >
                    {findingRejectionReasonLabels[reason]}
                  </button>
                ))}
              </div>
              <Button size="sm" variant="ghost" onClick={onDismissCancel}>Annuler</Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={pendingId === item.alert.id} onClick={() => onRegister(item)}>
                {pendingId === item.alert.id ? "Enregistrement…" : "Enregistrer comme constat Mbàmbulaan"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => onDismissStart(item.alert.id)}>Écarter cette occurrence</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function IntelligenceFeed({ state, role }: { state: ProductState; role: Role }) {
  const { run } = useProduct();
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [dismissingId, setDismissingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [showRegistry, setShowRegistry] = useState(false);
  const [showHandled, setShowHandled] = useState(false);
  // Release hardening (V1) — promote_finding_to_situation existait déjà
  // (LOT 8), permissionnée et testée, mais jamais exposée. run() ne
  // renvoie qu'un booléen de succès, pas l'id de la Situation créée
  // (généré côté domaine) — on retient l'id du Finding en attente de
  // promotion, et un effet observe state.findings jusqu'à ce que son
  // promotedToSituationId apparaisse, puis ouvre le vrai dossier créé.
  // Jamais de promotion automatique : ce n'est déclenché que par le geste
  // humain promoteFinding ci-dessous.
  const [pendingPromotionFindingId, setPendingPromotionFindingId] = useState<string | null>(null);

  const feed = computeIntelligenceFeed(state);
  const observability = computeIntelligenceObservability(state);
  const newItems = feed.filter((item) => item.status === "nouvelle");
  const handledItems = feed.filter((item) => item.status !== "nouvelle");
  const canAct = canRole(role, "record_finding") && canRole(role, "dismiss_detection");
  const canPromote = canRole(role, "promote_finding_to_situation");

  useEffect(() => {
    if (!pendingPromotionFindingId) return;
    const finding = state.findings.find((item) => item.id === pendingPromotionFindingId);
    if (finding?.promotedToSituationId) {
      setPendingPromotionFindingId(null);
      router.push(`/app/situations/${finding.promotedToSituationId}`);
    }
  }, [state, pendingPromotionFindingId, router]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const registerFinding = async (item: IntelligenceFeedItem) => {
    setPendingId(item.alert.id);
    try {
      await run({ type: "record_finding", ...item.draft });
    } finally {
      setPendingId(null);
    }
  };

  const dismissDetection = async (item: IntelligenceFeedItem, reason: FindingRejectionReason) => {
    setPendingId(item.alert.id);
    try {
      const ok = await run({ type: "dismiss_detection", ...item.draft, rejectionReason: reason });
      if (ok) setDismissingId(null);
    } finally {
      setPendingId(null);
    }
  };

  const confirmFinding = async (findingId: string) => {
    setPendingId(findingId);
    try {
      await run({ type: "update_finding_status", findingId, status: "confirmed" });
    } finally {
      setPendingId(null);
    }
  };

  // promoteFinding — release hardening (V1) : le seul chemin qui ouvre une
  // Situation depuis un constat confirmé, via la commande Core existante
  // (promote_finding_to_situation, knowledge-pipeline.ts). N'invente
  // aucune règle : le garde-fou "un Finding déjà promu ne l'est jamais
  // deux fois" reste entièrement porté par le domaine — ce composant se
  // contente de ne pas afficher le bouton une fois promotedToSituationId
  // renseigné (cf. rendu ci-dessous).
  const promoteFinding = async (findingId: string) => {
    setPendingId(findingId);
    try {
      const ok = await run({ type: "promote_finding_to_situation", findingId });
      if (ok) setPendingPromotionFindingId(findingId);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
        <Info size={14} className="mt-0.5 shrink-0" />
        Mbàmbulaan détecte des combinaisons de faits qui méritent votre attention à partir de règles explicites — jamais une intelligence artificielle, jamais une décision prise à votre place. Chaque détection reste à examiner ; c’est vous qui décidez d’en faire un constat, ou de l’écarter.
      </p>

      {/* Observabilité simple (mandat §32) — une activité, jamais un score. */}
      <div className="grid grid-cols-2 gap-3 rounded-xl border bg-card/40 p-4 text-xs sm:grid-cols-4">
        <div><p className="font-semibold uppercase tracking-wide text-muted-foreground">Règles actives</p><p className="mt-1 text-lg font-bold text-[#0b1a2a]">{observability.rulesActive}</p></div>
        <div><p className="font-semibold uppercase tracking-wide text-muted-foreground">Détections produites</p><p className="mt-1 text-lg font-bold text-[#0b1a2a]">{observability.detectionsProduced}</p></div>
        <div><p className="font-semibold uppercase tracking-wide text-muted-foreground">Déjà examinées</p><p className="mt-1 text-lg font-bold text-[#0b1a2a]">{observability.detectionsExamined}</p></div>
        <div><p className="font-semibold uppercase tracking-wide text-muted-foreground">Écartées</p><p className="mt-1 text-lg font-bold text-[#0b1a2a]">{observability.detectionsDismissed}</p></div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">À examiner</p>
        {newItems.length === 0 ? (
          <div className="mt-2 rounded-xl border"><Empty label="Aucune détection à examiner pour le moment — cela ne signifie pas qu'aucune réalité ne mérite attention, seulement qu'aucune règle active n'en a trouvé ici." /></div>
        ) : (
          <div className="mt-2 space-y-3">
            {groupFeedItems(newItems).map((group) => {
              if (group.items.length === 1) {
                const item = group.items[0];
                const expanded = expandedIds.has(item.alert.id);
                return (
                  <div key={item.alert.id} className="rounded-xl border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={attentionBadge[item.alert.attentionLevel]}>{attentionLabel[item.alert.attentionLevel]}</Badge>
                          <TrustBadge trust={item.draft.trust} />
                        </div>
                        <p className="mt-2 text-sm font-semibold">{item.alert.title}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => toggleExpanded(item.alert.id)}>
                        {expanded ? <>Réduire <ChevronUp size={14} /></> : <>Examiner <ChevronDown size={14} /></>}
                      </Button>
                    </div>
                    {expanded && <FeedItemDetail item={item} canAct={canAct} dismissingId={dismissingId} pendingId={pendingId} onDismissStart={setDismissingId} onDismissCancel={() => setDismissingId(null)} onDismiss={dismissDetection} onRegister={registerFinding} />}
                  </div>
                );
              }

              // Groupe (>1 occurrence du même intitulé, cf. groupFeedItems
              // ci-dessus) : une seule carte, un seul badge d'attention
              // (le plus élevé du groupe — jamais minimisé), le décompte
              // réel en toutes lettres. "Examiner" déplie CHAQUE occurrence
              // individuellement, avec ses propres faits/sources/actions —
              // rien n'est masqué, seulement regroupé par défaut.
              const groupKey = `group:${group.title}`;
              const groupExpanded = expandedIds.has(groupKey);
              const worstAttention: "critique" | "vigilance" = group.items.some((item) => item.alert.attentionLevel === "critique") ? "critique" : "vigilance";
              return (
                <div key={groupKey} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={attentionBadge[worstAttention]}>{attentionLabel[worstAttention]}</Badge>
                        <Badge variant="outline">{group.items.length} occurrences</Badge>
                      </div>
                      <p className="mt-2 text-sm font-semibold">{group.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Même règle, {group.items.length} objets distincts — chacun garde ses propres faits, sources et geste.</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => toggleExpanded(groupKey)}>
                      {groupExpanded ? <>Réduire <ChevronUp size={14} /></> : <>Examiner ({group.items.length}) <ChevronDown size={14} /></>}
                    </Button>
                  </div>
                  {groupExpanded && (
                    <div className="mt-4 space-y-3 border-t pt-4">
                      {group.items.map((item) => (
                        <div key={item.alert.id} className="rounded-lg border p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <TrustBadge trust={item.draft.trust} />
                            <p className="text-xs font-semibold text-muted-foreground">{state.territories.find((territory) => territory.id === item.alert.territoryId)?.name ?? item.alert.territoryId}</p>
                          </div>
                          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{item.alert.description}</p>
                          <FeedItemDetail item={item} canAct={canAct} dismissingId={dismissingId} pendingId={pendingId} onDismissStart={setDismissingId} onDismissCancel={() => setDismissingId(null)} onDismiss={dismissDetection} onRegister={registerFinding} compact />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {handledItems.length > 0 && (
        <div>
          <button type="button" onClick={() => setShowHandled((current) => !current)} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {showHandled ? <ChevronUp size={13} /> : <ChevronDown size={13} />} Détections déjà traitées ({handledItems.length})
          </button>
          {showHandled && (
            <div className="mt-2 divide-y rounded-xl border">
              {handledItems.map((item) => (
                <div key={item.alert.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{item.alert.title}</p>
                    <p className="mt-0.5 text-muted-foreground">
                      {item.status === "enregistree" ? "Constat enregistré" : "Détection écartée"}
                      {item.finding?.status === "confirmed" ? " · confirmé" : ""}
                      {item.finding?.reviewNote ? ` · ${item.finding.reviewNote}` : ""}
                    </p>
                  </div>
                  {canAct && item.status === "enregistree" && item.finding?.status === "proposed" && (
                    <Button size="sm" variant="outline" disabled={pendingId === item.finding.id} onClick={() => confirmFinding(item.finding!.id)}>
                      {pendingId === item.finding.id ? "…" : "Confirmer ce constat"}
                    </Button>
                  )}
                  {/* Finding → Situation (release hardening, V1) : visible
                      uniquement pour un constat confirmé pas encore promu
                      et un rôle autorisé — absent sinon, jamais désactivé
                      à vide. */}
                  {canPromote && item.status === "enregistree" && item.finding?.status === "confirmed" && !item.finding?.promotedToSituationId && (
                    <Button size="sm" disabled={pendingId === item.finding.id} onClick={() => promoteFinding(item.finding!.id)}>
                      {pendingId === item.finding.id ? "…" : "Ouvrir une situation"}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <button type="button" onClick={() => setShowRegistry((current) => !current)} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {showRegistry ? <ChevronUp size={13} /> : <ChevronDown size={13} />} <ShieldQuestion size={13} /> Catalogue des règles actives ({INTELLIGENCE_RULE_REGISTRY.length})
        </button>
        {showRegistry && (
          <div className="mt-2 space-y-2">
            {INTELLIGENCE_RULE_REGISTRY.map((rule) => (
              <div key={rule.ruleId} className="rounded-lg border p-3 text-xs">
                <p className="font-semibold">{rule.name}</p>
                <p className="mt-1 text-muted-foreground">{rule.objective}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{rule.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
