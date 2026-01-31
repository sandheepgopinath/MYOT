'use client';

import Link from 'next/link';
import { ThemeSwitcher } from '@/components/layout/theme-switcher';

export default function CraftHeader() {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 sticky top-0 w-full z-20">
      <div className="flex items-center justify-between text-text-primary glass-card p-4 h-[72px]">
        <div className="flex-1">
          <Link href="/">
            <h1 className="text-xl md:text-2xl font-brand tracking-widest uppercase inline-block">
              MAKE MY <span className="gold-gradient">TEE</span>.
            </h1>
          </Link>
        </div>
        
        <nav className="flex-1 flex items-center justify-end gap-2 md:gap-6">
          <ThemeSwitcher />
        </nav>
      </div>
    </header>
  );
}
