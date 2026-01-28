import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";

export default function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 sticky top-0 w-full z-20">
      <div className="flex items-center justify-between text-text-primary glass-card p-4">
        {/* Left placeholder to balance the nav items on the right */}
        <div className="flex-1"></div>

        {/* Centered Logo */}
        <div className="flex-1 text-center">
            <Link href="/">
              <h1 className="text-xl md:text-2xl font-brand tracking-widest uppercase inline-block">
                MAKE MY <span className="gold-gradient">TEE</span>.
              </h1>
            </Link>
        </div>
        
        {/* Right-aligned Navigation */}
        <nav className="flex-1 flex items-center justify-end gap-2 md:gap-6">
          <Link
            href="#how-it-works"
            className="btn-outline uppercase nav-link-desktop !py-2 !px-4 text-xs"
          >
            How it works
          </Link>
          <ThemeSwitcher />
        </nav>
      </div>
    </header>
  );
}
