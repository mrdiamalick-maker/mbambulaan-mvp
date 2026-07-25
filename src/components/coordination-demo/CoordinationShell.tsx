"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useCoordinationDemo } from "./CoordinationDemoProvider";

const roleLinks = [
  { href: "/terrain", label: "Terrain", hint: "Remonter et suivre" },
  { href: "/coordinateur", label: "Coordination", hint: "Organiser la réponse" },
  { href: "/responsable", label: "Interventions", hint: "Agir sur le terrain" },
  { href: "/pilotage", label: "Pilotage", hint: "Voir les résultats" }
];

type CoordinationShellProps = {
  children: ReactNode;
  eyebrow: string;
  title: string;
  intro: string;
  action?: ReactNode;
};

export function CoordinationShell({ children, eyebrow, title, intro, action }: CoordinationShellProps) {
  const pathname = usePathname();
  const { resetDemo } = useCoordinationDemo();

  return (
    <div data-private-console className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f3f6f5] text-[#142926]">
      <header className="border-b border-[#173f3a]/12 bg-[#082f35] text-white">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/20 bg-[#0f5861] text-sm font-black">
              MB
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-black">Mbàmbulaan</span>
              <span className="block truncate text-[11px] font-semibold text-white/62">Coordination territoriale</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/demo-coordination"
              className="hidden rounded-md border border-white/18 px-3 py-2 text-xs font-bold text-white/80 transition hover:bg-white/10 sm:inline-flex"
            >
              Guide de démonstration
            </Link>
            <button
              type="button"
              onClick={resetDemo}
              className="rounded-md bg-[#d8ebe6] px-3 py-2 text-xs font-black text-[#083a3f] transition hover:bg-white"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </header>

      <nav aria-label="Espaces de démonstration" className="border-b border-[#173f3a]/10 bg-white">
        <div className="mx-auto flex max-w-[90rem] gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
          {roleLinks.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`min-w-fit border-b-2 px-3 py-3 text-left transition sm:px-4 ${
                  active
                    ? "border-[#087c78] text-[#075e5b]"
                    : "border-transparent text-[#506763] hover:border-[#9cc8c1] hover:text-[#183f3a]"
                }`}
              >
                <span className="block text-xs font-black sm:text-sm">{item.label}</span>
                <span className="hidden text-[10px] font-semibold opacity-70 md:block">{item.hint}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto min-w-0 max-w-[90rem] overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <section className="mb-6 flex flex-col gap-4 border-b border-[#173f3a]/12 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#087c78]">{eyebrow}</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-[#102f2b] sm:text-3xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#58706c]">{intro}</p>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </section>
        <div className="min-w-0 max-w-full">{children}</div>
      </main>
    </div>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#087c78] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#065f5c] focus:outline-none focus:ring-2 focus:ring-[#087c78] focus:ring-offset-2"
    >
      {children}
    </Link>
  );
}

export function SecondaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#9eb7b2] bg-white px-5 text-sm font-black text-[#1d4d47] transition hover:border-[#087c78] hover:bg-[#f3fbf9]"
    >
      {children}
    </Link>
  );
}
