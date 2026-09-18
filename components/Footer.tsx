export default function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-line py-7 font-mono text-[10px] text-muted">
      <span>© {new Date().getFullYear()} Rafeed Iqbal</span>
      <span className="hidden lg:inline">
        Curious? Open the terminal with <kbd className="kbd">`</kbd>
      </span>
      <a href="#whoami" className="small-link">
        Back to top <span aria-hidden="true">↑</span>
      </a>
    </footer>
  );
}
