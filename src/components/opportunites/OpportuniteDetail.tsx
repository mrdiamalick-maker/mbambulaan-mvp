import Link from "next/link";
import type { Opportunite } from "@/lib/matching";

export function OpportuniteDetail({ opportunite }: { opportunite: Opportunite }) {
  return (
    <main className="min-h-screen bg-[#f7f4ec] px-5 py-8 text-[#14312d] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/opportunites" className="inline-flex rounded-full border border-[#14312d]/15 px-4 py-2 text-sm font-bold text-[#14312d] transition hover:border-[#14312d]">
          Retour aux opportunites
        </Link>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Detail opportunite</p>
              <h1 className="mt-4 text-4xl font-black sm:text-5xl">{opportunite.espece}</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#14312d]/70">
                Proposition de mise en relation entre un besoin d'achat et un arrivage compatible.
              </p>
            </div>
            <div className="rounded-3xl bg-[#f7f4ec] p-6 lg:min-w-80">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#d65a31]">Compatibilite</p>
              <p className="mt-3 text-5xl font-black">{opportunite.scoreCompatibilite}%</p>
              <p className="mt-2 text-sm font-semibold text-[#14312d]/65">Compatible à {opportunite.scoreCompatibilite}%</p>
              <span className="mt-5 inline-flex rounded-full bg-[#d8f3dc] px-3 py-1 text-xs font-black text-[#1b5e20] ring-1 ring-[#95d5b2]">
                {opportunite.statut}
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <InfoPanel title="Informations de l'offre">
              <DetailLine label="Acteur concerne" value={opportunite.offre.vendeur} />
              <DetailLine label="Espece" value={opportunite.espece} />
              <DetailLine label="Quantite disponible" value={opportunite.offre.quantite} />
              <DetailLine label="Lieu" value={opportunite.offre.quai} />
              <DetailLine label="Heure de debarquement" value={opportunite.offre.heureDebarquement} />
              <DetailLine label="Statut arrivage" value={opportunite.offre.statut} />
            </InfoPanel>

            <InfoPanel title="Informations du besoin">
              <DetailLine label="Acteur demandeur" value={opportunite.besoin.acheteur} />
              <DetailLine label="Espece recherchee" value={opportunite.espece} />
              <DetailLine label="Quantite demandee" value={opportunite.besoin.quantite} />
              <DetailLine label="Quai cible" value={opportunite.besoin.quai} />
              <DetailLine label="Urgence" value={opportunite.besoin.urgence} />
              <DetailLine label="Commentaire" value={opportunite.besoin.commentaire} />
            </InfoPanel>
          </div>

          <div className="mt-8 rounded-3xl bg-[#f7f4ec] p-6">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Pourquoi ce rapprochement</p>
            <div className="mt-5 grid gap-3">
              {opportunite.raisons.map((raison) => (
                <p key={raison} className="rounded-2xl bg-white p-4 text-sm font-bold leading-6 text-[#14312d]/75">
                  {raison}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-[#14312d]/10 p-6">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Acteurs concernes</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <ActorCard label="Demandeur" value={opportunite.acheteur} />
              <ActorCard label="Acteur concerne" value={opportunite.vendeur} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoPanel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="rounded-3xl bg-[#f7f4ec] p-6">
      <h2 className="text-2xl font-black">{title}</h2>
      <div className="mt-5 grid gap-3">{children}</div>
    </section>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{label}</p>
      <p className="mt-2 text-base font-black">{value}</p>
    </div>
  );
}

function ActorCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f7f4ec] p-5">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}
