"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Factory,
  MessageCircleMore,
  Mic,
  PhoneCall,
  Send,
  ShipWheel,
  ShoppingBasket,
  Snowflake,
  UsersRound
} from "lucide-react";
import { getChannelMessage, getNextChannel } from "@/lib/mbambulaan/channel-routing";
import { sharedPurchaseDemo } from "@/lib/mbambulaan/purchase-demo";
import { sharedTransformationDemo } from "@/lib/mbambulaan/transformation-demo";

type Actor = "capitaine" | "operateur" | "mareyeur" | "transformateur" | "prestataire";

type Journey = {
  id: string;
  title: string;
  intro: string;
  questions: string[];
  replies: string[][];
  confirmation: string;
  result: string;
};

type ActorConfig = {
  label: string;
  identity: string;
  context: string;
  icon: typeof ShipWheel;
  journeys: Journey[];
};

const actors: Record<Actor, ActorConfig> = {
  capitaine: {
    label: "Capitaine",
    identity: "Mamadou Diop · Pirogue Ndeye Fatou",
    context: "Sortie, quai et téléphone déjà connus de Mbàmbulaan.",
    icon: ShipWheel,
    journeys: [
      {
        id: "retour",
        title: "Je rentre au quai",
        intro: "Bonjour Mamadou. Nous préparons votre arrivée à Hann.",
        questions: ["Dans combien de temps arrivez-vous ?", "De quoi avez-vous besoin ?"],
        replies: [["Moins d’1 heure", "1 à 2 heures", "Plus tard"], ["Place au quai", "Glace", "Manutention", "Rien"]],
        confirmation: "Le quai est prévenu et voit votre demande.",
        result: "Retour annoncé et préparation du quai demandée."
      },
      {
        id: "pesage",
        title: "Confirmer la pesée",
        intro: "Le quai a enregistré 420 kg.",
        questions: ["Le poids est-il correct ?"],
        replies: [["Oui", "Non, il faut vérifier", "Appelez-moi"]],
        confirmation: "Votre réponse est enregistrée.",
        result: "Pesée confirmée ou vérification demandée."
      }
    ]
  },
  operateur: {
    label: "Agent de quai",
    identity: "Agent quai de Hann",
    context: "Arrivée RET-2026-0814 reçue depuis le même moteur Mbàmbulaan.",
    icon: UsersRound,
    journeys: [
      {
        id: "arrivee",
        title: "Préparer une arrivée",
        intro: "La pirogue Ndeye Fatou arrive dans 1 à 2 heures.",
        questions: ["La place au quai est-elle prête ?", "La glace est-elle disponible ?"],
        replies: [["Oui", "Non", "À confirmer"], ["Oui", "Non", "À confirmer"]],
        confirmation: "Le capitaine reçoit l’état de préparation.",
        result: "État du quai mis à jour pour la même arrivée."
      },
      {
        id: "poids",
        title: "Partager la pesée",
        intro: "Le débarquement est terminé.",
        questions: ["Quel poids envoyer au capitaine ?"],
        replies: [["420 kg", "Corriger le poids", "Appelez-moi"]],
        confirmation: "Le poids est envoyé au capitaine.",
        result: "Pesée liée à l’arrivée et attente de confirmation."
      }
    ]
  },
  mareyeur: {
    label: "Mareyeur",
    identity: `${sharedPurchaseDemo.buyer} · Acheteuse référencée`,
    context: `Recherche ${sharedPurchaseDemo.needId} · préférences et zones habituelles déjà connues.`,
    icon: ShoppingBasket,
    journeys: [
      {
        id: "achat",
        title: "Je cherche du poisson",
        intro: `Bonjour ${sharedPurchaseDemo.buyer}. Dites-nous seulement ce qu’il vous faut aujourd’hui.`,
        questions: ["Quelle espèce cherchez-vous ?", "Quelle quantité environ ?", "Où voulez-vous récupérer ?", "Pour quand ?"],
        replies: [["Sardinelle", "Thiof", "Yaboy", "Autre"], ["Moins de 100 kg", "100 à 500 kg", "Plus de 500 kg"], ["Hann", "Soumbédioune", "Mbour"], ["Aujourd’hui", "Demain", "Cette semaine"]],
        confirmation: "Votre recherche est enregistrée. Mbàmbulaan vous prévient lorsqu’une proposition correspond.",
        result: "Votre recherche est reliée aux lots, lieux, délais et possibilités d’enlèvement utiles."
      },
      {
        id: "proposition",
        title: "Répondre à une proposition",
        intro: `${sharedPurchaseDemo.proposals[0].quantityKg} kg de ${sharedPurchaseDemo.proposals[0].species} sont proposés à ${sharedPurchaseDemo.proposals[0].site}.`,
        questions: ["Cette proposition vous intéresse-t-elle ?", "Que voulez-vous faire ensuite ?"],
        replies: [["Oui, je suis intéressée", "Non merci", "Montrez-moi une autre proposition", "Appelez-moi"], ["Réserver ce lot", "Organiser l’enlèvement", "Comparer avant de décider"]],
        confirmation: "Votre réponse est enregistrée.",
        result: "Votre réponse reste reliée à la même recherche."
      }
    ]
  },
  transformateur: {
    label: "Transformatrice",
    identity: `${sharedTransformationDemo.processor} · ${sharedTransformationDemo.unit}`,
    context: `Production ${sharedTransformationDemo.planId} · produit et échéance déjà connus.`,
    icon: Factory,
    journeys: [
      {
        id: "manque",
        title: "Il me manque du poisson",
        intro: `Bonjour ${sharedTransformationDemo.processor}. Que vous manque-t-il pour la production de ${sharedTransformationDemo.product} ?`,
        questions: ["Quelle quantité manque-t-il ?"],
        replies: [["Moins de 100 kg", "100 à 300 kg", "Plus de 300 kg", "Appelez-moi"]],
        confirmation: "C’est enregistré. Mbàmbulaan cherchera des disponibilités compatibles.",
        result: "La quantité manquante est ajoutée à la même production. La comparaison des options reste dans l’espace professionnel."
      },
      {
        id: "reponse-offre",
        title: "Répondre à une proposition",
        intro: `${sharedTransformationDemo.supplyOptions[0].quantityKg} kg de ${sharedTransformationDemo.supplyOptions[0].species} sont proposés à ${sharedTransformationDemo.supplyOptions[0].source}.`,
        questions: ["Cette proposition vous intéresse-t-elle ?"],
        replies: [["Oui", "Non", "Appelez-moi"]],
        confirmation: "Votre réponse est enregistrée.",
        result: "La réponse est reliée à la même production. Comparer plusieurs options, vérifier le froid ou organiser le transport se fait dans l’espace professionnel."
      },
      {
        id: "equipe",
        title: "Confirmer que l’équipe est prête",
        intro: `${sharedTransformationDemo.securedKg} kg sur ${sharedTransformationDemo.targetKg} kg sont déjà sécurisés.`,
        questions: ["Votre équipe est-elle prête ?"],
        replies: [["Oui", "Non", "À confirmer", "Appelez-moi"]],
        confirmation: "L’état de l’équipe est mis à jour.",
        result: "La préparation de l’équipe est enregistrée. La décision de lancer la production reste dans l’espace professionnel."
      }
    ]
  },
  prestataire: {
    label: "Prestataire",
    identity: "Ibrahima Fall · Froid et glace",
    context: "Équipement, zone et conditions déjà enregistrés.",
    icon: Snowflake,
    journeys: [
      {
        id: "capacite",
        title: "J’ai une capacité disponible",
        intro: "Bonjour Ibrahima. Que pouvez-vous proposer aujourd’hui ?",
        questions: ["Quel service est disponible ?", "Jusqu’à quand ?"],
        replies: [["Glace", "Chambre froide", "Transport"], ["Aujourd’hui", "Demain", "Cette semaine"]],
        confirmation: "Votre capacité est visible pour les acteurs concernés.",
        result: "Votre disponibilité est reliée au lieu et à la période."
      }
    ]
  }
};

function isActor(value: string | null): value is Actor {
  return value === "capitaine" || value === "operateur" || value === "mareyeur" || value === "transformateur" || value === "prestataire";
}

export default function MessagingSimulationPage() {
  const searchParams = useSearchParams();
  const requestedActor = searchParams.get("acteur");
  const initialActor: Actor = isActor(requestedActor) ? requestedActor : "capitaine";
  const [actor, setActor] = useState<Actor>(initialActor);
  const [journeyId, setJourneyId] = useState(actors[initialActor].journeys[0].id);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [lastAnswer, setLastAnswer] = useState("");
  const [done, setDone] = useState(false);

  const config = actors[actor];
  const journey = config.journeys.find((item) => item.id === journeyId) ?? config.journeys[0];
  const Icon = config.icon;
  const nextChannel = getNextChannel(lastAnswer);

  const messages = useMemo(() => {
    const history: Array<{ from: "mbambulaan" | "client"; text: string }> = [
      { from: "mbambulaan", text: journey.intro },
      { from: "client", text: journey.title }
    ];
    answers.forEach((answer, index) => {
      history.push({ from: "mbambulaan", text: journey.questions[index] });
      history.push({ from: "client", text: answer });
    });
    if (!done) history.push({ from: "mbambulaan", text: journey.questions[step] });
    if (done) history.push({ from: "mbambulaan", text: journey.confirmation });
    return history;
  }, [answers, done, journey, step]);

  function reset(nextActor = actor, nextJourney = actors[nextActor].journeys[0].id) {
    setActor(nextActor);
    setJourneyId(nextJourney);
    setStep(0);
    setAnswers([]);
    setLastAnswer("");
    setDone(false);
  }

  function answer(value: string) {
    setAnswers((current) => [...current, value]);
    setLastAnswer(value);
    const channel = getNextChannel(value);
    if (channel !== "termine" || step + 1 >= journey.questions.length) setDone(true);
    else setStep((current) => current + 1);
  }

  return (
    <main className="min-h-screen bg-[var(--canvas)] px-3 py-4 text-[var(--ink)] sm:px-6 sm:py-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link href="/terrain" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ocean-800)]"><ArrowLeft size={16} /> Retour au démonstrateur</Link>
          <Link href="/terrain/telephone" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ocean-800)]"><PhoneCall size={16} /> Voir le canal téléphonique</Link>
        </div>

        <div className="grid overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--white)] shadow-[var(--shadow-md)] lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="border-b border-[var(--line)] bg-[var(--ocean-1000)] p-5 text-white lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-[var(--lagoon-500)] text-[var(--ocean-1000)]"><MessageCircleMore size={21} /></span><div><p className="font-semibold">Canal Mbàmbulaan</p><p className="text-xs text-white/60">Simulation messaging unique</p></div></div>
            <p className="mt-7 text-xs font-bold uppercase tracking-[.12em] text-white/42">Acteur reconnu</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(Object.keys(actors) as Actor[]).map((item) => <button key={item} onClick={() => reset(item)} className={`rounded-[var(--radius-sm)] px-3 py-3 text-left text-sm font-semibold transition ${actor === item ? "bg-white/12 text-white" : "text-white/62 hover:bg-white/7 hover:text-white"}`}>{actors[item].label}</button>)}
            </div>
            <div className="mt-6 rounded-[var(--radius-sm)] border border-white/10 bg-white/5 p-4"><p className="text-xs font-semibold text-white">{config.identity}</p><p className="mt-1 text-xs leading-5 text-white/55">{config.context}</p></div>
            <p className="mt-7 text-xs font-bold uppercase tracking-[.12em] text-white/42">Parcours disponibles</p>
            <div className="mt-3 space-y-2">{config.journeys.map((item) => <button key={item.id} onClick={() => reset(actor, item.id)} className={`flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-3 text-left text-sm font-semibold transition ${journey.id === item.id ? "bg-white/12 text-white" : "text-white/62 hover:bg-white/7 hover:text-white"}`}><Icon size={17} /> {item.title}</button>)}</div>
          </aside>

          <div className="min-w-0 bg-[var(--sand-100)]">
            <header className="flex items-center gap-3 border-b border-[var(--line)] bg-[var(--white)] px-4 py-3 sm:px-5"><span className="grid size-10 place-items-center rounded-full bg-[var(--lagoon-100)] text-[var(--lagoon-600)]"><Icon size={19} /></span><div><p className="font-semibold text-[var(--ink)]">Mbàmbulaan · {config.label} reconnu</p><p className="text-xs text-[var(--muted)]">Une réponse rapide ici ; l’espace professionnel seulement quand c’est nécessaire</p></div></header>
            <div className="min-h-[520px] space-y-3 p-4 sm:p-6">
              {messages.map((message, index) => <div key={`${message.text}-${index}`} className={`flex ${message.from === "client" ? "justify-end" : "justify-start"}`}><div className={`max-w-[86%] rounded-[18px] px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[72%] ${message.from === "client" ? "rounded-br-md bg-[var(--lagoon-100)]" : "rounded-bl-md bg-[var(--white)]"}`}>{message.text}<p className="mt-1 text-right text-[10px] text-[var(--muted)]">Maintenant {message.from === "client" && <Check className="ml-1 inline" size={11} />}</p></div></div>)}
              {!done && <div className="pt-2"><div className="flex flex-wrap gap-2">{journey.replies[step].map((reply) => <button key={reply} onClick={() => answer(reply)} className="rounded-full border border-[var(--line-strong)] bg-[var(--white)] px-4 py-2 text-sm font-semibold text-[var(--ocean-800)] transition hover:border-[var(--lagoon-500)] hover:bg-[var(--lagoon-100)]">{reply}</button>)}</div><div className="mt-4 flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--white)] px-3 py-2"><span className="min-w-0 flex-1 text-sm text-[var(--muted)]">Écrire ou envoyer un vocal…</span><button className="grid size-9 place-items-center rounded-full text-[var(--muted)]" aria-label="Envoyer un vocal"><Mic size={18} /></button><button className="grid size-9 place-items-center rounded-full bg-[var(--lagoon-500)] text-[var(--ocean-1000)]" aria-label="Envoyer"><Send size={17} /></button></div></div>}
              {done && <div className="mt-5 rounded-[var(--radius-md)] border border-[var(--lagoon-200)] bg-[var(--white)] p-5"><p className="text-sm font-semibold text-[var(--ink)]">Ce qui se passe ensuite</p><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{journey.result}</p><p className="mt-3 rounded-[var(--radius-sm)] bg-[var(--sand-100)] p-3 text-sm font-semibold text-[var(--ink)]">{getChannelMessage(nextChannel)}</p><div className="mt-5 flex flex-wrap gap-3"><button onClick={() => reset(actor, journey.id)} className="btn-secondary">Rejouer</button>{nextChannel === "espace" && <Link href="/app/travail" className="btn-primary">Ouvrir mon espace <ArrowRight size={16} /></Link>}{nextChannel === "telephone" && <Link href="/terrain/telephone" className="btn-primary"><PhoneCall size={16} /> Demander l’appel</Link>}</div></div>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
