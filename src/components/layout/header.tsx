'use client';

import Link from 'next/link';
import { ThemeSwitcher } from './theme-switcher';
import Breadcrumbs from '@/components/myot/breadcrumbs';

export default function Header({ scrollY }: { scrollY: number }) {
  const howItWorksThreshold = 2000;
  const personalizeThreshold = 6000;
  const reviewOrderThreshold = 9000;

  const showBreadcrumbs = scrollY >= howItWorksThreshold;

  let activeStep = '';
  if (scrollY >= reviewOrderThreshold) {
    activeStep = 'Review & Ship';
  } else if (scrollY >= personalizeThreshold) {
    activeStep = 'Personalize';
  } else if (scrollY >= howItWorksThreshold) {
    activeStep = 'Fabric';
  }

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, y: number) => {
    e.preventDefault();
    window.scrollTo({
      top: y,
      behavior: 'smooth',
    });
  };

  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 sticky top-0 w-full z-20">
      <div className="flex items-center justify-between text-text-primary glass-card p-4 h-[72px]">
        {/* Left side: Becomes logo when scrolled to a section with breadcrumbs */}
        <div className="flex-none md:flex-1">
          <Link
            href="/"
            className={`transition-opacity duration-500 hidden md:block ${showBreadcrumbs
              ? 'opacity-100'
              : 'opacity-0 pointer-events-none'
              }`}
          >
            <h1 className="text-xl md:text-2xl font-brand tracking-widest uppercase inline-block">
              MAKE MY <span className="gold-gradient">TEE</span>.
            </h1>
          </Link>
        </div>

        {/* Center: Logo when not scrolled, Breadcrumbs when scrolled */}
        <div className="flex-1 text-center">
          <div className="relative w-full h-full">
            {/* Logo when NOT in a section with breadcrumbs */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${!showBreadcrumbs
                ? 'opacity-100'
                : 'opacity-0 pointer-events-none'
                }`}
            >
              <Link href="/">
                <h1 className="text-xl md:text-2xl font-brand tracking-widest uppercase inline-block">
                  MAKE MY <span className="gold-gradient">TEE</span>.
                </h1>
              </Link>
            </div>
            {/* Breadcrumbs when in a section with breadcrumbs */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${showBreadcrumbs
                ? 'opacity-100'
                : 'opacity-0 pointer-events-none'
                }`}
            >
              <Breadcrumbs activeStep={activeStep} />
            </div>
          </div>
        </div>

        {/* Right-aligned Navigation */}
        <nav className="flex-none md:flex-1 flex items-center justify-end gap-2 md:gap-6">
          <a
            href="#how-it-works"
            onClick={(e) => handleScrollTo(e, 2500)}
            className="btn-outline uppercase nav-link-desktop !py-2 !px-4 text-xs"
          >
            How it works
          </a>
          <ThemeSwitcher />
        </nav>
      </div>
    </header>
  );
}
