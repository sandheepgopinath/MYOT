export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center text-center text-white animate-fade-in">
      <div className="relative z-10 container mx-auto px-4">
        <h2 className="font-tagline text-2xl md:text-3xl premium-gradient mb-4">
          Designed by you, crafted by us.
        </h2>
        <a href="#" className="btn-primary uppercase">
          Start Crafting
        </a>
      </div>
      <div className="scroll-indicator">
        <div className="mouse">
          <div className="scroll-wheel"></div>
        </div>
      </div>
    </section>
  );
}
