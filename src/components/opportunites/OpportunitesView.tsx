import Link from "next/link";
import type { MatchingSummary, Opportunite } from "@/lib/matching";

type OpportunitesViewProps = {
  opportunites: Opportunite[];
  summary: MatchingSummary;
};

export function OpportunitesView({ opportunites, summary }: OpportunitesViewProps) {
  return (
    <main className="min-h-screen bg-[#f7f4ec] px-5 py-8 text-[#14312d] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="inline-flex rounded-full border border-[#14312d]/15 px-4 py-2 text-sm font-bold text-[#14312d] transition hover:border-[#14312d]">
          Retour a l'accueil
        </Link>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Opportunites</p>
              <h1 className="mt-4 text-4xl font-black sm:text-5xl">Matching arrivages et besoins</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#14312d]/70">
                Detection automatique des correspondances simples entre les lots disponibles et les besoins d'achat publies.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:min-w-[34rem]">
              <Metric value={String(summary.nombreOpportunites)} label="Opportunites" />
              <Metric value={`${summary.tauxCouvertureBesoins}%`} label="Couverture besoins" />
              <Metric value={String(summary.arrivagesDisponibles)} label="Arrivages disponibles" />
            </div>
          </div>

          <div className="mt-8 hidden overflow-hidden rounded-3xl border border-[#14312d]/10 lg:block">
            <table className="w-full border-collapse bg-white text-left">
              <thead className="bg-[#14312d] text-white">
                <tr>
                  <ColumnHeader>Espece</ColumnHeader>
                  <ColumnHeader>Quai</ColumnHeader>
                  <ColumnHeader>Vendeur</ColumnHeader>
                  <ColumnHeader>Acheteur</ColumnHeader>
                  <ColumnHeader>Disponible</ColumnHeader>
                  <ColumnHeader>Demandee</ColumnHeader>
                  <ColumnHeader>Statut</ColumnHeader>
                </tr>
              </thead>
              <tbody>
                {opportunites.map((opportunite) => (
                  <tr key={opportunite.id} className="border-t border-[#14312d]/10">
                    <Cell strong>{opportunite.espece}</Cell>
                    <Cell>{opportunite.quai}</Cell>
                    <Cell>{opportunite.vendeur}</Cell>
                    <Cell>{opportunite.acheteur}</Cell>
                    <Cell>{opportunite.quantiteDisponible}</Cell>
                    <Cell>{opportunite.quantiteDemandee}</Cell>
                    <Cell>
                      <StatusBadge>{opportunite.statut}</StatusBadge>
                    </Cell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid gap-4 lg:hidden">
            {opportunites.map((opportunite) => (
              <article key={opportunite.id} className="rounded-3xl border border-[#14312d]/10 bg-[#f7f4ec] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black">{opportunite.espece}</h2>
                    <p className="mt-2 text-sm font-semibold text-[#14312d]/65">{opportunite.quai}</p>
                  </div>
                  <StatusBadge>{opportunite.statut}</StatusBadge>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <MobileDetail label="Disponible" value={opportunite.quantiteDisponible} />
                  <MobileDetail label="Demandee" value={opportunite.quantiteDemandee} />
                </div>
                <div className="mt-4 grid gap-3">
                  <MobileDetail label="Vendeur" value={opportunite.vendeur} />
                  <MobileDetail label="Acheteur" value={opportunite.acheteur} />
                </div>
              </article>
            ))}
          </div>

          {opportunites.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-[#14312d]/20 p-8 text-center">
              <p className="text-lg font-black">Aucune correspondance detectee.</p>
              <p className="mt-2 text-sm text-[#14312d]/65">Publiez de nouveaux besoins ou arrivages pour generer des opportunites.</p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-[#f7f4ec] p-5">
      <p className="text-3xl font-black">{value}</p>
      <p className="mt-2 text-sm font-semibold text-[#14312d]/65">{label}</p>
    </div>
  );
}

function ColumnHeader({ children }: { children: React.ReactNode }) {
  return <th className="px-5 py-4 text-sm font-black uppercase tracking-[0.12em]">{children}</th>;
}

function Cell({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) {
  return <td className={`px-5 py-5 text-sm ${strong ? "font-black" : "font-semibold text-[#14312d]/70"}`}>{children}</td>;
}

function StatusBadge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex rounded-full bg-[#d8f3dc] px-3 py-1 text-xs font-black text-[#1b5e20] ring-1 ring-[#95d5b2]">{children}</span>;
}

function MobileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{label}</p>
      <p className="mt-2 text-lg font-black">{value}</p>
    </div>
  );
}
