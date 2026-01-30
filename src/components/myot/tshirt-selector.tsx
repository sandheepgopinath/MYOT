'use client';

import Image from 'next/image';

export default function TShirtSelector() {
    const teeOptions = [
        { id: 'Normal Fit', imageSrc: '/normal_tee-removebg-preview.png' },
        { id: 'Oversized', imageSrc: '/Oversized makemytee.png' },
        { id: 'Full Sleeves', imageSrc: '/Full sleeve makemytee.png' },
        { id: 'Jersey', imageSrc: '/jercy makemytee.png' },
    ];

    const qualityOptions = ['180GSM', '200GSM', '220GSM', '300GSM'];

    return (
        <section className="min-h-screen text-text-primary flex flex-col justify-center items-center gap-2 sm:gap-4 px-4 pt-20 pb-4">
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
                            className="glass-card p-2 sm:p-4 relative overflow-hidden transition-all duration-300 aspect-[4/5] hover:border-primary/50 cursor-pointer"
                        >
                            <div className="relative w-full h-full scale-110">
                                <Image
                                    src={tee.imageSrc}
                                    alt={tee.id}
                                    fill
                                    className="object-contain drop-shadow-2xl"
                                />
                            </div>
                            <p className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 text-xs text-text-primary z-10 w-full text-center">
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
                        className="btn-outline py-1 px-2 sm:py-1 sm:px-3 text-xs text-text-primary font-normal cursor-pointer hover:bg-primary/10"
                    >
                        {quality}
                    </div>
                ))}
            </div>
        </section>
    );
}
