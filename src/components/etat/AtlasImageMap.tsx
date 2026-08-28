// Carte Atlas en pourcentage — mandat CEO "simplifier l'Atlas /app/etat :
// image + marqueurs en pourcentage, pas de SVG calibré" (2026-08-27).
// Remplace CoastlineTerritoryMap pour /app/etat UNIQUEMENT : ce composant
// est nouveau, CoastlineTerritoryMap.tsx et territory-map-positions.ts
// restent intouchés (/app/pilotage en dépend toujours, hors mandat).
//
// Positions : territory-map-image-positions.ts (Lot A, calibré et vérifié
// pixel par pixel + visuellement sur cette image précise — jamais réutilisé
// depuis ProfessionalAtlasWorkspace.positions, calibré contre une silhouette
// CSS différente).
//
// Caméra (Lot C) : transform CSS scale()/translate(), pas de viewBox SVG à
// synchroniser — cf. correctif "l'image de fond ne suit pas la caméra"
// (2026-08-27) et diagnostic transmis au CEO sur le désalignement structurel
// que ce changement de fond élimine. Architecture à deux couches, approuvée
// par le CEO avant implémentation : l'image reçoit la transform CSS,
// les marqueurs sont positionnés INDÉPENDAMMENT (même état de caméra,
// recalculé pour chaque marqueur, jamais un transform hérité) pour garder
// une taille CSS constante — évite de reproduire le bug de labels/points
// qui grossissent au zoom, déjà rencontré et corrigé une fois côté SVG
// (CoastlineTerritoryMap.scale()).
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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

// BASE_ZOOM_SCALE — recalibré (correctif CEO, "Hann invisible par défaut,
// cadrage trop resserré", 2026-08-28) après un premier calibrage (S=5) qui
// s'est révélé insuffisant : calibré uniquement contre la séparation au
// clic (l'écart minimal mesuré, 7,2px, cf. historique), sans le recroiser
// avec l'exigence de CONTEXTE de l'ancienne caméra SVG ("jamais un
// territoire isolé seul dans le cadre... 3 à 9 voisins immédiats",
// REGIONAL_WINDOW_HALF_HEIGHT). Vérifié précisément (pas supposé) :
// à S=5, depuis N'IMPORTE quel territoire ciblé, 13 à 17 des 17 autres
// tombaient hors du cadre visible (overflow-hidden) — un problème
// systémique, pas propre à un territoire. S=2 restaure EXACTEMENT le
// critère déjà validé de l'ancien système (script de calibrage : à S=2,
// chaque territoire garde entre 3 et 10 voisins visibles, moyenne 7,9 —
// correspond à "3 à 9 voisins"), pas une nouvelle valeur approximée.
// Coût assumé : la paire la plus dense (7,2px non zoomée) ne descend
// plus qu'à ~14,4px à l'échelle par défaut, sous les 20px de la zone de
// clic — la boucle "clic → zoom manuel → clic corrigé", déjà vérifiée
// fonctionnelle au Lot C, reste le filet de sécurité pour ce cas,
// désormais sollicitée dès l'état par défaut sur les paires les plus
// denses plutôt qu'en cas isolé.
const BASE_ZOOM_SCALE = 2;

// zoomFactor : même sémantique que l'ancienne caméra SVG (0,4 = le plus
// resserré, 2,2 = le plus large) — division plutôt que multiplication
// puisque l'ancien système appliquait le facteur à la TAILLE de la
// fenêtre (petit facteur = fenêtre plus petite = zoom avant), alors que
// celui-ci l'applique à une ÉCHELLE (petit facteur = échelle plus grande
// = zoom avant) : effet identique côté utilisateur, formule inversée en
// conséquence du changement de représentation (fenêtre → échelle).
function cameraFor(targetId: string | null | undefined, zoomFactor: number): { cx: number; cy: number; scale: number } {
  if (!targetId) return { cx: 50, cy: 50, scale: 1 };
  const position = territoryMapImagePositions[targetId];
  if (!position) return { cx: 50, cy: 50, scale: 1 };
  const [cx, cy] = position;
  return { cx, cy, scale: BASE_ZOOM_SCALE / zoomFactor };
}

// Interpolation JS (requestAnimationFrame) — même technique et mêmes
// réglages que l'ancienne useAnimatedViewBox (rAF, easing ease-out
// cubique, ~420ms), adaptée pour interpoler {cx, cy, scale} au lieu des
// 4 nombres d'un viewBox SVG. Reprise du même principe, pas une nouvelle
// interpolation inventée : le CEO a explicitement demandé de garder
// requestAnimationFrame plutôt qu'une transition CSS native pour ce
// premier lot caméra CSS, "ne pas cumuler les risques" (changement
// d'architecture + nouveau mécanisme d'animation en même temps).
function useAnimatedCamera(target: { cx: number; cy: number; scale: number }, durationMs = 420) {
  const [current, setCurrent] = useState(target);
  const frameRef = useRef<number | null>(null);
  useEffect(() => {
    const from = current;
    const to = target;
    if (from.cx === to.cx && from.cy === to.cy && from.scale === to.scale) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setCurrent({
        cx: from.cx + (to.cx - from.cx) * eased,
        cy: from.cy + (to.cy - from.cy) * eased,
        scale: from.scale + (to.scale - from.scale) * eased
      });
      if (elapsed < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.cx, target.cy, target.scale]);
  return current;
}

export function AtlasImageMap({
  territories,
  selectedId,
  onSelect,
  cameraTargetId,
  zoomFactor = 1
}: {
  territories: AtlasImageMapTerritory[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  // Additifs, défaut = vue nationale figée (cameraTargetId absent ⇒
  // {cx:50, cy:50, scale:1}, identité) : un appelant qui ne les passe
  // pas obtient exactement le comportement du Lot B.
  cameraTargetId?: string | null;
  zoomFactor?: number;
}) {
  const targetCamera = cameraFor(cameraTargetId, zoomFactor);
  const { cx, cy, scale } = useAnimatedCamera(targetCamera);

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 m-auto max-h-full max-w-full overflow-hidden" style={{ aspectRatio: IMAGE_ASPECT }}>
        {/* Couche image — reçoit la transform CSS. translate() en % est
            résolu contre la boîte D'ORIGINE de cet élément (pas affecté
            par son propre scale()), combiné à transformOrigin={cx,cy} :
            recette standard "zoom vers un point" (translate appliqué
            dans l'espace déjà mis à l'échelle par la composition des
            fonctions transform, lues de droite à gauche). Même formule
            que l'historique territoryZoomStyle (mini-cartes du carrousel
            "Où concentrer l'attention", retiré, retrouvé dans l'historique
            git à la demande du CEO — "réutiliser plutôt que réinventer"),
            adaptée : ici cx/cy viennent directement de
            territoryMapImagePositions (déjà en %), plus besoin de
            convertir depuis un viewBox SVG comme le faisait l'original. */}
        <div
          className="absolute inset-0"
          style={{ transform: `translate(${50 - cx}%, ${50 - cy}%) scale(${scale})`, transformOrigin: `${cx}% ${cy}%` }}
        >
          <Image
            src="/images/etat-atlas-ocean-background.webp"
            alt=""
            fill
            sizes="(min-width: 1024px) 62vw, 100vw"
            priority={false}
            className="pointer-events-none object-cover"
          />
        </div>
        {territories.map((territory) => {
          const position = territoryMapImagePositions[territory.id];
          if (!position) return null;
          const [px, py] = position;
          // Couche marqueurs — PAS d'transform héritée de l'image :
          // chaque position est recalculée depuis {cx, cy, scale}, la
          // MÊME homothétie que celle appliquée à l'image (formule
          // dérivée directement de translate+scale+transform-origin
          // ci-dessus : un point (px,py) devient (50+(px-cx)*scale,
          // 50+(py-cy)*scale) dans le référentiel de la boîte), mais la
          // TAILLE du marqueur (span, dot, texte) reste en pixels CSS
          // fixes, non affectée par scale — c'est ce qui garde les points
          // et libellés à taille constante au zoom (architecture à deux
          // couches approuvée par le CEO), sans quoi ils grossiraient
          // avec l'image comme le ferait un enfant transformé hérité.
          const left = 50 + (px - cx) * scale;
          const top = 50 + (py - cy) * scale;
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
                  Bargny/Popenguine, cluster Dakar, mobile 390px, à
                  l'échelle 1 — sans caméra). Réduit à 20px (size-5).
                  Depuis ce lot, la caméra (BASE_ZOOM_SCALE ci-dessus)
                  résout ce chevauchement une fois un territoire de ce
                  cluster ciblé — vérifié empiriquement, pas supposé. */}
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
