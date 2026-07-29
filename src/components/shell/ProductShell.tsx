"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Anchor,
  Bell,
  Building2,
  CircleUserRound,
  Gauge,
  Globe2,
  Handshake,
  Home,
  Leaf,
  LogOut,
  Menu,
  MessageSquareText,
  RotateCcw,
  ShipWheel,
  Settings,
  Store,
  X
} from "lucide-react";
import { useState } from "react";
import type { Role } from "@/domain/types";
import { useProduct } from "@/components/providers/ProductProvider";

const nav: Array<{ href: string; label: string; icon: typeof Home; roles: Role[] }> = [
  { href: "/app/travail", label: "Accueil", icon: Home, roles: [] },
  { href: "/app/atlas", label: "Atlas", icon: Globe2, roles: [] },
  { href: "/app/operations", label: "Opérations", icon: Anchor, roles: ["administrateur", "operateur", "capitaine", "mareyeur", "transformateur", "gestionnaire_organisation", "coordinateur", "institution"] },
  { href: "/app/coordination", label: "Coordination", icon: Handshake, roles: ["administrateur", "operateur", "mareyeur", "transformateur", "prestataire", "gestionnaire_organisation", "coordinateur", "institution", "partenaire"] },
  { href: "/app/marches", label: "Prix & marchés", icon: Store, roles: ["administrateur", "operateur", "capitaine", "mareyeur", "transformateur", "gestionnaire_organisation", "coordinateur", "institution"] },
  { href: "/app/community", label: "Community", icon: MessageSquareText, roles: ["administrateur", "operateur", "capitaine", "mareyeur", "transformateur", "prestataire", "gestionnaire_organisation", "coordinateur"] },
  { href: "/app/durabilite", label: "Durabilité", icon: Leaf, roles: ["administrateur", "operateur", "capitaine", "transformateur", "gestionnaire_organisation", "coordinateur", "institution", "partenaire"] },
  { href: "/app/pilotage", label: "Pilotage", icon: Gauge, roles: ["administrateur", "gestionnaire_organisation", "coordinateur", "institution", "partenaire"] },
  { href: "/app/organisation", label: "Organisation", icon: Building2, roles: ["administrateur", "gestionnaire_organisation", "coordinateur", "institution", "partenaire"] }
];

const roleLabels: Record<Role, string> = {
  administrateur: "Administrateur Mbàmbulaan",
  operateur: "Opérateur de quai",
  capitaine: "Capitaine",
  mareyeur: "Mareyeuse",
  transformateur: "Transformatrice",
  prestataire: "Prestataire d’infrastructure",
  gestionnaire_organisation: "Gestionnaire d’organisation",
  coordinateur: "Coordinateur territorial",
  institution: "Institution",
  partenaire: "Partenaire"
};

export function ProductShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, role, persistence, loading, error, changeRole, reset } = useProduct();
  const [open, setOpen] = useState(false);
  const unread = state?.notifications.filter((item) => item.role === role && !item.read).length ?? 0;
  const visible = nav.filter((item) => item.roles.length === 0 || item.roles.includes(role));
  const items = role === "administrateur"
    ? [...visible, { href: "/app/administration", label: "Administration", icon: Settings, roles: ["administrateur" as const] }]
    : visible;

  return (
    <div className="min-h-screen bg-[#f4f7f6]">
      <header className="no-print sticky top-0 z-40 flex h-16 items-center border-b border-[#cfdcde] bg-white/95 px-4 backdrop-blur md:px-6">
        <button className="mr-3 p-2 text-[#075466] md:hidden" onClick={() => setOpen(true)} aria-label="Ouvrir la navigation">
          <Menu size={22} />
        </button>
        <Link href="/app/travail" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center bg-[#075466] text-white"><ShipWheel size={19} /></span>
          <span>
            <strong className="block text-sm text-[#062d36]">Mbàmbulaan</strong>
            <span className="hidden text-xs text-[#60737a] sm:block">Écosystème numérique de la filière</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <span className="hidden border border-[#d8e1e2] bg-[#f8faf9] px-2.5 py-1 text-xs font-semibold text-[#60737a] lg:inline">
            Données simulées · {persistence === "postgresql" ? "PostgreSQL" : "mémoire locale"}
          </span>
          <label className="hidden items-center gap-2 sm:flex">
            <span className="sr-only">Vue actuelle</span>
            <CircleUserRound size={17} className="text-[#087287]" />
            <select
              value={role}
              onChange={(event) => void changeRole(event.target.value as Role)}
              className="max-w-52 border border-[#cfdcde] bg-white px-2 py-2 text-sm font-semibold text-[#17313a]"
            >
              {Object.entries(roleLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
          <button className="relative p-2 text-[#075466]" aria-label={`${unread} notifications non lues`}>
            <Bell size={20} />
            {unread > 0 && <span className="absolute right-1 top-1 size-2 rounded-full bg-[#c94f3d]" />}
          </button>
          <button onClick={() => void reset()} className="hidden items-center gap-2 border border-[#b9dfe4] px-3 py-2 text-sm font-bold text-[#075466] hover:bg-[#eaf8fa] md:flex">
            <RotateCcw size={16} /> Réinitialiser
          </button>
        </div>
      </header>

      <aside className="no-print fixed bottom-0 left-0 top-16 z-30 hidden w-64 border-r border-[#cfdcde] bg-[#062d36] p-4 text-white md:block">
        <nav aria-label="Navigation principale" className="space-y-1">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 border-l-[3px] px-3 py-3 text-sm font-semibold transition ${active ? "border-[#36c6b1] bg-white/10 text-white" : "border-transparent text-[#c7dde1] hover:bg-white/5 hover:text-white"}`}>
                <item.icon size={18} /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-5 left-4 right-4 border-t border-white/15 pt-4">
          <p className="text-xs text-[#9dbcc2]">Tenant isolé</p>
          <p className="mt-1 text-sm font-semibold">{state?.tenant.name ?? "Chargement…"}</p>
          <Link href="/" className="mt-4 flex items-center gap-2 text-xs text-[#b9dfe4]"><LogOut size={14} /> Quitter la démonstration</Link>
        </div>
      </aside>

      {open && (
        <div className="no-print fixed inset-0 z-50 bg-[#062d36] p-5 text-white md:hidden">
          <div className="flex items-center justify-between">
            <strong>Navigation</strong>
            <button onClick={() => setOpen(false)} className="p-2" aria-label="Fermer la navigation"><X /></button>
          </div>
          <nav className="mt-8 space-y-2">
            {items.map((item) => (
              <Link onClick={() => setOpen(false)} key={item.href} href={item.href} className="flex items-center gap-3 border-b border-white/10 py-4 font-semibold">
                <item.icon size={18} /> {item.label}
              </Link>
            ))}
          </nav>
          <label className="mt-8 block">
            <span className="text-xs text-[#b9dfe4]">Vue actuelle</span>
            <select value={role} onChange={(event) => void changeRole(event.target.value as Role)} className="mt-2 w-full bg-white p-3 text-[#17313a]">
              {Object.entries(roleLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
        </div>
      )}

      <main className="mobile-safe min-w-0 md:ml-64">
        {error && <div role="alert" className="border-b border-[#efc8c1] bg-[#fff1ee] px-5 py-3 text-sm font-semibold text-[#9c392b]">{error}</div>}
        {loading && !state ? <div className="grid min-h-[70vh] place-items-center text-sm text-[#60737a]">Chargement de l’espace de coordination…</div> : children}
      </main>

      <nav className="no-print fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 border-t border-[#cfdcde] bg-white md:hidden">
        {items.slice(0, 4).map((item) => (
          <Link key={item.href} href={item.href} className={`flex min-w-0 flex-col items-center gap-1 px-1 py-2 text-[10px] font-bold ${pathname.startsWith(item.href) ? "text-[#075466]" : "text-[#60737a]"}`}>
            <item.icon size={18} /><span className="truncate">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
