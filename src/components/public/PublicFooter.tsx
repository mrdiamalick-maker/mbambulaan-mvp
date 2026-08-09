import Link from "next/link";
import { ArrowUpRight, ShipWheel } from "lucide-react";

const columns = [
  {
    title: "Découvrir",
    links: [["La filière", "/filiere"], ["Atlas public", "/atlas"], ["Réseau & initiatives", "/community"], ["Durabilité", "/durabilite"], ["Actualités & annonces", "/actualites"], ["Démonstration", "/demo"]]
  },
  {
    title: "Mbàmbulaan",
    links: [["Vision", "/a-propos"], ["Solutions", "/offres"], ["Construire un pilote", "/contact"], ["Accès professionnel", "/connexion"]]
  }
] as const;

export function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#031a22] px-5 py-12 text-white md:px-10">
      <div className="mx-auto grid max-w-[1500px] gap-10 md:grid-cols-[1.4fr_.6fr_.6fr]">
        <div className="max-w-md">
          <Link href="/" className="inline-flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-[#5fe0d3] text-[#031a22]"><ShipWheel size={19}/></span><span><strong className="brand-wordmark block">Mbàmbulaan</strong><span className="text-xs text-white/45">La filière reliée.</span></span></Link>
          <p className="mt-5 text-sm leading-6 text-white/52">Infrastructure numérique de coordination des filières sénégalaises, en commençant par la pêche artisanale.</p>
          <p className="mt-5 text-[11px] leading-5 text-white/35">Version de démonstration · données simulées et non officielles · aucune transaction ni décision automatique.</p>
        </div>
        {columns.map((column) => <div key={column.title}><p className="text-[10px] font-black uppercase tracking-[.12em] text-white/32">{column.title}</p><div className="mt-4 space-y-3">{column.links.map(([label, href]) => <Link key={href} href={href} className="flex items-center gap-1.5 text-sm font-semibold text-white/64 transition hover:text-[#74e1d6]">{label}{label === "Accès professionnel" && <ArrowUpRight size={13}/>}</Link>)}</div></div>)}
      </div>
      <div className="mx-auto mt-10 flex max-w-[1500px] flex-col gap-2 border-t border-white/8 pt-6 text-[11px] text-white/32 sm:flex-row sm:justify-between"><span>© 2026 Mbàmbulaan Sénégal</span><span>Coordination · confiance · valeur</span></div>
    </footer>
  );
}
