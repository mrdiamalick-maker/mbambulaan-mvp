import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeDashboardMetrics, computeMatching } from "@/lib/coordination";
import { countUnreadNotifications, createNotifications } from "@/lib/notifications";

const links = [
  { href: "#projet", label: "Projet" },
  { href: "#acteurs", label: "Acteurs" },
  { href: "#fonctionnalites", label: "Fonctionnalites" },
  { href: "#benefices", label: "Benefices" }
];

export function SiteHeader() {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatching(arrivages, besoins);
  const dashboardData = computeDashboardMetrics(arrivages, besoins, opportunites);
  const unreadCount = countUnreadNotifications(createNotifications(arrivages, besoins, opportunites, dashboardData));

  return (
    <header className="sticky top-0 z-50 border-b border-[#14312d]/10 bg-[#f7f4ec]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <a href="#accueil" className="text-lg font-black tracking-wide text-[#14312d]">
          Mbàmbulaan
        </a>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-[#14312d]/75 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-[#14312d]">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="/notifications" className="relative rounded-full border border-[#14312d]/15 px-4 py-2 text-sm font-bold text-[#14312d] transition hover:border-[#14312d]">
            Notifications
            {unreadCount > 0 ? (
              <span className="absolute -right-2 -top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#d65a31] px-2 text-xs font-black text-white">
                {unreadCount}
              </span>
            ) : null}
          </a>
          <a
            href="/dashboard"
            className="rounded-full bg-[#14312d] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#1e4a43]"
          >
            Espace pilote
          </a>
        </div>
      </div>
    </header>
  );
}
