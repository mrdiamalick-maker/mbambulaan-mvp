"use client";

import {
  ArrowRight,
  CheckCircle2,
  Handshake,
  UsersRound
} from "lucide-react";
import type {
  CoordinationSpace,
  ProductState
} from "@/domain/types";

export function CoordinationProposal({
  coordination,
  state
}: {
  coordination?: CoordinationSpace;
  state: ProductState;
}) {
  if (!coordination) {
    return (
      <section className="surface p-6">
        <p className="label">
          Coordination recommandée
        </p>

        <h2 className="mt-3 text-xl font-black text-[var(--ink)]">
          Préparer une réponse coordonnée
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--legacy-muted)]">
          Les acteurs concernés pourront être mobilisés lorsque la situation nécessitera une action collective.
        </p>
      </section>
    );
  }

  const actors = state.actors.filter(
    (actor) =>
      coordination.participantIds.includes(actor.id)
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-[#c7d9dc] bg-white">

      <div className="bg-[#031a22] p-6 text-white">

        <div className="flex items-center gap-2 text-[#74e1d6]">
          <Handshake size={18}/>
          <p className="text-xs font-black uppercase tracking-[.12em]">
            Coordination active
          </p>
        </div>

        <h2 className="mt-3 text-2xl font-black">
          {coordination.title}
        </h2>

        <p className="mt-3 text-sm leading-6 text-white/60">
          {coordination.objective}
        </p>

      </div>


      <div className="grid gap-5 p-6 lg:grid-cols-2">

        <div>

          <p className="label">
            Acteurs mobilisés
          </p>

          <div className="mt-4 space-y-3">

            {actors.map((actor)=>(
              <div
                key={actor.id}
                className="flex items-center gap-3 rounded-xl bg-[var(--canvas)] p-3"
              >

                <span className="grid size-9 place-items-center rounded-full bg-white text-[#08758a]">
                  <UsersRound size={16}/>
                </span>

                <div>
                  <p className="text-sm font-bold text-[var(--ink)]">
                    {actor.name}
                  </p>

                  <p className="text-xs text-[var(--legacy-muted)]">
                    {actor.role.replaceAll("_", " ")}
                    {actor.verified && " · Vérifié"}
                  </p>
                </div>

              </div>
            ))}

          </div>

        </div>


        <div>

          <p className="label">
            Engagements
          </p>

          <div className="mt-4 space-y-3">

            {coordination.commitments.map((commitment)=>(
              <div
                key={commitment.id}
                className="rounded-xl border border-[var(--line)] p-3"
              >

                <div className="flex items-start gap-2">

                  <CheckCircle2
                    size={16}
                    className="mt-1 text-[#118f83]"
                  />

                  <div>
                    <p className="text-sm font-bold text-[var(--ink)]">
                      {commitment.label}
                    </p>

                    <p className="mt-1 text-xs text-[var(--legacy-muted)]">
                      Statut : {commitment.status.replaceAll("_", " ")}
                    </p>
                  </div>

                </div>

              </div>
            ))}

          </div>

        </div>

      </div>


      <div className="border-t border-[var(--line)] p-5">

        <div className="flex items-center justify-between gap-4">

          <p className="text-sm font-bold text-[var(--ink)]">
            Décision :
            {" "}
            {coordination.decision}
          </p>

          <ArrowRight
            size={18}
            className="text-[#08758a]"
          />

        </div>

      </div>

    </section>
  );
}