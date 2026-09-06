// XXL-R1 (§17 du mandat) — signature Signal : point / pulse discret /
// marqueur pour nouveau signal, attention, changement, information
// confirmée. Ce langage existe déjà et fonctionne — TensionGlyph
// (components/etat/TensionGlyph.tsx), déjà utilisé sur le hero de la
// fiche Situation et identifié par l'audit comme la seule animation
// réellement justifiée du produit. §19 du mandat (pas de component
// factory) : on ne duplique pas un second glyphe, on le formalise comme
// primitive officielle sous son nom générique.
export { TensionGlyph as SignalMark } from "@/components/etat/TensionGlyph";
