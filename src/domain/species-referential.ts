// Species Referential V1 (PD.2, mandat "Product Dressing — Species
// Referential V1") — couche de résolution pure pour le référentiel
// Species ajouté à types.ts. Centralise ce que chaque consommateur
// faisait jusqu'ici en ligne (`state.species.find(item => item.id ===
// x)`) sans les obliger à migrer (mandat §7/§13 : audit fait, aucun
// consommateur existant cassé) — les nouveaux usages (Landing
// Intelligence, PD.2) passent par ces fonctions plutôt que de dupliquer
// une nouvelle logique de résolution.
//
// Discipline "pas d'IA floue" (mandat §10) : la résolution par alias est
// une égalité exacte après normalisation (casse, espaces, accents) —
// jamais une distance d'édition ni un score de similarité. Une
// correspondance multiple retourne explicitement l'ambiguïté plutôt que
// de deviner laquelle retenir.
import type { ProductState, Species } from "./types";

export function resolveSpeciesById(state: ProductState, id: string): Species | undefined {
  return state.species.find((item) => item.id === id);
}

export function resolveSpeciesByCode(state: ProductState, code: string): Species | undefined {
  const normalized = normalize(code);
  return state.species.find((item) => normalize(item.code) === normalized);
}

export type SpeciesLookupResult =
  | { status: "found"; species: Species }
  | { status: "not_found" }
  // ambiguous (mandat §10 : "If alias resolution is ambiguous, return
  // ambiguity/not-found rather than guessing") — ne se produit pas avec
  // le référentiel de démonstration actuel (chaque code/nameFr/alias y
  // est unique), mais reste un résultat de première classe : un futur
  // référentiel plus large pourrait légitimement introduire un alias
  // partagé par deux espèces, et ce cas ne doit jamais se résoudre en
  // silence vers l'une des deux.
  | { status: "ambiguous"; candidates: Species[] };

// resolveSpeciesByAlias — résout un texte libre (code, nom de référence
// français, ou l'un des noms locaux/alias) vers une espèce réelle.
// Comparaison exacte après normalisation, jamais floue.
export function resolveSpeciesByAlias(state: ProductState, alias: string): SpeciesLookupResult {
  const normalized = normalize(alias);
  if (!normalized) return { status: "not_found" };

  const matches = state.species.filter(
    (item) =>
      normalize(item.code) === normalized ||
      normalize(item.nameFr) === normalized ||
      item.localNames.some((localName) => normalize(localName) === normalized)
  );

  if (matches.length === 0) return { status: "not_found" };
  if (matches.length > 1) return { status: "ambiguous", candidates: matches };
  return { status: "found", species: matches[0] };
}

// normalize — casse, espaces et diacritiques retirés (plage Unicode des
// signes combinatoires U+0300–U+036F, produite par la décomposition NFD)
// pour une comparaison stable ("Thiof" === "thiof" === "THIOF"). Toujours
// une égalité exacte après cette normalisation, jamais une distance
// approximative.
function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
