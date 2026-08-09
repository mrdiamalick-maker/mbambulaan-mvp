"use client";

import { useEffect, useState } from "react";
import type { DemoIdentity, DemoSession } from "@/platform/access/demo-access-control";

export interface ActiveDemoAccess {
  identity: DemoIdentity;
  session: DemoSession;
}

export function DemoProfileSwitcher({ onChange }: { onChange: (access?: ActiveDemoAccess) => void }) {
  const [profiles, setProfiles] = useState<DemoIdentity[]>([]);
  const [selectedIdentityId, setSelectedIdentityId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    async function initialize() {
      try {
        const response = await fetch("/api/v1/access/profiles", { cache: "no-store" });
        if (!response.ok) throw new Error("Impossible de charger les profils.");
        const payload = await response.json() as { profiles: DemoIdentity[] };
        setProfiles(payload.profiles);

        const stored = window.localStorage.getItem("mbambulaan-demo-access");
        if (stored) {
          const access = JSON.parse(stored) as ActiveDemoAccess;
          if (Date.parse(access.session.expiresAt) > Date.now()) {
            setSelectedIdentityId(access.identity.id);
            onChange(access);
          } else {
            window.localStorage.removeItem("mbambulaan-demo-access");
          }
        }
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Erreur inconnue.");
      } finally {
        setLoading(false);
      }
    }
    void initialize();
  }, [onChange]);

  async function selectProfile(identityId: string) {
    setSelectedIdentityId(identityId);
    setError(undefined);
    if (!identityId) {
      window.localStorage.removeItem("mbambulaan-demo-access");
      onChange(undefined);
      return;
    }

    const response = await fetch("/api/v1/access/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ identityId }),
    });
    const payload = await response.json() as { session?: DemoSession; identity?: DemoIdentity; error?: { message?: string } };
    if (!response.ok || !payload.session || !payload.identity) {
      setError(payload.error?.message ?? "Impossible de créer la session.");
      return;
    }

    const access = { identity: payload.identity, session: payload.session };
    window.localStorage.setItem("mbambulaan-demo-access", JSON.stringify(access));
    onChange(access);
  }

  return (
    <div className="min-w-[18rem] rounded border border-white/20 bg-white/10 p-3">
      <label htmlFor="demo-profile" className="block font-mono text-[9px] font-bold uppercase tracking-[0.13em] text-white/60">
        Profil de démonstration
      </label>
      <select
        id="demo-profile"
        value={selectedIdentityId}
        disabled={loading}
        onChange={(event) => void selectProfile(event.target.value)}
        className="mt-2 h-10 w-full rounded border border-white/20 bg-[var(--mb-navy-900)] px-3 text-xs text-white"
      >
        <option value="">Choisir un acteur</option>
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>{profile.displayName} — {profile.organizationName}</option>
        ))}
      </select>
      {error ? <p className="mt-2 text-xs text-red-200">{error}</p> : null}
    </div>
  );
}
