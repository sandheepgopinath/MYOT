'use client';

import Image from 'next/image';
import { getImageById } from '@/lib/placeholder-images';

export default function Personalize({ scrollY }: { scrollY: number }) {
  const fadeInOpacity = Math.max(0, Math.min(1, (scrollY - 6000) / 1000));
  const fadeOutOpacity = Math.max(0, 1 - (scrollY - 8000) / 1000);
  const opacity = Math.min(fadeInOpacity, fadeOutOpacity);
  const pointerEvents = opacity > 0 ? 'auto' : 'none';

  const scale = Math.min(1, 0.98 + (scrollY - 6000) / 1000 * 0.02);

  const curatedDesignImage = getImageById('curated_design_tee');

  return (
    <section
      id="personalize"
      className="fixed inset-0 text-text-primary flex flex-col justify-center items-center gap-4 px-4 pt-24 sm:pt-32 pb-4"
      style={{ opacity, pointerEvents, transform: `scale(${scale})` }}
    >
      <div className="text-center">
        <h3 className="font-heading text-xs sm:text-sm uppercase tracking-[0.2em] text-text-secondary mb-1 sm:mb-2">
          Step 02
        </h3>
        <h2 className="font-display text-2xl sm:text-3xl text-text-primary font-normal">
          Make It Yours
        </h2>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
        {/* Custom Studio - First */}
        <div className="glass-card p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col justify-end min-h-[120px] sm:min-h-[180px] md:min-h-[250px] lg:min-h-[380px] relative overflow-hidden cursor-pointer">
          <Image
            src="/personalize.png"
            alt="Custom Studio"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <div className="relative z-10">
            <h4 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl mb-1 sm:mb-2 font-normal text-white">
              Custom Studio
            </h4>
            <p className="text-gray-200 text-xs sm:text-sm max-w-xs">
              Your vision, our canvas. Design bespoke apparel in seconds.
            </p>
          </div>
        </div>

        {/* Signature Series - Second */}
        <div className="glass-card p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col justify-end min-h-[120px] sm:min-h-[180px] md:min-h-[250px] lg:min-h-[380px] relative overflow-hidden cursor-pointer">
          {curatedDesignImage && (
            <>
              <Image
                src={curatedDesignImage.imageUrl}
                alt={curatedDesignImage.description}
                fill
                className="object-cover object-center"
                data-ai-hint={curatedDesignImage.imageHint}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            </>
          )}
          <div className="relative z-10">
            <h4 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl mb-1 sm:mb-2 font-normal text-white">
              Signature Series
            </h4>
            <p className="text-gray-200 text-xs sm:text-sm max-w-xs">
              Discover exclusive, limited-edition artwork from our studio.
            </p>
          </div>
        </div>

        {/* Designer Partner Program - Third */}
        <div className="glass-card p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col justify-end min-h-[120px] sm:min-h-[180px] md:min-h-[250px] lg:min-h-[380px] relative overflow-hidden cursor-pointer">
          <Image
            src="/partner_program_bg.png"
            alt="Designer Partner Program"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20"></div>

          <div className="relative z-10">
            <h4 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl mb-1 sm:mb-2 font-normal text-white">
              Designer Partner Program
            </h4>
            <p className="text-gray-200 text-xs sm:text-sm max-w-xs">
              Showcase your portfolio and earn royalties on every sale.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
