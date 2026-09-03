"use client";

// WorkdayHub — LOT 9 (mandat "Operating Experience — faire disparaître les
// modules derrière le travail réel"). Remplace CoordinatorHub pour
// coordinateur/administrateur/gestionnaire_organisation/partenaire :
// CoordinatorHub ne montrait que des Situations (jamais les Findings/
// détections LOT 8, les Commitments à échéance, les Missions terrain, le
// développement de programme ou le réseau) — un vrai manque face au
// mandat §9/§11/§12. Consomme uniquement buildWorkdayView
// (src/domain/workday.ts) : aucune donnée recalculée ici, ce composant ne
// fait que la mettre en forme — "bureau de travail", pas un dashboard KPI
// ni un Kanban (mandat §30).
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, ChevronDown, Info, Radio } from "lucide-react";
import type { ProductState, Role } from "@/domain/types";
import { buildWorkdayView, capItemsForDisplay, sortWorkdayItems, type WorkdayItem } from "@/domain/workday";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CoordinatorSignalForm } from "@/components/work/CoordinatorSignalForm";
import { glyphBorderColor } from "@/lib/status-tokens";
import { PageIntro, SignalMark, TerritoryIdentity } from "@/components/foundations";

// Le titre d'un item de travail embarque déjà, en toutes lettres, un
// suffixe "… · <Territoire>" (donnée réelle, cf. situation.title dans
// demo-state.ts — buildWorkdayView non modifié). Quand TerritoryIdentity
// s'affiche déjà juste au-dessus avec ce même nom, l'un des deux doit
// céder : ce n'est qu'un habillage d'affichage (aucune donnée perdue, le
// titre complet reste utilisé partout ailleurs — Situations, Situation
// Room, etc.), pas une réécriture du contenu. Extraite en fonction pure
// de module (plutôt que fermeture locale) pour rester testable
// directement (TEST xxl-r3, garde-fou anti-répétition).
export function displayTitle(title: string, territoryName?: string) {
  return territoryName && title.endsWith(` · ${territoryName}`) ? title.slice(0, -(territoryName.length + 3)) : title;
}

// §8 — un seul repère par priorité : quand le territoire résout à un
// objet réel, TerritoryIdentity porte déjà son propre glyphe (TensionGlyph
// sur territory.activity) — le SignalMark autonome ne s'ajoute que
// lorsqu'aucun territoire n'est affiché, pour ne jamais doubler le repère.
// Extraite en fonction pure (garde-fou anti double-glyphe, testable).
export function shouldShowStandaloneSignal(urgency: WorkdayItem["urgency"], hasTerritory: boolean) {
  return urgency !== "normale" && !hasTerritory;
}

const urgencyTag: Record<WorkdayItem["urgency"], "critique" | "vigilance" | "stable"> = {
  critique: "critique",
  vigilance: "vigilance",
  normale: "stable"
};

const urgencyBadgeVariant: Record<WorkdayItem["urgency"], "terracotta" | "amber" | "marine"> = {
  critique: "terracotta",
  vigilance: "amber",
  normale: "marine"
};

const categoryLabel: Record<WorkdayItem["category"], string> = {
  decision: "Décision",
  coordination: "Coordination",
  bloque: "Bloqué",
  echeance: "Échéance",
  mission: "Mission terrain",
  qualification_finding: "À qualifier",
  qualification_besoin: "Développement",
  qualification_reseau: "Réseau",
  qualification_intake: "À qualifier",
  gouvernance: "Gouvernance"
};

// XXL-R3 (§4 du mandat) — courte contextualisation du hero, "uniquement
// dérivée du contenu réel" : un thème court par catégorie, jamais un
// chiffre en avant (§12), pour composer une phrase du type "coordination,
// échéances et missions terrain en cours." à partir des catégories
// réellement présentes dans le Top 3 — jamais un texte pseudo-éditorial
// figé.
const categoryTheme: Record<WorkdayItem["category"], string> = {
  decision: "des décisions",
  coordination: "de la coordination",
  bloque: "des situations bloquées",
  echeance: "des échéances",
  mission: "des missions terrain",
  qualification_finding: "des qualifications",
  qualification_besoin: "du développement de programme",
  qualification_reseau: "de la qualification réseau",
  qualification_intake: "des remontées à qualifier",
  gouvernance: "de la gouvernance"
};

// §11 — raccourcis secondaires, jamais davantage que ces 4 espaces déjà
// nommés par le mandat, mêmes routes que AppSidebar.tsx.
const secondaryShortcuts = [
  { href: "/app/situations", label: "Situations" },
  { href: "/app/initiatives", label: "Programmes" },
  { href: "/app/atlas", label: "Territoires" },
  { href: "/app/organisation", label: "Réseau" }
] as const;

function frenchList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
}

// Rôles autorisés à qualifier une contribution réseau (permissions.ts,
// mêmes trois rôles que record_finding/dismiss_detection + institution,
// qui n'atteint jamais /app/travail — non repris ici) — mirroré plutôt
// qu'importé du serveur, même discipline que workday.ts.
const NETWORK_CONTRIBUTION_ROLES: Role[] = ["administrateur", "coordinateur", "gestionnaire_organisation"];

// XXL-R0 (Demo Integrity, correctif n°5) — garde-fou mécanique contre le
// défilement de ~23 000px observé par l'Audit Maritime Intelligence sur
// mobile. Cause réelle vérifiée : "rest" (myAttention au-delà du Top 3)
// et waitingOnOthers étaient rendus intégralement, sans plafond — 89
// éléments pour le coordinateur de démonstration, chacun haut de
// plusieurs lignes en colonne sur mobile (ItemRow, flex-col en dessous de
// md). Pas un redesign d'Aujourd'hui (qui appartient à XXL-R3, cf. audit
// §10) : seulement une limite d'affichage par défaut + un "Voir tout",
// qui révèle la même liste réelle déjà calculée par buildWorkdayView —
// rien n'est masqué en permanence, rien n'est fabriqué. Le Top 3 n'est
// jamais concerné par ce plafond (toujours affiché en entier).
//
// "Voir tout" reste ici une bascule d'affichage plutôt qu'un lien vers
// une page tierce : buildWorkdayView() agrège des catégories hétérogènes
// (décisions, coordination, missions terrain, qualification réseau…)
// sans registre unique existant qui les recouvre toutes — inventer une
// telle page serait le redesign explicitement exclu de ce lot. La
// "vraie surface" est donc cette liste elle-même, dans son intégralité,
// pas un extrait tronqué.
const WORK_LIST_VISIBLE_COUNT = 5;

function CappedList<T extends { id: string }>({ items, visibleCount, renderItem }: { items: T[]; visibleCount: number; renderItem: (item: T) => ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const { visible, hiddenCount } = expanded ? { visible: items, hiddenCount: 0 } : capItemsForDisplay(items, visibleCount);
  return (
    <>
      {visible.map(renderItem)}
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex w-full items-center justify-center gap-1.5 py-3 text-xs font-semibold text-primary hover:underline"
        >
          Voir tout ({items.length}) <ChevronDown size={13} />
        </button>
      )}
    </>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

// XXL-RC1 (§3) — la barre latérale colorée par ligne (une par urgence,
// répétée sur chacun des N éléments de "Votre travail") a été retirée :
// le Badge (déjà présent, même couleur, mêmes 3 valeurs
// urgencyBadgeVariant) porte déjà cette information — la barre ne
// faisait que la répéter en aplat sur toute la hauteur de la ligne. Sur
// une liste de 5+ éléments, cette répétition verticale était le premier
// facteur de l'effet "file de tickets" identifié par le contre-audit
// visuel (Pass 2, §3/§9) : aucune information perdue en la retirant,
// glyphBorderColor reste utilisé plus bas (Top 3, repère de catégorie) —
// seul cet usage-ci en ligne de liste disparaît. py-5 (au lieu de py-4) :
// un peu plus de respiration verticale par ligne, même esprit que
// l'augmentation d'espacement du composant dans son ensemble.
function ItemRow({ item }: { item: WorkdayItem }) {
  return (
    <div className="flex flex-col gap-3 py-5 md:flex-row md:flex-wrap md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={urgencyBadgeVariant[item.urgency]}>{categoryLabel[item.category]}</Badge>
          {item.territoryName && <span className="text-xs text-muted-foreground">{item.territoryName}</span>}
        </div>
        <p className="mt-1.5 text-sm font-semibold">{item.title}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.why}</p>
      </div>
      <Button size="sm" variant="outline" asChild><Link href={item.href}>{item.ctaLabel} <ArrowRight size={14} /></Link></Button>
    </div>
  );
}

export function WorkdayHub({ state, actorId, role }: { state: ProductState; actorId: string; role: Role }) {
  const actor = state.actors.find((item) => item.id === actorId);
  const [networkItem, setNetworkItem] = useState<WorkdayItem | null>(null);
  const [signalOpen, setSignalOpen] = useState(false);

  // Contributions publiques à qualifier — pas dans ProductState (dépôt
  // séparé, cf. server/public-repository.ts, réutilisé tel quel), donc un
  // fetch léger plutôt qu'une donnée recalculée dans buildWorkdayView
  // (qui doit rester une projection pure de ProductState). Même mécanisme
  // que CoordinationWorkspace.tsx/OrganizationWorkspace.tsx.
  useEffect(() => {
    if (!NETWORK_CONTRIBUTION_ROLES.includes(role)) return;
    let cancelled = false;
    fetch("/api/coordination/public-contributions")
      .then(async (response) => {
        if (!response.ok || cancelled) return;
        const payload = await response.json();
        const count = (payload.contributions ?? []).length;
        if (!cancelled && count > 0) {
          setNetworkItem({
            id: "network-contribution:pending",
            category: "qualification_reseau",
            title: `${count} contribution${count > 1 ? "s" : ""} publique${count > 1 ? "s" : ""} à qualifier`,
            why: "Une capacité a été proposée depuis l’espace public et attend une qualification humaine.",
            ctaLabel: "Qualifier la contribution",
            href: "/app/organisation",
            urgency: "normale"
          });
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [role]);

  const view = buildWorkdayView(state, actorId, role);
  const myAttention = networkItem ? sortWorkdayItems([...view.myAttention, networkItem]) : view.myAttention;
  const top3 = myAttention.slice(0, 3);
  const rest = myAttention.slice(3);
  const dateLabel = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  // XXL-R3 (§4, §16) — hero dérivé du contenu réel de myAttention/view,
  // jamais un texte figé ni un chiffre en tuile (§12). Le thème n'énumère
  // que les catégories réellement présentes dans le Top 3 (déduplique,
  // ordre d'apparition, 3 maximum pour rester une phrase courte).
  const top3Themes = [...new Set(top3.map((item) => categoryTheme[item.category]))].slice(0, 3);
  const firstName = actor?.name?.split(" ")[0] ?? "";
  const heroTitle = top3.length > 0
    ? `${top3.length} priorité${top3.length > 1 ? "s" : ""} demande${top3.length > 1 ? "nt" : ""} votre attention.`
    : "Aucune action prioritaire actuellement.";
  const heroDek = top3.length > 0
    ? `${greeting()}, ${firstName}. ${frenchList(top3Themes)}${top3Themes.length > 0 ? " en cours." : ""}`
    : `${greeting()}, ${firstName}. Le travail engagé reste consultable ci-dessous — rien ne réclame une décision immédiate.`;

  // §7 — TerritoryIdentity seulement si le territoire résout à un objet
  // réel de state.territories (jamais un glyphe fabriqué pour un simple
  // nom de chaîne). §8 — SignalMark seulement pour ce qui représente
  // réellement une nouvelle attention (critique/vigilance), jamais pour
  // une priorité "normale".
  const territoryFor = (name?: string) => (name ? state.territories.find((item) => item.name === name) : undefined);

  return (
    // XXL-RC1 (§3) — space-y-14 (au lieu de space-y-10) : plus de
    // respiration entre chapitres, même logique que les pt-8 (au lieu de
    // pt-6) sur chaque section ci-dessous — un seul geste de composition
    // cohérent, pas une valeur isolée.
    <div className="shadcn-scope space-y-14 bg-background p-5 pb-16 lg:p-8">
      {/* XXL-R3 (§4) — l'eyebrow redevient la date (repère temporel
          stable), le vrai titre devient un état dérivé ("N priorités
          demandent votre attention" / état calme si 0) plutôt qu'une
          simple salutation — la salutation personnelle migre dans le dek,
          avec la contextualisation thématique (§4, "dérivée du contenu
          réel", jamais pseudo-éditoriale). */}
      <PageIntro
        eyebrow={dateLabel}
        title={heroTitle}
        dek={heroDek}
        action={<Button variant="outline" onClick={() => setSignalOpen(true)}><Radio /> Signaler une situation</Button>}
        signature
      />

      {/* XXL-R3 (§5-§8) — Top 3 : un seul espace de composition, jamais
          trois cartes. #1 domine par l'espace et la typographie (padding,
          taille de titre), pas par la couleur ou l'animation — même
          filet de sévérité, même famille visuelle pour les trois.
          Numérotation 01/02/03 en registre Evidence (mono). */}
      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Vos priorités</p>
        {top3.length === 0 ? (
          <div className="mt-3 rounded-lg border px-6 py-8 text-center" style={{ borderColor: "var(--mb-hairline-soft)" }}>
            <p className="text-sm text-muted-foreground">Aucune action prioritaire actuellement.</p>
          </div>
        ) : (
          <div className="mt-3 divide-y" style={{ borderColor: "var(--mb-hairline-soft)" }}>
            {top3.map((item, index) => {
              const dominant = index === 0;
              const territory = territoryFor(item.territoryName);
              const showSignal = shouldShowStandaloneSignal(item.urgency, Boolean(territory));
              return (
                <div key={item.id} className={dominant ? "flex gap-5 py-7" : "flex gap-4 py-5"}>
                  <span className="mb-evidence shrink-0 pt-1" style={{ color: "var(--mb-stone-400)", fontSize: dominant ? 13 : 11 }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {showSignal ? (
                        <SignalMark status={urgencyTag[item.urgency]} size={dominant ? 22 : 16} pulse={item.urgency === "critique"} />
                      ) : null}
                      <span className="mb-evidence" style={{ color: glyphBorderColor[urgencyTag[item.urgency]] }}>{categoryLabel[item.category]}</span>
                      {item.dueAt && <span className="mb-evidence" style={{ color: "var(--mb-stone-400)" }}>· échéance {new Date(item.dueAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</span>}
                    </div>
                    {/* Identité territoriale en repère court (nom + région,
                        son propre glyphe) au-dessus du titre réel de la
                        priorité — jamais fusionnée avec lui, et jamais
                        répétée avec lui : displayTitle() retire le
                        suffixe "… · Cap Skirring" du titre affiché ici
                        puisque TerritoryIdentity porte déjà ce nom (§7). */}
                    {territory && (
                      <div className="mt-2"><TerritoryIdentity name={territory.name} region={territory.region} status={territory.activity} size="sm" /></div>
                    )}
                    <p className={dominant ? "mt-2 text-lg font-semibold tracking-tight" : "mt-1.5 text-sm font-semibold"}>{displayTitle(item.title, territory?.name)}</p>
                    <p className={dominant ? "mt-2 max-w-2xl text-sm leading-6 text-muted-foreground" : "mt-1 text-xs leading-5 text-muted-foreground"}>{item.why}</p>
                    <Button size={dominant ? "default" : "sm"} className="mt-3" asChild><Link href={item.href}>{item.ctaLabel} <ArrowRight size={14} /></Link></Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* XXL-RC1 (§3) — eyebrow "Votre travail" repassé en
          text-muted-foreground (comme "Ce que vous attendez"/"Ce qui a
          changé" juste en dessous, jamais en text-primary/terracotta) :
          la couleur d'accent reste réservée à "Vos priorités" seule —
          Top 3 reste la seule pièce centrale de la page, les registres
          secondaires ne se disputent plus la même emphase visuelle. */}
      {rest.length > 0 && (
        <section className="border-t pt-8">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Votre travail</p>
          <div className="mt-3 divide-y border-y">
            <CappedList items={rest} visibleCount={WORK_LIST_VISIBLE_COUNT} renderItem={(item) => <ItemRow key={item.id} item={item} />} />
          </div>
        </section>
      )}

      {view.waitingOnOthers.length > 0 && (
        <section className="border-t pt-8">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ce que vous attendez des autres</p>
          <div className="mt-3 space-y-1">
            <CappedList
              items={view.waitingOnOthers}
              visibleCount={WORK_LIST_VISIBLE_COUNT}
              renderItem={(item) => (
                <Link key={item.id} href={item.href} className="flex items-center justify-between gap-2 rounded-md px-2 py-2.5 text-xs hover:bg-accent">
                  <span><span className="font-semibold">{item.title}</span> — {item.detail}</span>
                  <ArrowRight size={13} className="shrink-0 text-muted-foreground" />
                </Link>
              )}
            />
          </div>
        </section>
      )}

      {/* XXL-R3 (§10) — "Changement ≠ tâche" : registre visuel délibérément
          plus calme que "Votre travail"/"Ce que vous attendez" (pas de
          chevron d'action, horodatage réel affiché — WorkdayChangeItem.at,
          déjà calculé par buildWorkdayView mais jamais montré jusqu'ici). */}
      {view.whatChanged.length > 0 && (
        <section className="border-t pt-8">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ce qui a changé</p>
          <div className="mt-3 space-y-3">
            {view.whatChanged.map((item) => (
              <Link key={item.id} href={item.href} className="block rounded-md px-2 py-2 hover:bg-accent">
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mb-evidence mt-0.5">{new Date(item.at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })} · {item.detail}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* §11 — raccourcis secondaires, 4 au maximum, jamais un module
          reconstruit ici. */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-8 text-xs font-semibold" style={{ borderColor: "var(--mb-hairline-soft)" }}>
        {secondaryShortcuts.map((shortcut) => (
          <Link key={shortcut.href} href={shortcut.href} className="text-muted-foreground hover:text-foreground">{shortcut.label} →</Link>
        ))}
      </div>

      <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
        <Info size={14} className="mt-0.5 shrink-0" />
        Cette page ne montre que ce qui vous concerne réellement — les autres situations, programmes et réseaux restent accessibles dans leurs espaces respectifs.
      </p>

      <Sheet open={signalOpen} onOpenChange={setSignalOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Signaler une situation</SheetTitle>
            <SheetDescription>Le signal reste déclaratif jusqu’à sa qualification.</SheetDescription>
          </SheetHeader>
          <CoordinatorSignalForm territories={state.territories} onDone={() => setSignalOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
