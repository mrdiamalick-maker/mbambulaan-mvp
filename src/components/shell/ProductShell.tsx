"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Anchor,
  Banknote,
  Bell,
  BookOpenText,
  Building2,
  CircleDollarSign,
  CircleUserRound,
  ClipboardList,
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
import type { PlatformModule } from "@/domain/platform/modules";
import { useProduct } from "@/components/providers/ProductProvider";
import { resolveCapabilities } from "@/domain/platform/access-resolver";

type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: typeof Home;
  roles: Role[];
  module?: PlatformModule;
};
type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: "Agir",
    items: [
      {
        href: "/app/travail",
        label: "Aujourd’hui",
        shortLabel: "Accueil",
        icon: Home,
        roles: []
      },
      {
        href: "/app/operations",
        module: "operations",
        label: "Opérations",
        shortLabel: "Opérations",
        icon: Anchor,
        roles: [
          "administrateur",
          "operateur",
          "capitaine",
          "mareyeur",
          "transformateur",
          "gestionnaire_organisation",
          "coordinateur",
          "institution"
        ]
      },
      {
        href: "/app/situations",
        module: "operations",
        label: "Situations",
        shortLabel: "Situations",
        icon: ClipboardList,
        roles: [
          "administrateur",
          "operateur",
          "capitaine",
          "mareyeur",
          "transformateur",
          "prestataire",
          "gestionnaire_organisation",
          "coordinateur",
          "institution"
        ]
      },
      {
        href: "/app/coordination",
        module: "coordination",
        label: "Coordinations",
        shortLabel: "Coordination",
        icon: Handshake,
        roles: [
          "administrateur",
          "operateur",
          "mareyeur",
          "transformateur",
          "prestataire",
          "gestionnaire_organisation",
          "coordinateur",
          "institution",
          "partenaire"
        ]
      }
    ]
  },
  {
    label: "Comprendre",
    items: [
      {
        href: "/app/atlas",
        module: "territory_intelligence",
        label: "Territoires & capacités",
        shortLabel: "Territoires",
        icon: Globe2,
        roles: []
      },
      {
        href: "/app/marches",
        module: "market_intelligence",
        label: "Flux & débouchés",
        shortLabel: "Débouchés",
        icon: Store,
        roles: [
          "administrateur",
          "operateur",
          "capitaine",
          "mareyeur",
          "transformateur",
          "gestionnaire_organisation",
          "coordinateur",
          "institution"
        ]
      },
      {
        href: "/app/durabilite",
        label: "Provenance & durabilité",
        shortLabel: "Durabilité",
        icon: Leaf,
        roles: [
          "administrateur",
          "operateur",
          "capitaine",
          "transformateur",
          "gestionnaire_organisation",
          "coordinateur",
          "institution",
          "partenaire"
        ]
      }
    ]
  },
  {
    label: "Structurer",
    items: [
      {
        href: "/app/organisation",
        label: "Organisation",
        shortLabel: "Organisation",
        icon: Building2,
        roles: ["administrateur", "gestionnaire_organisation", "coordinateur", "institution", "partenaire"]
      },
      {
        href: "/app/community",
        label: "Réseau & savoirs",
        shortLabel: "Réseau",
        icon: BookOpenText,
        roles: [
          "administrateur",
          "operateur",
          "capitaine",
          "mareyeur",
          "transformateur",
          "prestataire",
          "gestionnaire_organisation",
          "coordinateur",
          "institution",
          "partenaire"
        ]
      }
    ]
  },
  {
    label: "Décider",
    items: [
      {
        href: "/app/initiatives",
        label: "Programmes & financements",
        shortLabel: "Programmes",
        icon: CircleDollarSign,
        roles: ["administrateur", "gestionnaire_organisation", "coordinateur", "institution", "partenaire"]
      },
      {
        href: "/app/pilotage",
        module: "reporting",
        label: "Pilotage & rapports",
        shortLabel: "Pilotage",
        icon: Gauge,
        roles: ["administrateur", "gestionnaire_organisation", "coordinateur", "institution", "partenaire"]
      }
    ]
  }
];

// L'Espace État est un parcours, pas un enchaînement de pages : le mandat
// institution n'a que deux destinations dans le menu (le parcours vivant
// et le rapport à exporter), tout le reste se découvre depuis l'intérieur
// du parcours lui-même (panneaux latéraux), pas via une nouvelle page.
const ministryNavItems: NavItem[] = [
  { href: "/app/etat", label: "Espace État", shortLabel: "État", icon: Home, roles: ["institution"] },
  { href: "/app/etat/rapport", label: "Rapport bailleurs", shortLabel: "Rapport", icon: Banknote, roles: ["institution"] }
];
const ministryNavGroups: NavGroup[] = [{ label: "Espace État", items: ministryNavItems }];

const roleLabels: Record<Role, string> = {
  administrateur: "Administrateur Mbàmbulaan",
  operateur: "Opérateur de quai",
  capitaine: "Capitaine de pirogue",
  mareyeur: "Mareyeuse",
  transformateur: "Transformatrice",
  prestataire: "Prestataire d’infrastructure",
  gestionnaire_organisation: "Gestionnaire d’organisation",
  coordinateur: "Coordinateur territorial",
  institution: "Ministère",
  partenaire: "Partenaire"
};

function canSee(
  item: NavItem,
  role: Role,
  modules: PlatformModule[]
) {

  const roleAllowed =
    item.roles.length === 0 ||
    item.roles.includes(role);


  const moduleAllowed =
    !item.module ||
    modules.includes(item.module);


  return roleAllowed && moduleAllowed;

}

export function ProductShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    state,
    role,
    actorId,
    persistence,
    loading,
    error,
    reset
} = useProduct();
  const actor = state?.actors.find(
    (item) => item.id === actorId
  );

  const capabilities =
    state && actor
      ? resolveCapabilities(
          state,
          actor.organizationId
        )
      : {
          modules: [],
          levels: {}
        };

  const organization =
    state?.organizations.find(
      (item) => item.id === actor?.organizationId
    );

  const subscription =
    state?.subscriptions.find(
      (item) => item.organizationId === organization?.id
    );

  const plan =
    state?.plans.find(
      (item) => item.id === subscription?.planId
    );

  const [open, setOpen] = useState(false);
  const unread = state?.notifications.filter((item) => item.role === role && !item.read).length ?? 0;
  const isMinistry = role === "institution";
  const visibleGroups = (isMinistry ? ministryNavGroups : navGroups)
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          canSee(
            item,
            role,
            capabilities.modules
          )
      )
    }))
    .filter((group) => group.items.length > 0);
  const mobileItems = visibleGroups.flatMap((group) => group.items).slice(0, 4);
  const logout = () => {
    void fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      window.location.href = "/";
    });
  };

  return (
    <div className="op-scope min-h-screen bg-[var(--op-canvas)]">
      <header className="no-print sticky top-0 z-40 flex h-[68px] items-center border-b border-[var(--op-surface-line)] bg-white/95 px-4 backdrop-blur-xl md:px-6 lg:pl-[292px]">
        <button className="op-btn-ghost mr-2 grid size-10 place-items-center rounded-lg lg:hidden" onClick={() => setOpen(true)} aria-label="Ouvrir la navigation">
          <Menu size={21} />
        </button>
        <div className="min-w-0">
          <p className="op-eyebrow">{roleLabels[role]}</p>
          <p className="mt-0.5 truncate text-sm font-bold text-[var(--op-ink-900)]">
            {organization?.name ?? "Organisation active"} <span className="text-[var(--op-ink-300)]">·</span> {plan?.name ?? "Plan démonstration"} <span className="text-[var(--op-ink-300)]">·</span> {capabilities.modules.length} module(s) actif(s)
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="op-badge op-badge--neutral hidden xl:inline-flex">
            <span className="op-badge-dot text-[var(--op-success-500)]" />
            {persistence === "postgresql" ? "Base de production" : "Environnement de démonstration"}
          </span>

          <span className="hidden h-10 items-center gap-2 rounded-lg border border-[var(--op-surface-line)] bg-white px-3 text-xs font-bold text-[var(--op-ink-900)] shadow-sm md:inline-flex">
            <CircleUserRound size={17} className="text-[var(--op-signal-500)]" />
            {roleLabels[role]}
          </span>

          <button className="op-btn-ghost relative grid size-10 place-items-center rounded-lg" aria-label={`${unread} notifications non lues`}>
            <Bell size={19} />
            {unread > 0 && <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-[var(--op-danger-500)]" />}
          </button>
          {persistence === "memoire_locale_demo" && (
            <button onClick={() => void reset()} className="op-btn-outline hidden size-10 place-items-center rounded-lg !p-0 sm:grid" title="Réinitialiser la démonstration" aria-label="Réinitialiser la démonstration">
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </header>

      <aside className="op-instrumented no-print fixed inset-y-0 left-0 z-50 hidden w-[268px] overflow-y-auto text-white lg:block">
        <div className="flex h-[68px] items-center gap-3 border-b border-[var(--op-graphite-line)] px-5">
          <span className="grid size-9 place-items-center rounded-lg bg-[var(--op-signal-500)] text-white"><ShipWheel size={18} /></span>
          <div className="min-w-0">
            <strong className="block truncate text-sm tracking-[-.01em]">Mbàmbulaan</strong>
            <span className="op-eyebrow op-eyebrow--on-dark !text-[9.5px]">Espace professionnel</span>
          </div>
        </div>

        <nav aria-label="Navigation principale" className="space-y-5 px-3 py-5">
          {visibleGroups.map((group) => (
            <div key={group.label}>
              <p className="op-nav-group-label">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href || (item.href !== "/app/travail" && pathname.startsWith(item.href));
                  return (
                    <Link key={item.href} href={item.href} className={`op-nav-link group ${active ? "op-nav-link--active" : ""}`}>
                      <item.icon size={17} className={active ? "text-[var(--op-signal-400)]" : "text-white/42 group-hover:text-white/72"} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {role === "administrateur" && (
            <div>
              <p className="op-nav-group-label">Exploiter</p>
              <Link href="/app/administration" className={`op-nav-link ${pathname.startsWith("/app/administration") ? "op-nav-link--active" : ""}`}>
                <Settings size={17} /> Administration
              </Link>
            </div>
          )}
        </nav>

        <div className="mx-3 mb-4 rounded-[var(--op-radius-md)] border border-[var(--op-graphite-line)] bg-white/[.04] p-4">
          <div className="flex items-center gap-2 text-[var(--op-signal-400)]"><Sparkles size={15} /><p className="text-[10px] font-black uppercase tracking-[.1em]">Votre périmètre</p></div>
          <p className="mt-2 text-xs leading-5 text-white/52">Seules les données, actions et informations nécessaires à votre mandat sont affichées.</p>
        </div>
        <div className="border-t border-[var(--op-graphite-line)] px-5 py-4">
          <p className="text-[10px] uppercase tracking-wider text-white/30">Organisation active</p>
          <p className="mt-1 truncate text-xs font-bold text-white/80">{state?.tenant.name ?? "Chargement…"}</p>
          <button type="button" onClick={logout} className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-white/48 hover:text-white">
            <LogOut size={13} /> Quitter l’espace
          </button>
        </div>
      </aside>

      {open && (
        <div className="op-instrumented no-print fixed inset-0 z-[70] overflow-y-auto p-5 text-white lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[var(--op-signal-500)] text-white"><ShipWheel size={20} /></span><div><strong className="block">Mbàmbulaan</strong><span className="text-xs text-white/50">{roleLabels[role]}</span></div></div>
            <button onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-lg bg-white/8" aria-label="Fermer la navigation"><X /></button>
          </div>
          <div className="mt-7 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Espace actif</p>
            <p className="mt-2 text-sm font-bold text-white">{roleLabels[role]}</p>
            <p className="mt-1 text-xs leading-5 text-white/50">Votre rôle est défini par votre session et votre mandat.</p>
          </div>
          <nav className="mt-7 space-y-5">
            {visibleGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[.12em] text-white/32">{group.label}</p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Link onClick={() => setOpen(false)} key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/4 px-4 py-3 font-semibold">
                      <item.icon size={18} className="text-[var(--op-signal-400)]" /> {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            {role === "administrateur" && (
              <Link onClick={() => setOpen(false)} href="/app/administration" className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/4 px-4 py-3 font-semibold">
                <Settings size={18} className="text-[var(--op-signal-400)]" /> Administration
              </Link>
            )}
          </nav>
          <button type="button" onClick={logout} className="op-btn op-btn-on-dark mt-7 w-full justify-center">
            <LogOut size={15} /> Quitter l’espace
          </button>
        </div>
      )}

      <main className="mobile-safe min-w-0 lg:ml-[268px]">
        {error && <div role="alert" className="border-b border-[var(--op-danger-100)] bg-[var(--op-danger-100)] px-5 py-3 text-sm font-semibold text-[var(--op-danger-600)]">{error}</div>}
        {loading && !state ? <div className="grid min-h-[70vh] place-items-center text-sm text-[var(--op-ink-400)]">Initialisation de votre espace…</div> : children}
      </main>

      <nav className="no-print fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 border-t border-[var(--op-surface-line)] bg-white/96 px-1 backdrop-blur lg:hidden">
        {mobileItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/app/travail" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={`flex min-w-0 flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-bold ${active ? "text-[var(--op-signal-600)]" : "text-[var(--op-ink-400)]"}`}>
              <item.icon size={18} /><span className="truncate">{item.shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
