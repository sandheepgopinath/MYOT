'use client';

import { Shirt } from 'lucide-react';

export default function HowItWorks({ scrollY }: { scrollY: number }) {
  // Start fading in after 400px of scroll, fully visible by 1200px
  const fadeInOpacity = Math.max(0, Math.min(1, (scrollY - 400) / 800));
  // Start fading out after 1600px, fully gone by 2100px
  const fadeOutOpacity = Math.max(0, 1 - (scrollY - 1600) / 500);
  const opacity = Math.min(fadeInOpacity, fadeOutOpacity);
  
  // To prevent interaction when invisible
  const pointerEvents = opacity > 0 ? 'auto' : 'none';

  const teeTypes = [
    { name: 'Normal Fit', icon: Shirt, delay: '0s' },
    { name: 'Oversized', icon: Shirt, delay: '0.3s' },
    { name: 'Full Sleeves', icon: Shirt, delay: '0.6s' },
    { name: 'Jersey', icon: Shirt, delay: '0.9s' },
  ];

  return (
    <section 
      id="how-it-works" 
      className="fixed inset-0 text-text-primary pt-28 pb-20"
      style={{ opacity, pointerEvents }}
    >
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-tagline text-xl md:text-2xl font-bold mb-4">
          Step 1: Choose your tee
        </h2>
        <p className="text-text-secondary mb-12">
          Choose the T-shirt type and quality for your needs.
        </p>
        
        <div className="flex justify-center items-start gap-8 md:gap-16 flex-wrap">
          {teeTypes.map((tee) => (
            <div key={tee.name} className="flex flex-col items-center gap-4">
              <div 
                className="glass-card p-6 rounded-full animate-float"
                style={{ animationDelay: tee.delay }}
              >
                <tee.icon className="w-12 h-12 text-accent-gold" />
              </div>
              <p className="font-heading text-base font-semibold">{tee.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
