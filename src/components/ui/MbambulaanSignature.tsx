type SignaturePoint = {
  label: string;
  position: number;
  hot?: boolean;
};

export function MbambulaanSignature({
  eyebrow = "Signal territorial",
  title,
  detail,
  points
}: {
  eyebrow?: string;
  title: string;
  detail: string;
  points: SignaturePoint[];
}) {
  return (
    <section className="mb-signature p-6 lg:p-8">
      <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#d5bd8a]">{eyebrow}</p>
          <h2 className="mt-3 max-w-xl text-3xl font-black leading-tight text-[#fffaf2] lg:text-4xl">{title}</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#c9d9dc]">{detail}</p>
        </div>
        <div>
          <div className="mb-tension-line" aria-label="Représentation Mbàmbulaan de la tension territoriale">
            {points.map((point) => (
              <span
                key={point.label}
                className={`mb-tension-node ${point.hot ? "mb-tension-node--hot" : ""}`}
                style={{ left: `${point.position}%` }}
                title={point.label}
              />
            ))}
            <span className="mb-tension-pulse" style={{ left: "72%" }} />
          </div>
          <div className="grid grid-cols-3 gap-3 text-[11px] font-bold text-[#d7e6e7]">
            {points.slice(0, 3).map((point) => <span key={point.label}>{point.label}</span>)}
          </div>
        </div>
      </div>
    </section>
  );
}
