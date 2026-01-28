'use client';

import { Palette, Upload, Type } from 'lucide-react';

export default function Personalize({ scrollY }: { scrollY: number }) {
    // Starts fading in as the previous section fades out
    const fadeInOpacity = Math.max(0, Math.min(1, (scrollY - 4800) / 3000));
    // Starts fading out after being visible for a while
    const fadeOutOpacity = Math.max(0, 1 - (scrollY - 10000) / 2000);
    const opacity = Math.min(fadeInOpacity, fadeOutOpacity);
    const pointerEvents = opacity > 0 ? 'auto' : 'none';

    const options = [
        {
            icon: <Palette className="w-8 h-8" />,
            title: "Add from our curated set of designs",
            delay: "0.4s",
        },
        {
            icon: <Upload className="w-8 h-8" />,
            title: "Upload your designs",
            delay: "0.5s",
        },
        {
            icon: <Type className="w-8 h-8" />,
            title: "Add personalized texts",
            delay: "0.6s",
        },
    ];

    return (
        <section 
            id="personalize" 
            className="fixed inset-0 text-text-primary flex flex-col justify-center items-center gap-12"
            style={{ opacity, pointerEvents }}
        >
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h2 className="font-tagline text-xl md:text-2xl uppercase premium-gradient">
                    Step 02 : Personalize your Tshirt
                </h2>
            </div>
            
            <div className="flex flex-col gap-4 w-full max-w-md px-8">
                {options.map((option) => (
                    <button
                        key={option.title}
                        className="btn-outline flex items-center justify-start gap-4 w-full text-left animate-fade-in"
                        style={{animationDelay: option.delay}}
                    >
                        {option.icon}
                        <span className="font-heading">{option.title}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}
