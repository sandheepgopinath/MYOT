'use client';

export default function Hero({ scrollY }: { scrollY: number }) {
  // Fade out over the first 400px of scrolling
  const opacity = Math.max(0, 1 - scrollY / 400);
  // Move the content up for a parallax effect
  const transform = `translateY(-${scrollY / 3}px)`;

  return (
    <section className="relative h-screen flex items-center justify-center text-center text-text-primary animate-fade-in">
      <div 
        className="relative z-10 container mx-auto px-4"
        style={{ opacity, transform }}
      >
        <h2 className="font-tagline text-2xl md:text-3xl premium-gradient mb-4">
          Designed by you, crafted by us.
        </h2>
        <a href="#how-it-works" className="btn-outline font-normal text-sm">
          Start Crafting
        </a>
      </div>
      <div 
        className="scroll-indicator" 
        style={{ opacity: Math.max(0, 1 - scrollY / 100) }}
      >
        <div className="mouse">
          <div className="scroll-wheel"></div>
        </div>
      </div>
    </section>
  );
}
