export function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: React.ReactNode }) {
  return (
    <header className="relative overflow-hidden border-b border-[#d9e3e3] bg-white px-5 py-7 lg:px-8 lg:py-8">
      <div className="pointer-events-none absolute -right-24 -top-36 size-72 rounded-full bg-[#e5f7f3]/80 blur-3xl" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <p className="label">{eyebrow}</p>
          <span className="inline-flex items-center rounded-full border border-[#c8dcde] bg-[#f5faf9] px-2.5 py-1 text-[9px] font-black uppercase tracking-[.14em] text-[#42636b]">Espace professionnel</span>
        </div>
        <h1 className="title-balance mt-2 text-3xl font-[740] tracking-[-.04em] text-[#102e37] md:text-[2.15rem]">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667b81] md:text-[15px]">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  );
}
