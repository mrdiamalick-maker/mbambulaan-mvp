export function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-5 border-b border-[#d8e1e2] bg-white px-5 py-7 lg:flex-row lg:items-end lg:justify-between lg:px-8">
      <div className="max-w-3xl">
        <p className="label">{eyebrow}</p>
        <h1 className="title-balance mt-2 text-2xl font-bold text-[#062d36] md:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#60737a] md:text-base">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
