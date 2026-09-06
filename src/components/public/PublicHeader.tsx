import Link from "next/link";
import { ArrowUpRight, Compass, MapPinned, Menu } from "lucide-react";

const links = [
  { href: "/decouvrir", label: "Découvrir" },
  { href: "/atlas", label: "Territoires" },
  { href: "/opportunites", label: "Opportunités" },
  { href: "/mbambulaan", label: "Mbàmbulaan" }
];

export function PublicHeader({ dark = false }: { dark?: boolean }) {
  const textClass = dark ? "text-white" : "text-[var(--pub-deep-900)]";
  const subtleClass = dark ? "text-white/62" : "text-[var(--pub-stone-500)]";

  return (
    <header className={`relative z-30 border-b ${dark ? "border-white/10 bg-[var(--pub-deep-900)]/85" : "border-[var(--pub-stone-150)] bg-[var(--pub-ivory-100)]/92"} ${textClass} backdrop-blur-xl`}>
      <div className="mx-auto flex min-h-[76px] max-w-[1500px] items-center justify-between gap-4 px-5 md:px-10">
        <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="Mbàmbulaan, accueil">
          <span className="pub-display text-[1.55rem] italic leading-none text-[var(--pub-turquoise-400)]">M</span>
          <span className="min-w-0">
            <strong className="brand-wordmark block truncate pub-display text-[1.08rem] not-italic tracking-[-.01em]">Mbàmbulaan</strong>
            <span className={`hidden text-[10px] font-semibold uppercase tracking-[.12em] sm:block ${subtleClass}`}>
              Terrain · réseau · technologie
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-[13px] font-semibold xl:flex" aria-label="Navigation publique">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={`group relative py-2 transition ${subtleClass} ${dark ? "hover:text-white" : "hover:text-[var(--pub-deep-900)]"}`}>
              {link.label}
              <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-[var(--pub-turquoise-400)] transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link href="/atlas" className={`hidden min-h-10 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-bold lg:inline-flex ${dark ? "border-white/16 text-white hover:bg-white/8" : "border-[var(--pub-stone-300)] text-[var(--pub-deep-800)] hover:bg-white"}`}>
            <MapPinned size={15} /> Ouvrir l’Atlas
          </Link>
          <Link href="/solutions" className="pub-btn pub-btn-primary hidden sm:inline-flex">
            <Compass size={15} /> Décrire une situation
          </Link>

          <details className="group relative xl:hidden">
            <summary className={`grid size-10 cursor-pointer list-none place-items-center rounded-full border [&::-webkit-details-marker]:hidden ${dark ? "border-white/16 text-white" : "border-[var(--pub-stone-300)] text-[var(--pub-deep-800)]"}`} aria-label="Ouvrir le menu">
              <Menu size={18} />
            </summary>
            <div className="absolute right-0 top-12 z-50 w-[290px] overflow-hidden rounded-2xl border border-[var(--pub-stone-150)] bg-white p-2 text-[var(--pub-deep-900)] shadow-2xl">
              <nav aria-label="Navigation publique mobile">
                {links.map((link) => (
                  <Link key={link.href} href={link.href} className="block rounded-xl px-4 py-3 text-sm font-bold hover:bg-[var(--pub-ivory-200)]">
                    {link.label}
                  </Link>
                ))}
                <Link href="/atlas" className="mt-1 flex items-center gap-2 rounded-xl bg-[var(--pub-ivory-200)] px-4 py-3 text-sm font-bold text-[var(--pub-deep-800)]">
                  <MapPinned size={16} /> Ouvrir l’Atlas
                </Link>
                <Link href="/solutions" className="mt-1 flex items-center gap-2 rounded-xl bg-[var(--pub-deep-800)] px-4 py-3 text-sm font-bold text-white">
                  <Compass size={16} /> Décrire une situation
                </Link>
                <Link href="/contact" className="mt-1 block rounded-xl px-4 py-3 text-sm font-bold text-[var(--pub-deep-800)]">Contact</Link>
                <Link href="/connexion" className="block rounded-xl px-4 py-3 text-sm font-semibold text-[var(--pub-stone-500)]">Accès professionnel</Link>
              </nav>
            </div>
          </details>

          <Link
            href="/connexion"
            className={`hidden min-h-10 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold uppercase tracking-[.06em] transition lg:inline-flex ${dark ? "text-white/58 hover:text-white" : "text-[var(--pub-stone-500)] hover:text-[var(--pub-deep-900)]"}`}
          >
            Accès pro <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </header>
  );
}
