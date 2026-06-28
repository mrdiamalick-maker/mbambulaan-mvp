export function Footer() {
  return (
    <footer className="border-t border-[#0F2D4A]/8 bg-white px-5 py-10 text-[#0F2D4A] sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xl font-black">Mbàmbulaan</p>
          <p className="mt-2 text-sm font-semibold text-[#334155]">MVP de coordination pour la filière halieutique.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-semibold text-[#334155]">
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
