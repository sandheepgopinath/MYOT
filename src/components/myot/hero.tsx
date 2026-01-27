'use client';

export default function Hero({ scrollY }: { scrollY: number }) {
  // Fade out over the first 800px of scrolling for a more gradual effect
  const opacity = Math.max(0, 1 - scrollY / 800);
  const pointerEvents = opacity <= 0 ? 'none' : 'auto';

  return (
    <section 
      className="fixed inset-0 z-10 flex items-center justify-center text-center text-text-primary"
      style={{ opacity, pointerEvents }}
    >
      <div className="relative container mx-auto px-4">
        <h2 className="font-tagline text-2xl md:text-3xl premium-gradient mb-4">
          Designed by you, crafted by us.
        </h2>
        <a href="#how-it-works" className="btn-outline font-normal text-sm">
          Start Crafting
        </a>
      </div>
    </section>
  );
}
