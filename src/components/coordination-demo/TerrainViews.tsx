"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DEMO_SITUATION_ID, type Urgency } from "@/lib/coordination-demo";
import { CoordinationShell, PrimaryLink, SecondaryLink } from "./CoordinationShell";
import { NextStep, Panel, Progress, SituationCard, SituationFacts, StatusPill, Timeline, UrgencyPill } from "./CoordinationUI";
import { useCoordinationDemo } from "./CoordinationDemoProvider";

const fieldClass =
  "mt-2 min-h-11 w-full rounded-md border border-[#a9bdb9] bg-white px-3 text-sm font-semibold text-[#173d38] outline-none transition placeholder:text-[#91a19e] focus:border-[#087c78] focus:ring-2 focus:ring-[#087c78]/15";

export function TerrainHome() {
  const { situations } = useCoordinationDemo();
  const ownSituations = situations.filter((item) => item.reportedBy.includes("Ibrahima") || item.id === DEMO_SITUATION_ID).slice(0, 3);

  return (
    <CoordinationShell
      eyebrow="Espace acteur terrain"
      title="Une difficulté ne doit plus rester sans réponse"
      intro="Remontez ce qui bloque sur le site, puis suivez simplement qui s’en occupe et ce qui va se passer."
      action={<PrimaryLink href="/terrain/remonter">Remonter une difficulté</PrimaryLink>}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <ActionCard number="1" title="Remonter une difficulté" detail="Décrivez le problème, le site et l’urgence en quelques champs." href="/terrain/remonter" />
        <ActionCard number="2" title="Suivre ma situation" detail="Voyez le statut, le responsable et la prochaine étape." href={`/terrain/situations/${DEMO_SITUATION_ID}`} />
        <ActionCard number="3" title="Voir ce qui a été fait" detail="Consultez le résultat et l’élément de confirmation." href="/terrain?filtre=regle" />
      </section>

      <Panel title="Mes situations" intro="Les informations utiles, sans détails internes." className="mt-6">
        <div className="grid gap-3 lg:grid-cols-3">
          {ownSituations.map((situation) => (
            <SituationCard key={situation.id} situation={situation} href={`/terrain/situations/${situation.id}`} />
          ))}
        </div>
      </Panel>
    </CoordinationShell>
  );
}

function ActionCard({ number, title, detail, href }: { number: string; title: string; detail: string; href: string }) {
  return (
    <a href={href} className="group rounded-lg border border-[#173f3a]/12 bg-white p-5 transition hover:border-[#45a096] hover:bg-[#f8fdfc]">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e4f2ef] text-xs font-black text-[#087c78]">{number}</span>
      <h2 className="mt-5 text-base font-black text-[#183f39] group-hover:text-[#087c78]">{title}</h2>
      <p className="mt-2 text-xs font-medium leading-5 text-[#647975]">{detail}</p>
    </a>
  );
}

export function ReportDifficultyForm() {
  const router = useRouter();
  const { createSituation } = useCoordinationDemo();
  const [errors, setErrors] = useState<string[]>([]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const type = String(form.get("type") ?? "").trim();
    const site = String(form.get("site") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const urgency = String(form.get("urgency") ?? "") as Urgency;
    const reportedBy = String(form.get("reportedBy") ?? "").trim();
    const reporterContact = String(form.get("reporterContact") ?? "").trim();
    const nextErrors = [
      !type && "Indiquez le type de difficulté.",
      !site && "Indiquez le site concerné.",
      description.length < 12 && "Décrivez la difficulté en au moins 12 caractères.",
      !["Faible", "Modérée", "Élevée"].includes(urgency) && "Choisissez un niveau d’urgence.",
      !reportedBy && "Indiquez votre nom ou votre structure.",
      !reporterContact && "Indiquez un moyen de contact."
    ].filter(Boolean) as string[];
    if (nextErrors.length) {
      setErrors(nextErrors);
      return;
    }
    const attachment = form.get("attachment");
    const id = createSituation({
      type,
      site,
      description,
      urgency,
      reportedBy,
      reporterContact,
      attachmentName: attachment instanceof File && attachment.name ? attachment.name : undefined
    });
    router.push(`/terrain/situations/${id}?creation=ok`);
  }

  return (
    <CoordinationShell
      eyebrow="Acteur terrain"
      title="Remonter une difficulté"
      intro="Un formulaire court. La coordination locale reçoit immédiatement la situation dans cette démonstration."
      action={<SecondaryLink href="/terrain">Retour à mon espace</SecondaryLink>}
    >
      <form onSubmit={submit} noValidate className="mx-auto max-w-3xl rounded-lg border border-[#173f3a]/12 bg-white">
        <div className="border-b border-[#173f3a]/10 bg-[#edf7f4] px-5 py-4 sm:px-7">
          <p className="text-xs font-bold leading-5 text-[#45645f]">Les champs marqués * sont nécessaires pour organiser une première réponse.</p>
        </div>
        <div className="space-y-6 p-5 sm:p-7">
          {errors.length ? (
            <div role="alert" className="rounded-md border border-[#d99a84] bg-[#fff1ec] p-4">
              <p className="text-sm font-black text-[#8c402e]">Vérifiez les informations suivantes :</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs font-semibold text-[#8c402e]">
                {errors.map((error) => <li key={error}>{error}</li>)}
              </ul>
            </div>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-xs font-black text-[#264c46]">
              Type de difficulté *
              <select name="type" defaultValue="Machine à glace en panne" className={fieldClass}>
                <option>Machine à glace en panne</option>
                <option>Équipement indisponible</option>
                <option>Accès au quai perturbé</option>
                <option>Manque de caisses</option>
                <option>Problème d’eau ou d’hygiène</option>
              </select>
            </label>
            <label className="text-xs font-black text-[#264c46]">
              Site concerné *
              <select name="site" defaultValue="Quai de débarquement de Mbao" className={fieldClass}>
                <option>Quai de débarquement de Mbao</option>
                <option>Quai de débarquement de Hann</option>
                <option>Quai de débarquement de Joal-Fadiouth</option>
                <option>Quai de débarquement de Kayar</option>
              </select>
            </label>
          </div>

          <label className="block text-xs font-black text-[#264c46]">
            Description courte *
            <textarea
              name="description"
              rows={4}
              defaultValue="La machine à glace ne produit plus depuis ce matin. Les produits débarqués risquent de ne pas être conservés correctement."
              className={`${fieldClass} py-3`}
            />
            <span className="mt-2 block text-[10px] font-semibold text-[#758783]">Décrivez ce qui se passe et qui est concerné.</span>
          </label>

          <fieldset>
            <legend className="text-xs font-black text-[#264c46]">Niveau d’urgence *</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {(["Faible", "Modérée", "Élevée"] as Urgency[]).map((urgency) => (
                <label key={urgency} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[#afc1bd] bg-white px-3 text-xs font-bold text-[#395b56] has-[:checked]:border-[#087c78] has-[:checked]:bg-[#e9f6f3]">
                  <input type="radio" name="urgency" value={urgency} defaultChecked={urgency === "Élevée"} className="accent-[#087c78]" />
                  {urgency}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-xs font-black text-[#264c46]">
              Votre nom ou structure *
              <input name="reportedBy" defaultValue="Ibrahima Sarr — Gestionnaire du site" className={fieldClass} />
            </label>
            <label className="text-xs font-black text-[#264c46]">
              Téléphone ou contact *
              <input name="reporterContact" type="tel" defaultValue="+221 77 000 00 10" className={fieldClass} />
            </label>
          </div>

          <label className="block text-xs font-black text-[#264c46]">
            Photo ou document <span className="font-semibold text-[#758783]">(facultatif)</span>
            <input name="attachment" type="file" accept="image/*,.pdf" className={`${fieldClass} file:mr-3 file:border-0 file:bg-[#e6f2ef] file:px-3 file:py-2 file:text-xs file:font-black file:text-[#087c78]`} />
          </label>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-[#173f3a]/10 bg-[#fafcfb] px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
          <SecondaryLink href="/terrain">Annuler</SecondaryLink>
          <button type="submit" className="min-h-11 rounded-md bg-[#087c78] px-6 text-sm font-black text-white transition hover:bg-[#065e5b]">
            Envoyer la difficulté
          </button>
        </div>
      </form>
    </CoordinationShell>
  );
}

export function TerrainSituationDetail({ id, created = false }: { id: string; created?: boolean }) {
  const { getSituation } = useCoordinationDemo();
  const situation = getSituation(id);

  if (!situation) {
    return (
      <CoordinationShell eyebrow="Suivi terrain" title="Situation introuvable" intro="Cette situation n’existe pas dans les données locales.">
        <PrimaryLink href="/terrain">Retour à mes situations</PrimaryLink>
      </CoordinationShell>
    );
  }

  return (
    <CoordinationShell
      eyebrow="Suivi terrain"
      title={situation.title}
      intro={`${situation.id} · ${situation.site}`}
      action={<SecondaryLink href="/terrain">Mes situations</SecondaryLink>}
    >
      {created ? (
        <div role="status" className="mb-5 rounded-md border border-[#72aa84] bg-[#edf8f0] p-4">
          <p className="text-sm font-black text-[#245c36]">Votre difficulté a bien été reçue.</p>
          <p className="mt-1 text-xs font-semibold text-[#4c7157]">Numéro de suivi : {situation.id}. Conservez-le pour retrouver la situation.</p>
        </div>
      ) : null}

      <div className="grid min-w-0 max-w-full gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="min-w-0 max-w-full space-y-5">
          <Panel title="Où en est la situation ?">
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill status={situation.status} />
              <UrgencyPill urgency={situation.urgency} />
            </div>
            <div className="mt-6"><Progress status={situation.status} /></div>
            <div className="mt-6"><NextStep situation={situation} /></div>
          </Panel>
          <Panel title="Ce que vous avez remonté">
            <p className="text-sm font-medium leading-6 text-[#48635e]">{situation.description}</p>
            <div className="mt-5"><SituationFacts situation={situation} terrain /></div>
          </Panel>
          {situation.status === "Réglé" ? (
            <Panel title="Ce qui a été fait">
              <div className="rounded-md border border-[#85b394] bg-[#eff8f1] p-4">
                <p className="text-sm font-black text-[#295d39]">{situation.resultNote}</p>
                <p className="mt-3 text-xs font-semibold leading-5 text-[#53725c]">Élément de confirmation : {situation.confirmation}</p>
              </div>
            </Panel>
          ) : null}
        </div>
        <Panel title="Historique simplifié" intro="Les étapes utiles pour suivre la prise en charge.">
          <Timeline situation={situation} simplified />
        </Panel>
      </div>
    </CoordinationShell>
  );
}
