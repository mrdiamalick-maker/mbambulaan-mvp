// Magic UI — Dotted Map (sourcé via github.com/magicuidesign/magicui, voir
// number-ticker.tsx). Validé par le CEO pour illustrer le littoral et les
// territoires actifs. Cohérent avec D6 (PRODUCT_DECISION_LOG.md) : c'est
// une illustration abstraite par points, pas un fond de carte géographique
// réel — aucune précision de projection ou de tracé n'est impliquée, donc
// aucun risque de fausse précision (§2.6 du spec maître).
import * as React from "react";
import { createMap } from "svg-dotted-map";
import { cn } from "@/lib/utils";

export interface Marker {
  lat: number;
  lng: number;
  size?: number;
  pulse?: boolean;
  /** Couleur propre à ce marqueur — sinon `markerColor` (global) s'applique.
      Ajouté pour distinguer visuellement plusieurs statuts (ex. territoires
      stable/vigilance/critique) sur une même carte sans rendu custom complet. */
  color?: string;
}

type MapMarker<M extends Marker> = Omit<M, "lat" | "lng"> & { x: number; y: number };

export interface DottedMapRegion {
  lat: { min: number; max: number };
  lng: { min: number; max: number };
}

export interface DottedMapProps<M extends Marker = Marker> extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  mapSamples?: number;
  /** Codes pays ISO3 (ex. ["SEN"]) : recadre la carte sur leur emprise
      plutôt que le monde entier — c'est ce qui permet une illustration du
      littoral sénégalais plutôt qu'un point minuscule sur un planisphère. */
  countries?: string[];
  /** À fournir dès que `countries` est utilisé : svg-dotted-map@2.1.0 a un
      bug connu (`createMap` appelle sa fonction de bounding-box récursive
      sur chaque Feature individuelle, pas seulement la FeatureCollection,
      ce qui lève systématiquement "Unknown or unsupported geojson
      structure") si aucune `region` explicite n'est passée en même temps
      que `countries`. Fournir `region` contourne ce chemin de code cassé. */
  region?: DottedMapRegion;
  markers?: M[];
  dotColor?: string;
  markerColor?: string;
  dotRadius?: number;
  stagger?: boolean;
  pulse?: boolean;
  renderMarkerOverlay?: (args: { marker: MapMarker<M>; index: number; x: number; y: number; r: number }) => React.ReactNode;
  /** Rend chaque marqueur cliquable (zone de clic élargie, invisible, pour
      rester utilisable malgré le petit rayon des points). */
  onMarkerClick?: (marker: MapMarker<M>) => void;
}

export function DottedMap<M extends Marker = Marker>({
  width = 150,
  height = 75,
  mapSamples = 5000,
  countries,
  region,
  markers = [],
  dotColor = "currentColor",
  markerColor = "#FF6900",
  dotRadius = 0.2,
  stagger = true,
  pulse = false,
  renderMarkerOverlay,
  onMarkerClick,
  className,
  style,
  ...svgProps
}: DottedMapProps<M>) {
  const { points, addMarkers } = createMap({ width, height, mapSamples, countries, region });
  const processedMarkers = addMarkers(markers);

  const { xStep, yToRowIndex } = React.useMemo(() => {
    const sorted = [...points].sort((a, b) => a.y - b.y || a.x - b.x);
    const rowMap = new Map<number, number>();
    let step = 0;
    let prevY = Number.NaN;
    let prevXInRow = Number.NaN;

    for (const p of sorted) {
      if (p.y !== prevY) {
        prevY = p.y;
        prevXInRow = Number.NaN;
        if (!rowMap.has(p.y)) rowMap.set(p.y, rowMap.size);
      }
      if (!Number.isNaN(prevXInRow)) {
        const delta = p.x - prevXInRow;
        if (delta > 0) step = step === 0 ? delta : Math.min(step, delta);
      }
      prevXInRow = p.x;
    }

    return { xStep: step || 1, yToRowIndex: rowMap };
  }, [points]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("text-gray-500 dark:text-gray-500", className)}
      style={{ width: "100%", height: "100%", ...style }}
      {...svgProps}
    >
      {points.map((point, index) => {
        const rowIndex = yToRowIndex.get(point.y) ?? 0;
        const offsetX = stagger && rowIndex % 2 === 1 ? xStep / 2 : 0;
        return <circle cx={point.x + offsetX} cy={point.y} r={dotRadius} fill={dotColor} key={`${point.x}-${point.y}-${index}`} />;
      })}

      {processedMarkers.map((marker, index) => {
        const rowIndex = yToRowIndex.get(marker.y) ?? 0;
        const offsetX = stagger && rowIndex % 2 === 1 ? xStep / 2 : 0;
        const x = marker.x + offsetX;
        const y = marker.y;
        const r = marker.size ?? dotRadius;
        const shouldPulse = pulse ? marker.pulse !== false : marker.pulse === true;
        const pulseTo = r * 2.8;

        const fill = marker.color ?? markerColor;
        const clickable = Boolean(onMarkerClick);

        return (
          <g
            key={`${marker.x}-${marker.y}-${index}`}
            onClick={clickable ? () => onMarkerClick?.({ ...marker, x, y }) : undefined}
            style={clickable ? { cursor: "pointer" } : undefined}
          >
            {clickable && <circle cx={x} cy={y} r={Math.max(r * 2.2, 2.4)} fill="transparent" />}
            <circle cx={x} cy={y} r={r} fill={fill} />
            {shouldPulse ? (
              <g pointerEvents="none">
                <circle cx={x} cy={y} r={r} fill="none" stroke={fill} strokeOpacity={1} strokeWidth={0.35}>
                  <animate attributeName="r" values={`${r};${pulseTo}`} dur="1.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0" dur="1.4s" repeatCount="indefinite" />
                </circle>
                <circle cx={x} cy={y} r={r} fill="none" stroke={fill} strokeOpacity={0.9} strokeWidth={0.3}>
                  <animate attributeName="r" values={`${r};${pulseTo}`} dur="1.4s" begin="0.7s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0" dur="1.4s" begin="0.7s" repeatCount="indefinite" />
                </circle>
              </g>
            ) : null}
            {renderMarkerOverlay?.({ marker: { ...marker, x, y }, index, x, y, r })}
          </g>
        );
      })}
    </svg>
  );
}
