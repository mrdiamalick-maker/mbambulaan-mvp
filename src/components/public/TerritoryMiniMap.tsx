"use client";

// Mini-carte "Où sommes-nous ?" — Public V2, écran "05 Fiche territoire".
// Même fond de carte que AtlasMap (Esri World Light Gray Base), centré
// sur un seul territoire. Import dynamique de leaflet (jamais au niveau
// module) : voir AtlasMap.tsx pour le détail du problème SSR évité.
import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";

const TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
const TILE_ATTRIBUTION = "© Esri · OpenStreetMap";

export function TerritoryMiniMap({ lat, lon, name }: { lat: number; lon: number; name: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    import("leaflet").then(({ default: L }) => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current, { scrollWheelZoom: false, zoomControl: true }).setView([lat, lon], 10);
      L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 16 }).addTo(map);
      L.marker([lat, lon], {
        icon: L.divIcon({
          className: "pv2-atlas-marker",
          html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:#B6522F;border:2px solid #F7F3E9;box-shadow:0 1px 4px rgba(11,26,42,.4)"></span>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      })
        .addTo(map)
        .bindTooltip(name, { className: "mb-tip", direction: "top", offset: [0, -4] });
      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lon, name]);

  return <div ref={containerRef} role="img" aria-label={`Carte de localisation : ${name}`} className="pv2-atlas-map" style={{ position: "absolute", inset: 0 }} />;
}
