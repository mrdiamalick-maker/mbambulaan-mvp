"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

// Panneau latéral générique : garde l'exploration (détail d'un territoire,
// planification d'une mission) à l'intérieur du même parcours plutôt que
// de forcer un changement de page — l'espace doit rester vivant, pas un
// enchaînement d'écrans.
// size (LOT 1, mandat "Vertical Slice Joal") : le dossier Situation, une
// fois enrichi (signature "pourquoi Mbàmbulaan vous le signale", timeline
// de Signals, Value Trail…), ne tient plus confortablement dans le
// max-w-md historique — un contenu plus riche mérite plus de largeur,
// pas un nouveau composant. "md" (comportement inchangé) reste le défaut
// pour Territoire/Mission/Vigilance, qui n'ont pas grossi.
export function Drawer({ open, onClose, title, eyebrow, size = "md", children }: { open: boolean; onClose: () => void; title: string; eyebrow?: string; size?: "md" | "lg"; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80]">
      <button aria-label="Fermer" className="absolute inset-0 bg-[var(--etat-navy-950)]/55 backdrop-blur-[2px]" onClick={onClose} />
      <aside className={`absolute right-0 top-0 flex h-full w-full ${size === "lg" ? "max-w-2xl" : "max-w-md"} flex-col bg-white shadow-[-30px_0_70px_rgba(7,22,39,.25)]`}>
        <div className="flex items-start justify-between border-b border-[var(--etat-line)] p-6">
          <div>
            {eyebrow && <p className="etat-eyebrow">{eyebrow}</p>}
            <h2 className="etat-display mt-2 text-xl not-italic text-[var(--etat-navy-950)]">{title}</h2>
          </div>
          <button onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-lg text-[var(--etat-stone-600)] hover:bg-[var(--etat-offwhite)]" aria-label="Fermer le panneau"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </aside>
    </div>
  );
}
