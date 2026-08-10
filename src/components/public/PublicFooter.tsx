import Link from "next/link";
import { ArrowUpRight, MapPinned, ShipWheel } from "lucide-react";

const columns = [
  {
    title: "Explorer",
    links: [["Découvrir", "/decouvrir"], ["Territoires", "/territoires"], ["Atlas", "/atlas"], ["Opportunités", "/opportunites"]]
  },
  {
    title: "Agir",
    links: [["Trouver une solution", "/solutions"], ["Rejoindre le réseau", "/reseau"], ["Contact", "/contact"], ["Accès professionnel", "/connexion"]]
  },
  {
    title: "Mbàmbulaan",
    links: [["Notre approche", "/mbambulaan"], ["Confidentialité", "/confidentialite"], ["Mentions légales", "/mentions-legales"]]
  }
] as const;

export function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#031a22] px-5 py-12 text-white md:px-10">
      <div className="mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-[1.5fr_.55fr_.55fr_.55fr]">
        <div className="max-w-md">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-[#5fe0d3] text-[#031a22]"><ShipWheel size={19}/></span>
            <span>
              <strong className="brand-wordmark block">Mbàmbulaan</strong>
              <span className="text-xs text-white/45">Économie maritime · terrain, réseau, technologie</span>
            </span>
          </Link>
          <p className="mt-5 text-sm leading-6 text-white/54">Mbàmbulaan construit une infrastructure de coordination pour l’économie maritime, en commençant par la filière halieutique sénégalaise.</p>
          <Link href="/atlas" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#74e1d6]"><MapPinned size={15}/> Explorer l’Atlas</Link>
          <p className="mt-5 text-[11px] leading-5 text-white/35">Les données de démonstration ou d’illustration sont identifiées comme telles et ne sont jamais présentées comme des données officielles.</p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-[10px] font-black uppercase tracking-[.12em] text-white/32">{column.title}</p>
            <div className="mt-4 space-y-3">
              {column.links.map(([label, href]) => (
                <Link key={href} href={href} className="flex items-center gap-1.5 text-sm font-semibold text-white/64 transition hover:text-[#74e1d6]">
                  {label}{label === "Accès professionnel" && <ArrowUpRight size={13}/>}                
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 flex max-w-[1500px] flex-col gap-2 border-t border-white/8 pt-6 text-[11px] text-white/32 sm:flex-row sm:justify-between">
        <span>© 2026 Mbàmbulaan Sénégal</span>
        <span>Connecter les acteurs · coordonner les territoires · faire circuler la valeur</span>
      </div>
    </footer>
  );
}
