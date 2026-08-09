import { CheckCircle2, Compass, Gauge, UsersRound } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { ContactForm } from "@/components/public/ContactForm";
import { PublicFooter } from "@/components/public/PublicFooter";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f3f7f6]">
      <PublicHeader dark />
      <section className="bg-[#031a22] px-5 pb-16 pt-14 text-white md:px-10 md:pb-20 md:pt-20"><div className="mx-auto max-w-[1500px]"><p className="label-inverse">Partenariat et déploiement</p><h1 className="mt-4 max-w-5xl text-4xl font-[760] leading-[1.02] tracking-[-.05em] md:text-6xl">Quel résultat votre territoire doit-il obtenir ?</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-white/66">Nous cadrons le problème, les acteurs, les sources, le payeur, les responsabilités et la preuve de valeur avant de parler d’écrans ou de licences.</p></div></section>
      <section className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 md:px-10 md:py-20 lg:grid-cols-[.68fr_1.32fr]">
        <div><p className="label">Un pilote Mbàmbulaan</p><h2 className="mt-3 text-3xl font-[740] tracking-[-.04em]">Petit périmètre. Boucle complète. Valeur mesurable.</h2><div className="mt-8 space-y-4">{[
          [Compass,"Un problème prioritaire","Une rupture de coordination suffisamment coûteuse ou fréquente pour justifier une action."],
          [UsersRound,"Des acteurs mandatés","Ceux qui signalent, décident, agissent, bénéficient et financent sont identifiés."],
          [Gauge,"Trois à cinq indicateurs","Délai, pertes évitées, couverture, complétude, qualité de service ou résultat économique."],
          [CheckCircle2,"Une décision de suite","Étendre, ajuster ou arrêter selon les résultats documentés du pilote."]
        ].map(([Icon,title,text])=>{const ItemIcon=Icon as typeof Compass;return <div key={String(title)} className="flex gap-4 border-b border-[#d9e3e3] pb-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e5f7f3] text-[#075568]"><ItemIcon size={18}/></span><div><p className="font-bold">{String(title)}</p><p className="mt-1 text-sm leading-6 text-[#667b81]">{String(text)}</p></div></div>})}</div></div>
        <ContactForm />
      </section>
      <PublicFooter />
    </main>
  );
}
