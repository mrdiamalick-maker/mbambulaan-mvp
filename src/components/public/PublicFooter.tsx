import Link from "next/link";
import { ArrowUpRight, MapPinned } from "lucide-react";

const columns = [
  {
    title: "Explorer",
    links: [["Découvrir", "/decouvrir"], ["Territoires", "/atlas"], ["Opportunités", "/opportunites"]]
  },
  {
    // LOT 6 (mandat "Public — Comprendre, trouver, contribuer", §28) —
    // "Signaler / corriger" existait déjà (accessible depuis l'Atlas,
    // territoire par territoire) mais n'avait aucune porte d'entrée
    // globale visible depuis le footer, contrairement à "Proposer une
    // capacité". Complète les 3 types de contribution du mandat sans
    // ajouter de nouveau formulaire (réutilise /contact?intent=correction,
    // déjà câblé).
    title: "Agir",
    links: [["Décrire une situation", "/solutions"], ["Proposer une capacité", "/contact?intent=contribution"], ["Signaler une correction", "/contact?intent=correction"], ["Contact", "/contact"], ["Accès professionnel", "/connexion"]]
  },
  {
    title: "Mbàmbulaan",
    links: [["Notre approche", "/mbambulaan"], ["Confidentialité", "/confidentialite"], ["Mentions légales", "/mentions-legales"]]
  }
] as const;

export function PublicFooter() {
  return (
    <footer className="pub-hero border-t border-white/8 px-5 py-14 text-white md:px-10">
      <div className="mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-[1.5fr_.55fr_.55fr_.55fr]">
        <div className="max-w-md">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="pub-display text-2xl italic leading-none text-[var(--pub-turquoise-400)]">M</span>
            <span>
              <strong className="brand-wordmark pub-display block text-lg not-italic">Mbàmbulaan</strong>
              <span className="text-xs text-white/45">Économie maritime · terrain, réseau, technologie</span>
            </span>
          </Link>
          <p className="mt-5 text-sm leading-6 text-white/54">Mbàmbulaan relie territoires, situations et capacités pour mieux coordonner l’action, en commençant par la pêche artisanale sénégalaise.</p>
          <Link href="/atlas" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--pub-turquoise-300)]"><MapPinned size={15}/> Ouvrir l’Atlas</Link>
          <p className="mt-5 text-[11px] leading-5 text-white/35">Les données de démonstration ou d’illustration sont identifiées comme telles et ne sont jamais présentées comme des données officielles.</p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-[10px] font-black uppercase tracking-[.12em] text-white/32">{column.title}</p>
            <div className="mt-4 space-y-3">
              {column.links.map(([label, href]) => (
                <Link key={href} href={href} className="flex items-center gap-1.5 text-sm font-semibold text-white/64 transition hover:text-[var(--pub-turquoise-300)]">
                  {label}{label === "Accès professionnel" && <ArrowUpRight size={13}/>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="pub-tideline mx-auto mt-10 max-w-[1500px]" />
      <div className="mx-auto mt-6 flex max-w-[1500px] flex-col gap-2 text-[11px] text-white/32 sm:flex-row sm:justify-between">
        <span>© 2026 Mbàmbulaan Sénégal</span>
        <span>Relier les territoires · qualifier les situations · mobiliser les capacités · coordonner l’action</span>
      </div>
    </footer>
  );
}
