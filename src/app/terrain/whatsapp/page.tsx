"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, MapPin, MessageCircleMore, Mic, PhoneCall, Send, ShipWheel, ShoppingBasket, Snowflake, TriangleAlert } from "lucide-react";

type Flow = "retour" | "achat" | "capacite" | "probleme";

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
};

const flows: Record<Flow, FlowConfig> = {
  retour: {
    actor: "Capitaine référencé",
    clientContext: "Pirogue et quai habituels déjà connus",
    title: "Je rentre au quai",
    intro: "Bonjour Mamadou. Votre pirogue Ndeye Fatou est reconnue. Nous allons préparer votre arrivée.",
    icon: ShipWheel,
    questions: ["Vous arrivez à quel quai ?", "Dans combien de temps pensez-vous arriver ?", "De quoi avez-vous besoin à l'arrivée ?"],
    quickReplies: [["Mon quai habituel : Hann", "Soumbédioune", "Kayar", "Mbour"], ["Moins d'1 heure", "1 à 2 heures", "Plus de 2 heures"], ["Glace", "Place au quai", "Transport", "Rien pour le moment"]],
    confirmation: "C'est enregistré. Le quai de Hann est prévenu et voit votre heure d'arrivée estimée.",
    outcome: "Annonce de retour créée et reliée à la pirogue, au capitaine et au quai."
  },
  achat: {
    actor: "Mareyeur référencé",
    clientContext: "Préférences d'achat et zones habituelles connues",
    title: "Je cherche du poisson",
    intro: "Bonjour Awa. Dites-nous ce que vous cherchez. Nous utiliserons vos préférences et vos zones habituelles.",
    icon: ShoppingBasket,
    questions: ["Quelle espèce cherchez-vous ?", "Quelle quantité environ ?", "Où voulez-vous récupérer le poisson ?"],
    quickReplies: [["Sardinelle", "Thiof", "Yaboy", "Autre"], ["Moins de 100 kg", "100 à 500 kg", "Plus de 500 kg"], ["Hann", "Soumbédioune", "Kayar", "Mbour"]],
    confirmation: "Votre besoin est enregistré. Seuls les lots correspondant à votre demande vous seront proposés.",
    outcome: "Besoin d'achat créé et relié au mareyeur, à l'espèce, au volume et au lieu."
  },
  capacite: {
    actor: "Prestataire référencé",
    clientContext: "Équipement, zone et conditions déjà enregistrés",
    title: "J'ai une capacité disponible",
    intro: "Bonjour Ibrahima. Votre activité de froid est reconnue. Dites-nous ce qui est disponible aujourd'hui.",
    icon: Snowflake,
    questions: ["Que pouvez-vous proposer ?", "Quelle quantité est disponible ?", "Jusqu'à quand est-ce disponible ?"],
    quickReplies: [["Glace", "Chambre froide", "Transport", "Transformation"], ["Petite quantité", "Quantité moyenne", "Grande quantité"], ["Aujourd'hui", "Demain", "Cette semaine"]],
    confirmation: "Votre capacité est enregistrée et proposée uniquement aux acteurs concernés.",
    outcome: "Capacité créée et reliée au prestataire, à l'équipement, au territoire et à la durée."
  },
  probleme: {
    actor: "Client Mbàmbulaan référencé",
    clientContext: "Identité, rôle et territoire déjà connus",
    title: "Quelque chose ne va pas",
    intro: "Nous vous avons reconnu. Expliquez simplement ce qui se passe ; l'équipe concernée recevra le message.",
    icon: TriangleAlert,
    questions: ["Qu'est-ce qui ne va pas ?", "Où cela se passe-t-il ?", "Faut-il vous rappeler ?"],
    quickReplies: [["Panne", "Manque de glace", "Retard", "Problème de qualité"], ["Au quai", "En mer", "Au marché", "Sur la route"], ["Oui, appelez-moi", "Non, le message suffit"]],
    confirmation: "Votre message est transmis à la personne concernée. Vous pouvez suivre la suite dans votre espace si nécessaire.",
    outcome: "Situation créée avec l'auteur, le lieu, le canal d'origine et la personne à prévenir."
  }
};

export default function WhatsAppSimulationPage() {
  const searchParams = useSearchParams();
  const requested = searchParams.get("parcours") as Flow | null;
  const initialFlow: Flow = requested && requested in flows ? requested : "retour";
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
                <p className="text-xs text-white/60">Démonstration des parcours clients WhatsApp</p>
              </div>
            </div>

            <div className="mt-6 rounded-[var(--radius-sm)] border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold text-white">{config.actor}</p>
              <p className="mt-1 text-xs leading-5 text-white/55">{config.clientContext}</p>
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-[.12em] text-white/42">Parcours à visualiser</p>
            <div className="mt-3 space-y-2">
              {(Object.keys(flows) as Flow[]).map((item) => {
                const ItemIcon = flows[item].icon;
                return (
                  <button key={item} onClick={() => chooseFlow(item)} className={`flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-3 text-left text-sm font-semibold transition ${flow === item ? "bg-white/12 text-white" : "text-white/62 hover:bg-white/7 hover:text-white"}`}>
                    <ItemIcon size={17} /> {flows[item].title}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 rounded-[var(--radius-sm)] border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold text-white">Ce que nous voulons construire</p>
              <p className="mt-2 text-xs leading-5 text-white/55">Mbàmbulaan reconnaît le client, utilise les informations déjà connues et transforme une conversation courte en action métier suivie.</p>
            </div>
          </aside>

          <div className="min-w-0 bg-[var(--sand-100)]">
            <header className="flex items-center gap-3 border-b border-[var(--line)] bg-[var(--white)] px-4 py-3 sm:px-5">
              <span className="grid size-10 place-items-center rounded-full bg-[var(--lagoon-100)] text-[var(--lagoon-600)]"><Icon size={19} /></span>
              <div>
                <p className="font-semibold text-[var(--ink)]">Mbàmbulaan · Compte client reconnu</p>
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
                  <p className="text-sm font-semibold text-[var(--ink)]">Ce que le client a demandé</p>
                  <div className="mt-3 space-y-2">
                    {answers.map((answer, index) => <p key={`${answer}-${index}`} className="text-sm text-[var(--muted)]"><span className="font-semibold text-[var(--ink)]">{config.questions[index]}</span><br />{answer}</p>)}
                  </div>
                  <div className="mt-4 rounded-[var(--radius-sm)] bg-[var(--lagoon-100)] p-4">
                    <p className="text-xs font-bold uppercase tracking-[.1em] text-[var(--lagoon-600)]">Dans Mbàmbulaan</p>
                    <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{config.outcome}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button onClick={() => { setStep(0); setAnswers([]); setDone(false); }} className="btn-secondary">Rejouer le parcours</button>
                    <Link href="/terrain" className="btn-primary">Retour au démonstrateur</Link>
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
