"use client";

// XXL-R1 (§31 du mandat) — page de documentation visuelle interne : les
// tokens et les 9 primitives ensemble, avec leurs états (normal, long,
// absent, connaissance incomplète). PAS une fonctionnalité produit :
// aucune entrée de navigation (Public ou Pro) ne pointe ici, route
// atteignable seulement par son adresse directe — exactement l'usage
// prévu ("elle ne doit pas être exposée comme une feature utilisateur").
// Hors du groupe /app (aucun garde d'authentification dans middleware.ts,
// qui ne protège que /app/:path*) : un outil pour l'équipe produit, pas
// un espace client.
import {
  PageIntro,
  EditorialSection,
  MetricStatement,
  AttentionItem,
  TerritoryIdentity,
  EvidenceLine,
  TrustIndicator,
  NarrativeFlow,
  KnowledgeState,
  TerritorySignature,
  SignalMark
} from "@/components/foundations";

const colorGroups: { title: string; swatches: { name: string; varName: string; hex: string }[] }[] = [
  {
    title: "Navy — structure, autorité",
    swatches: [
      { name: "navy-950", varName: "--mb-navy-950", hex: "#071627" },
      { name: "navy-900", varName: "--mb-navy-900", hex: "#0b1a2a" },
      { name: "navy-800", varName: "--mb-navy-800", hex: "#13263a" },
      { name: "navy-600", varName: "--mb-navy-600", hex: "#1d4468" }
    ]
  },
  {
    title: "Terracotta — action, rare",
    swatches: [
      { name: "terracotta-700", varName: "--mb-terracotta-700", hex: "#8f3f22" },
      { name: "terracotta-600", varName: "--mb-terracotta-600", hex: "#b6522f" },
      { name: "terracotta-500", varName: "--mb-terracotta-500", hex: "#c56745" }
    ]
  },
  {
    title: "Crème — matière, respiration",
    swatches: [
      { name: "cream-100", varName: "--mb-cream-100", hex: "#f7f3e9" },
      { name: "cream-200", varName: "--mb-cream-200", hex: "#eee8dc" },
      { name: "paper", varName: "--mb-paper", hex: "#ffffff" }
    ]
  },
  {
    title: "Sémantiques",
    swatches: [
      { name: "success", varName: "--mb-success", hex: "#1d8a5f" },
      { name: "warning", varName: "--mb-warning", hex: "#c68a2c" },
      { name: "danger", varName: "--mb-danger", hex: "#b6522f" },
      { name: "info", varName: "--mb-info", hex: "#1d4468" }
    ]
  }
];

const radiusFamilies: { name: string; token: string; px: string }[] = [
  { name: "Editorial", token: "--mb-radius-editorial", px: "3px" },
  { name: "Interactive", token: "--mb-radius-interactive", px: "8px" },
  { name: "Workspace", token: "--mb-radius-workspace", px: "12px" },
  { name: "Floating", token: "--mb-radius-floating", px: "22px" },
  { name: "Pill", token: "--mb-radius-pill", px: "999px" }
];

export default function DesignFoundationsPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--mb-cream-100)" }}>
      <div className="mb-container-workspace px-5 py-10 lg:px-8">
        <div className="mb-6 rounded-md border px-4 py-3" style={{ borderColor: "var(--mb-warning)", background: "#f3e6cb", color: "#8a5b17" }}>
          <p className="mb-operational text-[12px]">Documentation interne XXL-R1 — non liée à la navigation Public ou Pro. Pas une page produit.</p>
        </div>

        <PageIntro
          eyebrow="XXL-R1 — Design Foundations"
          title="Le langage produit Mbàmbulaan, en un seul endroit."
          dek="Tokens verrouillés et 9 primitives réutilisables — construits à partir des fragments déjà réussis du produit (Public, Brief national, Situation, Terrain), pas d'une cinquième direction inventée."
          signature
        />

        {/* ---------------- Couleurs ---------------- */}
        <EditorialSection eyebrow="§6-§8" title="Couleurs" className="mt-14">
          <p>Trois couleurs verrouillées + quatre sémantiques — aucune palette parallèle.</p>
        </EditorialSection>
        <div className="mt-5 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {colorGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-evidence">{group.title}</p>
              <div className="mt-2 space-y-2">
                {group.swatches.map((swatch) => (
                  <div key={swatch.name} className="flex items-center gap-2.5">
                    <span className="size-8 shrink-0 rounded-md border" style={{ background: swatch.hex, borderColor: "var(--mb-hairline-soft)" }} />
                    <div className="min-w-0">
                      <p className="mb-operational text-[12px]">{swatch.name}</p>
                      <p className="mb-evidence text-[10px]">{swatch.hex}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ---------------- Typographie ---------------- */}
        <EditorialSection eyebrow="§9-§10" title="Typographie — 8 rôles" className="mt-16">
          <p>Trois voix : éditorial (comprendre), opérationnel (faire), preuve (pourquoi nous pouvons le dire).</p>
        </EditorialSection>
        <div className="mt-5 space-y-5 border-y py-6" style={{ borderColor: "var(--mb-hairline-soft)" }}>
          <div><p className="mb-evidence mb-1">Display</p><p className="mb-display">Situation globalement maîtrisée.</p></div>
          <div><p className="mb-evidence mb-1">Page title</p><p className="mb-page-title">Brief national</p></div>
          <div><p className="mb-evidence mb-1">Section title</p><p className="mb-section-title">Le pouls de la filière</p></div>
          <div><p className="mb-evidence mb-1">Dossier title</p><p className="mb-dossier-title">Quai de Joal-Fadiouth</p></div>
          <div><p className="mb-evidence mb-1">Body</p><p className="mb-body max-w-lg">Mbàmbulaan relie information de terrain, acteurs et capacités pour transformer des situations dispersées en actions mieux coordonnées.</p></div>
          <div><p className="mb-evidence mb-1">Operational</p><p className="mb-operational">Confirmer l’heure de retour avec le capitaine et le quai</p></div>
          <div><p className="mb-evidence mb-1">Evidence / meta</p><p className="mb-evidence">Poste de quai de Joal · 29 juil. 2026 · déclarée</p></div>
          <div><p className="mb-evidence mb-1">Metric</p><p className="mb-metric-value">35</p></div>
        </div>

        {/* ---------------- Géométrie ---------------- */}
        <EditorialSection eyebrow="§13-§14" title="Géométrie et ombre" className="mt-16">
          <p>Quatre familles de rayon + pill — jamais un rounded-xl universel. Une seule ombre, réservée au flottant.</p>
        </EditorialSection>
        <div className="mt-5 flex flex-wrap gap-6">
          {radiusFamilies.map((family) => (
            <div key={family.name} className="text-center">
              <div className="h-16 w-24 border" style={{ borderRadius: family.px, borderColor: "var(--mb-navy-600)", background: "var(--mb-paper)" }} />
              <p className="mb-evidence mt-2">{family.name}</p>
              <p className="mb-evidence" style={{ color: "var(--mb-stone-400)" }}>{family.px}</p>
            </div>
          ))}
          <div className="text-center">
            <div className="h-16 w-24" style={{ borderRadius: "22px", boxShadow: "var(--mb-shadow-floating)", background: "var(--mb-paper)" }} />
            <p className="mb-evidence mt-2">Floating (ombre)</p>
            <p className="mb-evidence" style={{ color: "var(--mb-stone-400)" }}>seule élévation autorisée</p>
          </div>
        </div>

        {/* ---------------- Signatures graphiques ---------------- */}
        <EditorialSection eyebrow="§16-§17" title="Signatures graphiques" className="mt-16">
          <p>Territoire (littoral, coordonnées, trajectoire) et Signal (TensionGlyph, déjà en production) — jamais de vagues décoratives ni de motif nautique.</p>
        </EditorialSection>
        <div className="mt-5 flex flex-wrap items-center gap-10">
          <div className="text-center">
            <TerritorySignature size={72} />
            <p className="mb-evidence mt-2">TerritorySignature</p>
          </div>
          <div className="flex gap-6">
            {(["stable", "vigilance", "critique"] as const).map((status) => (
              <div key={status} className="text-center">
                <SignalMark status={status} size={56} pulse={status === "critique"} />
                <p className="mb-evidence mt-2">{status}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- 9 primitives ---------------- */}
        <EditorialSection eyebrow="§18" title="Les 9 primitives" className="mt-16">
          <p>Réutilisables sur Pro et État — pas un composant par écran (§19).</p>
        </EditorialSection>

        <div className="mt-6 space-y-10">
          <div>
            <p className="mb-evidence mb-3">1 · PageIntro</p>
            <div className="rounded-md border p-5" style={{ borderColor: "var(--mb-hairline-soft)", background: "var(--mb-paper)" }}>
              <PageIntro eyebrow="Espace État" title="Territoires suivis — registre complet" dek="18 territoires sur 18 au total. La lecture associe niveau d'attention, situations ouvertes et capacités fragiles." stat={<MetricStatement value="18" label="territoires suivis" size="sm" />} />
            </div>
          </div>

          <div>
            <p className="mb-evidence mb-3">2 · EditorialSection</p>
            <div className="rounded-md border p-5" style={{ borderColor: "var(--mb-hairline-soft)", background: "var(--mb-paper)" }}>
              <EditorialSection eyebrow="Le pouls de la filière" title="Capter tout signal, quel que soit le canal.">
                <p>35 signaux captés à ce jour, tous canaux confondus — chaque situation suivie par le réseau en découle.</p>
              </EditorialSection>
            </div>
          </div>

          <div>
            <p className="mb-evidence mb-3">3 · MetricStatement (normal / avec tendance)</p>
            <div className="flex flex-wrap gap-10 rounded-md border p-5" style={{ borderColor: "var(--mb-hairline-soft)", background: "var(--mb-paper)" }}>
              <MetricStatement value="24" label="situations ouvertes" tone="attention" context="dont 4 critiques" trend="+3 vs 7 jours" />
              <MetricStatement value="0" label="espace public" context="aucun signal reçu par ce canal sur la période — une vraie valeur nulle, jamais masquée" />
            </div>
          </div>

          <div>
            <p className="mb-evidence mb-3">4 · AttentionItem (normal / titre long)</p>
            <div className="overflow-hidden rounded-md border" style={{ borderColor: "var(--mb-hairline-soft)", background: "var(--mb-paper)" }}>
              <div className="px-4">
                <AttentionItem level="critique" levelLabel="Décision" territory="Joal-Fadiouth" reason="Machine à glace indisponible au quai de Joal" nextStep="Confirmer l’heure de retour avec le capitaine et le quai" ctaLabel="Prendre une décision" href="#" />
                <AttentionItem level="vigilance" levelLabel="Échéance" territory="Cap Skirring" reason="Fenêtre de débarquement à consolider avant la prochaine marée haute, en lien avec le relais territorial et le prestataire de transport froid" nextStep="Valider la prochaine étape avec le relais" ctaLabel="Suivre l’engagement" href="#" />
              </div>
            </div>
          </div>

          <div>
            <p className="mb-evidence mb-3">5 · TerritoryIdentity (clair / sombre, connaissance suffisante / insuffisante)</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border p-5" style={{ borderColor: "var(--mb-hairline-soft)", background: "var(--mb-paper)" }}>
                <TerritoryIdentity name="Quai de Kayar" region="Référentiel de démonstration · Thiès" status="vigilance" />
              </div>
              <div className="rounded-md p-5" style={{ background: "var(--mb-navy-900)" }}>
                <TerritoryIdentity name="Quai de Missirah" region="Référentiel de démonstration · Fatick" status="stable" knowledgeSufficient={false} tone="dark" />
              </div>
            </div>
          </div>

          <div>
            <p className="mb-evidence mb-3">6 · EvidenceLine</p>
            <div className="space-y-1.5 rounded-md border p-5" style={{ borderColor: "var(--mb-hairline-soft)", background: "var(--mb-paper)" }}>
              <EvidenceLine source="Poste de quai de Joal" date="29 juil. 2026, 08:10" detail="constat direct" />
              <EvidenceLine source="Signal territorial" detail="aucune date horodatée disponible" />
            </div>
          </div>

          <div>
            <p className="mb-evidence mb-3">7 · TrustIndicator (avec / sans limite connue)</p>
            <div className="flex flex-wrap gap-6 rounded-md border p-5" style={{ borderColor: "var(--mb-hairline-soft)", background: "var(--mb-paper)" }}>
              <TrustIndicator trust="verifiee" />
              <TrustIndicator trust="estimee" limitation="Volume approximatif, pesée non confirmée" />
              <TrustIndicator trust="expiree" limitation="Dernière validité connue dépassée — à revérifier" />
            </div>
          </div>

          <div>
            <p className="mb-evidence mb-3">8 · NarrativeFlow (étape en cours / à confirmer)</p>
            <div className="rounded-md border p-5" style={{ borderColor: "var(--mb-hairline-soft)", background: "var(--mb-paper)" }}>
              <NarrativeFlow
                steps={[
                  { id: "s1", label: "Signal", content: "Machine à glace indisponible au quai de Joal", state: "done" },
                  { id: "s2", label: "Compréhension", content: "Panne confirmée par le poste de quai", state: "done" },
                  { id: "s3", label: "Décision", content: "Organiser un délestage temporaire vers Mbour", state: "current" },
                  { id: "s4", label: "Résultat", content: "Effet à confirmer — aucun résultat constaté pour le moment", state: "pending" }
                ]}
              />
            </div>
          </div>

          <div>
            <p className="mb-evidence mb-3">9 · KnowledgeState (les 4 niveaux)</p>
            <div className="space-y-2 rounded-md border p-5" style={{ borderColor: "var(--mb-hairline-soft)", background: "var(--mb-paper)" }}>
              <KnowledgeState level="connu">Deux signaux distincts corroborent le constat</KnowledgeState>
              <KnowledgeState level="incomplet">Cause dominante non établie</KnowledgeState>
              <KnowledgeState level="a_verifier">Volume déclaré, non encore pesé</KnowledgeState>
              <KnowledgeState level="non_etabli">Aucune capacité de remplacement documentée sur ce territoire</KnowledgeState>
            </div>
          </div>
        </div>

        <p className="mb-evidence mt-16 border-t pt-6" style={{ borderColor: "var(--mb-hairline-soft)" }}>
          Redimensionnez la fenêtre (390 / 768 / 1280 / 1440) pour vérifier le comportement responsive de cette page — aucune vue mobile simulée séparément (§34).
        </p>
      </div>
    </div>
  );
}
