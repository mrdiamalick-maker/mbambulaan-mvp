import type { ProductState } from "@/domain/types";
import type { PlatformModule } from "./modules";
import { planMapping } from "./plan-mapping";
import { subscriptionPlans } from "./modules";


export interface UserCapabilities {

  modules: PlatformModule[];

  levels: Record<string,string>;

}


export function resolveCapabilities(
  state: ProductState,
  organizationId: string
): UserCapabilities {


  const subscription =
    state.subscriptions.find(
      (item)=>
        item.organizationId === organizationId
    );


  if (!subscription) {

    return {
      modules: [],
      levels: {}
    };

  }


  const platformPlan =
    planMapping[subscription.planId];


  const plan =
    subscriptionPlans.find(
      (item)=>
        item.id === platformPlan
    );


  if (!plan) {

    return {
      modules: [],
      levels: {}
    };

  }


  return {

    modules:
      plan.modules
        .filter(
          (item)=>
            item.enabled
        )
        .map(
          (item)=>
            item.module
        ),


    levels:
      Object.fromEntries(
        plan.modules.map(
          (item)=>[
            item.module,
            item.level
          ]
        )
      )

  };

}