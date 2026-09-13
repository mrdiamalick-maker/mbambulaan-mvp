// Singleton du domaine réel pour tout /private-v3 — construit une seule
// fois au chargement du module (même discipline que PD.1, mandat "The
// current Demo World instances may remain demo data") et partagé par
// tous les ponts v3-template/lib/*-bridge.ts, pour ne jamais reconstruire
// deux copies indépendantes du même ProductState.
import { createDemoState } from "@/data/demo-state";

export const DEMO_STATE = createDemoState();
