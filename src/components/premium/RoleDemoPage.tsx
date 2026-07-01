import { getRoleProfile, type RoleKey } from "@/data/mockMbambulaan";
import { PageIntro, PublicNav, RoleWorkspace, StatusBadge } from "./PremiumComponents";

export function RoleDemoPage({ role }: { role: RoleKey }) {
  const profile = getRoleProfile(role);

  return (
    <main className="min-h-screen bg-[#f6fbfb]">
      <PublicNav />
      <PageIntro eyebrow="Scénario d'essai qualifié" title={profile.label} description={`${profile.promise} La page montre la valeur en quelques étapes, sans ouvrir l'espace privé complet.`}>
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone={profile.accent}>{profile.audience}</StatusBadge>
          <StatusBadge tone="slate">Aperçu avant essai</StatusBadge>
        </div>
      </PageIntro>
      <RoleWorkspace profile={profile} />
    </main>
  );
}
