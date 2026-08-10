import { ProductProvider } from "@/components/providers/ProductProvider";
import { CoordinationLoopProvider } from "@/components/providers/CoordinationLoopProvider";
import { ProductShell } from "@/components/shell/ProductShell";
import { CoordinationUpdateStrip } from "@/components/work/CoordinationUpdateStrip";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProductProvider>
      <CoordinationLoopProvider>
        <ProductShell>
          <CoordinationUpdateStrip />
          {children}
        </ProductShell>
      </CoordinationLoopProvider>
    </ProductProvider>
  );
}
