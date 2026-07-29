import { EthicalFinanceActivityMonitoring } from "./ethical-finance-activity-monitoring";

const globalMonitoring = globalThis as typeof globalThis & {
  __mbEthicalFinanceActivityMonitoring?: EthicalFinanceActivityMonitoring;
};

export function getEthicalFinanceActivityMonitoring() {
  globalMonitoring.__mbEthicalFinanceActivityMonitoring ??= new EthicalFinanceActivityMonitoring();
  return globalMonitoring.__mbEthicalFinanceActivityMonitoring;
}
