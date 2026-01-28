'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
  
export default function HowItWorks({ scrollY }: { scrollY: number }) {
    const fadeInOpacity = Math.max(0, Math.min(1, (scrollY - 800) / 2000));
    const fadeOutOpacity = Math.max(0, 1 - (scrollY - 3800) / 2000);
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
            className="fixed inset-0 text-text-primary flex flex-col justify-center items-center"
            style={{ opacity, pointerEvents }}
        >
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <p className="text-sm uppercase tracking-[0.2em] text-text-secondary mb-2">Step 01</p>
                <h2 className="font-tagline text-3xl md:text-4xl uppercase premium-gradient mb-3">
                    Choose Your Tee
                </h2>
                <div className="flex justify-center gap-4 animate-fade-in mb-6" style={{ animationDelay: '0.3s' }}>
                    {qualityOptions.map((quality) => (
                        <button key={quality} className="btn-outline !py-2 !px-4 text-xs">
                            {quality}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="w-full mt-8">
                <div className="grid grid-cols-4 items-end text-center px-8">
                    {teeOptions.map((tee, index) => (
                        <div key={tee.id} className="flex flex-col justify-end items-center gap-4 h-[35vh] animate-fade-in" style={{animationDelay: `${0.4 + index * 0.1}s`}}>
                            <div className="relative w-full h-full flex justify-center items-center">
                                <div className="absolute bottom-8 w-[200%] h-32 bg-[radial-gradient(ellipse_at_bottom,_var(--glass-border)_0%,_transparent_70%)] opacity-70" />
                                <Image 
                                    src={tee.imageSrc}
                                    alt={tee.id}
                                    width={250}
                                    height={250}
                                    className="animate-float relative z-10 object-contain max-h-[250px]"
                                />
                            </div>
                            <p className="uppercase tracking-widest text-xs text-text-primary font-medium">
                                {tee.id}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
