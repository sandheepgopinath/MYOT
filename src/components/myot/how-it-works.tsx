'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const NormalFitIcon = ({ className, ...props }: { className?: string; [key:string]: any; }) => (
    <Image src="/normal_tee-removebg-preview.png" alt="Normal Fit" width={200} height={200} className={cn(className, 'w-full h-full object-contain')} {...props} />
);
  
const OversizedIcon = ({ className, ...props }: { className?: string; [key:string]: any; }) => (
    <Image src="/Oversized makemytee.png" alt="Oversized" width={200} height={200} className={cn(className, 'w-full h-full object-cover')} {...props} />
);

const FullSleevesIcon = ({ className, ...props }: { className?: string; [key:string]: any; }) => (
    <Image src="/Full sleeve makemytee.png" alt="Full Sleeves" width={200} height={200} className={cn(className, 'w-full h-full object-contain')} {...props} />
);

const JerseyIcon = ({ className, ...props }: { className?: string; [key:string]: any; }) => (
    <Image src="/jercy makemytee.png" alt="Jersey" width={200} height={200} className={cn(className, 'w-full h-full object-contain')} {...props} />
);
  
export default function HowItWorks({ scrollY }: { scrollY: number }) {
    const fadeInOpacity = Math.max(0, Math.min(1, (scrollY - 800) / 2000));
    const fadeOutOpacity = Math.max(0, 1 - (scrollY - 3800) / 2000);
    const opacity = Math.min(fadeInOpacity, fadeOutOpacity);
    const pointerEvents = opacity > 0 ? 'auto' : 'none';

    const [selectedTee, setSelectedTee] = useState('Normal Fit');
    
    const teeOptions = useMemo(() => [
        { id: 'Normal Fit', icon: NormalFitIcon, previewImage: '/normal_tee-removebg-preview.png' },
        { id: 'Oversized', icon: OversizedIcon, previewImage: '/Oversized makemytee.png' },
        { id: 'Full Sleeves', icon: FullSleevesIcon, previewImage: '/Full sleeve makemytee.png' },
        { id: 'Jersey', icon: JerseyIcon, previewImage: '/jercy makemytee.png' }
    ], []);

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
                                    <tee.icon className="w-20 h-20 text-text-secondary transition-opacity duration-300 group-hover:opacity-100 opacity-60 animate-float" />
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
