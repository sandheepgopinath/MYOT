'use client';
import Link from 'next/link';

export default function Hero({ scrollY }: { scrollY: number }) {
  // Fade out over the first 2000px of scrolling.
  const opacity = Math.max(0, 1 - scrollY / 2000);
  const pointerEvents = opacity <= 0 ? 'none' : 'auto';

  return (
    <section
      className="fixed inset-0 z-10 flex items-center justify-center text-center text-text-primary"
      style={{ opacity, pointerEvents }}
    >
      <div className="relative container mx-auto px-4">
        <h2 className="font-heading text-2xl md:text-3xl premium-gradient mb-4 uppercase tracking-[0.2em] font-normal">
          Designed by you, crafted by us.
        </h2>
        <Link
          href="/craft"
          className="btn-outline font-normal text-sm"
        >
          Start Crafting
        </Link>
      </div>
    </section>
  );
}
