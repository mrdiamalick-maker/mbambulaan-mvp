import Link from "next/link";
import { ArrowUpRight, Compass, MapPinned, Menu, ShipWheel } from "lucide-react";

const links = [
  { href: "/decouvrir", label: "Découvrir" },
  { href: "/territoires", label: "Territoires" },
  { href: "/opportunites", label: "Opportunités" },
  { href: "/mbambulaan", label: "Mbàmbulaan" }
];

export function PublicHeader({ dark = false }: { dark?: boolean }) {
  const textClass = dark ? "text-white" : "text-[#10373a]";
  const subtleClass = dark ? "text-white/68" : "text-[#5f777a]";
  const hoverClass = dark ? "hover:bg-white/8 hover:text-white" : "hover:bg-[#eee4d1] hover:text-[#0a6d68]";

  return (
    <header className={`relative z-30 border-b ${dark ? "border-white/12 bg-[#031a22]/86" : "border-[#dfd5c2] bg-[#fffaf0]/94"} ${textClass} backdrop-blur-xl`}>
      <div className="mx-auto flex min-h-[72px] max-w-[1500px] items-center justify-between gap-4 px-5 md:px-10">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Mbàmbulaan, accueil">
          <span className={`grid size-10 place-items-center rounded-full ${dark ? "bg-white text-[#075568]" : "bg-[#0a6d68] text-[#fff6e5] shadow-[0_8px_20px_rgba(10,109,104,.18)]"}`}>
            <ShipWheel size={20} strokeWidth={1.8} />
          </span>
          <span className="min-w-0">
            <strong className="brand-wordmark block truncate">Mbàmbulaan</strong>
            <span className={`hidden text-[11px] font-medium sm:block ${subtleClass}`}>
              Économie maritime · terrain, réseau, technologie
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-[13px] font-semibold xl:flex" aria-label="Navigation publique">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={`rounded-full px-3.5 py-2 transition ${subtleClass} ${hoverClass}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link href="/atlas" className={`hidden min-h-10 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-bold lg:inline-flex ${dark ? "border-white/18 text-white hover:bg-white/8" : "border-[#bfd0cf] text-[#075568] hover:bg-[#edf5f4]"}`}>
            <MapPinned size={15} /> Ouvrir l’Atlas
          </Link>
          <Link href="/solutions" className={`hidden min-h-10 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold shadow-sm transition hover:-translate-y-px sm:inline-flex ${dark ? "bg-[#5fe0d3] text-[#031a22]" : "bg-[#10373a] text-[#fff8e9]"}`}>
            <Compass size={15} /> Trouver une solution
          </Link>

          <details className="group relative xl:hidden">
            <summary className={`grid size-10 cursor-pointer list-none place-items-center rounded-full border [&::-webkit-details-marker]:hidden ${dark ? "border-white/16 text-white" : "border-[#d9e3e3] text-[#075568]"}`} aria-label="Ouvrir le menu">
              <Menu size={18} />
            </summary>
            <div className="absolute right-0 top-12 z-50 w-[290px] overflow-hidden rounded-2xl border border-[#d9e3e3] bg-white p-2 text-[#102e37] shadow-2xl">
              <nav aria-label="Navigation publique mobile">
                {links.map((link) => (
                  <Link key={link.href} href={link.href} className="block rounded-xl px-4 py-3 text-sm font-bold hover:bg-[#edf5f4]">
                    {link.label}
                  </Link>
                ))}
                <Link href="/atlas" className="mt-1 flex items-center gap-2 rounded-xl bg-[#edf5f4] px-4 py-3 text-sm font-bold text-[#075568]">
                  <MapPinned size={16} /> Ouvrir l’Atlas
                </Link>
                <Link href="/solutions" className="mt-1 flex items-center gap-2 rounded-xl bg-[#10373a] px-4 py-3 text-sm font-bold text-white">
                  <Compass size={16} /> Trouver une solution
                </Link>
                <Link href="/contact" className="mt-1 block rounded-xl px-4 py-3 text-sm font-bold text-[#075568]">Contact</Link>
                <Link href="/connexion" className="block rounded-xl px-4 py-3 text-sm font-semibold text-[#5f777a]">Accès professionnel</Link>
              </nav>
            </div>
          </details>

          <Link
            href="/connexion"
            className={`hidden min-h-10 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold transition lg:inline-flex ${dark ? "text-white/78 hover:bg-white/8 hover:text-white" : "text-[#415c59] hover:bg-[#edf5f4] hover:text-[#075568]"}`}
          >
            Accès professionnel <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </header>
  );
}
