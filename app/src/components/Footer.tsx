export function Footer() {
  return (
    <footer className="h-8 flex items-center justify-between px-4 text-[11px] text-ramondin-warm-gray border-t border-[#1D3C34]/40 bg-ramondin-green-dark">
      <span>© 2025 Ramondin</span>
      <span className="font-medium text-ramondin-text-light">GMAO v1.0.0</span>
      <span className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-status-ok" />
        Système opérationnel
      </span>
    </footer>
  );
}
