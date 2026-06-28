import type { ProfileMetrics } from "@/lib/espaces";

export function ProfileSummary({ metrics, role }: { metrics: ProfileMetrics; role: string }) {
  return (
    <section className="rounded-3xl bg-[#f7f4ec] p-5">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">Profil actuel</p>
      <h2 className="mt-3 text-3xl font-black">{role}</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Notifications" value={String(metrics.notifications)} />
        <Metric label="Transactions" value={String(metrics.transactions)} />
        <Metric label="Opportunités" value={String(metrics.opportunites)} />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d65a31]">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}
