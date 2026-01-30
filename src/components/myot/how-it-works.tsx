'use client';

import { useMemo } from 'react';
import Image from 'next/image';

export default function HowItWorks({ scrollY }: { scrollY: number }) {
  const fadeInOpacity = Math.max(0, Math.min(1, (scrollY - 2000) / 1000));
  const fadeOutOpacity = Math.max(0, 1 - (scrollY - 5000) / 1000);
  const opacity = Math.min(fadeInOpacity, fadeOutOpacity);
  const pointerEvents = opacity > 0 ? 'auto' : 'none';

  const teeOptions = useMemo(
    () => [
      { id: 'Normal Fit', imageSrc: '/normal_tee-removebg-preview.png' },
      { id: 'Oversized', imageSrc: '/Oversized makemytee.png' },
      { id: 'Full Sleeves', imageSrc: '/Full sleeve makemytee.png' },
      { id: 'Jersey', imageSrc: '/jercy makemytee.png' },
    ],
    []
  );

  const qualityOptions = ['180GSM', '200GSM', '220GSM', '300GSM'];

  return (
    <section
      id="how-it-works"
      className="fixed inset-0 text-text-primary flex flex-col justify-start pt-16 sm:pt-20 items-center gap-4 sm:gap-6"
      style={{ opacity, pointerEvents }}
    >
      <div className="text-center px-4">
        <h3 className="font-heading text-sm uppercase tracking-[0.2em] text-text-secondary mb-2">
          Step 01
        </h3>
        <h2 className="font-display text-2xl sm:text-3xl text-text-primary font-normal">
          Choose your Fabric
        </h2>
      </div>

      <div className="w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 items-start text-center px-4 md:px-8 gap-2 sm:gap-4 md:gap-6">
          {teeOptions.map((tee) => (
            <div
              key={tee.id}
              className="glass-card p-2 sm:p-4 flex flex-col justify-end items-center relative overflow-hidden transition-all duration-300 aspect-[4/5] sm:aspect-[3/4]"
            >
              <div className="absolute inset-0 top-[-20%]">
                <Image
                  src={tee.imageSrc}
                  alt={tee.id}
                  fill
                  className="object-contain drop-shadow-2xl"
                />
              </div>
              <p className="text-xs text-text-primary z-10 relative">
                {tee.id}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2 sm:gap-4 mt-2 sm:mt-4">
        {qualityOptions.map((quality) => (
          <div
            key={quality}
            className="btn-outline py-2 px-3 sm:px-4 text-xs text-text-secondary"
          >
            {quality}
          </div>
        ))}
      </div>
    </section>
  );
}
