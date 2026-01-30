'use client';

import Image from 'next/image';

export default function HowItWorks({ scrollY }: { scrollY: number }) {
  const fadeInOpacity = Math.max(0, Math.min(1, (scrollY - 2000) / 1000));
  const fadeOutOpacity = Math.max(0, 1 - (scrollY - 5000) / 1000);
  const opacity = Math.min(fadeInOpacity, fadeOutOpacity);
  const pointerEvents = opacity > 0 ? 'auto' : 'none';

  const scale = Math.min(1, 0.98 + (scrollY - 2000) / 1000 * 0.02);

  const teeOptions = [
    { id: 'Normal Fit', imageSrc: '/normal_tee-removebg-preview.png' },
    { id: 'Oversized', imageSrc: '/Oversized makemytee.png' },
    { id: 'Full Sleeves', imageSrc: '/Full sleeve makemytee.png' },
    { id: 'Jersey', imageSrc: '/jercy makemytee.png' },
  ];

  const qualityOptions = ['180GSM', '200GSM', '220GSM', '300GSM'];

  return (
    <section
      id="how-it-works"
      className="fixed inset-0 text-text-primary flex flex-col justify-center items-center gap-2 sm:gap-4 px-4 pt-28 sm:pt-32 pb-4"
      style={{ opacity, pointerEvents, transform: `scale(${scale})` }}
    >
      <div className="text-center">
        <h3 className="font-heading text-xs sm:text-sm uppercase tracking-[0.2em] text-text-secondary mb-1 sm:mb-2">
          Step 01
        </h3>
        <h2 className="font-display text-2xl sm:text-3xl text-text-primary font-normal">
          Choose your Fabric
        </h2>
      </div>

      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 items-start text-center gap-2 sm:gap-4 md:gap-6">
          {teeOptions.map((tee) => (
            <div
              key={tee.id}
              className="glass-card p-2 sm:p-4 flex flex-col items-center relative overflow-hidden transition-all duration-300 aspect-square sm:aspect-[4/5]"
            >
              <div className="relative flex-grow w-full -mt-[20%] -mb-[5%]">
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

      <div className="flex justify-center gap-1 sm:gap-2 mt-2 sm:mt-4">
        {qualityOptions.map((quality) => (
          <div
            key={quality}
            className="btn-outline py-1 px-2 sm:py-1 sm:px-3 text-xs text-text-secondary"
          >
            {quality}
          </div>
        ))}
      </div>
    </section>
  );
}
