export type DemoRoleCode =
  | "fisher"
  | "landing_site_agent"
  | "weigher"
  | "cooperative_manager"
  | "buyer_operator"
  | "business_operator"
  | "territorial_coordinator"
  | "government_supervisor"
  | "finance_officer"
  | "knowledge_manager"
  | "atlas_decision_maker"
  | "platform_admin";

export type DemoPermission =
  | "campaign.read"
  | "campaign.write"
  | "landing.read"
  | "landing.write"
  | "capacity.read"
  | "capacity.write"
  | "trade.read"
  | "trade.write"
  | "finance.read"
  | "finance.write"
  | "knowledge.read"
  | "knowledge.write"
  | "government.read"
  | "government.write"
  | "atlas.read"
  | "atlas.ask"
  | "atlas.approve"
  | "admin.manage";

export interface DemoIdentity {
  id: string;
  displayName: string;
  roleCode: DemoRoleCode;
  organizationId: string;
  organizationName: string;
  territoryIds: string[];
  productCodes: string[];
  permissions: DemoPermission[];
  locale: "fr" | "wo";
  status: "active";
}

export interface DemoSession {
  id: string;
  identityId: string;
  activeOrganizationId: string;
  activeTerritoryId: string;
  issuedAt: string;
  expiresAt: string;
}

const identities: DemoIdentity[] = [
  {
    id: "demo-fisher-joal",
    displayName: "Moussa Ndiaye",
    roleCode: "fisher",
    organizationId: "org-pirogue-joal-01",
    organizationName: "Pirogue Jamm ak Jàmm",
    territoryIds: ["territory-joal"],
    productCodes: ["fisher"],
    permissions: ["campaign.read", "campaign.write", "landing.read"],
    locale: "wo",
    status: "active",
  },
  {
    id: "demo-landing-agent-dakar",
    displayName: "Abdoulaye Seck",
    roleCode: "landing_site_agent",
    organizationId: "org-landing-site-dakar",
    organizationName: "Site de débarquement pilote de Dakar",
    territoryIds: ["territory-dakar"],
    productCodes: ["fisher", "cooperative", "government"],
    permissions: ["campaign.read", "landing.read", "landing.write", "capacity.read"],
    locale: "fr",
    status: "active",
  },
  {
    id: "demo-weigher-dakar",
    displayName: "Ndeye Fatou Diagne",
    roleCode: "weigher",
    organizationId: "org-landing-site-dakar",
    organizationName: "Site de débarquement pilote de Dakar",
    territoryIds: ["territory-dakar"],
    productCodes: ["cooperative", "knowledge"],
    permissions: ["landing.read", "landing.write", "knowledge.read"],
    locale: "fr",
    status: "active",
  },
  {
    id: "demo-cooperative-dakar",
    displayName: "Awa Diop",
    roleCode: "cooperative_manager",
    organizationId: "org-cooperative-dakar",
    organizationName: "Coopérative des pêcheurs de Dakar",
    territoryIds: ["territory-dakar"],
    productCodes: ["cooperative", "fisher", "business"],
    permissions: ["campaign.read", "landing.read", "capacity.read", "capacity.write", "trade.read", "trade.write", "finance.read"],
    locale: "fr",
    status: "active",
  },
  {
    id: "demo-buyer-hotel-dakar",
    displayName: "Mamadou Diallo",
    roleCode: "buyer_operator",
    organizationId: "org-buyer-hotel-dakar",
    organizationName: "Hôtel Teranga Dakar",
    territoryIds: ["territory-dakar"],
    productCodes: ["business", "finance"],
    permissions: ["trade.read", "trade.write", "finance.read"],
    locale: "fr",
    status: "active",
  },
  {
    id: "demo-cold-chain-operator",
    displayName: "Fatou Sarr",
    roleCode: "business_operator",
    organizationId: "org-cold-chain-dakar",
    organizationName: "Froid Sénégal Services",
    territoryIds: ["territory-dakar", "territory-thies"],
    productCodes: ["business"],
    permissions: ["capacity.read", "capacity.write", "trade.read", "trade.write", "finance.read"],
    locale: "fr",
    status: "active",
  },
  {
    id: "demo-territorial-coordinator",
    displayName: "Cheikh Fall",
    roleCode: "territorial_coordinator",
    organizationId: "org-service-peche-dakar",
    organizationName: "Service régional des pêches de Dakar",
    territoryIds: ["territory-dakar"],
    productCodes: ["government", "atlas"],
    permissions: ["campaign.read", "landing.read", "capacity.read", "trade.read", "government.read", "government.write", "atlas.read", "atlas.ask"],
    locale: "fr",
    status: "active",
  },
  {
    id: "demo-government-supervisor",
    displayName: "Mariama Ba",
    roleCode: "government_supervisor",
    organizationId: "org-ministry-fisheries",
    organizationName: "Ministère des Pêches",
    territoryIds: ["territory-national"],
    productCodes: ["government", "atlas", "knowledge"],
    permissions: ["campaign.read", "landing.read", "capacity.read", "trade.read", "finance.read", "knowledge.read", "government.read", "government.write", "atlas.read", "atlas.ask", "atlas.approve"],
    locale: "fr",
    status: "active",
  },
  {
    id: "demo-finance-officer",
    displayName: "Ibrahima Kane",
    roleCode: "finance_officer",
    organizationId: "org-finance-partner",
    organizationName: "Fonds de financement halieutique",
    territoryIds: ["territory-national"],
    productCodes: ["finance", "atlas"],
    permissions: ["finance.read", "finance.write", "trade.read", "atlas.read"],
    locale: "fr",
    status: "active",
  },
  {
    id: "demo-knowledge-manager",
    displayName: "Sokhna Gueye",
    roleCode: "knowledge_manager",
    organizationId: "org-knowledge-center",
    organizationName: "Centre national de connaissance halieutique",
    territoryIds: ["territory-national"],
    productCodes: ["knowledge", "atlas"],
    permissions: ["knowledge.read", "knowledge.write", "atlas.read"],
    locale: "fr",
    status: "active",
  },
  {
    id: "demo-atlas-decision-maker",
    displayName: "Ousmane Sy",
    roleCode: "atlas_decision_maker",
    organizationId: "org-ministry-fisheries",
    organizationName: "Ministère des Pêches",
    territoryIds: ["territory-national"],
    productCodes: ["atlas", "government"],
    permissions: ["government.read", "atlas.read", "atlas.ask", "atlas.approve"],
    locale: "fr",
    status: "active",
  },
  {
    id: "demo-platform-admin",
    displayName: "Administrateur Mbàmbulaan",
    roleCode: "platform_admin",
    organizationId: "org-mbambulaan",
    organizationName: "Mbàmbulaan",
    territoryIds: ["territory-national"],
    productCodes: ["fisher", "cooperative", "business", "government", "development", "finance", "community", "knowledge", "atlas"],
    permissions: ["campaign.read", "campaign.write", "landing.read", "landing.write", "capacity.read", "capacity.write", "trade.read", "trade.write", "finance.read", "finance.write", "knowledge.read", "knowledge.write", "government.read", "government.write", "atlas.read", "atlas.ask", "atlas.approve", "admin.manage"],
    locale: "fr",
    status: "active",
  },
];

export class DemoAccessControl {
  private sessions = new Map<string, DemoSession>();

  listIdentities() {
    return structuredClone(identities);
  }

  getIdentity(identityId: string) {
    const identity = identities.find((item) => item.id === identityId);
    return identity ? structuredClone(identity) : undefined;
  }

  createSession(input: { identityId: string; territoryId?: string; issuedAt?: string }) {
    const identity = this.getIdentity(input.identityId);
    if (!identity) throw new Error("Profil de démonstration introuvable.");
    const territoryId = input.territoryId ?? identity.territoryIds[0];
    if (!territoryId || !this.canAccessTerritory(identity, territoryId)) throw new Error("Territoire non autorisé pour ce profil.");
    const issuedAt = input.issuedAt ?? new Date().toISOString();
    const session: DemoSession = {
      id: `demo-session-${identity.id}-${Date.parse(issuedAt)}`,
      identityId: identity.id,
      activeOrganizationId: identity.organizationId,
      activeTerritoryId: territoryId,
      issuedAt,
      expiresAt: new Date(Date.parse(issuedAt) + 8 * 60 * 60 * 1000).toISOString(),
    };
    this.sessions.set(session.id, session);
    return structuredClone(session);
  }

  getSession(sessionId: string, at = new Date().toISOString()) {
    const session = this.sessions.get(sessionId);
    if (!session || Date.parse(session.expiresAt) <= Date.parse(at)) return undefined;
    return structuredClone(session);
  }

  authorize(input: {
    sessionId: string;
    permission: DemoPermission;
    territoryId?: string;
    productCode?: string;
    at?: string;
  }) {
    const session = this.getSession(input.sessionId, input.at);
    if (!session) return { allowed: false as const, reason: "session_invalid_or_expired" };
    const identity = this.getIdentity(session.identityId);
    if (!identity) return { allowed: false as const, reason: "identity_not_found" };
    if (!identity.permissions.includes(input.permission)) return { allowed: false as const, reason: "permission_missing" };
    if (input.territoryId && !this.canAccessTerritory(identity, input.territoryId)) return { allowed: false as const, reason: "territory_denied" };
    if (input.productCode && !identity.productCodes.includes(input.productCode)) return { allowed: false as const, reason: "product_denied" };
    return { allowed: true as const, reason: "authorized", identity, session };
  }

  private canAccessTerritory(identity: DemoIdentity, territoryId: string) {
    return identity.territoryIds.includes("territory-national") || identity.territoryIds.includes(territoryId);
  }
}
