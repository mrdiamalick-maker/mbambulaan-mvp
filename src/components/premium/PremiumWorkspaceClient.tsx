"use client";

import { useState } from "react";
import { getRoleProfile, roleProfiles, type RoleKey } from "@/data/mockMbambulaan";
import { PremiumShell, StatusBadge } from "./PremiumComponents";

export function PremiumWorkspaceClient() {
  const [activeRole, setActiveRole] = useState<RoleKey>("etat");
  const profile = getRoleProfile(activeRole);

  return (
    <PremiumShell
      activeRole={profile}
      roleControls={
        <div className="flex flex-wrap gap-2">
          {roleProfiles.map((role) => (
            <button
              key={role.key}
              type="button"
              onClick={() => setActiveRole(role.key)}
              className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                role.key === activeRole
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              {role.label}
            </button>
          ))}
          <StatusBadge tone={profile.accent}>Rôle actif : {profile.label}</StatusBadge>
        </div>
      }
    />
  );
}
