'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Shirt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getImageById } from '@/lib/placeholder-images';

const NormalFitIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46 16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
    </svg>
);
  
const OversizedIcon = ({ className, ...props }: { className?: string; [key:string]: any; }) => (
    <Image src="/Oversized makemytee.png" alt="Oversized" width={80} height={80} className={cn(className, 'object-contain')} />
);

const FullSleevesIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 2.29a4 4 0 0 0-8 0L4 4.29V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4.29L16 2.29z" />
        <path d="M4 9.29 1 11v7a2 2 0 0 0 2 2h1" />
        <path d="M20 9.29 23 11v7a2 2 0 0 1-2 2h-1" />
    </svg>
);
  
export default function HowItWorks({ scrollY }: { scrollY: number }) {
    const fadeInOpacity = Math.max(0, Math.min(1, (scrollY - 800) / 2000));
    const fadeOutOpacity = Math.max(0, 1 - (scrollY - 3800) / 2000);
    const opacity = Math.min(fadeInOpacity, fadeOutOpacity);
    const pointerEvents = opacity > 0 ? 'auto' : 'none';

    const [selectedTee, setSelectedTee] = useState('Jersey');
    
    const normalFitImage = useMemo(() => getImageById('tshirt_front'), []);
    const oversizedImage = useMemo(() => getImageById('tshirt_front_oversized'), []);
    const jerseyImage = useMemo(() => getImageById('jersey_mockup'), []);

    const teeOptions = useMemo(() => [
        { id: 'Normal Fit', icon: NormalFitIcon, previewImage: normalFitImage?.imageUrl ?? '' },
        { id: 'Oversized', icon: OversizedIcon, previewImage: oversizedImage?.imageUrl ?? '' },
        { id: 'Full Sleeves', icon: FullSleevesIcon, previewImage: '/Full sleeves.png' },
        { id: 'Jersey', icon: Shirt, previewImage: jerseyImage?.imageUrl ?? '' }
    ], [normalFitImage, oversizedImage, jerseyImage]);

    const selectedTeeData = useMemo(() => {
        return teeOptions.find(t => t.id === selectedTee);
    }, [selectedTee, teeOptions]);

    return (
        <section 
            id="how-it-works" 
            className="fixed inset-0 text-text-primary flex flex-col justify-between"
            style={{ opacity, pointerEvents }}
        >
            <div className="text-center pt-24 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <p className="text-sm uppercase tracking-[0.2em] text-text-secondary mb-2">Step 01</p>
                <h2 className="font-tagline text-3xl md:text-4xl uppercase premium-gradient mb-3">
                    Choose Your Tee
                </h2>
                <p className="text-text-secondary">
                    Choose the T-shirt type and quality for your needs.
                </p>
            </div>
            
            <div className="w-full h-[50vh] relative">
                <div className="absolute bottom-0 w-full grid grid-cols-4 items-end text-center px-8">
                    {teeOptions.map((tee, index) => (
                        <div key={tee.id} className="flex flex-col justify-end items-center gap-4 h-[35vh] animate-fade-in" style={{animationDelay: `${0.4 + index * 0.1}s`}}>
                            {selectedTee === tee.id ? (
                                <div className="relative w-full h-full flex justify-center items-center">
                                    <div className="absolute bottom-8 w-[200%] h-32 bg-[radial-gradient(ellipse_at_bottom,_var(--glass-border)_0%,_transparent_70%)] opacity-70" />
                                    {selectedTeeData?.previewImage && (
                                        <Image 
                                            src={selectedTeeData.previewImage}
                                            alt={selectedTee}
                                            width={250}
                                            height={250}
                                            className="animate-float relative z-10 object-contain max-h-[250px]"
                                        />
                                    )}
                                </div>
                            ) : (
                                <button onClick={() => setSelectedTee(tee.id)} className="w-full h-full flex flex-col justify-end items-center gap-4 group">
                                    <tee.icon strokeWidth={1} className="w-20 h-20 text-text-secondary transition-opacity duration-300 group-hover:opacity-100 opacity-60" />
                                </button>
                            )}
                            <p className={cn(
                                "uppercase tracking-widest text-xs transition-colors duration-300",
                                selectedTee === tee.id ? "text-text-primary font-medium" : "text-text-secondary"
                            )}>
                                {tee.id}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
