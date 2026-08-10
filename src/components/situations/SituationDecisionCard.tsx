"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3
} from "lucide-react";
import type { ProductState, Situation } from "@/domain/types";

export function SituationDecisionCard({
  situation,
  state
}: {
  situation: Situation;
  state: ProductState;
}) {
  const territory = state.territories.find(
    (item) => item.id === situation.territoryId
  );

  const responsible = state.actors.find(
    (item) => item.id === situation.responsibleId
  );

  const priorityLabel = {
    critique: "Critique",
    haute: "Haute",
    moyenne: "Moyenne",
    faible: "Faible"
  }[situation.priority];

  const statusLabel = {
    recue: "Signal reçu",
    qualification: "Qualification",
    priorisee: "Priorisée",
    coordination: "Coordination",
    intervention: "Intervention",
    attente: "En attente",
    resultat: "Résultat attendu",
    reglee: "Réglée"
  }[situation.status];

  return (
    <article className="surface overflow-hidden">

      <div className="border-b border-[var(--line)] bg-[var(--canvas)] p-5">
        <div className="flex items-start justify-between gap-4">

          <div>
            <div className="flex items-center gap-2">
              {situation.priority === "critique" ? (
                <AlertTriangle
                  size={18}
                  className="text-[var(--coral-600)]"
                />
              ) : (
                <CheckCircle2
                  size={18}
                  className="text-[var(--lagoon-600)]"
                />
              )}

              <p className="label">
                {statusLabel}
              </p>
            </div>

            <h3 className="mt-3 text-xl font-black text-[var(--ink)]">
              {situation.title}
            </h3>

            <p className="mt-2 text-sm text-[var(--legacy-muted)]">
              {territory?.name}
            </p>
          </div>

          <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-bold">
            {priorityLabel}
          </span>

        </div>
      </div>


      <div className="grid gap-4 p-5 md:grid-cols-3">

        <div>
          <p className="label">
            Situation
          </p>

          <p className="mt-2 text-sm leading-6 text-[var(--ink)]">
            {situation.description}
          </p>
        </div>


        <div>
          <p className="label">
            Décision attendue
          </p>

          <p className="mt-2 text-sm font-bold text-[var(--ink)]">
            {situation.nextStep}
          </p>
        </div>


        <div>
          <p className="label">
            Responsable
          </p>

          <p className="mt-2 text-sm font-bold text-[var(--ink)]">
            {responsible?.name ?? "À définir"}
          </p>

          {situation.dueAt && (
            <p className="mt-2 flex items-center gap-1 text-xs text-[var(--legacy-muted)]">
              <Clock3 size={13}/>
              Échéance définie
            </p>
          )}
        </div>

      </div>


      <div className="flex justify-end border-t border-[var(--line)] p-4">

        <Link
          href={`/app/situations/${situation.id}`}
          className="btn-secondary"
        >
          Ouvrir la situation
          <ArrowRight size={15}/>
        </Link>

      </div>

    </article>
  );
}