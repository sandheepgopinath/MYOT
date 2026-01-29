'use client';

import { Palette, Upload, Type } from 'lucide-react';

export default function Personalize({ scrollY }: { scrollY: number }) {
    const fadeInOpacity = Math.max(0, Math.min(1, (scrollY - 6000) / 1000));
    const fadeOutOpacity = Math.max(0, 1 - (scrollY - 9000) / 1000);
    const opacity = Math.min(fadeInOpacity, fadeOutOpacity);
    const pointerEvents = opacity > 0 ? 'auto' : 'none';

    const options = [
        {
            icon: <Palette className="w-10 h-10 md:w-12 md:h-12 text-text-primary relative z-10" />,
            title: "Add from our curated set of designs",
            delay: "0.4s",
        },
        {
            icon: <Upload className="w-10 h-10 md:w-12 md:h-12 text-text-primary relative z-10" />,
            title: "Upload your designs",
            delay: "0.5s",
        },
        {
            icon: <Type className="w-10 h-10 md:w-12 md:h-12 text-text-primary relative z-10" />,
            title: "Add personalized texts",
            delay: "0.6s",
        },
    ];

    return (
        <section 
            id="personalize" 
            className="fixed inset-0 text-text-primary flex flex-col justify-start pt-40 items-center gap-8 px-4"
            style={{ opacity, pointerEvents }}
        >
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h2 className="font-tagline text-xl md:text-2xl uppercase premium-gradient text-center font-bold">
                    Step 02: Personalize your tee
                </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
                {options.map((option, index) => (
                    <div
                        key={option.title}
                        className="flex flex-col items-center justify-start gap-4 text-center animate-fade-in"
                        style={{animationDelay: option.delay}}
                    >
                        <div 
                            className="w-24 h-24 md:w-32 md:h-32 relative flex items-center justify-center animate-float"
                            style={{animationDelay: `${index * 0.2 + 0.4}s`}}
                        >
                            <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--glass-border)_0%,_transparent_70%)] opacity-70 rounded-full" />
                            {option.icon}
                        </div>
                        <p className="font-tagline text-base md:text-lg text-text-primary">
                            {option.title}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
