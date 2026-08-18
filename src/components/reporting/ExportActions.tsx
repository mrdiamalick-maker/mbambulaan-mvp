"use client";

import { Download, FileSpreadsheet, Printer, Share2 } from "lucide-react";
import { downloadCsv, downloadXlsx, type ExportRow } from "@/lib/exports";

export function ExportActions({ filename, rows, compact = false }: { filename: string; rows: ExportRow[]; compact?: boolean }) {
  const size = compact ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm";
  const share = async () => {
    try {
      const payload = { title: "Rapport Mbàmbulaan", text: "Rapport de coordination Mbàmbulaan — données de démonstration.", url: window.location.href };
      if (navigator.share) {
        await navigator.share(payload);
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Un partage annulé ne doit pas interrompre le travail en cours.
    }
  };
  return (
    <div className="flex flex-wrap gap-2 no-print">
      <button type="button" onClick={() => void downloadXlsx(filename, rows)} className={`inline-flex items-center gap-2 rounded-xl border border-[#9ecbd2] bg-white font-bold text-[#075568] transition hover:bg-[#edf7f6] ${size}`}>
        <FileSpreadsheet size={compact ? 14 : 16} /> Excel (.xlsx)
      </button>
      <button type="button" onClick={() => window.print()} className={`inline-flex items-center gap-2 rounded-xl bg-[#075568] font-bold text-white transition hover:bg-[#064858] ${size}`}>
        <Printer size={compact ? 14 : 16} /> PDF / imprimer
      </button>
      <button type="button" onClick={() => void share()} className={`inline-flex items-center gap-2 rounded-xl border border-[#c7d7d9] bg-[#f7faf9] font-bold text-[#385d65] transition hover:bg-white ${size}`}>
        <Share2 size={compact ? 14 : 16} /> Partager
      </button>
    </div>
  );
}

export function DownloadOnly({ filename, rows }: { filename: string; rows: ExportRow[] }) {
  return <button type="button" onClick={() => downloadCsv(filename, rows)} className="btn-secondary"><Download size={15} /> Télécharger les données</button>;
}
