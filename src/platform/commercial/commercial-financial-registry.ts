import { CommercialFinancialExecution } from "./commercial-financial-execution";

declare global {
  var __mbambulaanCommercialFinancialExecution: CommercialFinancialExecution | undefined;
}

export function getCommercialFinancialExecution() {
  globalThis.__mbambulaanCommercialFinancialExecution ??= new CommercialFinancialExecution();
  return globalThis.__mbambulaanCommercialFinancialExecution;
}

export function resetCommercialFinancialExecution() {
  getCommercialFinancialExecution().reset();
}
