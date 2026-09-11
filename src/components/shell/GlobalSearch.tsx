"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { PrivateSpace } from "@/domain/platform/private-nav";
import type { ProductState } from "@/domain/types";

// LOT V3.8 ("Shell pixel-fidelity") — la maquette Claude Design affiche une
// recherche globale dans l'en-tête ("Territoire, situation, programme…")
// qu'aucune fonctionnalité réelle ne portait avant ce lot (vérifié : aucun
// composant GlobalSearch/CommandDialog nulle part dans le produit, aucune
// page privée ne lit de paramètre de recherche). Reproduire seulement le
// visuel (un champ qui ne fait rien) aurait fabriqué une capacité — à
// l'exact opposé de la discipline du produit. Ce composant est donc une
// VRAIE recherche, mais volontairement bornée à ce qu'aucune infrastructure
// nouvelle ne doit être inventée pour livrer honnêtement : correspondance
// texte sur les entités déjà chargées dans ProductState (situations,
// programmes, territoires), qui mène vers la VRAIE liste qui les contient
// (aucune page privée ne supporte aujourd'hui de lien profond vers UN
// enregistrement précis par paramètre d'URL — vérifié par lecture directe
// des 3 pages concernées — donc ce composant n'en simule pas un).
interface SearchHit {
  key: string;
  kind: "Situation" | "Programme" | "Territoire";
  label: string;
  href: string;
}

function buildIndex(state: ProductState, space: PrivateSpace): SearchHit[] {
  const situationsHref = space === "etat" ? "/app/etat/situations" : "/app/situations";
  const programmesHref = space === "etat" ? "/app/etat/programmes" : "/app/initiatives";
  const territoiresHref = space === "etat" ? "/app/etat/territoires" : "/app/atlas";
  return [
    ...state.situations.map((item) => ({ key: `sit-${item.id}`, kind: "Situation" as const, label: item.title, href: situationsHref })),
    ...state.initiatives.map((item) => ({ key: `prog-${item.id}`, kind: "Programme" as const, label: item.title, href: programmesHref })),
    ...state.territories.map((item) => ({ key: `terr-${item.id}`, kind: "Territoire" as const, label: item.name, href: territoiresHref }))
  ];
}

export function GlobalSearch({ state, space }: { state: ProductState; space: PrivateSpace }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const index = useMemo(() => buildIndex(state, space), [state, space]);
  const normalized = query.trim().toLowerCase();
  const hits = normalized === "" ? [] : index.filter((item) => item.label.toLowerCase().includes(normalized)).slice(0, 8);

  function go(hit: SearchHit) {
    router.push(hit.href);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative flex-none">
      <div
        className="flex w-[250px] items-center gap-[9px] overflow-hidden rounded-[4px] border px-[10px] py-[7px]"
        style={{ borderColor: "rgba(11,26,42,.16)", background: "var(--etat-cream)" }}
      >
        <Search size={13} className="shrink-0" style={{ color: "rgba(11,26,42,.4)" }} />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && hits[0]) go(hits[0]);
            if (event.key === "Escape") setOpen(false);
          }}
          placeholder="Territoire, situation, programme…"
          className="w-full bg-transparent text-[12px] outline-none"
          style={{ color: "var(--etat-navy)" }}
        />
      </div>
      {open && normalized !== "" && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-[320px] rounded-[4px] border bg-white py-1 shadow-lg" style={{ borderColor: "rgba(11,26,42,.14)" }}>
          {hits.length === 0 ? (
            <p className="px-3 py-2.5 text-[12px]" style={{ color: "var(--etat-stone-400)" }}>Aucun résultat pour « {query} ».</p>
          ) : (
            hits.map((hit) => (
              // onMouseDown (pas onClick) pour agir avant le onBlur du champ.
              <button
                key={hit.key}
                onMouseDown={(event) => {
                  event.preventDefault();
                  go(hit);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-[var(--etat-offwhite-dim)]"
              >
                <span className="shrink-0 text-[9.5px] font-semibold uppercase tracking-[.08em]" style={{ color: "var(--etat-terracotta)" }}>{hit.kind}</span>
                <span className="min-w-0 flex-1 truncate text-[12.5px]" style={{ color: "var(--etat-navy)" }}>{hit.label}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
