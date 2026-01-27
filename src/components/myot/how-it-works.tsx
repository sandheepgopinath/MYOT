'use client';

import { Shirt } from 'lucide-react';

export default function HowItWorks({ scrollY }: { scrollY: number }) {
  // Start fading in after 800px of scroll, fully visible by 2800px (2000px duration)
  const fadeInOpacity = Math.max(0, Math.min(1, (scrollY - 800) / 2000));
  // Start fading out after 3800px, fully gone by 5800px (2000px duration)
  const fadeOutOpacity = Math.max(0, 1 - (scrollY - 3800) / 2000);

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
      className="fixed inset-0 text-text-primary"
      style={{ opacity, pointerEvents }}
    >
      <div className="container mx-auto px-4 h-full flex flex-col justify-end items-center pb-20">
        <div className="text-center">
            <h2 className="font-tagline text-2xl md:text-3xl premium-gradient mb-4">
              Step 1: Choose your tee
            </h2>
            <p className="text-text-secondary mb-12">
              Choose the T-shirt type and quality for your needs.
            </p>
        </div>
        
        <div className="flex justify-center items-start gap-8 md:gap-16 flex-wrap">
          {teeTypes.map((tee) => (
            <div key={tee.name} className="flex flex-col-reverse items-center gap-4">
              <div 
                className="glass-card p-6 rounded-full animate-float"
                style={{ animationDelay: tee.delay }}
              >
                <tee.icon className="w-12 h-12 text-accent-gold" />
              </div>
              <p className="font-heading text-base">{tee.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
