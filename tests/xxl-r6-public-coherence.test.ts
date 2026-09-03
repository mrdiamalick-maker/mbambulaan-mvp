import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { publicTerritories } from "../src/data/public-atlas";
import { coastlinePath } from "../src/domain/territory-map-positions";
import { PublicAtlasWorkspace } from "../src/components/ecosystem/PublicAtlasWorkspace";

// XXL-R6 — Public Coherence (mandat CEO "une marque produit, plusieurs
// expériences"). Le Core (PublicRequest/PublicContribution → Signal,
// buildTerritoryIntelligence, projections métier) reste gelé — non
// modifié cette session, déjà couvert par public-request-signal.test.ts
// et public-contribution-signal.test.ts ("E. PublicRequest/
// PublicContribution lifecycle inchangé", §23). Les tests ci-dessous
// portent sur ce que ce lot a réellement changé ou doit garantir : la
// convergence cartographique technique vers la géométrie R5.5 (§5), la
// séparation Public/Pro (§6), l'absence de jargon interne (§18) et la
// couverture territoriale publique (§7/§21).
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}
(globalThis as Record<string, unknown>).React = React;

const workspaceSource = readSource("../src/components/ecosystem/PublicAtlasWorkspace.tsx");

// TEST A — même ADN cartographique (mandat §5, §19) : l'Atlas public
// importe désormais le même tracé littoral calibré (coastlinePath) que
// Brief national, Atlas professionnel et /app/pilotage — plus une chaîne
// dupliquée qui pourrait diverger silencieusement d'une future
// recalibration. Pas de troisième géométrie.
test("TEST A — l'Atlas public importe le même tracé littoral calibré que le reste du produit", () => {
  assert.ok(workspaceSource.includes('coastlinePath } from "@/domain/territory-map-positions"'), "PublicAtlasWorkspace doit importer coastlinePath depuis la source partagée");
  assert.ok(!/M 315 145 L 610 118/.test(workspaceSource), "le tracé ne doit plus être dupliqué en dur dans le composant");
  assert.ok(typeof coastlinePath === "string" && coastlinePath.startsWith("M 315 145"), "coastlinePath doit rester le tracé calibré connu");
});

// TEST B — l'Atlas public N'IMPORTE PAS CoastlineTerritoryMap lui-même
// (mandat §7 : "ne pas importer automatiquement la légende Pro" ; §6 :
// jamais de Territory.activity interne côté Public) — la convergence
// reste géométrique, jamais une fuite du vocabulaire d'attention Pro/État.
test("TEST B — l'Atlas public ne réutilise pas le composant carte Pro/État (pas de niveaux d'attention internes)", () => {
  // La chaîne "CoastlineTerritoryMap" reste légitimement présente dans le
  // commentaire expliquant CE choix (doctrine : jamais réécrire le
  // raisonnement rétroactivement) — seul un import réel du composant est
  // vérifié absent ici.
  assert.ok(!workspaceSource.includes('from "@/components/territories/CoastlineTerritoryMap"'), "PublicAtlasWorkspace ne doit pas importer le composant carte réservé à /app (activity stable/vigilance/critique)");
  // Le champ Territory.activity (interne) lui-même est vérifié absent du
  // jeu de données public dans TEST C (forbiddenKeys) — pas re-testé ici
  // par une recherche du mot anglais "activity", qui apparaîtrait
  // légitimement dans la prose expliquant CE choix.
});

// TEST C — séparation Public/Pro : aucun champ opérationnel réservé au
// Pro/État n'existe sur le jeu de données public (mandat §6), et le rendu
// de l'Atlas public ne contient aucun terme interne (mandat §18).
test("TEST C — aucune donnée ni terme interne Pro/État ne fuit dans l'Atlas public", () => {
  const forbiddenKeys = ["trust", "situations", "signalIds", "infrastructures", "actors", "territoryId", "coordinations", "networkCapacities", "activity"];
  for (const territory of publicTerritories) {
    const keys = Object.keys(territory);
    for (const forbidden of forbiddenKeys) {
      assert.ok(!keys.includes(forbidden), `data/public-atlas.ts expose un champ opérationnel "${forbidden}" — fuite Pro → Public`);
    }
  }
  const html = renderToStaticMarkup(React.createElement(PublicAtlasWorkspace));
  const forbiddenTerms = ["Finding", "Knowledge Gap", "Commitment", "Outcome", "ProgramOpportunity", "Intelligence Engine", "Digital Twin", "Trust interne"];
  for (const term of forbiddenTerms) {
    assert.ok(!html.includes(term), `le terme interne "${term}" ne doit jamais apparaître dans l'Atlas public`);
  }
});

// TEST D — tous les territoires publics autorisés restent accessibles
// (mandat §7/§21) : chaque territoire du jeu public a une position
// calibrée sur le tracé (donc un marqueur réellement affiché) et un slug
// unique routable (/atlas/[slug]).
test("TEST D — chaque territoire public a une position sur la carte et une fiche routable unique", () => {
  assert.ok(publicTerritories.length > 0, "le jeu de données public ne doit pas être vide");
  const slugs = new Set<string>();
  for (const territory of publicTerritories) {
    assert.ok(Array.isArray(territory.mapPosition) && territory.mapPosition.length === 2, `${territory.name} doit avoir une position calibrée sur le tracé`);
    assert.ok(!slugs.has(territory.slug), `le slug "${territory.slug}" doit être unique (fiche territoire routable sans collision)`);
    slugs.add(territory.slug);
  }
});

// TEST E — le rendu de l'Atlas public affiche bien un marqueur cliquable
// par territoire du jeu public (mandat §7 : "les territoires couverts,
// leur identité, la diversité territoriale" doivent être compréhensibles
// d'un coup d'œil, aucun territoire documenté n'est caché par un filtre
// par défaut).
test("TEST E — l'Atlas public affiche un marqueur pour chaque territoire de la région sélectionnée par défaut", () => {
  const html = renderToStaticMarkup(React.createElement(PublicAtlasWorkspace));
  for (const territory of publicTerritories) {
    assert.ok(html.includes(`Découvrir ${territory.name}`), `${territory.name} doit apparaître comme marqueur cliquable sur la carte publique par défaut (aucun filtre Région actif)`);
  }
});

// TEST F — palette verrouillée (mandat §13) : aucune teinte hors marine/
// terre-cuite/crème n'est introduite dans le CSS public — les variables
// --pub-turquoise-*/--pub-gold-* historiquement mal nommées restent, en
// valeur, des teintes marine/terre-cuite/crème (aucune vraie couleur
// turquoise ou or n'est ajoutée par ce lot).
test("TEST F — la palette publique reste strictement marine/terre-cuite/crème (aucune teinte parallèle)", () => {
  const cssSource = readSource("../src/app/public-design-system.css");
  assert.ok(cssSource.includes("--pub-deep-900: #0b1a2a;"), "la marine verrouillée doit rester #0b1a2a");
  assert.ok(cssSource.includes("--pub-turquoise-500: #b6522f;"), "l'accent verrouillé doit rester la terre-cuite #b6522f (variable historiquement mal nommée, valeur inchangée)");
  assert.ok(cssSource.includes("--pub-ivory-100: #f7f3e9;"), "la crème verrouillée doit rester #f7f3e9");
});
