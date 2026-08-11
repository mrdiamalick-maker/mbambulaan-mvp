import { ProductProvider } from "@/components/providers/ProductProvider";
import { PresentationGuideProvider } from "@/components/providers/PresentationGuideProvider";
import { PresentationGuideBar } from "@/components/presentation/PresentationGuideBar";

// Couche données uniquement (état produit) — partagée par tout /app/*, y
// compris l'Espace État, qui a besoin du même state applicatif. La coquille
// visuelle (AppShell/AppSidebar) n'est PAS ici : elle vit dans
// src/app/app/(coordination)/layout.tsx, un groupe de routes que l'Espace
// État n'intègre pas (D9). C'est la distinction technique demandée, pas une
// simple composition différente du même shell.
//
// PresentationGuideProvider + PresentationGuideBar (Lot 6, étape 3/4)
// vivent ici, au-dessus des trois coquilles distinctes (Institution/
// Coordination/Terrain) : le mode présentation doit survivre à une
// traversée entre elles, pas redémarrer à chaque changement d'entrée
// technique.
//
// CoordinationLoopProvider (simulation de fil WhatsApp/appel déconnectée du
// state réel, alimentait UnifiedWorkView/WorkFocus/CoordinationUpdateStrip)
// retiré ici — passe de cohérence pré-Lot 6 : ces trois composants
// pointaient vers /terrain/whatsapp et /terrain/telephone, des routes qui
// n'ont jamais existé, exactement l'anti-pattern « canaux terrain restent
// décoratifs » interdit par le spec maître (§22). Remplacé au Lot 6 par une
// expérience terrain réelle, branchée sur le state produit.
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProductProvider>
      <PresentationGuideProvider>
        {children}
        <PresentationGuideBar />
      </PresentationGuideProvider>
    </ProductProvider>
  );
}
