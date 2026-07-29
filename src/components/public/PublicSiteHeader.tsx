import Link from "next/link";

const publicLinks = [
  { href: "/mobilisations", label: "Mobilisations" },
  { href: "/publications", label: "Comprendre" },
  { href: "/projets", label: "Initiatives" },
  { href: "/contact", label: "Contribuer" },
];

const workspaceLinks = [
  { href: "/operations", label: "Opérations" },
  { href: "/coordination-services", label: "Coordination" },
  { href: "/government", label: "Government" },
  { href: "/atlas", label: "Atlas" },
];

export function PublicSiteHeader() {
  return (
    <header className="border-b border-[var(--mb-neutral-200)] bg-white">
      <div className="mx-auto max-w-[84rem] px-4 py-3 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Accueil Mbàmbulaan">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[3px] bg-[var(--mb-navy-900)] text-[11px] font-black text-white">Mb</span>
            <span className="min-w-0">
              <strong className="block truncate text-[15px] text-[var(--mb-navy-900)]">Mbàmbulaan</strong>
              <span className="hidden text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-neutral-400)] sm:block">Infrastructure de coordination de la pêche artisanale</span>
            </span>
          </Link>
          <Link href="/operations" className="inline-flex min-h-9 shrink-0 items-center justify-center border border-[var(--mb-neutral-200)] px-3 text-[10px] font-bold text-[var(--mb-navy-900)] hover:bg-[var(--mb-foam)] sm:hidden">Espace métier</Link>
          <nav aria-label="Navigation publique" className="hidden items-center gap-1 sm:flex">
            {publicLinks.map((link) => (
              <Link key={link.href} href={link.href} className="inline-flex min-h-9 items-center justify-center whitespace-nowrap px-3 text-[11px] font-bold text-[var(--mb-navy-900)] hover:bg-[var(--mb-foam)]">{link.label}</Link>
            ))}
            <Link href="/operations" className="ml-2 inline-flex min-h-9 items-center justify-center whitespace-nowrap border border-[var(--mb-neutral-200)] px-4 text-[11px] font-bold text-[var(--mb-navy-900)] hover:bg-[var(--mb-foam)]">Espace métier</Link>
          </nav>
        </div>

        <div className="mt-3 flex flex-col gap-2 border-t border-[var(--mb-neutral-100)] pt-3 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Navigation publique mobile" className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 sm:hidden">
            {publicLinks.map((link) => (
              <Link key={link.href} href={link.href} className="inline-flex min-h-9 shrink-0 snap-start items-center justify-center whitespace-nowrap border border-[var(--mb-neutral-200)] bg-white px-3 text-[10px] font-bold text-[var(--mb-navy-900)] hover:bg-[var(--mb-foam)]">{link.label}</Link>
            ))}
          </nav>
          <p className="font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-[var(--mb-neutral-400)]">Espaces de coordination</p>
          <nav aria-label="Espaces de coordination" className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1">
            {workspaceLinks.map((link) => (
              <Link key={link.href} href={link.href} className="inline-flex min-h-8 shrink-0 snap-start items-center justify-center whitespace-nowrap rounded-[3px] bg-[var(--mb-neutral-50)] px-3 text-[9px] font-bold text-[var(--mb-neutral-600)] hover:bg-[var(--mb-foam)] hover:text-[var(--mb-ocean-700)]">{link.label}</Link>
            ))}
            <Link href="/development" className="inline-flex min-h-8 shrink-0 snap-start items-center justify-center whitespace-nowrap rounded-[3px] bg-[var(--mb-neutral-50)] px-3 text-[9px] font-bold text-[var(--mb-neutral-600)] hover:bg-[var(--mb-foam)] hover:text-[var(--mb-ocean-700)]">Development</Link>
            <Link href="/exploitation" className="inline-flex min-h-8 shrink-0 snap-start items-center justify-center whitespace-nowrap rounded-[3px] bg-[var(--mb-neutral-50)] px-3 text-[9px] font-bold text-[var(--mb-neutral-600)] hover:bg-[var(--mb-foam)] hover:text-[var(--mb-ocean-700)]">Exploitation</Link>
            <Link href="/administration-ecosysteme" className="inline-flex min-h-8 shrink-0 snap-start items-center justify-center whitespace-nowrap rounded-[3px] bg-[var(--mb-neutral-50)] px-3 text-[9px] font-bold text-[var(--mb-neutral-600)] hover:bg-[var(--mb-foam)] hover:text-[var(--mb-ocean-700)]">Administration</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
