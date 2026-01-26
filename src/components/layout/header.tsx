import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";

export default function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 absolute top-0 w-full z-20">
      <div className="container mx-auto flex items-center justify-between text-text-primary glass-card p-4">
        <Link href="/">
          <h1 className="text-2xl font-brand tracking-widest uppercase">
            MAKE MY TEE.
          </h1>
        </Link>
        <nav className="flex items-center gap-2 md:gap-6">
          <Link
            href="#"
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
