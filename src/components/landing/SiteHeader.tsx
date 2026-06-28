import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeDashboardMetrics, computeMatching } from "@/lib/coordination";
import { countUnreadNotifications, createNotifications } from "@/lib/notifications";

const explorerLinks = [
  { href: "/arrivages", label: "Arrivages" },
  { href: "/besoins", label: "Besoins" },
  { href: "/opportunites", label: "Opportunités" },
  { href: "/transactions", label: "Transactions" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/coordination", label: "Coordination" },
  { href: "/quais", label: "Quais" }
];

export function SiteHeader() {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatching(arrivages, besoins);
  const dashboardData = computeDashboardMetrics(arrivages, besoins, opportunites);
  const unreadCount = countUnreadNotifications(createNotifications(arrivages, besoins, opportunites, dashboardData));

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0F2D4A]/96 text-white backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <a href="/" className="flex min-w-0 items-center gap-3 text-white">
          <span
            className="h-11 w-11 shrink-0 rounded-2xl bg-white bg-contain bg-center bg-no-repeat ring-1 ring-white/20"
            style={{ backgroundImage: "url('/images/mbambulaan/mbambulaan-logo.webp')" }}
            aria-hidden="true"
          />
          <span className="min-w-0">
            <span className="block truncate text-lg font-black tracking-wide">Mbàmbulaan</span>
            <span className="hidden text-xs font-bold text-white/70 sm:block">Plateforme de coordination maritime</span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 text-sm font-bold text-white/78 lg:flex">
          <a href="/" className="transition hover:text-white">Accueil</a>
          <a href="/demo" className="transition hover:text-white">Démo</a>
          <a href="/executive" className="transition hover:text-white">Executive</a>
          <details className="group relative">
            <summary className="cursor-pointer list-none transition hover:text-white">Explorer</summary>
            <div className="absolute right-0 top-8 hidden w-56 rounded-2xl bg-white p-2 text-[#0F2D4A] shadow-xl ring-1 ring-[#0F2D4A]/10 group-open:grid">
              {explorerLinks.map((link) => (
                <a key={link.href} href={link.href} className="rounded-xl px-3 py-2 text-sm font-bold text-[#334155] transition hover:bg-[#F8FAFC] hover:text-[#0F2D4A]">
                  {link.label}
                </a>
              ))}
            </div>
          </details>
        </nav>

        <div className="flex items-center gap-2">
          <a href="/notifications" className="relative hidden rounded-xl px-3 py-2 text-sm font-bold text-white/76 transition hover:bg-white/10 hover:text-white sm:inline-flex">
            Notifications
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D85A34] px-1.5 text-[0.65rem] font-black text-white">
                {unreadCount}
              </span>
            ) : null}
          </a>
          <a href="/executive" className="hidden rounded-xl px-3 py-2 text-sm font-bold text-white/76 transition hover:bg-white/10 hover:text-white md:inline-flex">
            Executive
          </a>
          <a href="/demo" className="rounded-xl bg-white px-4 py-2 text-sm font-black text-[#0F2D4A] transition hover:bg-[#F8FAFC]">
            Lancer la démo
          </a>
        </div>
      </div>
    </header>
  );
}
