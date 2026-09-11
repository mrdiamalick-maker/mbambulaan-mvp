import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createDemoState } from "../src/data/demo-state";
import { dataSourceRegistry, dataSourceSummary } from "../src/domain/data-sources";

// LOT V3.7 ("Arbitrages / Sources") — les deux derniers écrans du plan V3
// jamais couverts par un lot dédié. Arbitrages (composant "use client")
// n'est pas montable via renderToStaticMarkup dans ce jeu de tests Node
// pur (même contrainte déjà documentée pour les LOTs V3.1-V3.6) — vérifié
// par lecture de source. Le Core (domain/data-sources.ts, pur) est testé
// en direct, ainsi que DataSourcesRegistry.tsx (composant serveur, pas de
// hook, mais tout de même vérifié par lecture de source pour rester
// cohérent avec la discipline des lots précédents).
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}

const state = createDemoState();

// TEST 1 — dataSourceRegistry reste une lecture directe et vérifiable :
// 6 cartes, avec les 6 noms EXACTS et le ORDRE exact de la maquette
// (corrigé au LOT V3.22 — "Signaux de terrain et de quai" et
// "Déclarations téléphoniques et espace public" étaient des noms
// reformulés qui remplaçaient à tort les 6 cartes littérales du
// prototype). Chaque compteur affiché dans `effect` provient réellement
// de state, jamais d'un nombre fabriqué.
test("TEST 1 — dataSourceRegistry reprend les 6 noms littéraux du prototype, dans son ordre exact, avec des chiffres réels", () => {
  const cards = dataSourceRegistry(state);
  assert.equal(cards.length, 6);
  assert.deepEqual(
    cards.map((c) => c.name),
    [
      "Relais de quai mandatés",
      "Formulaires et contributions",
      "Système budgétaire du ministère",
      "Registre national des immatriculations",
      "Systèmes de suivi des navires",
      "Référentiels institutionnels"
    ]
  );

  const onSite = state.signals.filter((s) => ["terrain", "poste_quai", "whatsapp_structure"].includes(s.channel));
  const declarative = state.signals.filter((s) => ["telephone", "espace_public"].includes(s.channel));
  // Toute la partition des canaux doit être couverte, jamais un signal
  // orphelin qui n'apparaîtrait dans aucune des deux cartes "connectée".
  assert.equal(onSite.length + declarative.length, state.signals.length);

  const relaisCard = cards.find((c) => c.key === "relais-quai");
  const declaratifCard = cards.find((c) => c.key === "formulaires");
  const territoriesWithOnSite = new Set(onSite.map((s) => s.territoryId).filter((id): id is string => id != null));
  assert.ok(relaisCard?.effect.includes(String(territoriesWithOnSite.size)), "le nombre de territoires couverts doit être réel, jamais le \"4 sites sur 18\" fabriqué du prototype");
  assert.ok(declaratifCard?.effect.includes(String(declarative.length)));

  const vesselCard = cards.find((c) => c.key === "immatriculation");
  assert.ok(vesselCard?.effect.includes(String(state.vessels.length)));

  const refCard = cards.find((c) => c.key === "referentiels");
  assert.ok(refCard?.effect.includes(String(state.territories.length)));
  assert.ok(refCard?.effect.includes(String(state.organizations.length)));
});

// TEST 2 — jamais de compteur négatif ou incohérent (garde-fou "jamais
// fabriqué, jamais impossible").
test("TEST 2 — dataSourceSummary reste cohérent avec la donnée réelle", () => {
  const summary = dataSourceSummary(state);
  assert.ok(summary.connectedCount >= 0);
  assert.ok(summary.connectedCount <= summary.totalCount);
  assert.equal(summary.totalCount, 6);
  const totalFunding = state.initiatives.flatMap((i) => i.funding).reduce((sum, f) => sum + f.amountFcfa, 0);
  assert.equal(summary.fundingTotalFcfa, totalFunding);
});

// TEST 3 — la page Sources est réellement montée sous /app/etat/sources et
// consomme DataSourcesRegistry (aucune route équivalente n'existait avant
// ce lot).
test("TEST 3 — /app/etat/sources monte réellement DataSourcesRegistry", () => {
  const pageSource = readSource("../src/app/app/etat/sources/page.tsx");
  assert.ok(pageSource.includes('from "@/components/etat/DataSourcesRegistry"'));
  assert.ok(pageSource.includes("<DataSourcesRegistry state={state} />"));
  const navSource = readSource("../src/domain/platform/private-nav.ts");
  assert.ok(navSource.includes('href: "/app/etat/sources"'));
});

// TEST 4 — Arbitrages : le panneau "Décision attendue" continue de
// n'exposer que des actions réelles (jamais les options de texte libre
// pro/con du prototype, qui ne correspondent à aucune commande générique
// du domaine — décision déjà prise et documentée avant ce lot,
// reconfirmée ici plutôt que silencieusement défaite).
test("TEST 4 — ArbitragesPage n'expose toujours que des actions réelles, jamais les options fabriquées du prototype", () => {
  const source = readSource("../src/app/app/etat/arbitrages/page.tsx");
  assert.ok(source.includes("Planifier une visite terrain"));
  assert.ok(source.includes("Arbitrer cette situation"));
  assert.ok(!source.includes("arbOptions"), "aucune trace du mécanisme d'options fabriquées du prototype");
  // 3e colonne ("Si rien n'est décidé") : présente, mais dérivée de champs
  // réels (priorité/étape/ancienneté), jamais d'une conséquence narrative
  // inventée.
  assert.ok(source.includes("Si rien n’est décidé"));
  assert.ok(source.includes("sm:grid-cols-3"));
});

// TEST 5 (LOT V3.22, "copie conforme littérale") — le h1 reprend la
// formule EXACTE du prototype ("{N} décisions attendues, chacune avec ce
// qui reste inconnu au moment de décider"), avec le compte RÉEL de
// situations en attente (18 dans le Demo World actuel) plutôt que le
// "Trois" figé, propre à la fixture du prototype (3 arbitrages de
// démonstration) — jamais recopié tel quel car faux pour ce produit.
test("TEST 5 — le h1 d'Arbitrages reprend la formule littérale du prototype avec le compte réel, jamais le nombre fixe de la fixture", () => {
  const source = readSource("../src/app/app/etat/arbitrages/page.tsx");
  assert.ok(source.includes("décision"));
  assert.ok(source.includes("chacune avec ce qui reste inconnu au moment de décider"));
  assert.ok(source.includes("frenchCount(situationsAArbitrer.length)"));
  assert.ok(!/>\s*Trois décisions attendues/.test(source), "le nombre fixe \"Trois\" de la fixture du prototype ne doit jamais être codé en dur");
  assert.ok(source.includes("mb-rise"), "l'animation d'entrée littérale de la maquette doit être appliquée");
});
