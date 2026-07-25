# Mbàmbulaan

Infrastructure numérique de coordination territoriale pour la pêche artisanale sénégalaise.

Cette version démontre une chaîne opérationnelle unique :

`observation → situation qualifiée → priorité → coordination → intervention → résultat → apprentissage`

## Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- App Router
- PostgreSQL (optionnel en démonstration, requis en production)
- PWA avec brouillons terrain hors connexion

## Commandes

```bash
npm install
npm run dev
```

Puis ouvrir :

- `http://localhost:3000/` : entrée publique ;
- `http://localhost:3000/demo` : parcours guidé unique ;
- `http://localhost:3000/app/travail` : briefing opérationnel ;
- `http://localhost:3000/app/situations/sit-glace` : scénario machine à glace.

Le code OTP de démonstration locale est `246810`. Aucun SMS ou message WhatsApp réel n'est envoyé.

## Validation

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Configuration

```bash
DATABASE_URL=postgres://...
SESSION_SECRET=...
```

Sans `DATABASE_URL`, le produit utilise un état en mémoire réservé à la démonstration. Les données affichées sont déterministes et ne constituent pas des statistiques officielles.
