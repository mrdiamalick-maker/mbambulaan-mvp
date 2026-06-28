import Link from "next/link";
import type { WorkspacePageData } from "@/data/workspace";

export function WorkspacePage({ page }: { page: WorkspacePageData }) {
  return (
    <main className="min-h-screen bg-[#f7f4ec] px-5 py-8 text-[#14312d] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm font-bold text-[#d65a31]">
          Retour a l'accueil
        </Link>
        <section className="mt-10 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#14312d]/10 sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">{page.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">{page.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#14312d]/70">{page.description}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {page.metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl bg-[#f7f4ec] p-5">
                <p className="text-3xl font-black">{metric.value}</p>
                <p className="mt-2 text-sm font-semibold text-[#14312d]/65">{metric.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
