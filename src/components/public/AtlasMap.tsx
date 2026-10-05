"use client";

// Carte Atlas — Public V2, écrans "04 Atlas" et "05 Fiche territoire".
// Leaflet consommant les tuiles publiques Esri World Light Gray Base
// (aucune clé API), teintées en sépia pour s'accorder à la palette V2.
// Import dynamique (jamais au niveau module) : le module leaflet touche
// `window` à son chargement, ce qui casse le rendu serveur/statique de
// la page si l'import est statique, même dans un composant "use client".
import { useEffect, useRef } from "react";
import type { DivIcon, Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import type { Territory } from "@/data/public-v2-content";

const TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
const TILE_ATTRIBUTION = "© Esri · OpenStreetMap";

function markerIcon(L: typeof import("leaflet"), active: boolean): DivIcon {
  return L.divIcon({
    className: "pv2-atlas-marker",
    html: `<span style="display:block;width:${active ? 18 : 13}px;height:${active ? 18 : 13}px;border-radius:50%;background:${active ? "#B6522F" : "#0B1A2A"};border:2px solid #F7F3E9;box-shadow:0 1px 4px rgba(11,26,42,.4)"></span>`,
    iconSize: [active ? 18 : 13, active ? 18 : 13],
    iconAnchor: [active ? 9 : 6.5, active ? 9 : 6.5]
  });
}

export function AtlasMap({ territories, selectedSlug, onSelect }: { territories: Territory[]; selectedSlug: string | null; onSelect: (slug: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Map<string, LeafletMarker>>(new Map());
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;
    const markers = markersRef.current;

    import("leaflet").then(({ default: L }) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, { scrollWheelZoom: false, zoomControl: true }).setView([14.6, -16.6], 7);
      L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 16 }).addTo(map);
      mapRef.current = map;

      territories.forEach((t) => {
        const marker = L.marker([t.lat, t.lon], { icon: markerIcon(L, t.slug === selectedSlug) })
          .addTo(map)
          .bindTooltip(t.name, { className: "mb-tip", direction: "top", offset: [0, -4] })
          .on("click", () => onSelectRef.current(t.slug));
        markers.set(t.slug, marker);
      });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markers.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- la carte n'est (re)créée qu'au montage ; selectedSlug est géré par l'effet suivant
  }, [territories]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    import("leaflet").then(({ default: L }) => {
      markersRef.current.forEach((marker, slug) => marker.setIcon(markerIcon(L, slug === selectedSlug)));
      if (selectedSlug) {
        const t = territories.find((item) => item.slug === selectedSlug);
        if (t) map.flyTo([t.lat, t.lon], 9, { duration: 0.6 });
      } else {
        map.flyTo([14.6, -16.6], 7, { duration: 0.6 });
      }
    });
  }, [selectedSlug, territories]);

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Carte des territoires maritimes"
      className="pv2-atlas-map"
      style={{ position: "absolute", inset: 0 }}
    />
  );
}
