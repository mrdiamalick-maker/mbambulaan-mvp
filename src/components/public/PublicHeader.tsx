import Link from "next/link";
import { ArrowUpRight, ShipWheel } from "lucide-react";

const links = [
  { href: "/atlas", label: "Atlas" },
  { href: "/community", label: "Communauté" },
  { href: "/durabilite", label: "Durabilité" },
  { href: "/offres", label: "Solutions" }
];

export function PublicHeader({ dark = false }: { dark?: boolean }) {
  return (
    <header className={`relative z-30 border-b ${dark ? "border-white/12 bg-[#031a22]/86 text-white backdrop-blur-xl" : "border-[#d9e3e3] bg-white/92 text-[#102e37] backdrop-blur-xl"}`}>
      <div className="mx-auto flex min-h-[72px] max-w-[1500px] items-center justify-between gap-4 px-5 md:px-10">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Mbàmbulaan, accueil">
          <span className={`grid size-10 place-items-center rounded-xl ${dark ? "bg-white text-[#075568]" : "bg-[#075568] text-white"}`}>
            <ShipWheel size={20} strokeWidth={1.8} />
          </span>
          <span className="min-w-0">
            <strong className="block truncate text-sm tracking-[-.01em]">Mbàmbulaan</strong>
            <span className={`hidden text-[11px] font-medium sm:block ${dark ? "text-white/60" : "text-[#667b81]"}`}>
              Digital Twin de la filière halieutique
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-[13px] font-semibold lg:flex" aria-label="Navigation publique">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={`rounded-lg px-3 py-2 transition ${dark ? "text-white/72 hover:bg-white/8 hover:text-white" : "text-[#38535b] hover:bg-[#edf5f4] hover:text-[#075568]"}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link href="/demo" className={`hidden rounded-lg px-3 py-2 text-sm font-bold sm:inline-flex ${dark ? "text-white hover:bg-white/8" : "text-[#075568] hover:bg-[#edf5f4]"}`}>
            Voir le produit
          </Link>
          <Link href="/connexion" className={`${dark ? "bg-white text-[#075568]" : "bg-[#075568] text-white"} inline-flex min-h-10 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-bold shadow-sm transition hover:-translate-y-px sm:px-4`}>
            Accès professionnel <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </header>
  );
}
