import { CoordinationWorkspace } from "@/components/ecosystem/CoordinationWorkspace";

export default function CoordinationPage() {
  return (
    <div className="shadcn-scope bg-background pb-16">
      <header className="px-5 pt-6 lg:px-8 lg:pt-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Coordination</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Coordination de la chaîne de valeur</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Les besoins qualifiés rencontrent des capacités vérifiables. Les acteurs valident les engagements et chaque mission se termine par un résultat observable.</p>
      </header>
      <div className="px-5 pt-6 lg:px-8"><CoordinationWorkspace /></div>
    </div>
  );
}
