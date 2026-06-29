export function Footer() {
  return (
    <footer className="bg-[#0F2D4A] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xl font-black">Mbàmbulaan</p>
          <p className="mt-2 text-sm font-semibold text-white/70">Coordonner la pêche artisanale, du quai à la décision.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-semibold text-white/72">
          <a href="/dashboard">Dashboard</a>
          <a href="/quais">Quais</a>
          <a href="/arrivages">Arrivages</a>
          <a href="/opportunites">Opportunités</a>
          <a href="/besoins">Besoins</a>
        </div>
      </div>
    </footer>
  );
}
