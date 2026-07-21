import Link from "next/link";

const links = [
  { href: "/mobilisations", label: "Mobilisations" },
  { href: "/publications", label: "Comprendre" },
  { href: "/projets", label: "Initiatives" },
  { href: "/contact", label: "Contribuer" },
  { href: "/espace-prive", label: "Accès Ministère" },
];

export function PublicSiteHeader() {
  return <header className="border-b border-[var(--mb-neutral-200)] bg-white">
    <div className="mx-auto max-w-[84rem] px-4 py-3 sm:px-8 lg:px-10">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Accueil Mbàmbulaan">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[3px] bg-[var(--mb-navy-900)] text-[11px] font-black text-white">Mb</span>
          <span className="min-w-0"><strong className="block truncate text-[15px] text-[var(--mb-navy-900)]">Mbàmbulaan</strong><span className="hidden text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-neutral-400)] sm:block">La communauté de la pêche artisanale</span></span>
        </Link>
        <Link href="/espace-prive" className="inline-flex min-h-9 shrink-0 items-center justify-center border border-[var(--mb-neutral-200)] px-3 text-[10px] font-bold text-[var(--mb-navy-900)] hover:bg-[var(--mb-foam)] sm:hidden">Ministère</Link>
        <nav aria-label="Navigation publique" className="hidden items-center gap-1 sm:flex">
          {links.map((link, index) => <Link key={link.href} href={link.href} className={`inline-flex min-h-9 items-center justify-center whitespace-nowrap px-3 text-[11px] font-bold text-[var(--mb-navy-900)] hover:bg-[var(--mb-foam)] ${index === links.length - 1 ? "ml-2 border border-[var(--mb-neutral-200)] px-4" : ""}`}>{link.label}</Link>)}
        </nav>
      </div>
      <nav aria-label="Navigation publique mobile" className="mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 sm:hidden">
        {links.slice(0, 4).map((link) => <Link key={link.href} href={link.href} className="inline-flex min-h-9 shrink-0 snap-start items-center justify-center whitespace-nowrap border border-[var(--mb-neutral-200)] bg-white px-3 text-[10px] font-bold text-[var(--mb-navy-900)] hover:bg-[var(--mb-foam)]">{link.label}</Link>)}
      </nav>
    </div>
  </header>;
}
