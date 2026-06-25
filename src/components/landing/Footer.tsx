export function Footer() {
  return (
    <footer className="bg-[#14312d] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xl font-black">Mbàmbulaan</p>
          <p className="mt-2 text-sm text-white/65">MVP de coordination pour la filiere halieutique.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-semibold text-white/75">
          <a href="/dashboard">Dashboard</a>
          <a href="/quais">Quais</a>
          <a href="/arrivages">Arrivages</a>
          <a href="/opportunites">Opportunites</a>
          <a href="/besoins">Besoins</a>
        </div>
      </div>
    </footer>
  );
}
