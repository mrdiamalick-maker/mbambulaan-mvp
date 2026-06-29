import Link from "next/link";

const kpis = [
  ["Territoires suivis", "03", "Joal, Kayar, Saint-Louis"],
  ["Signaux terrain", "12", "4 nécessitent arbitrage"],
  ["Demandes financement", "08", "froid, moteurs, sécurité"],
  ["Programmes actifs", "05", "État, ONG, partenaires"],
  ["Innovations à qualifier", "06", "trace, froid, transformation"],
  ["Décisions prioritaires", "04", "note prête à discuter"]
];

const steps = [
  {
    title: "Situation",
    subtitle: "Une tension apparaît sur Joal / Petite-Côte.",
    text: "La commune signale une pression sur le quai : arrivages sensibles, besoin de froid, débouchés incertains et demandes de financement dispersées.",
    items: ["Joal devient prioritaire", "Risque de perte de valeur", "Plusieurs acteurs sollicitent l'État"]
  },
  {
    title: "Signaux",
    subtitle: "Mbàmbulaan rassemble les remontées terrain.",
    text: "Le système consolide déclarations de pêcheurs, besoins mareyeurs, alertes qualité, programme partenaire et demandes d'équipement.",
    items: ["12 signaux qualifiés", "8 demandes financement", "5 programmes actifs"]
  },
  {
    title: "Lecture Mbàmbulaan",
    subtitle: "La plateforme ne visualise pas seulement : elle qualifie.",
    text: "Les signaux sont reliés au territoire, aux acteurs, aux programmes et aux preuves disponibles pour éviter un arbitrage à l'aveugle.",
    items: ["Niveau de preuve visible", "Doublons programme détectés", "Acteurs à coordonner identifiés"]
  },
  {
    title: "Décision",
    subtitle: "Une recommandation institutionnelle émerge.",
    text: "Prioriser un pilote froid à Joal, mobiliser commune, ONG et organisations professionnelles, puis cadrer un financement ciblé.",
    items: ["Pilote froid", "Mission conjointe", "Note ministère"]
  },
  {
    title: "Coordination",
    subtitle: "La décision devient une file d'action.",
    text: "Chaque acteur a une responsabilité : commune, service pêche, ONG, organisation professionnelle, mareyeurs et équipe Mbàmbulaan.",
    items: ["Réunion commune", "Validation terrain", "Suivi programme"]
  },
  {
    title: "Preuve / résultat",
    subtitle: "Le ministère obtient une note exploitable, pas un simple graphe.",
    text: "La synthèse indique ce qui est prouvé, ce qui est estimé, ce qui reste à vérifier et pourquoi un pilote institutionnel se justifie.",
    items: ["Preuve système", "Limites explicites", "Pilote justifié"]
  }
];

const tensions = [
  ["Joal", "Tension forte", "glace, conservation, débouchés", "pilote froid"],
  ["Kayar", "Tension moyenne", "prix, logistique, conflits", "médiation"],
  ["Saint-Louis", "Surveillance", "sécurité, sortie en mer", "coordination"]
];

const actors = ["Ministère", "Commune de Joal", "Service pêche", "ONG partenaire", "Organisation professionnelle", "Mareyeurs", "Relais quai"];

export function InstitutionalCockpit() {
  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#102a37]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="font-black text-[#0d3b4c]">Mbàmbulaan</Link>
        <nav className="hidden gap-6 text-sm font-bold text-[#425662] md:flex">
          <Link href="/demo">Changer de profil</Link>
          <Link href="/devis">Cadrer pilote</Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0d6f8d]">Démo État / Ministère</p>
          <h1 className="mt-4 text-5xl font-black leading-none tracking-[-0.05em] text-[#0d3b4c] sm:text-7xl">
            Arbitrer une tension filière, pas regarder un dashboard.
          </h1>
          <p className="mt-5 text-lg font-semibold leading-8 text-[#52656f]">
            Le ministère voit comment Mbàmbulaan coordonne signaux terrain, besoins, programmes, financements, acteurs et preuves autour d'un territoire pilote.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {kpis.map(([label, value, detail]) => (
            <article key={label} className="rounded-3xl border border-[#dce5e8] bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0d6f8d]">{label}</p>
              <p className="mt-3 text-4xl font-black text-[#0d3b4c]">{value}</p>
              <p className="mt-2 text-sm font-semibold text-[#64727a]">{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-12 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-[#dce5e8] bg-white p-6 shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Tension prioritaire</p>
          <h2 className="mt-3 text-3xl font-black text-[#0d3b4c]">Voici une tension sur Joal.</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#52656f]">
            L'objectif n'est pas de produire une visualisation de plus. L'objectif est de savoir quoi coordonner, avec qui, sur quelle preuve et pour quelle décision.
          </p>
          {tensions.map(([zone, level, issue, action]) => (
            <div key={zone} className="mt-3 grid gap-3 rounded-2xl bg-[#f2f7f7] p-4 md:grid-cols-4">
              <strong>{zone}</strong>
              <span className="font-black text-[#0d6f8d]">{level}</span>
              <span className="text-sm font-semibold text-[#52656f]">{issue}</span>
              <span className="text-sm font-black text-[#0d3b4c]">{action}</span>
            </div>
          ))}
        </article>

        <article className="rounded-[2rem] bg-[#0d3b4c] p-6 text-white shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/55">Note ministère simulée</p>
          <h2 className="mt-3 text-3xl font-black">Décision recommandée</h2>
          <p className="mt-4 text-sm font-semibold leading-6 text-white/70">
            Prioriser Joal pour un pilote froid et coordination mareyeurs, sous réserve de validation terrain et de cadrage institutionnel.
          </p>
          {[
            "Mandater une réunion commune Ministère, commune, ONG et organisation professionnelle",
            "Consolider les preuves sur demandes de financement froid",
            "Relier le pilote à un registre des innovations de la filière"
          ].map((decision, index) => (
            <div key={decision} className="mt-4 flex gap-4 rounded-2xl bg-white/10 p-4">
              <span className="font-black text-white/45">0{index + 1}</span>
              <strong>{decision}</strong>
            </div>
          ))}
        </article>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-8">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Simulation guidée</p>
        <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] text-[#0d3b4c]">
          Le parcours institutionnel en six étapes.
        </h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-[1.7rem] border border-[#dce5e8] bg-white p-5 shadow-sm">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-[#0d6f8d]">Étape {index + 1}</span>
              <h3 className="mt-3 text-2xl font-black text-[#0d3b4c]">{step.title}</h3>
              <p className="mt-2 text-base font-black text-[#102a37]">{step.subtitle}</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#586973]">{step.text}</p>
              <div className="mt-4 grid gap-2">
                {step.items.map((item) => (
                  <span key={item} className="rounded-2xl bg-[#f2f7f7] px-3 py-2 text-xs font-black text-[#0d3b4c]">{item}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[2rem] border border-[#dce5e8] bg-white p-6 shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Acteurs à coordonner</p>
          <h2 className="mt-3 text-3xl font-black text-[#0d3b4c]">La décision devient une coalition d'action.</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {actors.map((actor) => (
              <div key={actor} className="rounded-2xl bg-[#f2f7f7] p-4 text-sm font-black text-[#0d3b4c]">{actor}</div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[#dce5e8] bg-white p-6 shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0d6f8d]">Preuve et limites</p>
          <h2 className="mt-3 text-3xl font-black text-[#0d3b4c]">Ce qui est prouvé, ce qui reste à vérifier.</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#e7f5fa] p-4 text-sm font-black text-[#0d3b4c]">Preuve système : signaux consolidés</div>
            <div className="rounded-2xl bg-[#fff7e8] p-4 text-sm font-black text-[#0d3b4c]">Impact estimé : besoin de protocole pilote</div>
            <div className="rounded-2xl bg-[#f2f7f7] p-4 text-sm font-black text-[#0d3b4c]">À vérifier : volumes, coûts, responsabilités</div>
          </div>
          <p className="mt-5 text-sm font-semibold leading-6 text-[#52656f]">
            Mbàmbulaan peut s'intégrer aux outils existants du ministère : il ne les remplace pas, il rend les signaux coordonnables et les décisions traçables.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/demande-demo" className="rounded-full bg-[#0d6f8d] px-6 py-4 text-center text-sm font-black text-white">Demander une démo complète</Link>
            <Link href="/devis" className="rounded-full border border-[#d8e1e5] px-6 py-4 text-center text-sm font-black text-[#0d3b4c]">Cadrer un pilote institutionnel</Link>
          </div>
        </article>
      </section>
    </main>
  );
}
