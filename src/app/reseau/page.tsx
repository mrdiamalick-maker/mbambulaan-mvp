import Link from "next/link";
import { ArrowRight, Building2, GraduationCap, Handshake, Network, PackageCheck, ShipWheel, Truck } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

const profiles = [
  { title: "Entreprise / prestataire", text: "Froid, maintenance, équipement, conseil, services techniques ou capacités spécialisées.", icon: Building2 },
  { title: "Transport / logistique", text: "Transport, collecte, livraison, manutention ou chaîne du froid.", icon: Truck },
  { title: "Formation / expertise", text: "Compétences, accompagnement, diagnostic, recherche ou expertise sectorielle.", icon: GraduationCap },
  { title: "ONG / programme / financeur", text: "Programmes de développement, financement, appui technique ou intervention territoriale.", icon: Handshake },
  { title: "Organisation professionnelle", text: "Besoins collectifs, représentation, services aux membres et coordination territoriale.", icon: ShipWheel },
  { title: "Acheteur / débouché", text: "Sourcing, distribution, transformation, approvisionnement ou partenariat commercial.", icon: PackageCheck }
] as const;

export default function NetworkPage() {
  return (
    <main className="min-h-screen bg-[#f6f1e7] text-[#10373a]">
      <PublicHeader />
      <section className="border-b border-[#ded2bd] bg-[#fffaf0] px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[#0a6d68]"><Network size={16} /> Réseau Mbàmbulaan</div>
            <h1 className="mt-5 font-serif text-5xl leading-[.98] tracking-[-.045em] md:text-7xl">Vous pouvez apporter une capacité utile ?</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#60716f]">Faites connaître votre organisation, vos capacités et vos territoires d’intervention. Une soumission ne crée pas automatiquement un référencement : Mbàmbulaan qualifie la relation avant toute mise en relation.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-16">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map(({ title, text, icon: Icon }) => (
            <article key={title} className="rounded-[22px] border border-[#ded5c5] bg-white p-5 shadow-[0_18px_45px_rgba(16,55,58,.05)]">
              <span className="grid size-11 place-items-center rounded-xl bg-[#e5f7f3] text-[#075568]"><Icon size={20} /></span>
              <h2 className="mt-5 text-xl font-black tracking-[-.025em]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#667b81]">{text}</p>
            </article>
          ))}
        </div>

        <section className="mt-12 rounded-[28px] bg-[#031a22] p-6 text-white md:p-10">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[.14em] text-[#74e1d6]">Proposer une capacité</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-.04em]">Présentez ce que vous pouvez apporter à l’économie maritime.</h2>
            <p className="mt-4 text-sm leading-7 text-white/64">La V1 collecte les propositions via Mbàmbulaan, puis l’équipe qualifie le service, la couverture territoriale et les conditions de mobilisation avant de poursuivre.</p>
            <Link href="/contact?intent=network" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#5fe0d3] px-5 py-3 font-black text-[#031a22]">Proposer mes services <ArrowRight size={17} /></Link>
          </div>
        </section>
      </section>
      <PublicFooter />
    </main>
  );
}
