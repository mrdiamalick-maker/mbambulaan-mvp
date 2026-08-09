import type {
  Territory
} from "@/domain/types";


export interface CopilotContext {

  territory?: Territory;

  activeSituations: number;

  activeCoordinations: number;

  trustLevel: number;

  opportunities: number;

  risks: string[];

}
