"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { EtatPreviewRole } from "@/domain/platform/private-nav";

// LOT V3.29 ("Header + menu — copie conforme littérale") — la maquette
// Claude Design porte 2 contrôles d'en-tête jamais reproduits jusqu'ici,
// malgré une fidélité déjà poussée sur les 8 écrans de l'Espace État :
//  - le bandeau période ("30 jours"/"90 jours"/"12 mois" + la plage de
//    dates qui en découle), qui change réellement la fenêtre "sur la
//    période" déjà utilisée par l'Atlas territorial (LOT V3.28) ;
//  - le sélecteur "Rôle connecté" (Ministre/Direction de programme/
//    Coordination territoriale), qui réordonne réellement le menu dans
//    la maquette (vérifié par clic réel dans le bundle standalone.html :
//    3 ordres différents, "Arbitrages" absent pour Direction de
//    programme, "Résultats" absent pour Coordination territoriale).
//
// Ce produit n'a que 2 rôles réels qui atteignent l'Espace État
// (institution, administrateur — garde serveur, etat/layout.tsx) : les 3
// boutons de la maquette ne correspondent pas à 3 comptes réels
// distincts. Pour ne jamais fabriquer une capacité (changer réellement
// d'identité/autorisation depuis un bouton client serait exactement ça),
// ce sélecteur reste un APERÇU de mise en avant du menu, jamais un
// changement de rôle réel : il réordonne les VRAIES destinations
// (jamais n'en masque aucune — contrairement à la maquette, qui fait
// disparaître certaines entrées par rôle, ce qui masquerait une capacité
// réellement accessible à la session courante).
export type EtatPeriod = "30j" | "90j" | "12m";
export type { EtatPreviewRole };

export const ETAT_PERIOD_DAYS: Record<EtatPeriod, number> = { "30j": 30, "90j": 90, "12m": 365 };

interface EtatPreviewContextValue {
  period: EtatPeriod;
  setPeriod: (period: EtatPeriod) => void;
  periodDays: number;
  previewRole: EtatPreviewRole;
  setPreviewRole: (role: EtatPreviewRole) => void;
}

const EtatPreviewContext = createContext<EtatPreviewContextValue | null>(null);

export function EtatPreviewProvider({ children }: { children: React.ReactNode }) {
  // "90 jours" actif par défaut — état exact de la maquette au premier
  // rendu (vérifié par lecture directe du bundle : le bouton "90 jours"
  // porte déjà le fond actif au chargement).
  const [period, setPeriod] = useState<EtatPeriod>("90j");
  const [previewRole, setPreviewRole] = useState<EtatPreviewRole>("ministre");
  const value = useMemo<EtatPreviewContextValue>(() => ({ period, setPeriod, periodDays: ETAT_PERIOD_DAYS[period], previewRole, setPreviewRole }), [period, previewRole]);
  return <EtatPreviewContext.Provider value={value}>{children}</EtatPreviewContext.Provider>;
}

// Retourne `null` hors du provider (Coordination, qui ne le monte pas) —
// jamais une erreur : les consommateurs optionnels (PrivateHeader) savent
// se rabattre sur un rendu sans ces 2 contrôles.
export function useEtatPreview(): EtatPreviewContextValue | null {
  return useContext(EtatPreviewContext);
}
