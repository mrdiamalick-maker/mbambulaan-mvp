export type PlatformModule =
  | "territory_intelligence"
  | "coordination"
  | "trust_network"
  | "market_intelligence"
  | "operations"
  | "reporting"
  | "copilot";


export interface ModuleEntitlement {
  module: PlatformModule;
  enabled: boolean;
  level: "basic" | "advanced" | "enterprise";
}


export interface SubscriptionPlan {
  id: string;
  name: string;
  modules: ModuleEntitlement[];
}


export const subscriptionPlans: SubscriptionPlan[] = [

  {
    id: "free",
    name: "Mbàmbulaan Free",
    modules: [
      {
        module: "trust_network",
        enabled: true,
        level: "basic"
      }
    ]
  },


  {
    id: "professional",
    name: "Mbàmbulaan Professionnel",
    modules: [
      {
        module: "operations",
        enabled: true,
        level: "basic"
      },
      {
        module: "coordination",
        enabled: true,
        level: "advanced"
      },
      {
        module: "trust_network",
        enabled: true,
        level: "advanced"
      },
      {
        module: "market_intelligence",
        enabled: true,
        level: "basic"
      },
      {
        module: "reporting",
        enabled: true,
        level: "basic"
      },
      {
        module: "copilot",
        enabled: true,
        level: "basic"
      }
    ]
  },


  {
    id: "organization",
    name: "Mbàmbulaan Organisation",
    modules: [
      {
        module: "territory_intelligence",
        enabled: true,
        level: "advanced"
      },
      {
        module: "coordination",
        enabled: true,
        level: "advanced"
      },
      {
        module: "operations",
        enabled: true,
        level: "advanced"
      },
      {
        module: "trust_network",
        enabled: true,
        level: "advanced"
      },
      {
        module: "market_intelligence",
        enabled: true,
        level: "advanced"
      },
      {
        module: "reporting",
        enabled: true,
        level: "advanced"
      },
      {
        module: "copilot",
        enabled: true,
        level: "advanced"
      }
    ]
  },


  {
    id: "institution",
    name: "Mbàmbulaan Institution",
    modules: [
      {
        module: "territory_intelligence",
        enabled: true,
        level: "enterprise"
      },
      {
        module: "coordination",
        enabled: true,
        level: "enterprise"
      },
      {
        module: "operations",
        enabled: true,
        level: "enterprise"
      },
      {
        module: "trust_network",
        enabled: true,
        level: "enterprise"
      },
      {
        module: "market_intelligence",
        enabled: true,
        level: "enterprise"
      },
      {
        module: "reporting",
        enabled: true,
        level: "enterprise"
      },
      {
        module: "copilot",
        enabled: true,
        level: "enterprise"
      }
    ]
  }

];
