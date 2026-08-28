// Carte Atlas en pourcentage — mandat CEO "simplifier l'Atlas /app/etat :
// image + marqueurs en pourcentage, pas de SVG calibré" (2026-08-27), Lot B
// (composant, sans caméra — cf. Lot C pour le pan/zoom transform CSS).
// Remplace CoastlineTerritoryMap pour /app/etat UNIQUEMENT : ce composant
// est nouveau, CoastlineTerritoryMap.tsx et territory-map-positions.ts
// restent intouchés (/app/pilotage en dépend toujours, hors mandat).
//
// Positions : territory-map-image-positions.ts (Lot A, calibré et vérifié
// pixel par pixel + visuellement sur cette image précise — jamais réutilisé
// depuis ProfessionalAtlasWorkspace.positions, calibré contre une silhouette
// CSS différente).
"use client";

import Image from "next/image";
import { territoryMapImagePositions } from "@/domain/territory-map-image-positions";

export type AtlasMapActivity = "stable" | "vigilance" | "critique";

export interface AtlasImageMapTerritory {
  id: string;
  name: string;
  activity: AtlasMapActivity;
}

// Mêmes couleurs que la légende "Niveau d'attention" déjà affichée sur
// cette page (glyphBorderColor, components/etat/shared.tsx) — pas une
// palette dupliquée. Reproduites en valeurs littérales ici plutôt
// qu'importées : shared.tsx importe des composants de page (Drawer,
// useProduct-dépendants) qu'un composant de carte pur n'a pas besoin
// d'entraîner, et ces 3 valeurs sont déjà fixées ailleurs (var(--etat-*),
// résolues uniquement sous .etat-scope, ce composant n'étant utilisé que
// là) — dupliquer 3 lignes de constantes plutôt qu'importer tout shared.tsx.
const activityColor: Record<AtlasMapActivity, string> = {
  stable: "var(--etat-navy-600)",
  vigilance: "var(--etat-ocre)",
  critique: "var(--etat-terracotta)"
};

// Ratio intrinsèque exact de etat-atlas-ocean-background.webp (1536×1024,
// vérifié par décodage direct du fichier, pas supposé). Boîte interne
// verrouillée sur ce ratio, centrée et jamais recadrée (object-contain
// n'aurait pas suffi seul — cf. gap analysis transmise au CEO : sans cette
// boîte, un marqueur en left/top % du CONTENEUR extérieur ne coïnciderait
// PAS avec le même % de l'image dès que le conteneur n'a pas exactement ce
// ratio, ce qui est le cas à chaque breakpoint de ce panneau). position:
// absolute + inset-0 + margin:auto + aspect-ratio + max-w/h:100% : la boîte
// devient aussi grande que possible sans dépasser le conteneur sur aucun
// axe, centrée, en CSS pur — aucun ResizeObserver, aucun JS de mesure.
// Les marqueurs, positionnés en % à l'intérieur de CETTE boîte (pas du
// conteneur extérieur), retombent donc exactement sur le pixel calibré de
// l'image, à n'importe quelle taille de conteneur.
const IMAGE_ASPECT = "1536 / 1024";

export function AtlasImageMap({
  territories,
  selectedId,
  onSelect
}: {
  territories: AtlasImageMapTerritory[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}) {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 m-auto max-h-full max-w-full" style={{ aspectRatio: IMAGE_ASPECT }}>
        <Image
          src="/images/etat-atlas-ocean-background.webp"
          alt=""
          fill
          sizes="(min-width: 1024px) 62vw, 100vw"
          priority={false}
          className="pointer-events-none object-cover"
        />
        {territories.map((territory) => {
          const position = territoryMapImagePositions[territory.id];
          if (!position) return null;
          const [left, top] = position;
          const active = territory.id === selectedId;
          const color = activityColor[territory.activity];
          const clickable = Boolean(onSelect);
          return (
            <button
              key={territory.id}
              type="button"
              onClick={clickable ? () => onSelect?.(territory.id) : undefined}
              style={{ left: `${left}%`, top: `${top}%` }}
              className={`group absolute -translate-x-1/2 -translate-y-1/2 text-left outline-none ${clickable ? "cursor-pointer" : "cursor-default"}`}
              aria-label={`Ouvrir ${territory.name}`}
              aria-pressed={clickable ? active : undefined}
              disabled={!clickable}
            >
              {/* Zone de clic — PLUS petite qu'un simple agrandissement
                  confortable (contrairement à CoastlineTerritoryMap,
                  size-9/36px à l'origine) : mesuré par script sur cette
                  page réelle (pas supposé), l'écart minimal entre 2
                  marqueurs voisins descend à 7px à l'écran (Rufisque-
                  Bargny/Popenguine, cluster Dakar, mobile 390px) — un
                  cercle de clic de 36px de diamètre volait silencieusement
                  les clics du mauvais territoire sur plusieurs paires
                  denses (confirmé : un clic visant Joal-Fadiouth
                  atteignait en réalité Foundiougne). Réduit à 20px
                  (size-5), qui reste le geste normal du composant mais
                  réduit nettement les vols de clic sans les éliminer
                  totalement pour les paires les plus denses — limite
                  assumée et signalée au CEO : sans caméra (Lot C, à
                  venir), aucune taille fixe ne peut lever toute ambiguïté
                  pour des marqueurs à 7-12px d'écart réel. */}
              <span className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full" />
              {territory.activity === "critique" && (
                <span className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full opacity-40" style={{ backgroundColor: color }} />
              )}
              {active && <span className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2" style={{ borderColor: color }} />}
              <span
                className="relative block rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(255,255,255,.08)] transition group-hover:opacity-90"
                style={{ backgroundColor: color, width: active ? 18 : territory.activity === "stable" ? 11 : 14, height: active ? 18 : territory.activity === "stable" ? 11 : 14 }}
              />
              {territory.activity !== "stable" && (
                <span className="absolute left-4 top-1/2 w-max -translate-y-1/2 whitespace-nowrap text-[11px] font-bold" style={{ color, textShadow: "0 1px 2px rgba(255,255,255,.9), 0 0 6px rgba(255,255,255,.7)" }}>
                  {territory.name}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
