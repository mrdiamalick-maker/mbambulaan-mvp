"use client";

import {
  BadgeCheck,
  Handshake,
  UsersRound
} from "lucide-react";
import type { ProductState, Territory } from "@/domain/types";

export function ActorNetworkPanel({
  state,
  territory
}: {
  state: ProductState;
  territory: Territory;
}) {

  const actors = state.actors.filter(
    (actor) =>
      actor.territoryIds.includes(territory.id)
  );

  const commitments = state.coordinationSpaces
    .flatMap((space) => space.commitments)
    .filter((commitment) =>
      actors.some(
        (actor) => actor.id === commitment.actorId
      )
    );

  const activeCommitments = commitments.filter(
    (item) => item.status !== "terminee"
  );


  return (
    <section className="surface overflow-hidden">

      <div className="border-b border-[var(--line)] bg-[var(--canvas)] p-5">

        <div className="flex items-center gap-2 text-[#08758a]">
          <UsersRound size={18}/>
          <p className="label">
            Réseau territorial
          </p>
        </div>

        <h2 className="mt-2 text-2xl font-black text-[var(--ink)]">
          Les acteurs capables d&apos;agir
        </h2>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Acteurs présents sur le territoire et engagements associés.
        </p>

      </div>


      <div className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]">

        <div className="grid gap-3 md:grid-cols-2">

          {actors.slice(0, 6).map((actor) => (

            <div
              key={actor.id}
              className="rounded-xl border border-[var(--line)] bg-white p-4"
            >

              <div className="flex items-start justify-between gap-3">

                <div>

                  <p className="font-black text-[var(--ink)]">
                    {actor.name}
                  </p>

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {actor.role.replaceAll("_", " ")}
                  </p>

                </div>


                {actor.verified && (
                  <BadgeCheck
                    size={18}
                    className="text-[#118f83]"
                  />
                )}

              </div>


              <p className="mt-3 text-xs text-[var(--muted)]">
                {actor.phone}
              </p>

            </div>

          ))}

        </div>


        <div className="rounded-xl bg-[#031a22] p-5 text-white">

          <div className="flex items-center gap-2 text-[#74e1d6]">
            <Handshake size={17}/>
            <p className="text-xs font-black uppercase tracking-[.1em]">
              Coordination
            </p>
          </div>


          <p className="mt-4 text-3xl font-black">
            {activeCommitments.length}
          </p>

          <p className="mt-1 text-xs text-white/50">
            engagement(s) actif(s)
          </p>


          <div className="mt-5 border-t border-white/10 pt-4">

            <p className="text-xs font-bold text-white/50">
              Acteurs identifiés
            </p>

            <p className="mt-1 text-lg font-black">
              {actors.length}
            </p>

          </div>

        </div>

      </div>


      {actors.length === 0 && (
        <div className="p-6 text-sm text-[var(--muted)]">
          Aucun acteur identifié sur ce territoire.
        </div>
      )}

    </section>
  );
}