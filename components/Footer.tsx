export default function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line py-6 font-mono text-xs text-muted">
      <span>© {new Date().getFullYear()} Rafeed Iqbal</span>
      <span className="hidden lg:inline">
        Open the terminal with <kbd className="kbd">Ctrl + `</kbd>
      </span>
      <a href="#whoami" className="small-link">
        Back to top <span aria-hidden="true">↑</span>
      </a>
    </footer>
  );
}
