// QuoteBlock — checkpoint E (mandat Public V1, §2/§4) : citation ou
// témoignage simple. `status` doit toujours être renseigné honnêtement :
// "demonstration" (illustratif, jamais attribué à une personne réelle
// nommée) ou "verified" (propos réellement recueilli et vérifié). Le
// statut est toujours affiché — jamais une citation présentée comme
// réelle sans pouvoir l'être.
import { Quote } from "lucide-react";

export interface PublicQuote {
  text: string;
  attribution: string;
  status: "demonstration" | "verified";
}

export function QuoteBlock({ quote }: { quote: PublicQuote }) {
  return (
    <figure className="rounded-[var(--pub-radius-md)] border border-[var(--pub-stone-150)] bg-[var(--pub-ivory-200)] p-6 md:p-7">
      <Quote size={22} className="text-[var(--pub-turquoise-500)]" />
      <blockquote className="mt-4 text-lg font-[600] leading-7 text-[var(--pub-deep-900)]">{quote.text}</blockquote>
      <figcaption className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-bold text-[var(--pub-stone-700)]">{quote.attribution}</span>
        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em] ${quote.status === "demonstration" ? "border-[var(--pub-stone-150)] bg-white text-[var(--pub-stone-500)]" : "border-transparent bg-[var(--pub-turquoise-500)] text-white"}`}>
          {quote.status === "demonstration" ? "Illustration · démonstration" : "Témoignage vérifié"}
        </span>
      </figcaption>
    </figure>
  );
}
