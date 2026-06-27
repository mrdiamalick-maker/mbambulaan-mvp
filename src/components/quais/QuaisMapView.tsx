"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { QuaiMapPoint } from "@/lib/map";
import { getQuaiActivityLabel, getQuaiFilterUrl, senegalSvgViewBox } from "@/lib/map";

export function QuaisMapView({ points }: { points: QuaiMapPoint[] }) {
  const [selectedId, setSelectedId] = useState(points[0]?.id ?? "");
  const selectedPoint = useMemo(() => points.find((point) => point.id === selectedId) ?? points[0], [points, selectedId]);

  return (
    <main className="min-h-screen bg-[#f7f4ec] px-5 py-8 text-[#14312d] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="flex flex-wrap gap-2">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                item.href === "/quais" ? "border-[#14312d] bg-[#14312d] text-white" : "border-[#14312d]/15 text-[#14312d] hover:border-[#14312d]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Vision territoriale</p>
              <h1 className="mt-4 text-4xl font-black sm:text-5xl">Carte des quais pilotes</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#14312d]/70">
                Lecture geographique simplifiee des quais suivis par Mbàmbulaan, basee sur les arrivages, besoins et opportunites detectees.
              </p>
            </div>
            <div className="grid gap-2 rounded-3xl bg-[#f7f4ec] p-5 text-sm font-black sm:min-w-72">
              <Legend color="#2f9e44" label="Activite faible" />
              <Legend color="#f08c00" label="Activite suivie" />
              <Legend color="#c92a2a" label="Activite forte" />
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
            <div className="overflow-hidden rounded-3xl bg-[#f7f4ec]">
              <svg viewBox={senegalSvgViewBox} role="img" aria-label="Carte simplifiee du Senegal" className="h-auto w-full">
                <path
                  d="M182 30 C220 52 246 74 266 105 C286 138 300 168 314 205 C330 247 327 281 305 317 C279 360 284 397 250 430 C224 454 184 474 151 459 C118 444 106 410 83 389 C60 368 47 338 59 307 C72 274 54 249 72 219 C91 187 104 150 117 112 C130 76 150 49 182 30 Z"
                  fill="#fdfaf2"
                  stroke="#14312d"
                  strokeWidth="3"
                />
                <path d="M143 44 C122 91 104 149 94 207 C84 260 78 335 106 407" fill="none" stroke="#14312d" strokeOpacity="0.18" strokeWidth="7" />
                <path d="M112 271 C136 262 162 261 188 270 C217 281 250 277 282 261" fill="none" stroke="#d65a31" strokeOpacity="0.22" strokeWidth="5" />
                {points.map((point) => (
                  <g
                    key={point.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Afficher ${point.nom}`}
                    onClick={() => setSelectedId(point.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedId(point.id);
                      }
                    }}
                    className="cursor-pointer outline-none"
                  >
                    <circle cx={point.x} cy={point.y} r={selectedPoint?.id === point.id ? 15 : 12} fill={point.color} stroke="#ffffff" strokeWidth="5" />
                    <circle cx={point.x} cy={point.y} r={selectedPoint?.id === point.id ? 23 : 18} fill="transparent" stroke={point.color} strokeOpacity="0.28" strokeWidth="4" />
                    <text x={point.x + 18} y={point.y + 5} className="fill-[#14312d] text-[15px] font-black">
                      {point.nom}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </section>

          {selectedPoint ? <QuaiPanel point={selectedPoint} /> : null}
        </div>
      </div>
    </main>
  );
}

const navigationItems = [
  { href: "/", label: "Accueil" },
  { href: "/arrivages", label: "Arrivages" },
  { href: "/besoins", label: "Besoins" },
  { href: "/opportunites", label: "Opportunites" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/quais", label: "Quais" }
];

function QuaiPanel({ point }: { point: QuaiMapPoint }) {
  return (
    <aside className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Quai pilote</p>
          <h2 className="mt-3 text-3xl font-black">{point.nom}</h2>
          <p className="mt-2 text-sm font-bold text-[#14312d]/60">{point.quai}</p>
        </div>
        <span className="rounded-full px-3 py-1 text-xs font-black text-white" style={{ backgroundColor: point.color }}>
          {getQuaiActivityLabel(point.activityLevel)}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Metric label="Volume debarque" value={point.volumeDebarque} />
        <Metric label="Arrivages" value={String(point.nombreArrivages)} />
        <Metric label="Besoins ouverts" value={String(point.besoinsOuverts)} />
        <Metric label="Opportunites" value={String(point.opportunitesDetectees)} />
        <Metric label="Mises en relation" value={String(point.misesEnRelation)} />
        <Metric label="Especes" value={point.especesPrincipales.length ? point.especesPrincipales.join(", ") : "Aucune"} />
      </div>

      <div className="mt-6 rounded-3xl bg-[#f7f4ec] p-5">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#d65a31]">Derniers debarquements</p>
        <div className="mt-4 grid gap-3">
          {point.derniersDebarquements.length > 0 ? (
            point.derniersDebarquements.map((arrivage) => (
              <article key={arrivage.id} className="rounded-2xl bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-black">{arrivage.espece}</p>
                    <p className="mt-1 text-sm font-semibold text-[#14312d]/65">{arrivage.quantite}</p>
                  </div>
                  <p className="text-sm font-black text-[#d65a31]">{arrivage.heureDebarquement}</p>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-2xl bg-white p-4 text-sm font-bold text-[#14312d]/65">Aucun debarquement mocke pour ce quai.</p>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <PanelLink href={getQuaiFilterUrl("/arrivages", point.quai)}>Arrivages filtres</PanelLink>
        <PanelLink href={getQuaiFilterUrl("/besoins", point.quai)}>Besoins filtres</PanelLink>
        <PanelLink href={getQuaiFilterUrl("/opportunites", point.quai)}>Opportunites filtrees</PanelLink>
        <PanelLink href="/dashboard">Dashboard</PanelLink>
      </div>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f7f4ec] p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}

function PanelLink({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-[#14312d]/15 px-4 py-3 text-center text-sm font-black text-[#14312d] transition hover:border-[#14312d] hover:bg-[#f7f4ec]">
      {children}
    </Link>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  );
}
