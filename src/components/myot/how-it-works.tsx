'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
  
export default function HowItWorks({ scrollY }: { scrollY: number }) {
    const fadeInOpacity = Math.max(0, Math.min(1, (scrollY - 2000) / 1000));
    const fadeOutOpacity = Math.max(0, 1 - (scrollY - 5000) / 1000);
    const opacity = Math.min(fadeInOpacity, fadeOutOpacity);
    const pointerEvents = opacity > 0 ? 'auto' : 'none';

    const [selectedTee, setSelectedTee] = useState('Oversized');
    const [selectedQuality, setSelectedQuality] = useState('180GSM');

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
            className="fixed inset-0 text-text-primary flex flex-col justify-start pt-24 md:pt-32 items-center gap-10"
            style={{ opacity, pointerEvents }}
        >
            <div className="text-center">
                 <h3 className="font-heading text-sm uppercase tracking-[0.2em] text-text-secondary mb-2">
                    Step 01
                </h3>
                <h2 className="font-display text-4xl md:text-5xl text-text-primary font-normal">
                    Choose Your Tee
                </h2>
            </div>
            
            <div className="w-full max-w-5xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 items-start text-center px-4 md:px-8 gap-4 md:gap-6">
                    {teeOptions.map((tee) => (
                        <button 
                            key={tee.id} 
                            onClick={() => setSelectedTee(tee.id)}
                            className="glass-card p-4 flex flex-col justify-end items-center relative overflow-hidden transition-all duration-300 aspect-[3/4]"
                        >
                            <div className="absolute inset-0 top-[-20%]">
                                <Image 
                                    src={tee.imageSrc}
                                    alt={tee.id}
                                    fill
                                    className="object-contain drop-shadow-2xl"
                                />
                            </div>
                            <p className="font-tagline text-base md:text-lg text-text-primary z-10 relative">
                                {tee.id}
                            </p>
                            {selectedTee === tee.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 gold-underline-glow"/>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-center gap-4 mt-4">
                {qualityOptions.map((quality) => (
                    <button 
                        key={quality} 
                        onClick={() => setSelectedQuality(quality)}
                        className={cn(
                            "btn-outline py-2 px-6 text-sm font-tagline transition-all duration-300",
                            selectedQuality === quality 
                                ? 'bg-primary text-primary-foreground border-primary' 
                                : 'text-text-secondary'
                        )}
                    >
                        {quality}
                    </button>
                ))}
            </div>
        </section>
    );
}
