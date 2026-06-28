import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeDashboardMetrics, computeMatching } from "@/lib/coordination";
import { countUnreadNotifications, createNotifications } from "@/lib/notifications";

const links = [
  { href: "/arrivages", label: "Arrivages" },
  { href: "/besoins", label: "Besoins" },
  { href: "/opportunites", label: "Opportunités" },
  { href: "/coordination", label: "Coordination" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/executive", label: "Executive" }
];

export function SiteHeader() {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatching(arrivages, besoins);
  const dashboardData = computeDashboardMetrics(arrivages, besoins, opportunites);
  const unreadCount = countUnreadNotifications(createNotifications(arrivages, besoins, opportunites, dashboardData));

  return (
    <header className="sticky top-0 z-50 border-b border-[#0F2D4A]/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <a href="/" className="flex items-center gap-3 text-[#0F2D4A]">
          <span
            className="h-9 w-9 rounded-xl border border-[#0F2D4A]/10 bg-[#F7F2E8] bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/mbambulaan/mbambulaan-logo.webp')" }}
            aria-hidden="true"
          />
          <span className="text-lg font-black tracking-wide">Mbàmbulaan</span>
        </a>
        <nav className="order-3 flex w-full items-center gap-2 overflow-x-auto text-sm font-bold text-[#0F2D4A]/70 lg:order-none lg:w-auto lg:gap-5 lg:overflow-visible">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="whitespace-nowrap rounded-xl border border-[#0F2D4A]/10 px-3 py-2 transition hover:border-[#1F6F8B]/45 hover:bg-[#F7F2E8] hover:text-[#0F2D4A] lg:border-0 lg:px-0 lg:hover:bg-transparent">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="/executive" className="hidden rounded-xl border border-[#0F2D4A]/15 px-3 py-2 text-sm font-bold text-[#0F2D4A] transition hover:border-[#1F6F8B]/50 sm:inline-flex sm:px-4">
            Vue exécutive
          </a>
          <a href="/notifications" className="relative rounded-xl border border-[#0F2D4A]/15 px-3 py-2 text-sm font-bold text-[#0F2D4A] transition hover:border-[#1F6F8B]/50 sm:px-4">
            Notifications
            {unreadCount > 0 ? (
              <span className="absolute -right-2 -top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#D85A34] px-2 text-xs font-black text-white">
                {unreadCount}
              </span>
            ) : null}
          </a>
          <a
            href="/demo"
            className="rounded-xl bg-[#0F2D4A] px-4 py-2 text-sm font-black text-white transition hover:bg-[#1F6F8B]"
          >
            Démo
          </a>
        </div>
      </div>
    </header>
  );
}
