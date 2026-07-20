import Link from "next/link";

const links = [
  { href: "/publications", label: "Publications", compactLabel: "Publications" },
  { href: "/projets", label: "Projets & contributions", compactLabel: "Projets" },
  { href: "/contact", label: "Participer", compactLabel: "Participer" },
  { href: "/espace-prive", label: "Accès Ministère", compactLabel: "Ministère" },
];

export function PublicSiteHeader() {
  return <header className="border-b border-[var(--mb-neutral-200)] bg-white">
    <div className="mx-auto flex max-w-[84rem] flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:px-10">
      <Link href="/" className="flex items-center gap-3" aria-label="Accueil Mbàmbulaan">
        <span className="grid h-9 w-9 place-items-center rounded-[3px] bg-[var(--mb-navy-900)] text-[11px] font-black text-white">Mb</span>
        <span><strong className="block text-[15px] text-[var(--mb-navy-900)]">Mbàmbulaan</strong><span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--mb-neutral-400)]">La communauté de la pêche artisanale</span></span>
      </Link>
      <nav aria-label="Navigation publique" className="order-3 grid w-full grid-cols-2 gap-px border border-[var(--mb-neutral-200)] bg-[var(--mb-neutral-200)] sm:order-none sm:flex sm:w-auto sm:border-0 sm:bg-transparent">
        {links.map((link, index) => <Link key={link.href} href={link.href} className={`inline-flex min-h-9 items-center justify-center bg-white px-3 text-[10px] font-bold text-[var(--mb-navy-900)] hover:bg-[var(--mb-foam)] sm:bg-transparent sm:text-[11px] ${index === links.length - 1 ? "sm:ml-2 sm:border sm:border-[var(--mb-neutral-200)] sm:px-4" : ""}`}>
          <span className="sm:hidden">{link.compactLabel}</span><span className="hidden sm:inline">{link.label}</span>
        </Link>)}
      </nav>
    </div>
  </header>;
}
