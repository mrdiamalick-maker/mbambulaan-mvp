export function MinistryHero({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="op-card--dark op-instrumented flex flex-col gap-5 p-6 md:flex-row md:items-end md:justify-between md:p-8">
      <div className="max-w-2xl">
        <p className="op-eyebrow op-eyebrow--on-dark">{eyebrow}</p>
        <h1 className="mt-3 text-2xl font-[780] tracking-[-.03em] text-white md:text-[1.9rem]">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-white/62">{description}</p>
      </div>
      {action}
    </div>
  );
}
