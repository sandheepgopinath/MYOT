'use client';

import { useMemo } from 'react';
import Image from 'next/image';
  
export default function HowItWorks({ scrollY }: { scrollY: number }) {
    const fadeInOpacity = Math.max(0, Math.min(1, (scrollY - 2000) / 1000));
    const fadeOutOpacity = Math.max(0, 1 - (scrollY - 5000) / 1000);
    const opacity = Math.min(fadeInOpacity, fadeOutOpacity);
    const pointerEvents = opacity > 0 ? 'auto' : 'none';

    const teeOptions = useMemo(() => [
        { id: 'Normal Fit', imageSrc: '/normal_tee-removebg-preview.png' },
        { id: 'Oversized', imageSrc: '/Oversized makemytee.png' },
        { id: 'Full Sleeves', imageSrc: '/Full sleeve makemytee.png' },
        { id: 'Jersey', imageSrc: '/jercy makemytee.png' }
    ], []);

    const qualityOptions = ['180GSM', '200GSM', '220GSM', '300GSM'];

    return (
        <section 
            id="how-it-works" 
            className="fixed inset-0 text-text-primary flex flex-col justify-start pt-40 items-center gap-8"
            style={{ opacity, pointerEvents }}
        >
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h2 className="font-tagline text-xl md:text-2xl uppercase premium-gradient">
                    Step 01 : Choose your Tee
                </h2>
            </div>
            
            <div className="w-full">
                <div className="grid grid-cols-2 md:grid-cols-4 items-end text-center px-4 md:px-8 gap-x-4">
                    {teeOptions.map((tee, index) => (
                        <div key={tee.id} className="flex flex-col justify-end items-center gap-2 md:gap-4 h-[30vh] md:h-[35vh] animate-fade-in" style={{animationDelay: `${0.4 + index * 0.1}s`}}>
                            <div className="relative w-full h-full flex justify-center items-center">
                                <div className="absolute bottom-8 w-[200%] h-32 bg-[radial-gradient(ellipse_at_bottom,_var(--glass-border)_0%,_transparent_70%)] opacity-70" />
                                <Image 
                                    src={tee.imageSrc}
                                    alt={tee.id}
                                    width={250}
                                    height={250}
                                    className="animate-float relative z-10 object-contain max-h-[150px] md:max-h-[250px]"
                                />
                            </div>
                            <p className="font-tagline text-sm md:text-lg text-text-primary">
                                {tee.id}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                {qualityOptions.map((quality) => (
                    <button key={quality} className="btn-outline py-2 px-3 md:px-4 text-xs md:text-sm font-tagline">
                        {quality}
                    </button>
                ))}
            </div>
        </section>
    );
}
