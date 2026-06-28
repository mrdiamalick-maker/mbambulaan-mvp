import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeDashboardMetrics, computeMatching } from "@/lib/coordination";
import { countUnreadNotifications, createNotifications } from "@/lib/notifications";

const links = [
  { href: "/demo", label: "Démo" },
  { href: "/arrivages", label: "Arrivages" },
  { href: "/besoins", label: "Besoins" },
  { href: "/opportunites", label: "Opportunités" },
  { href: "/coordination", label: "Coordination" },
  { href: "/quais", label: "Quais" },
  { href: "/espaces", label: "Espaces" }
];

export function SiteHeader() {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatching(arrivages, besoins);
  const dashboardData = computeDashboardMetrics(arrivages, besoins, opportunites);
  const unreadCount = countUnreadNotifications(createNotifications(arrivages, besoins, opportunites, dashboardData));

  return (
    <header className="sticky top-0 z-50 border-b border-[#14312d]/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <a href="/" className="text-lg font-black tracking-wide text-[#14312d]">
          Mbàmbulaan
        </a>
        <nav className="order-3 flex w-full items-center gap-2 overflow-x-auto text-sm font-bold text-[#14312d]/70 lg:order-none lg:w-auto lg:gap-5 lg:overflow-visible">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="whitespace-nowrap rounded-full border border-[#14312d]/10 px-3 py-2 transition hover:border-[#14312d] hover:bg-[#f8faf8] hover:text-[#14312d] lg:border-0 lg:px-0 lg:hover:bg-transparent">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="/notifications" className="relative rounded-full border border-[#14312d]/15 px-3 py-2 text-sm font-bold text-[#14312d] transition hover:border-[#14312d] sm:px-4">
            Notifications
            {unreadCount > 0 ? (
              <span className="absolute -right-2 -top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#d65a31] px-2 text-xs font-black text-white">
                {unreadCount}
              </span>
            ) : null}
          </a>
          <a
            href="/dashboard"
            className="rounded-full bg-[#14312d] px-3 py-2 text-sm font-black text-white transition hover:bg-[#1e4a43] sm:px-4"
          >
            Dashboard
          </a>
        </div>
      </div>
    </header>
  );
}
