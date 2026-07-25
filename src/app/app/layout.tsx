import { ProductProvider } from "@/components/providers/ProductProvider";
import { ProductShell } from "@/components/shell/ProductShell";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProductProvider>
      <ProductShell>{children}</ProductShell>
    </ProductProvider>
  );
}
