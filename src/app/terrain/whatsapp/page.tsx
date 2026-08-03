"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  MapPin,
  MessageCircleMore,
  Mic,
  PhoneCall,
  Scale,
  Send,
  ShipWheel,
  TriangleAlert,
  Wrench
} from "lucide-react";

type Flow = "preparation" | "retour" | "retard" | "quai" | "pesage" | "resume";

type FlowConfig = {
  actor: string;
  clientContext: string;
  title: string;
  intro: string;
  icon: typeof ShipWheel;
  questions: string[];
  quickReplies: string[][];
  confirmation: string;
  outcome: string;
  nextFlow?: Flow;
};

const flows: Record<Flow, FlowConfig> = {
  preparation: {
    actor: "Capitaine référencé",
    clientContext: "Pirogue, moteur, équipage et quai habituels déjà connus",
    title: "Préparer ma sortie",
    intro: "Bonjour Mamadou. Vérifions seulement ce qui peut bloquer votre départ.",
    icon: Wrench,
    questions: ["La pirogue est-elle prête ?", "Avez-vous assez de carburant et de glace ?", "L'équipage est-il au complet ?"],
    quickReplies: [["Oui, tout est prêt", "Problème moteur", "Autre problème"], ["Oui", "Il manque du carburant", "Il manque de la glace"], ["Oui", "Il manque une personne", "Appelez-moi"]],
    confirmation: "C'est enregistré. Vous voyez maintenant ce qui est prêt et ce qui manque avant le départ.",
    outcome: "État de préparation créé pour la sortie du capitaine, avec les éléments prêts et les blocages éventuels.",
    nextFlow: "retour"
  },
  retour: {
    actor: "Capitaine référencé",
    clientContext: "Pirogue et quai habituels déjà connus",
    title: "Je rentre au quai",
    intro: "Bonjour Mamadou. Votre pirogue Ndeye Fatou est reconnue. Nous allons préparer votre arrivée.",
    icon: ShipWheel,
    questions: ["Vous arrivez à quel quai ?", "Dans combien de temps pensez-vous arriver ?", "De quoi avez-vous besoin à l'arrivée ?"],
    quickReplies: [["Mon quai habituel : Hann", "Soumbédioune", "Kayar", "Mbour"], ["Moins d'1 heure", "1 à 2 heures", "Plus de 2 heures"], ["Glace", "Place au quai", "Manutention", "Transport", "Rien pour le moment"]],
    confirmation: "C'est enregistré. Le quai de Hann est prévenu et voit votre heure d'arrivée estimée.",
    outcome: "Annonce de retour créée et reliée à la pirogue, au capitaine et au quai.",
    nextFlow: "quai"
  },
  retard: {
    actor: "Capitaine référencé",
    clientContext: "Sortie en cours et quai de retour déjà connus",
    title: "Je serai en retard",
    intro: "D'accord Mamadou. Nous allons prévenir le quai sans vous demander plus que nécessaire.",
    icon: TriangleAlert,
    questions: ["Vous pensez avoir combien de retard ?", "Avez-vous besoin d'aide ?", "Qui devons-nous prévenir en priorité ?"],
    quickReplies: [["Moins d'1 heure", "1 à 2 heures", "Je ne sais pas encore"], ["Non, prévenez seulement", "Oui, appelez-moi", "Oui, besoin d'aide au retour"], ["Le quai", "Le propriétaire", "L'équipage à terre", "Tout le monde concerné"]],
    confirmation: "C'est noté. Le quai voit maintenant que votre arrivée est retardée et sait s'il doit vous rappeler.",
    outcome: "Retard enregistré, personnes concernées prévenues et besoin d'aide transmis sans créer de saisie supplémentaire.",
    nextFlow: "quai"
  },
  quai: {
    actor: "Capitaine référencé",
    clientContext: "Retour annoncé ; le quai répond sur ce qui est prêt",
    title: "Voir ce qui est prêt au quai",
    intro: "Le quai de Hann a répondu pour votre arrivée.",
    icon: ShipWheel,
    questions: ["Voici la situation : place au quai prête, manutention confirmée, glace encore à confirmer. Que voulez-vous faire ?"],
    quickReplies: [["C'est bon pour moi", "Attendre la glace", "Appelez-moi", "Changer de besoin"]],
    confirmation: "Votre réponse est enregistrée. Le quai sait maintenant comment poursuivre la préparation.",
    outcome: "État de préparation du quai partagé avec le capitaine et réponse du capitaine enregistrée.",
    nextFlow: "pesage"
  },
  pesage: {
    actor: "Capitaine référencé",
    clientContext: "Débarquement et pesée déjà enregistrés par le quai",
    title: "Confirmer la pesée",
    intro: "Le quai a enregistré 420 kg pour votre débarquement. Dites-nous si cela vous paraît correct.",
    icon: Scale,
    questions: ["Le poids de 420 kg est-il correct ?", "Souhaitez-vous ajouter quelque chose ?"],
    quickReplies: [["Oui, c'est correct", "Non, il faut corriger", "Je ne sais pas", "Appelez-moi"], ["Rien à ajouter", "Le poids semble trop bas", "Le poids semble trop haut", "Autre remarque"]],
    confirmation: "Votre réponse est enregistrée. En cas de désaccord, le quai devra reprendre la vérification avec vous.",
    outcome: "Confirmation ou désaccord de pesée enregistré avec l'auteur, la date et la suite attendue.",
    nextFlow: "resume"
  },
  resume: {
    actor: "Capitaine référencé",
    clientContext: "Sortie terminée et débarquement confirmé",
    title: "Voir le résumé de ma sortie",
    intro: "Votre sortie est terminée. Voici seulement les informations utiles à vérifier.",
    icon: Check,
    questions: ["Résumé : départ 05h20, retour 16h40, Hann, 420 kg, pesée confirmée. Est-ce correct ?", "Voulez-vous recevoir ce résumé ?"],
    quickReplies: [["Oui, tout est correct", "Il faut corriger", "Appelez-moi"], ["Oui sur WhatsApp", "Oui plus tard", "Non merci"]],
    confirmation: "C'est terminé. Votre historique est à jour et le résumé peut vous être envoyé sur WhatsApp.",
    outcome: "Résumé de sortie validé par le capitaine, historisé et prêt à être partagé dans le canal choisi."
  }
};

const captainFlows: Flow[] = ["preparation", "retour", "retard", "quai", "pesage", "resume"];

export default function WhatsAppSimulationPage() {
  const searchParams = useSearchParams();
  const requested = searchParams.get("parcours") as Flow | null;
  const initialFlow: Flow = requested && requested in flows ? requested : "preparation";
  const [flow, setFlow] = useState<Flow>(initialFlow);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const config = flows[flow];
  const Icon = config.icon;
  const messages = useMemo(() => {
    const history: Array<{ from: "mbambulaan" | "user"; text: string }> = [
      { from: "mbambulaan", text: config.intro },
      { from: "user", text: config.title }
    ];
    answers.forEach((answer, index) => {
      history.push({ from: "mbambulaan", text: config.questions[index] });
      history.push({ from: "user", text: answer });
    });
    if (!done && step < config.questions.length) history.push({ from: "mbambulaan", text: config.questions[step] });
    if (done) history.push({ from: "mbambulaan", text: config.confirmation });
    return history;
  }, [answers, config, done, step]);

  function chooseAnswer(answer: string) {
    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);
    if (step + 1 >= config.questions.length) setDone(true);
    else setStep(step + 1);
  }

  function chooseFlow(nextFlow: Flow) {
    setFlow(nextFlow);
    setStep(0);
    setAnswers([]);
    setDone(false);
  }

  return (
    <main className="min-h-screen bg-[var(--canvas)] px-3 py-4 text-[var(--ink)] sm:px-6 sm:py-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link href="/terrain" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ocean-800)]">
            <ArrowLeft size={16} /> Retour au démonstrateur
          </Link>
          <Link href="/terrain/telephone" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ocean-800)]">
            <PhoneCall size={16} /> Voir le canal téléphonique
          </Link>
        </div>

        <div className="grid overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--white)] shadow-[var(--shadow-md)] lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="border-b border-[var(--line)] bg-[var(--ocean-1000)] p-5 text-white lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-[var(--lagoon-500)] text-[var(--ocean-1000)]"><MessageCircleMore size={21} /></span>
              <div>
                <p className="font-semibold">Mbàmbulaan Business</p>
                <p className="text-xs text-white/60">Parcours capitaine WhatsApp</p>
              </div>
            </div>

            <div className="mt-6 rounded-[var(--radius-sm)] border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold text-white">{config.actor}</p>
              <p className="mt-1 text-xs leading-5 text-white/55">{config.clientContext}</p>
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-[.12em] text-white/42">Parcours capitaine</p>
            <div className="mt-3 space-y-2">
              {captainFlows.map((item) => {
                const ItemIcon = flows[item].icon;
                return (
                  <button key={item} onClick={() => chooseFlow(item)} className={`flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-3 text-left text-sm font-semibold transition ${flow === item ? "bg-white/12 text-white" : "text-white/62 hover:bg-white/7 hover:text-white"}`}>
                    <ItemIcon size={17} /> {flows[item].title}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 rounded-[var(--radius-sm)] border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold text-white">Principe produit</p>
              <p className="mt-2 text-xs leading-5 text-white/55">Le capitaine agit depuis WhatsApp. L'espace professionnel reste optionnel pour l'historique, plusieurs pirogues et les corrections complexes.</p>
            </div>
          </aside>

          <div className="min-w-0 bg-[var(--sand-100)]">
            <header className="flex items-center gap-3 border-b border-[var(--line)] bg-[var(--white)] px-4 py-3 sm:px-5">
              <span className="grid size-10 place-items-center rounded-full bg-[var(--lagoon-100)] text-[var(--lagoon-600)]"><Icon size={19} /></span>
              <div>
                <p className="font-semibold text-[var(--ink)]">Mbàmbulaan · Capitaine reconnu</p>
                <p className="text-xs text-[var(--muted)]">Canal WhatsApp Business simulé</p>
              </div>
            </header>

            <div className="min-h-[520px] space-y-3 p-4 sm:p-6">
              {messages.map((message, index) => (
                <div key={`${message.text}-${index}`} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[86%] rounded-[18px] px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[72%] ${message.from === "user" ? "rounded-br-md bg-[var(--lagoon-100)] text-[var(--ink)]" : "rounded-bl-md bg-[var(--white)] text-[var(--ink)]"}`}>
                    {message.text}
                    <p className="mt-1 text-right text-[10px] text-[var(--muted)]">Maintenant {message.from === "user" && <Check className="ml-1 inline" size={11} />}</p>
                  </div>
                </div>
              ))}

              {!done && (
                <div className="pt-2">
                  <div className="flex flex-wrap gap-2">
                    {config.quickReplies[step].map((reply) => (
                      <button key={reply} onClick={() => chooseAnswer(reply)} className="rounded-full border border-[var(--line-strong)] bg-[var(--white)] px-4 py-2 text-sm font-semibold text-[var(--ocean-800)] transition hover:border-[var(--lagoon-500)] hover:bg-[var(--lagoon-100)]">
                        {reply}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--white)] px-3 py-2">
                    <button className="grid size-9 place-items-center rounded-full text-[var(--muted)] hover:bg-[var(--canvas)]" aria-label="Partager votre position"><MapPin size={18} /></button>
                    <span className="min-w-0 flex-1 text-sm text-[var(--muted)]">Écrire un message ou envoyer un vocal…</span>
                    <button className="grid size-9 place-items-center rounded-full text-[var(--muted)] hover:bg-[var(--canvas)]" aria-label="Envoyer un vocal"><Mic size={18} /></button>
                    <button className="grid size-9 place-items-center rounded-full bg-[var(--lagoon-500)] text-[var(--ocean-1000)]" aria-label="Envoyer"><Send size={17} /></button>
                  </div>
                </div>
              )}

              {done && (
                <div className="mt-5 rounded-[var(--radius-md)] border border-[var(--lagoon-200)] bg-[var(--white)] p-5">
                  <p className="text-sm font-semibold text-[var(--ink)]">Ce que le capitaine a demandé</p>
                  <div className="mt-3 space-y-2">
                    {answers.map((answer, index) => <p key={`${answer}-${index}`} className="text-sm text-[var(--muted)]"><span className="font-semibold text-[var(--ink)]">{config.questions[index]}</span><br />{answer}</p>)}
                  </div>
                  <div className="mt-4 rounded-[var(--radius-sm)] bg-[var(--lagoon-100)] p-4">
                    <p className="text-xs font-bold uppercase tracking-[.1em] text-[var(--lagoon-600)]">Dans Mbàmbulaan</p>
                    <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{config.outcome}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button onClick={() => { setStep(0); setAnswers([]); setDone(false); }} className="btn-secondary">Rejouer ce parcours</button>
                    {config.nextFlow ? (
                      <button onClick={() => chooseFlow(config.nextFlow!)} className="btn-primary">Continuer le parcours capitaine</button>
                    ) : (
                      <Link href="/terrain" className="btn-primary">Retour au démonstrateur</Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
