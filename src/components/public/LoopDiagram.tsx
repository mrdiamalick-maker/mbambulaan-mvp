// Boucle métier Mbàmbulaan (Observer → ... → Apprendre) représentée comme un
// cycle explicite plutôt qu'une simple grille de cases — la flèche de retour
// est ce qui rend visible qu'il s'agit d'une boucle d'apprentissage continue.

const loop = [
  { title: "Observer", text: "Terrain, réseau, signaux faibles." },
  { title: "Qualifier", text: "Vérifier, documenter, contextualiser." },
  { title: "Connecter", text: "Relier besoin, capacité et territoire." },
  { title: "Coordonner", text: "Organiser la réponse avec les bons acteurs." },
  { title: "Réaliser", text: "Exécuter, suivre, accompagner." },
  { title: "Mesurer", text: "Constater le résultat réel obtenu." },
  { title: "Apprendre", text: "Réinjecter la connaissance dans le terrain." }
];

export function LoopDiagram() {
  return (
    <div className="pub-loop">
      <div className="pub-loop-row">
        {loop.map((step, index) => (
          <div key={step.title} className="pub-loop-node">
            <span className="pub-loop-number">0{index + 1}</span>
            <strong className="pub-loop-title">{step.title}</strong>
            <span className="pub-loop-text">{step.text}</span>
          </div>
        ))}
      </div>
      <div className="pub-loop-return" aria-hidden>
        <svg viewBox="0 0 100 22" preserveAspectRatio="none" className="pub-loop-return-svg">
          <path d="M97 2 C97 14 60 20 50 20 C40 20 3 14 3 2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 3" />
          <path d="M3 2 L1 6 M3 2 L7 3.6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span className="pub-loop-return-label">Apprendre nourrit à nouveau l’observation</span>
      </div>
    </div>
  );
}
