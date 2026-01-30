'use client';

import { ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';

export default function ReviewOrder({ scrollY }: { scrollY: number }) {
    // Fade in starts at 9000, fully visible at 10000
    // Fade out starts at 12000, fully invisible at 13000
    const fadeInOpacity = Math.max(0, Math.min(1, (scrollY - 9000) / 1000));
    const fadeOutOpacity = Math.max(0, 1 - (scrollY - 12000) / 1000);
    const opacity = Math.min(fadeInOpacity, fadeOutOpacity);
    const pointerEvents = opacity > 0 ? 'auto' : 'none';

    const scale = Math.min(1, 0.98 + (scrollY - 9000) / 1000 * 0.02);

    return (
        <section
            id="review-order"
            className="fixed inset-0 text-text-primary flex flex-col justify-center items-center gap-4 px-4 pt-20 sm:pt-32 pb-4"
            style={{ opacity, pointerEvents, transform: `scale(${scale})` }}
        >
            <div className="text-center mb-4 sm:mb-8">
                <h3 className="font-heading text-xs sm:text-sm uppercase tracking-[0.2em] text-text-secondary mb-1 sm:mb-2">
                    Step 03
                </h3>
                <h2 className="font-display text-2xl sm:text-3xl text-text-primary font-normal">
                    Review & Place Order
                </h2>
            </div>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 px-2">
                {/* AI Review Card */}
                <div className="glass-card p-6 sm:p-8 flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent mb-2">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="font-display text-xl text-text-primary">AI Content Review</h4>
                    <p className="text-sm text-text-secondary max-w-xs">
                        For uploaded or contributed designs, our AI ensures quality and compliance before printing.
                    </p>
                    <div className="mt-auto pt-4 flex gap-2 text-xs text-text-secondary">
                        <span className="px-2 py-1 rounded-full border border-white/10">Quality Check</span>
                        <span className="px-2 py-1 rounded-full border border-white/10">Copyright Safe</span>
                    </div>
                </div>

                {/* Place Order Card */}
                <div className="glass-card p-6 sm:p-8 flex flex-col items-center text-center gap-4 border-primary/30">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <h4 className="font-display text-xl text-text-primary">Ready to Print?</h4>
                    <p className="text-sm text-text-secondary max-w-xs">
                        Finalize your custom tee and get it delivered to your doorstep.
                    </p>
                    <button className="mt-auto btn-primary w-full sm:w-auto flex items-center justify-center gap-2 group">
                        Place Order
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </section>
    );
}
