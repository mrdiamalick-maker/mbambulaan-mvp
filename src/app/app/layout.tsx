import { ProductProvider } from "@/components/providers/ProductProvider";
import { CoordinationLoopProvider } from "@/components/providers/CoordinationLoopProvider";

// Couche données uniquement (état produit, boucle de coordination) —
// partagée par tout /app/*, y compris l'Espace État, qui a besoin du
// même state applicatif. La coquille visuelle (AppShell/AppSidebar) n'est
// PAS ici : elle vit dans src/app/app/(coordination)/layout.tsx, un
// groupe de routes que l'Espace État n'intègre pas (D9). C'est la
// distinction technique demandée, pas une simple composition différente
// du même shell.
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProductProvider>
      <CoordinationLoopProvider>{children}</CoordinationLoopProvider>
    </ProductProvider>
  );
}
