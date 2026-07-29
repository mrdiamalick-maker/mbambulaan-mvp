"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save, Send, X } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";

const draftKey = "mbambulaan-unsynced-signal";

export function NewSignalForm({ onClose }: { onClose: () => void }) {
  const { state, run } = useProduct();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [territoryId, setTerritoryId] = useState("joal");
  const [channel, setChannel] = useState<"terrain" | "telephone" | "whatsapp_structure" | "poste_quai">("poste_quai");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const draft = localStorage.getItem(draftKey);
    if (!draft) return;
    try {
      const data = JSON.parse(draft);
      setTitle(data.title ?? "");
      setDescription(data.description ?? "");
      setTerritoryId(data.territoryId ?? "joal");
      setChannel(data.channel ?? "poste_quai");
    } catch {
      localStorage.removeItem(draftKey);
    }
  }, []);

  const saveDraft = () => {
    localStorage.setItem(draftKey, JSON.stringify({ title, description, territoryId, channel, savedAt: new Date().toISOString() }));
    setSaved(true);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const ok = await run({ type: "create_signal", territoryId, title, description, channel });
    if (ok) {
      localStorage.removeItem(draftKey);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#062d36]/45" role="dialog" aria-modal="true" aria-labelledby="signal-title">
      <form onSubmit={submit} className="h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-2xl md:p-8">
        <div className="flex items-start justify-between">
          <div><p className="label">Observation terrain</p><h2 id="signal-title" className="mt-2 text-2xl font-bold">Signaler une situation</h2></div>
          <button type="button" onClick={onClose} className="p-2 text-[#60737a]" aria-label="Fermer"><X /></button>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#60737a]">Le signal reste déclaratif jusqu’à sa qualification. Un identifiant et une prochaine étape seront créés automatiquement.</p>
        <div className="mt-8 space-y-5">
          <label className="block"><span className="text-sm font-bold">Territoire</span><select value={territoryId} onChange={(e) => setTerritoryId(e.target.value)} className="mt-2 w-full border border-[#bfcfd2] bg-white p-3">{state?.territories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="block"><span className="text-sm font-bold">Canal d’origine</span><select value={channel} onChange={(e) => setChannel(e.target.value as typeof channel)} className="mt-2 w-full border border-[#bfcfd2] bg-white p-3"><option value="poste_quai">Poste de quai</option><option value="terrain">Agent terrain</option><option value="telephone">Téléphone</option><option value="whatsapp_structure">WhatsApp structuré manuel</option></select></label>
          <label className="block"><span className="text-sm font-bold">Objet du signal</span><input required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 w-full border border-[#bfcfd2] p-3" placeholder="Ex. Machine à glace indisponible" /></label>
          <label className="block"><span className="text-sm font-bold">Ce qui est observé</span><textarea required rows={6} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 w-full border border-[#bfcfd2] p-3" placeholder="Décrivez les faits, les personnes concernées et l’urgence apparente." /></label>
        </div>
        <div className="mt-8 flex flex-wrap gap-3 border-t border-[#d8e1e2] pt-5">
          <button type="submit" className="inline-flex items-center gap-2 bg-[#075466] px-5 py-3 font-bold text-white"><Send size={17} /> Enregistrer le signal</button>
          <button type="button" onClick={saveDraft} className="inline-flex items-center gap-2 border border-[#9ecbd2] px-5 py-3 font-bold text-[#075466]"><Save size={17} /> Garder hors connexion</button>
        </div>
        {saved && <p className="mt-3 text-sm font-semibold text-[#126b58]">Brouillon conservé sur cet appareil. Il pourra être repris sans réseau.</p>}
      </form>
    </div>
  );
}
