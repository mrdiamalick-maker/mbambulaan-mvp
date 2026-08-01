"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Anchor,
  Bell,
  BookOpenText,
  Building2,
  ChevronDown,
  CircleUserRound,
  ClipboardList,
  FileBarChart,
  Gauge,
  Globe2,
  Handshake,
  Home,
  Leaf,
  LogOut,
  Menu,
  RotateCcw,
  ShipWheel,
  Settings,
  Sparkles,
  Store,
  X
} from "lucide-react";
import { useState } from "react";
import type { Role } from "@/domain/types";
import { useProduct } from "@/components/providers/ProductProvider";

type NavItem = { href: string; label: string; shortLabel: string; icon: typeof Home; roles: Role[] };
type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: "Vue commune",
    items: [
      { href: "/app/travail", label: "Centre de situation", shortLabel: "Situation", icon: Home, roles: [] },
      { href: "/app/atlas", label: "Atlas professionnel", shortLabel: "Atlas", icon: Globe2, roles: [] }
    ]
  },
  {
    label: "Agir",
    items: [
      { href: "/app/operations", label: "Opérations de pêche", shortLabel: "Opérations", icon: Anchor, roles: ["administrateur", "operateur", "capitaine", "mareyeur", "transformateur", "gestionnaire_organisation", "coordinateur", "institution"] },
      { href: "/app/situations", label: "Situations à traiter", shortLabel: "Situations", icon: ClipboardList, roles: ["administrateur", "operateur", "capitaine", "mareyeur", "transformateur", "prestataire", "gestionnaire_organisation", "coordinateur", "institution"] },
      { href: "/app/coordination", label: "Coordination", shortLabel: "Coordination", icon: Handshake, roles: ["administrateur", "operateur", "mareyeur", "transformateur", "prestataire", "gestionnaire_organisation", "coordinateur", "institution", "partenaire"] }
    ]
  },
  {
    label: "Valoriser",
    items: [
      { href: "/app/marches", label: "Marchés & opportunités", shortLabel: "Marchés", icon: Store, roles: ["administrateur", "operateur", "capitaine", "mareyeur", "transformateur", "gestionnaire_organisation", "coordinateur", "institution"] },
      { href: "/app/community", label: "Communauté & savoirs", shortLabel: "Communauté", icon: BookOpenText, roles: ["administrateur", "operateur", "capitaine", "mareyeur", "transformateur", "prestataire", "gestionnaire_organisation", "coordinateur"] },
      { href: "/app/durabilite", label: "Durabilité & confiance", shortLabel: "Durabilité", icon: Leaf, roles: ["administrateur", "operateur", "capitaine", "transformateur", "gestionnaire_organisation", "coordinateur", "institution", "partenaire"] }
    ]
  },
  {
    label: "Décider",
    items: [
      { href: "/app/pilotage", label: "Pilotage & impact", shortLabel: "Pilotage", icon: Gauge, roles: ["administrateur", "gestionnaire_organisation", "coordinateur", "institution", "partenaire"] },
      { href: "/app/resultats", label: "Rapports & connaissances", shortLabel: "Rapports", icon: FileBarChart, roles: ["administrateur", "gestionnaire_organisation", "coordinateur", "institution", "partenaire"] },
      { href: "/app/organisation", label: "Organisation", shortLabel: "Organisation", icon: Building2, roles: ["administrateur", "gestionnaire_organisation", "coordinateur", "institution", "partenaire"] }
    ]
  }
];

const roleLabels: Record<Role, string> = {
  administrateur: "Administrateur Mbàmbulaan",
  operateur: "Opérateur de quai",
  capitaine: "Capitaine de pirogue",
  mareyeur: "Mareyeuse",
  transformateur: "Transformatrice",
  prestataire: "Prestataire d’infrastructure",
  gestionnaire_organisation: "Gestionnaire d’organisation",
  coordinateur: "Coordinateur territorial",
  institution: "Institution",
  partenaire: "Partenaire"
};

function canSee(item: NavItem, role: Role) {
  return item.roles.length === 0 || item.roles.includes(role);
}

export function ProductShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, role, persistence, loading, error, changeRole, reset } = useProduct();
  const [open, setOpen] = useState(false);
  const unread = state?.notifications.filter((item) => item.role === role && !item.read).length ?? 0;
  const mobileItems = navGroups.flatMap((group) => group.items).filter((item) => canSee(item, role)).slice(0, 4);
  const activeTerritory = state?.territories.find((item) => item.activity !== "stable") ?? state?.territories[0];

  return (
    <div className="min-h-screen bg-[#f3f7f6]">
      <header className="no-print sticky top-0 z-40 flex h-[72px] items-center border-b border-[#d9e3e3] bg-white/94 px-4 backdrop-blur-xl md:px-6 lg:pl-[284px]">
        <button className="mr-2 grid size-10 place-items-center rounded-lg text-[#075568] hover:bg-[#edf5f4] lg:hidden" onClick={() => setOpen(true)} aria-label="Ouvrir la navigation">
          <Menu size={22} />
        </button>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-extrabold uppercase tracking-[.08em] text-[#7a8e94]">
            Mbàmbulaan Ops · environnement professionnel
          </p>
          <p className="mt-1 truncate text-sm font-bold text-[#102e37]">
            {activeTerritory?.name ?? "Littoral sénégalais"} · {new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-[#d9e3e3] bg-[#f7faf9] px-3 py-1.5 text-[11px] font-bold text-[#667b81] xl:inline-flex">
            <span className="size-2 rounded-full bg-[#1fb6a4]" />
            Démonstration · {persistence === "postgresql" ? "PostgreSQL" : "mémoire locale"}
          </span>

          <div className="hidden items-center gap-1 2xl:flex">
            <Link href="/app/atlas" className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-xs font-bold text-[#075568] transition hover:bg-[#edf5f4]"><Globe2 size={15} /> Ouvrir l’Atlas</Link>
            <Link href="/app/coordination" className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-xs font-bold text-[#075568] transition hover:bg-[#edf5f4]"><Handshake size={15} /> Coordonner</Link>
          </div>

          <label className="relative hidden items-center md:flex">
            <CircleUserRound size={17} className="pointer-events-none absolute left-3 text-[#08758a]" />
            <select
              value={role}
              onChange={(event) => void changeRole(event.target.value as Role)}
              className="h-10 max-w-56 appearance-none rounded-lg border border-[#d0ddde] bg-white pl-9 pr-9 text-xs font-bold text-[#102e37] shadow-sm"
              aria-label="Changer de rôle"
            >
              {Object.entries(roleLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 text-[#667b81]" />
          </label>

          <button className="relative grid size-10 place-items-center rounded-lg text-[#075568] hover:bg-[#edf5f4]" aria-label={`${unread} notifications non lues`}>
            <Bell size={19} />
            {unread > 0 && <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-[#c65242]" />}
          </button>
          <button onClick={() => void reset()} className="hidden size-10 place-items-center rounded-lg border border-[#d0ddde] text-[#075568] hover:bg-[#edf5f4] sm:grid" title="Réinitialiser la démonstration" aria-label="Réinitialiser la démonstration">
            <RotateCcw size={17} />
          </button>
        </div>
      </header>

      <aside className="no-print fixed inset-y-0 left-0 z-50 hidden w-[260px] overflow-y-auto border-r border-white/8 bg-[#031a22] text-white lg:block">
        <div className="flex h-[72px] items-center gap-3 border-b border-white/10 px-5">
          <span className="grid size-10 place-items-center rounded-xl bg-[#5fe0d3] text-[#031a22]"><ShipWheel size={20} /></span>
          <div>
            <strong className="block text-sm">Mbàmbulaan Ops</strong>
            <span className="text-[11px] text-white/48">Jumeau halieutique professionnel</span>
          </div>
        </div>

        <nav aria-label="Navigation principale" className="space-y-5 px-3 py-5">
          {navGroups.map((group) => {
            const items = group.items.filter((item) => canSee(item, role));
            if (!items.length) return null;
            return (
              <div key={group.label}>
                <p className="px-3 pb-1.5 text-[9px] font-black uppercase tracking-[.14em] text-white/30">{group.label}</p>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const active = pathname === item.href || (item.href !== "/app/travail" && pathname.startsWith(item.href));
                    return (
                      <Link key={item.href} href={item.href} className={`group flex min-h-10 items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition ${active ? "bg-white/12 text-white shadow-[inset_3px_0_0_#5fe0d3]" : "text-white/62 hover:bg-white/6 hover:text-white"}`}>
                        <item.icon size={17} className={active ? "text-[#74e1d6]" : "text-white/42 group-hover:text-white/72"} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {role === "administrateur" && (
            <div>
              <p className="px-3 pb-1.5 text-[9px] font-black uppercase tracking-[.14em] text-white/30">Exploiter</p>
              <Link href="/app/administration" className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold ${pathname.startsWith("/app/administration") ? "bg-white/12 text-white" : "text-white/62 hover:bg-white/6 hover:text-white"}`}>
                <Settings size={17} /> Administration
              </Link>
            </div>
          )}
        </nav>

        <div className="mx-3 mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-[#74e1d6]"><Sparkles size={15} /><p className="text-[10px] font-black uppercase tracking-[.1em]">Assistance activable</p></div>
          <p className="mt-2 text-xs leading-5 text-white/52">Synthèses explicables, validation humaine obligatoire.</p>
        </div>
        <div className="border-t border-white/10 px-5 py-4">
          <p className="text-[10px] uppercase tracking-wider text-white/30">Organisation active</p>
          <p className="mt-1 text-xs font-bold text-white/80">{state?.tenant.name ?? "Chargement…"}</p>
          <Link href="/" className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-white/48 hover:text-white"><LogOut size={13} /> Quitter l’espace</Link>
        </div>
      </aside>

      {open && (
        <div className="no-print fixed inset-0 z-[70] overflow-y-auto bg-[#031a22] p-5 text-white lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#5fe0d3] text-[#031a22]"><ShipWheel size={20} /></span><strong>Mbàmbulaan</strong></div>
            <button onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-lg bg-white/8" aria-label="Fermer la navigation"><X /></button>
          </div>
          <label className="mt-7 block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Vue actuelle</span>
            <select value={role} onChange={(event) => void changeRole(event.target.value as Role)} className="mt-2 w-full rounded-lg bg-white p-3 text-sm font-semibold text-[#102e37]">
              {Object.entries(roleLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
          <nav className="mt-7 space-y-5">
            {navGroups.map((group) => {
              const items = group.items.filter((item) => canSee(item, role));
              if (!items.length) return null;
              return (
                <div key={group.label}>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[.12em] text-white/32">{group.label}</p>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <Link onClick={() => setOpen(false)} key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/4 px-4 py-3 font-semibold">
                        <item.icon size={18} className="text-[#74e1d6]" /> {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      )}

      <main className="mobile-safe min-w-0 lg:ml-[260px]">
        {error && <div role="alert" className="border-b border-[#efc8c1] bg-[#fff1ee] px-5 py-3 text-sm font-semibold text-[#9c392b]">{error}</div>}
        {loading && !state ? <div className="grid min-h-[70vh] place-items-center text-sm text-[#667b81]">Initialisation du jumeau territorial…</div> : children}
      </main>

      <nav className="no-print fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 border-t border-[#d0ddde] bg-white/96 px-1 backdrop-blur lg:hidden">
        {mobileItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/app/travail" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={`flex min-w-0 flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-bold ${active ? "text-[#075568]" : "text-[#71858a]"}`}>
              <item.icon size={18} /><span className="truncate">{item.shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
