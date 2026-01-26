import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronsDown } from "lucide-react";
import Image from "next/image";
import { getImageById } from "@/lib/placeholder-images";
import Link from "next/link";

export default function Hero() {
  const heroImage = getImageById("hero_tshirt_folded");

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
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 container mx-auto px-4">
        <h1 className="font-headline text-6xl md:text-8xl font-bold tracking-tight mb-4">
          MAKE YOUR OWN TEE.
        </h1>
        <p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto mb-10 uppercase tracking-widest">
          Designed by you, made by us.
        </p>
        <Button
          size="lg"
          className="bg-white text-black hover:bg-gray-200 rounded-sm px-10 py-7 text-lg uppercase"
          asChild
        >
          <a href="#customizer">
            Start
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </Button>
      </div>
      <a href="#customizer" className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/70 hover:text-white animate-bounce">
          <ChevronsDown className="w-6 h-6" />
      </a>
    </section>
  );
}
