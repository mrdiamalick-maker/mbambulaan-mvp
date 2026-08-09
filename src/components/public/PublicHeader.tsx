import Link from "next/link";
import { ArrowUpRight, Menu, ShipWheel } from "lucide-react";

const links = [
  { href: "/atlas", label: "Territoires" },
  { href: "/filiere", label: "La filière" },
  { href: "/community", label: "Réseau" },
  { href: "/actualites", label: "Ressources" },
  { href: "/offres", label: "Solutions" },
  { href: "/a-propos", label: "Vision" }
];

export function PublicHeader({ dark = false }: { dark?: boolean }) {
  return (
    <header className={`relative z-30 border-b ${dark ? "border-white/12 bg-[#031a22]/86 text-white backdrop-blur-xl" : "border-[#dfd5c2] bg-[#fffaf0]/94 text-[#10373a] backdrop-blur-xl"}`}>
      <div className="mx-auto flex min-h-[72px] max-w-[1500px] items-center justify-between gap-4 px-5 md:px-10">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Mbàmbulaan, accueil">
          <span className={`grid size-10 place-items-center rounded-full ${dark ? "bg-white text-[#075568]" : "bg-[#0a6d68] text-[#fff6e5] shadow-[0_8px_20px_rgba(10,109,104,.18)]"}`}>
            <ShipWheel size={20} strokeWidth={1.8} />
          </span>
          <span className="min-w-0">
            <strong className="brand-wordmark block truncate">Mbàmbulaan</strong>
            <span className={`hidden text-[11px] font-medium sm:block ${dark ? "text-white/60" : "text-[#667b81]"}`}>
              Infrastructure de coordination
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-[13px] font-semibold lg:flex" aria-label="Navigation publique">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={`rounded-full px-3.5 py-2 transition ${dark ? "text-white/72 hover:bg-white/8 hover:text-white" : "text-[#415c59] hover:bg-[#eee4d1] hover:text-[#0a6d68]"}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <details className="group relative lg:hidden">
            <summary className={`grid size-10 cursor-pointer list-none place-items-center rounded-full border [&::-webkit-details-marker]:hidden ${dark ? "border-white/16 text-white" : "border-[#d9e3e3] text-[#075568]"}`} aria-label="Ouvrir le menu">
              <Menu size={18} />
            </summary>
            <nav className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-[#d9e3e3] bg-white p-2 text-[#102e37] shadow-2xl" aria-label="Navigation publique mobile">
              {links.map((link) => <Link key={link.href} href={link.href} className="block rounded-xl px-4 py-3 text-sm font-bold hover:bg-[#edf5f4]">{link.label}</Link>)}
              <Link href="/demo" className="mt-1 block rounded-xl bg-[#e5f7f3] px-4 py-3 text-sm font-bold text-[#075568]">Démonstration guidée</Link>
              <Link href="/contact" className="block rounded-xl px-4 py-3 text-sm font-bold text-[#075568]">Construire un pilote</Link>
            </nav>
          </details>
          <Link href="/demo" className={`hidden rounded-lg px-3 py-2 text-sm font-bold sm:inline-flex ${dark ? "text-white hover:bg-white/8" : "text-[#075568] hover:bg-[#edf5f4]"}`}>
            Voir la démo
          </Link>
          <Link
            href="/connexion"
            style={{ color: dark ? "#075568" : "#fff8e9" }}
            className={`${dark ? "bg-white" : "bg-[#10373a]"} inline-flex min-h-10 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold shadow-sm transition hover:-translate-y-px sm:px-4`}
          >
            <span className="sm:hidden">Connexion</span><span className="hidden sm:inline">Accès professionnel</span> <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </header>
  );
}
