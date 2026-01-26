import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getImageById } from "@/lib/placeholder-images";

export default function Hero() {
  const heroImage = getImageById("hero_spotlight_floor");

  return (
    <section className="relative h-screen flex items-center justify-center text-center text-white">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          data-ai-hint={heroImage.imageHint}
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/80" />
      <div className="relative z-10 container mx-auto px-4">
        <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-widest mb-10 uppercase">
          Designed by you, crafted by us.
        </h1>
        <Button
          size="lg"
          variant="outline"
          className="border-white text-white hover:bg-white hover:text-black rounded-sm px-10 py-7 text-lg uppercase"
        >
          Start Crafting
        </Button>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <div className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center text-sm text-white/50">
          0
        </div>
      </div>
    </section>
  );
}
