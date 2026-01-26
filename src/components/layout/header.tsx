import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";

export default function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 absolute top-0 w-full z-20">
      <div className="container mx-auto flex items-center justify-between text-white glass-card p-4">
        <Link href="/">
          <h1 className="text-2xl font-brand tracking-widest uppercase">
            MAKE MY TEE.
          </h1>
        </Link>
        <nav className="flex items-center gap-2 md:gap-6">
          <Link
            href="#"
            className="text-sm uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors nav-link-desktop"
          >
            How it works
          </Link>
          <ThemeSwitcher />
        </nav>
      </div>
    </header>
  );
}
