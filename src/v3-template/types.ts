// Types partagés du template privé V3.

export type RoleKey = "ministre" | "programme" | "coordination";

export type ScreenKey =
  | "brief"
  | "atlas"
  | "situations"
  | "arbitrages"
  | "programmes"
  | "resultats"
  | "flux"
  | "sources";

export type PeriodKey = "30j" | "90j" | "12m";

export type TrustLevel = "declaree" | "observee" | "verifiee";

// [nom, région, lat, lon, niveau, nb situations, zone]
export type TerritoryRow = [string, string, number, number, "critique" | "vigilance" | "stable", number, string];
