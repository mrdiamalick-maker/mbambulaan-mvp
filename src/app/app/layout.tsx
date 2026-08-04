import { ProductProvider } from "@/components/providers/ProductProvider";
import { ProductShell } from "@/components/shell/ProductShell";
import { CoordinationUpdateStrip } from "@/components/work/CoordinationUpdateStrip";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProductProvider>
      <ProductShell>
        <CoordinationUpdateStrip />
        {children}
      </ProductShell>
    </ProductProvider>
  );
}
