type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d65a31]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black text-[#14312d] sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-8 text-[#14312d]/70 sm:text-lg">{description}</p>
    </div>
  );
}
