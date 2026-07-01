import { getRoleProfile, type RoleKey } from "@/data/mockMbambulaan";
import { PageIntro, PublicNav, RoleWorkspace, StatusBadge } from "./PremiumComponents";

export function RoleDemoPage({ role }: { role: RoleKey }) {
  const profile = getRoleProfile(role);

  return (
    <main className="min-h-screen bg-slate-50">
      <PublicNav />
      <PageIntro eyebrow="Démo par rôle" title={profile.label} description={profile.promise}>
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone={profile.accent}>{profile.audience}</StatusBadge>
          <StatusBadge tone="slate">Démo avant achat</StatusBadge>
        </div>
      </PageIntro>
      <RoleWorkspace profile={profile} />
    </main>
  );
}
