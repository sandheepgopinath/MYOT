import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="text-center py-16 md:py-24 container mx-auto">
      <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight mb-4 text-primary">
        Make Your Own Tee
      </h1>
      <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto mb-10">
        Unleash your creativity. Select your fit, choose from our curated
        designs or upload your own, and create a T-shirt that is uniquely
        yours. Three simple steps to a masterpiece.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl font-headline shadow-lg">
            1
          </div>
          <span className="font-semibold font-headline text-lg">Choose Tee</span>
        </div>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl font-headline shadow-lg">
            2
          </div>
          <span className="font-semibold font-headline text-lg">Add Design</span>
        </div>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl font-headline shadow-lg">
            3
          </div>
          <span className="font-semibold font-headline text-lg">Review & Order</span>
        </div>
      </div>
      <Button
        size="lg"
        className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-10 py-6 text-lg font-bold"
        asChild
      >
        <a href="#customizer">
          Start Designing
          <ArrowDown className="ml-2 h-5 w-5 animate-bounce" />
        </a>
      </Button>
    </section>
  );
}
