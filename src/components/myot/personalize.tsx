'use client';

import Image from 'next/image';
import { Upload, ChevronRight } from 'lucide-react';
import Breadcrumbs from './breadcrumbs';
import { getImageById } from '@/lib/placeholder-images';

export default function Personalize({ scrollY }: { scrollY: number }) {
    const fadeInOpacity = Math.max(0, Math.min(1, (scrollY - 6000) / 1000));
    const fadeOutOpacity = Math.max(0, 1 - (scrollY - 9000) / 1000);
    const opacity = Math.min(fadeInOpacity, fadeOutOpacity);
    const pointerEvents = opacity > 0 ? 'auto' : 'none';

    const curatedDesignImage = getImageById('curated_design_tee');

    return (
        <section
            id="personalize"
            className="fixed inset-0 text-text-primary flex flex-col justify-start pt-16 md:pt-20 items-center px-4"
            style={{ opacity, pointerEvents }}
        >
            <div className="w-full max-w-5xl mx-auto">
                <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <Breadcrumbs />
                </div>
                
                <div className="text-center mb-10 md:mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <h3 className="text-sm uppercase tracking-[0.2em] text-text-secondary mb-2">
                        Step 02
                    </h3>
                    <h2 className="font-tagline text-4xl md:text-5xl text-text-primary font-bold">
                        Make It Yours
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Card */}
                    <div className="glass-card p-8 flex flex-col justify-end min-h-[380px] relative overflow-hidden group cursor-pointer animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        {curatedDesignImage && (
                          <Image
                              src={curatedDesignImage.imageUrl}
                              alt={curatedDesignImage.description}
                              fill
                              className="object-cover object-center scale-125 group-hover:scale-110 transition-transform duration-700 ease-in-out opacity-30 group-hover:opacity-40"
                              data-ai-hint={curatedDesignImage.imageHint}
                          />
                        )}
                        <div className="relative z-10">
                            <h4 className="font-tagline text-3xl mb-2">Curated designs</h4>
                            <p className="text-text-secondary text-sm max-w-xs">Explore original artwork crafted by our designers</p>
                        </div>
                         <ChevronRight className="w-6 h-6 absolute bottom-8 right-8 z-10 text-text-secondary group-hover:translate-x-1 transition-transform" />
                    </div>
                    
                    {/* Right Cards */}
                    <div className="flex flex-col gap-6">
                        <div className="glass-card p-6 flex items-center justify-between relative group cursor-pointer animate-fade-in h-full" style={{ animationDelay: '0.6s' }}>
                            <div className="flex-1">
                                <h4 className="font-tagline text-2xl mb-1">Upload your artwork</h4>
                                <p className="text-text-secondary text-xs">Bring your vision — we’ll handle the rest.</p>
                            </div>
                            <div className="ml-4 w-28 h-16 bg-black/20 rounded-md flex items-center justify-center backdrop-blur-sm border border-white/10">
                                <Upload className="w-6 h-6 text-text-secondary" />
                            </div>
                            <ChevronRight className="w-5 h-5 absolute top-1/2 -translate-y-1/2 right-6 text-text-secondary opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </div>

                        <div className="glass-card p-6 flex items-center justify-between relative group cursor-pointer animate-fade-in h-full" style={{ animationDelay: '0.8s' }}>
                            <div className="flex-1">
                                <h4 className="font-tagline text-2xl mb-1">Personal text</h4>
                                <p className="text-text-secondary text-xs">Words that matter, placed with intent</p>
                            </div>
                            <div className="ml-4 w-28 h-16 bg-black/20 rounded-md flex items-center justify-center font-tagline text-text-secondary text-lg italic backdrop-blur-sm border border-white/10">
                                Your Text
                            </div>
                            <ChevronRight className="w-5 h-5 absolute top-1/2 -translate-y-1/2 right-6 text-text-secondary opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
