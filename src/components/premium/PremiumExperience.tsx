import Link from "next/link";
import type { ReactNode } from "react";
import type { Arrivage } from "@/lib/arrivages";
import type { Besoin } from "@/lib/besoins";
import type { DashboardData, MatchingSummary, Opportunite } from "@/lib/coordination";
import type { MvpSliceSummary, MvpSliceStep } from "@/lib/mvpSlice";
import type { TerritoryPilotSummary } from "@/lib/territoryPilot";

type NavMode = "public" | "demo";

type PremiumShellProps = {
  mode?: NavMode;
  children: ReactNode;
};

type Metric = {
  label: string;
  value: string | number;
  help?: string;
};

const demoRoutes = [
  { label: "Démo", href: "/demo" },
  { label: "Territoire pilote", href: "/territoire-pilote" },
  { label: "Arrivages", href: "/arrivages" },
  { label: "Besoins", href: "/besoins" },
  { label: "Opportunités", href: "/opportunites" },
  { label: "Coordination", href: "/coordination" },
  { label: "Vue exécutive", href: "/executive" }
];

export function PremiumShell({ mode = "demo", children }: PremiumShellProps) {
  const publicNav = [
    { label: "Accueil", href: "/" },
    { label: "Démo", href: "/demo" },
    { label: "Territoire pilote", href: "/territoire-pilote" },
    { label: "Demander une démo", href: "/demande-demo" }
  ];
  const nav = mode === "public" ? publicNav : demoRoutes;

  return (
    <main className="premium-app">
      <header className="premium-header">
        <Link className="premium-brand" href="/">
          <span className="premium-brand-mark">Mb</span>
          <span>
            <strong>Mbàmbulaan</strong>
            <small>Operating System de coordination</small>
          </span>
        </Link>
        <nav aria-label="Navigation principale" className="premium-nav">
          {nav.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link className="premium-header-cta" href="/demande-demo">
          Demander une démo
        </Link>
      </header>
      {mode === "demo" ? <DemoPath /> : null}
      {children}
      <footer className="premium-footer">
        <div>
          <strong>Mbàmbulaan</strong>
          <p>Coordonner les signaux terrain, les besoins, les actions et les preuves pour rendre la filière lisible.</p>
        </div>
        <div className="premium-footer-links">
          <Link href="/demo">Voir la démo</Link>
          <Link href="/devis">Demander un devis</Link>
          <Link href="/executive">Vue exécutive</Link>
        </div>
      </footer>
    </main>
  );
}

export function PublicLandingPage() {
  return (
    <PremiumShell mode="public">
      <section className="premium-hero premium-hero-public">
        <div className="premium-eyebrow">Pêche artisanale sénégalaise · coordination territoriale</div>
        <h1>Mbàmbulaan coordonne la filière, du signal terrain à la décision.</h1>
        <p>
          Une plateforme premium pour relier acteurs, territoires, besoins, preuves et impact sans exposer toute la valeur privée en public.
        </p>
        <div className="premium-actions">
          <Link className="premium-button premium-button-primary" href="/demande-demo">
            Demander une démo
          </Link>
          <Link className="premium-button premium-button-secondary" href="/devis">
            Demander un devis
          </Link>
          <Link className="premium-button premium-button-ghost" href="/demo">
            Voir la démo
          </Link>
        </div>
      </section>

      <section className="premium-section premium-grid-2">
        <SectionIntro kicker="Problème filière" title="L'information existe, mais elle circule mal." />
        <div className="premium-card-stack">
          <PremiumCard title="Signaux dispersés" text="Arrivages, besoins et tensions restent souvent dans des conversations isolées." />
          <PremiumCard title="Décisions lentes" text="Les collectivités et organisations manquent d'une lecture simple pour prioriser." />
          <PremiumCard title="Preuves fragiles" text="Les actions sont difficiles à expliquer, suivre et présenter à un partenaire." />
        </div>
      </section>

      <section className="premium-section premium-band">
        <SectionIntro kicker="Transformation" title="Mbàmbulaan transforme un signal en action coordonnée." />
        <div className="premium-flow">
          {[
            "Signal terrain",
            "Qualification",
            "Tension ou opportunité",
            "Action coordonnée",
            "Preuve",
            "Rapport"
          ].map((step, index) => (
            <div className="premium-flow-step" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="premium-section">
        <SectionIntro kicker="Pour qui" title="Une plateforme vendable à plusieurs familles d'acteurs." />
        <div className="premium-card-grid premium-card-grid-4">
          {[
            ["Collectivités", "Lire les tensions, prioriser un quai, rendre compte."],
            ["Organisations", "Coordonner pêcheurs, GIE, mareyeurs et partenaires."],
            ["Entreprises", "Structurer un besoin, sécuriser une opportunité, suivre la qualité."],
            ["Institutions", "Comprendre l'impact, les risques et les décisions prioritaires."]
          ].map(([title, text]) => (
            <PremiumCard key={title} title={title} text={text} />
          ))}
        </div>
      </section>

      <section className="premium-section premium-preview-grid">
        <div>
          <SectionIntro kicker="Aperçu contrôlé" title="La landing montre la promesse, pas tout le produit." />
          <p className="premium-muted">
            Les modules opérationnels restent guidés par la démo ou accessibles dans les espaces privés. La valeur vendue est protégée.
          </p>
          <div className="premium-actions">
            <Link className="premium-button premium-button-primary" href="/demo">
              Lancer le parcours démo
            </Link>
          </div>
        </div>
        <div className="premium-product-preview" aria-label="Aperçu contrôlé Mbàmbulaan">
          <div className="premium-preview-top">Joal / Petite-Côte</div>
          <div className="premium-preview-map">
            <span className="map-dot dot-critical" />
            <span className="map-dot dot-watch" />
            <span className="map-dot dot-stable" />
          </div>
          <div className="premium-preview-row"><strong>Action prioritaire</strong><span>Coordination en cours</span></div>
          <div className="premium-preview-row"><strong>Preuve</strong><span>Donnée validée</span></div>
        </div>
      </section>

      <section className="premium-section premium-final-cta">
        <SectionIntro kicker="Prochaine étape" title="Présenter Mbàmbulaan à votre organisation." />
        <p>Demandez une démo personnalisée, un devis ou le cadrage d'un pilote territorial. Aucun accès produit réel n'est promis sans échange.</p>
        <div className="premium-actions centered">
          <Link className="premium-button premium-button-primary" href="/demande-demo">Demander une démo</Link>
          <Link className="premium-button premium-button-secondary" href="/devis">Demander un devis</Link>
        </div>
      </section>
    </PremiumShell>
  );
}

export function PremiumDemoPage({ slice }: { slice: MvpSliceSummary }) {
  const profiles = [
    ["État / institution", "Lire tensions, impact, risques et décisions prioritaires.", "/executive"],
    ["Collectivité", "Comprendre comment Joal devient un territoire pilote lisible.", "/territoire-pilote"],
    ["ONG / programme", "Suivre actions, preuves et impact estimé sans surpromesse.", "/territoire-pilote"],
    ["Entreprise", "Voir comment un besoin rencontre une opportunité qualifiée.", "/opportunites"],
    ["Exportateur", "Comprendre qualité, trace et preuve autour d'un lot.", "/opportunites/arr-004-bes-004"],
    ["Acteur terrain", "Déclarer un signal et suivre ce qu'il déclenche.", "/arrivages"],
    ["Investisseur", "Voir la logique produit, l'impact et la valeur future.", "/executive"]
  ];

  return (
    <PremiumShell>
      <PageHero kicker="Hub de démonstration" title="Choisir le bon récit avant de montrer le produit." text="La démo n'est pas un accès ouvert : elle projette chaque partie prenante dans la valeur qui la concerne." ctaHref="/territoire-pilote" ctaLabel="Voir Joal / Petite-Côte" />
      <section className="premium-section">
        <SectionIntro kicker="Démo générale" title="Le flux démontré en 5 minutes." />
        <PremiumTimeline steps={slice.steps} />
      </section>
      <section className="premium-section">
        <SectionIntro kicker="Démos personnalisées" title="Chaque segment voit une valeur différente." />
        <div className="premium-card-grid premium-card-grid-3">
          {profiles.map(([title, text, href]) => (
            <Link className="premium-card premium-segment-card" href={href} key={title}>
              <span className="premium-eyebrow">Projection personnalisée</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <strong>Voir le parcours</strong>
            </Link>
          ))}
        </div>
      </section>
      <DecisionPanel title="Différence clé" text="La partie publique crée le désir. La démo raconte un scénario. L'espace privé livre la valeur achetée et utilisée." proof="Données simulées" />
    </PremiumShell>
  );
}

export function PremiumTerritoryPage({ pilot }: { pilot: TerritoryPilotSummary }) {
  return (
    <PremiumShell>
      <PageHero kicker="Territoire pilote" title={`${pilot.headline} devient lisible.`} text={pilot.narrative} ctaHref="/coordination" ctaLabel="Coordonner l'action" />
      <section className="premium-section premium-grid-2">
        <div>
          <SectionIntro kicker="Pourquoi ce territoire" title="Un pilote utile parce qu'il relie terrain, besoin et décision." />
          <p className="premium-muted">{pilot.whyPilot}</p>
          <div className="premium-metrics-row">
            <MetricCard label="Territoire" value={pilot.territory} help={pilot.region} />
            <MetricCard label="Quai pilote" value={pilot.quay} help={`Tension ${pilot.tensionLevel}`} tone="warning" />
          </div>
        </div>
        <TerritoryMapPanel title="Carte simplifiée du pilote" tension={pilot.tensionLevel} />
      </section>
      <section className="premium-section">
        <SectionIntro kicker="Flux démontrable" title="Du signal à la synthèse territoire." />
        <PremiumTimeline steps={pilot.flow} />
      </section>
      <section className="premium-section">
        <SectionIntro kicker="Valeur pilote" title="Ce que chaque partie prenante peut montrer." />
        <div className="premium-card-grid premium-card-grid-4">
          {pilot.valuePoints.map((point) => (
            <PremiumCard key={point.id} title={point.audience} text={`${point.title}. ${point.description}`} footer={point.proof} />
          ))}
        </div>
      </section>
      <DecisionPanel title={pilot.synthesis.title} text={pilot.synthesis.decision} proof={pilot.synthesis.limits} />
    </PremiumShell>
  );
}

export function PremiumArrivagesPage({ arrivages, slice }: { arrivages: Arrivage[]; slice: MvpSliceSummary }) {
  return (
    <PremiumShell>
      <PageHero kicker="Arrivages" title="Qualifier les signaux terrain avant toute décision." text="Les arrivages ne sont pas un catalogue public : ce sont des signaux à qualifier, relier et prouver." ctaHref="/demo" ctaLabel="Revenir à la démo" />
      <OperationalMetrics metrics={[{ label: "Signaux", value: arrivages.length }, { label: "Lot pilote", value: slice.signal.volume, help: slice.signal.quay }, { label: "Preuve", value: slice.signal.proofLevel }]} />
      <section className="premium-section">
        <SectionIntro kicker="Lots et signaux" title="Ce qu'il faut regarder." />
        <div className="premium-card-grid premium-card-grid-3">
          {arrivages.map((item) => (
            <DataCard key={item.id} title={item.espece} meta={`${item.quai} · ${item.heureDebarquement}`} status={item.statut} text={`${item.quantite} déclarés. ${item.vendeur ?? "Acteur terrain"}.`} href="/opportunites" />
          ))}
        </div>
      </section>
    </PremiumShell>
  );
}

export function PremiumBesoinsPage({ besoins, slice }: { besoins: Besoin[]; slice: MvpSliceSummary }) {
  return (
    <PremiumShell>
      <PageHero kicker="Besoins" title="Structurer la demande pour déclencher une coordination utile." text="Un besoin qualifié permet d'identifier une tension, une opportunité ou une action prioritaire." ctaHref="/opportunites" ctaLabel="Voir les opportunités" />
      <OperationalMetrics metrics={[{ label: "Besoins", value: besoins.length }, { label: "Besoin pilote", value: slice.need.volume, help: slice.need.species }, { label: "Niveau preuve", value: slice.need.proofLevel }]} />
      <section className="premium-section">
        <SectionIntro kicker="Demandes actives" title="Les besoins ne sont pas des paniers : ce sont des signaux de coordination." />
        <div className="premium-card-grid premium-card-grid-3">
          {besoins.map((item) => (
            <DataCard key={item.id} title={item.espece} meta={`${item.quai} · urgence ${item.urgence}`} status={item.urgence} text={`${item.quantite} demandés. ${item.commentaire}`} href="/opportunites" />
          ))}
        </div>
      </section>
    </PremiumShell>
  );
}

export function PremiumOpportunitesPage({ opportunites, summary }: { opportunites: Opportunite[]; summary: MatchingSummary }) {
  return (
    <PremiumShell>
      <PageHero kicker="Opportunités" title="Des correspondances expliquées, pas une marketplace." text="Chaque opportunité relie une offre, un besoin, un score, une raison et une action de coordination." ctaHref="/coordination" ctaLabel="Coordonner les actions" />
      <OperationalMetrics metrics={[{ label: "Opportunités", value: summary.nombreOpportunites }, { label: "Couverture besoins", value: `${summary.tauxCouvertureBesoins}%` }, { label: "Arrivages disponibles", value: summary.arrivagesDisponibles }]} />
      <section className="premium-section">
        <SectionIntro kicker="Recommandations" title="Meilleures correspondances en premier." />
        <div className="premium-card-grid premium-card-grid-3">
          {opportunites.map((item) => (
            <OpportunityCard key={item.id} opportunite={item} />
          ))}
        </div>
      </section>
    </PremiumShell>
  );
}

export function PremiumOpportunityDetailPage({ opportunite, slice }: { opportunite: Opportunite; slice: MvpSliceSummary }) {
  return (
    <PremiumShell>
      <PageHero kicker="Détail opportunité" title={`${opportunite.espece} · ${opportunite.lieu}`} text="La fiche explique pourquoi le lot et le besoin sont rapprochés, puis propose une action de coordination." ctaHref="/coordination" ctaLabel="Coordonner l'action" />
      <section className="premium-section premium-grid-2">
        <DecisionPanel title="Décision recommandée" text={slice.action.title} proof="Preuve système · données simulées" />
        <div className="premium-card">
          <span className="premium-eyebrow">Compatibilité</span>
          <div className="premium-score">{opportunite.scoreCompatibilite}%</div>
          <p>{opportunite.raisons.join(" · ")}</p>
          <div className="premium-badge-row">
            <Badge>{opportunite.priorite}</Badge>
            <Badge>{opportunite.statut}</Badge>
            <Badge>Preuve système</Badge>
          </div>
        </div>
      </section>
      <section className="premium-section premium-grid-2">
        <PremiumCard title="Offre" text={`${opportunite.offre.quantite} disponibles à ${opportunite.offre.quai}. Vendeur : ${opportunite.vendeur}.`} footer={opportunite.offre.statut} />
        <PremiumCard title="Besoin" text={`${opportunite.besoin.quantite} demandés par ${opportunite.acheteur}. Urgence : ${opportunite.besoin.urgence}.`} footer={opportunite.besoin.commentaire} />
      </section>
      <section className="premium-section">
        <SectionIntro kicker="Historique du lot" title="La preuve reste liée à la décision." />
        <PremiumTimeline steps={slice.steps.slice(0, 6)} />
      </section>
    </PremiumShell>
  );
}

export function PremiumCoordinationPage({ slice, dashboardData }: { slice: MvpSliceSummary; dashboardData: DashboardData }) {
  return (
    <PremiumShell>
      <PageHero kicker="Cockpit de coordination" title="Prioriser l'action, pas empiler les tableaux." text="La coordination rassemble signal, tension, opportunité, preuve et synthèse pour aider un responsable à agir." ctaHref="/executive" ctaLabel="Lire la synthèse" />
      <OperationalMetrics metrics={[{ label: "Arrivages", value: dashboardData.stats.arrivagesPublies }, { label: "Besoins ouverts", value: dashboardData.stats.besoinsOuverts }, { label: "Couverture", value: `${dashboardData.stats.tauxCouvertureBesoins}%` }]} />
      <section className="premium-section premium-grid-2">
        <DecisionPanel title="Action prioritaire" text={slice.action.description} proof={`${slice.action.proofLevel} · ${slice.action.source}`} />
        <div className="premium-card">
          <span className="premium-eyebrow">File d'action</span>
          {[slice.signal.title, slice.need.title, slice.action.title].map((item, index) => (
            <div className="premium-queue-row" key={item}>
              <span>{index + 1}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="premium-section">
        <SectionIntro kicker="Parcours opérationnel" title="Ce que le cockpit doit rendre évident." />
        <PremiumTimeline steps={slice.steps} />
      </section>
    </PremiumShell>
  );
}

export function PremiumExecutivePage({ slice, dashboardData }: { slice: MvpSliceSummary; dashboardData: DashboardData }) {
  return (
    <PremiumShell>
      <PageHero kicker="Vue exécutive" title="Comprendre la décision en moins de 60 secondes." text="La synthèse donne l'impact estimé, les limites de preuve et la prochaine action à discuter." ctaHref="/devis" ctaLabel="Demander un cadrage" />
      <OperationalMetrics metrics={[{ label: "Volume débarqué", value: dashboardData.stats.volumeTotalDebarque }, { label: "Opportunités", value: dashboardData.stats.opportunitesDetectees }, { label: "Impact", value: slice.report.impact }]} />
      <section className="premium-section premium-grid-2">
        <DecisionPanel title="Décision à retenir" text={slice.report.decision} proof={slice.report.limits} />
        <div className="premium-card">
          <span className="premium-eyebrow">Lecture décideur</span>
          <h3>Risques et limites visibles</h3>
          <p>Les indicateurs restent estimés ou système tant qu'ils ne sont pas confirmés par un pilote terrain réel.</p>
          <div className="premium-badge-row">
            <Badge>Impact estimé</Badge>
            <Badge>Preuve système</Badge>
            <Badge>Tension {slice.tension.level}</Badge>
          </div>
        </div>
      </section>
      <section className="premium-section">
        <SectionIntro kicker="Rapport" title="Les preuves et actions qui alimentent la synthèse." />
        <div className="premium-card-grid premium-card-grid-4">
          {slice.reportMetrics.map((metric) => (
            <MetricCard key={metric.id} label={metric.label} value={metric.value} help={metric.proofLevel} />
          ))}
        </div>
      </section>
    </PremiumShell>
  );
}

export function PageHero({ kicker, title, text, ctaHref, ctaLabel }: { kicker: string; title: string; text: string; ctaHref: string; ctaLabel: string }) {
  return (
    <section className="premium-hero premium-hero-page">
      <div className="premium-eyebrow">{kicker}</div>
      <h1>{title}</h1>
      <p>{text}</p>
      <div className="premium-actions">
        <Link className="premium-button premium-button-primary" href={ctaHref}>{ctaLabel}</Link>
        <Link className="premium-button premium-button-secondary" href="/demo">Parcours démo</Link>
      </div>
    </section>
  );
}

export function SectionIntro({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="premium-section-intro">
      <span className="premium-eyebrow">{kicker}</span>
      <h2>{title}</h2>
    </div>
  );
}

export function PremiumCard({ title, text, footer }: { title: string; text: string; footer?: string }) {
  return (
    <article className="premium-card">
      <h3>{title}</h3>
      <p>{text}</p>
      {footer ? <span className="premium-card-footer">{footer}</span> : null}
    </article>
  );
}

export function MetricCard({ label, value, help, tone }: Metric & { tone?: "default" | "warning" }) {
  return (
    <article className={`premium-metric ${tone === "warning" ? "premium-metric-warning" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {help ? <small>{help}</small> : null}
    </article>
  );
}

function OperationalMetrics({ metrics }: { metrics: Metric[] }) {
  return (
    <section className="premium-section premium-metrics-row">
      {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
    </section>
  );
}

function DataCard({ title, meta, status, text, href }: { title: string; meta: string; status: string; text: string; href: string }) {
  return (
    <Link className="premium-card premium-data-card" href={href}>
      <span className="premium-eyebrow">{meta}</span>
      <h3>{title}</h3>
      <p>{text}</p>
      <Badge>{status}</Badge>
    </Link>
  );
}

function OpportunityCard({ opportunite }: { opportunite: Opportunite }) {
  return (
    <Link className="premium-card premium-data-card" href={`/opportunites/${opportunite.id}`}>
      <span className="premium-eyebrow">{opportunite.lieu} · {opportunite.priorite}</span>
      <h3>{opportunite.espece}</h3>
      <p>{opportunite.quantiteDemandee} demandés · {opportunite.quantiteDisponible} disponibles.</p>
      <div className="premium-card-split">
        <Badge>{opportunite.scoreCompatibilite}% compatible</Badge>
        <Badge>{opportunite.statut}</Badge>
      </div>
    </Link>
  );
}

function PremiumTimeline({ steps }: { steps: Array<MvpSliceStep | TerritoryPilotSummary["flow"][number]> }) {
  return (
    <div className="premium-timeline">
      {steps.map((step, index) => (
        <Link className="premium-timeline-step" href={step.href} key={`${step.title}-${index}`}>
          <span className="premium-step-number">{String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>{step.title}</strong>
            <p>{step.description}</p>
            <small>{step.module} · {step.status}</small>
          </div>
        </Link>
      ))}
    </div>
  );
}

function DecisionPanel({ title, text, proof }: { title: string; text: string; proof: string }) {
  return (
    <section className="premium-section premium-decision-panel">
      <span className="premium-eyebrow">Décision</span>
      <h2>{title}</h2>
      <p>{text}</p>
      <Badge>{proof}</Badge>
    </section>
  );
}

function TerritoryMapPanel({ title, tension }: { title: string; tension: string }) {
  return (
    <div className="premium-card premium-map-card">
      <span className="premium-eyebrow">{title}</span>
      <div className="premium-map-visual">
        <span className="map-dot dot-critical" />
        <span className="map-label label-joal">Joal</span>
        <span className="map-dot dot-watch" />
        <span className="map-label label-mbour">Mbour</span>
      </div>
      <div className="premium-card-split">
        <Badge>Tension {tension}</Badge>
        <Badge>Données simulées</Badge>
      </div>
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return <span className="premium-badge">{children}</span>;
}

function DemoPath() {
  return (
    <div className="premium-demo-path" aria-label="Parcours de démonstration">
      {demoRoutes.map((route) => <Link href={route.href} key={route.href}>{route.label}</Link>)}
    </div>
  );
}
