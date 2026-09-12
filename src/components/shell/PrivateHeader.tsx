"use client";

import { useEffect, useState } from "react";
import { Bell, LogOut, PlayCircle, RotateCcw } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePresentationGuide } from "@/components/providers/PresentationGuideProvider";
import { spaceIdentityLabel, type PrivateSpace } from "@/domain/platform/private-nav";
import { dataSourceSummary } from "@/domain/data-sources";
import type { ProductState } from "@/domain/types";
import { GlobalSearch } from "@/components/shell/GlobalSearch";
import { useEtatPreview, type EtatPeriod, type EtatPreviewRole } from "@/components/providers/EtatPreviewProvider";
import { deriveDatasetReferenceAt } from "@/domain/signal-crossing";

const PERIOD_OPTIONS: Array<{ key: EtatPeriod; label: string }> = [
  { key: "30j", label: "30 jours" },
  { key: "90j", label: "90 jours" },
  { key: "12m", label: "12 mois" }
];
const ROLE_OPTIONS: Array<{ key: EtatPreviewRole; label: string }> = [
  { key: "ministre", label: "Ministre" },
  { key: "direction_programme", label: "Direction de programme" },
  { key: "coordination_territoriale", label: "Coordination territoriale" }
];

// EtatPeriodControls / EtatRoleControls (LOT V3.29, "Header — copie
// conforme littérale") — les 2 contrôles de la maquette jamais reproduits
// jusqu'ici : le bandeau période (qui filtre réellement "sur la période"
// côté Atlas territorial, LOT V3.28) et le sélecteur "Rôle connecté" (qui
// réordonne réellement le menu État, PrivateSidebar — jamais un
// changement de rôle réel, cf. EtatPreviewProvider). N'apparaissent que
// pour l'Espace État (le contexte est absent en Coordination, cf.
// PrivateShell) — séparés en 2 composants pour reprendre la même
// disposition que la maquette (période à gauche, à côté de la recherche ;
// rôle à droite, après l'espaceur flexible).
function EtatPeriodControls({ state }: { state: ProductState | null }) {
  const preview = useEtatPreview();
  if (!preview || !state) return null;
  const endMs = (() => {
    const at = deriveDatasetReferenceAt(state);
    return at ? new Date(at).getTime() : Date.now();
  })();
  const startMs = endMs - preview.periodDays * 86_400_000;
  const startLabel = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" }).format(new Date(startMs));
  const endLabel = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(endMs));

  return (
    <>
      <div className="hidden items-center overflow-hidden rounded-[4px] border xl:flex" style={{ borderColor: "rgba(11,26,42,.16)" }}>
        {PERIOD_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => preview.setPeriod(option.key)}
            className="whitespace-nowrap px-[13px] py-[7px] text-[11.5px] font-medium transition"
            style={preview.period === option.key ? { background: "var(--etat-navy, #0b1a2a)", color: "#F7F3E9" } : { background: "transparent", color: "rgba(11,26,42,.66)" }}
          >
            {option.label}
          </button>
        ))}
      </div>
      <span className="hidden whitespace-nowrap text-[11.5px] xl:inline" style={{ color: "rgba(11,26,42,.5)" }}>{startLabel} → {endLabel}</span>
    </>
  );
}

function EtatRoleControls() {
  const preview = useEtatPreview();
  if (!preview) return null;
  return (
    <span className="hidden items-center gap-[7px] min-[1700px]:flex">
      <span className="whitespace-nowrap text-[10px] uppercase tracking-[.14em]" style={{ color: "rgba(11,26,42,.42)" }}>Rôle connecté</span>
      <span className="flex items-center overflow-hidden rounded-[4px] border" style={{ borderColor: "rgba(11,26,42,.16)" }}>
        {ROLE_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => preview.setPreviewRole(option.key)}
            className="whitespace-nowrap px-3 py-[7px] text-[11.5px] font-medium transition"
            style={preview.previewRole === option.key ? { background: "var(--etat-navy, #0b1a2a)", color: "#F7F3E9" } : { background: "transparent", color: "rgba(11,26,42,.66)" }}
          >
            {option.label}
          </button>
        ))}
      </span>
    </span>
  );
}

function initials(name?: string) {
  if (!name) return "MB";
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

// LOT V3.1 (Scope A/G) — en-tête UNIQUE pour tout l'espace privé (contenu
// réel : historique complet dans le commentaire précédent, conservé en
// LOT V3.8 ci-dessous).
//
// LOT V3.8 ("Shell pixel-fidelity") — reprend la géométrie exacte de la
// maquette (barre 60px, recherche + bandeau "mode démo" séparé en
// dessous) au lieu de l'en-tête shadcn générique hérité de V3.1. Les
// affordances réelles de V3.1 (Présentation guidée, réinitialisation
// démo, cloche, compte) n'ont pas d'équivalent dans la maquette — jamais
// supprimées pour autant (ce seraient de vraies régressions de capacité) :
// regroupées à droite, avec le même poids visuel discret que le reste de
// la barre. La recherche (GlobalSearch, réelle — cf. son propre en-tête
// de commentaire) et le bandeau "sources connectées" (réel, LOT V3.7
// dataSourceSummary) remplacent les éléments de la maquette qui, eux,
// n'avaient aucune capacité réelle derrière avant ce lot.
export function PrivateHeader({
  space,
  state,
  title,
  subtitle,
  actorName,
  unread,
  persistence,
  onReset,
  onLogout,
  error,
  showLoading
}: {
  space: PrivateSpace;
  state: ProductState | null;
  title?: string;
  subtitle?: string;
  actorName?: string;
  unread: number;
  persistence: string;
  onReset?: () => void;
  onLogout: () => void;
  error: string;
  showLoading: boolean;
}) {
  const { start } = usePresentationGuide();
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  useEffect(() => {
    if (!showLoading && !lastRefreshedAt) setLastRefreshedAt(new Date());
  }, [showLoading, lastRefreshedAt]);

  const isDemo = persistence !== "postgresql";
  const sourceSummary = space === "etat" && state ? dataSourceSummary(state) : null;

  return (
    <>
      <header
        className="flex shrink-0 items-center gap-[18px] px-[18px] lg:px-[30px]"
        style={{ height: 60, borderBottom: "1px solid rgba(11,26,42,.12)", position: "sticky", top: 0, zIndex: 40, background: "#FFFFFF" }}
      >
        {/* Bascule mobile/desktop du rail (tiroir sous 768px, collapse
            icône au-dessus) — capacité réelle de V3.1, sans équivalent
            dans la maquette (mockup desktop fixe) : jamais retirée, sinon
            aucun moyen d'ouvrir la navigation sous 768px. */}
        <SidebarTrigger className="-ml-1 shrink-0" />
        {/* Recherche masquée en dessous de lg (1024px) — la maquette est un
            gabarit desktop fixe (min-width:1360px dans son propre CSS,
            jamais pensé responsive) ; en dessous, la largeur fixe de 250px
            ferait déborder l'en-tête (trouvé en QA réelle à 1024/768/390),
            ce que le mandat "aucun débordement horizontal" de chaque lot
            précédent interdit. */}
        {state && (
          <div className="hidden lg:block">
            <GlobalSearch state={state} space={space} />
          </div>
        )}
        {space === "etat" && <EtatPeriodControls state={state} />}
        {(title || subtitle) && (
          <div className="hidden min-w-0 sm:block">
            {title && <p className="truncate text-[13px] font-semibold" style={{ color: "var(--etat-navy, #0b1a2a)" }}>{title}</p>}
            {subtitle && <p className="truncate text-[11px]" style={{ color: "rgba(11,26,42,.5)" }}>{subtitle}</p>}
          </div>
        )}

        <div className="flex-1" />

        {space === "etat" && <EtatRoleControls />}

        {/* Affordances réelles sans équivalent maquette (V3.1) — regroupées
            ici, poids visuel discret (12px, encre à 60-70 %) pour rester
            cohérent avec le reste de la barre plutôt qu'imposer le style
            shadcn par défaut. */}
        <div className="flex flex-none items-center gap-[6px]">
          {/* Libellés textuels resserrés à icône + info-bulle (LOT V3.29) —
              le sélecteur de rôle et le bandeau période de la maquette
              (jamais montrés avant ce lot) ont besoin de la place que ces
              2 libellés occupaient. L'icône seule (avec aria-label/title,
              capacité inchangée) suffit à rester utilisable, jamais une
              capacité retirée — seulement un texte de confort qui cède la
              place au contenu littéral de la maquette plutôt que de
              provoquer un débordement horizontal. Le remontage de "MAJ
              aujourd'hui" en <time> avec title reste équivalent en
              information (survolable), jamais une donnée supprimée. */}
          {lastRefreshedAt && (
            <time
              className="hidden shrink-0 min-[2200px]:inline"
              style={{ fontSize: 11.5, color: "rgba(11,26,42,.5)" }}
              title={`Mis à jour aujourd’hui à ${lastRefreshedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`}
            >
              MAJ aujourd’hui {lastRefreshedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </time>
          )}
          <Button variant="ghost" size="sm" className="hidden gap-1.5 text-[12.5px] sm:inline-flex" onClick={start} aria-label="Présentation guidée" title="Présentation guidée">
            <PlayCircle size={15} /> <span className="hidden min-[2200px]:inline">Présentation guidée</span>
          </Button>
          {onReset && (
            <Button variant="ghost" size="icon" onClick={onReset} title="Réinitialiser la démonstration" aria-label="Réinitialiser la démonstration">
              <RotateCcw size={16} />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="relative" aria-label={`${unread} notification(s) non lue(s)`}>
            <Bell size={16} />
            {unread > 0 && <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full border-2 border-background bg-destructive text-[9px] font-bold text-white">{unread}</span>}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="size-7">
                  <AvatarFallback className="text-[11px]">{initials(actorName)}</AvatarFallback>
                </Avatar>
                <span className="hidden flex-col items-start leading-tight sm:flex">
                  <span className="text-[12.5px] font-medium">{actorName}</span>
                  <span className="text-[9.5px] font-semibold uppercase tracking-[.1em]" style={{ color: "rgba(11,26,42,.45)" }}>{spaceIdentityLabel(space)}</span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{actorName ?? "Mon compte"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} variant="destructive">
                <LogOut /> Quitter l’espace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Bandeau "mode démo" — structure et typographie de la maquette
          (barre fine, séparateurs verticaux) ; le seul segment de la
          maquette réellement reproductible tel quel est celui de droite
          ("N sources connectées sur 6 envisagées"), maintenant réel
          depuis LOT V3.7 (dataSourceRegistry). Les deux autres segments
          de la maquette (roleNote fixe, propre à sa fixture) sont
          remplacés par l'identité réelle de session — jamais un texte
          fabriqué pour "remplir" la barre. */}
      {!showLoading && (
        <div
          className="flex flex-wrap items-center gap-[14px] px-[18px] py-[9px] text-[11.5px] lg:px-[30px]"
          style={{ background: "rgba(11,26,42,.04)", borderBottom: "1px solid rgba(11,26,42,.08)", color: "rgba(11,26,42,.6)" }}
        >
          <span className="flex items-center gap-[7px]">
            <span className="size-[6px] rounded-full" style={{ background: isDemo ? "#4E7B5A" : "var(--etat-critique, #c8452b)" }} />
            {isDemo ? "Données de démonstration — structure réelle, valeurs illustratives" : "Base de production"}
          </span>
          <span className="hidden h-3 w-px sm:block" style={{ background: "rgba(11,26,42,.15)" }} />
          <span className="hidden sm:inline">{actorName ? `${actorName} · ${spaceIdentityLabel(space)}` : spaceIdentityLabel(space)}</span>
          <span className="flex-1" />
          {sourceSummary && (
            <span>{sourceSummary.connectedCount} source{sourceSummary.connectedCount > 1 ? "s" : ""} connectée{sourceSummary.connectedCount > 1 ? "s" : ""} sur {sourceSummary.totalCount} envisagée{sourceSummary.totalCount > 1 ? "s" : ""}</span>
          )}
        </div>
      )}

      {error && (
        <div role="alert" className="border-b border-destructive/20 bg-destructive/10 px-5 py-3 text-sm font-semibold text-destructive">
          {error}
        </div>
      )}
    </>
  );
}
