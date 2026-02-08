'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { AuthForms } from '@/components/community/auth-forms';
import { ProfileView } from '@/components/community/profile-view';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { getImageById } from '@/lib/placeholder-images';

export default function CommunityPage() {
    const auth = useAuth();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Force dark mode for Community page
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setCurrentUser(u);
            setLoading(false);
        });

        return () => {
            unsubscribe();
        };
    }, [auth]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0B1116]">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        )
    }

    const bgImage = getImageById('hero_spotlight_floor');

    return (
        <div className="min-h-screen bg-[#0B1116] flex flex-col relative overflow-hidden">
            {/* Cinematic Background Layer */}
            {!currentUser && (
                <div className="absolute inset-0 z-0">
                    {bgImage && (
                        <Image 
                            src={bgImage.imageUrl} 
                            alt="Studio Background" 
                            fill 
                            className="object-cover opacity-30 grayscale brightness-50"
                            priority
                            data-ai-hint="dark spotlight floor"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0B1116] via-transparent to-[#0B1116]" />
                    <div className="absolute inset-0 bg-black/60" />
                </div>
            )}

            <div className="relative z-10 flex flex-col min-h-screen">
                <Header scrollY={0} />
                
                <main className="flex-grow flex flex-col items-center justify-center">
                    {currentUser ? (
                        <div className="w-full">
                            <ProfileView user={currentUser} />
                        </div>
                    ) : (
                        <div className="container mx-auto px-4 py-12 flex flex-col items-center">
                            {/* Legacy Header Section */}
                            <div className="text-center mb-12 space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-display text-white leading-tight tracking-tight">
                                    Where independent designers <br className="hidden md:block" />
                                    build their <span className="text-amber-500 italic">legacy.</span>
                                </h1>
                                <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed font-tagline italic">
                                    Upload your designs, set your price, and earn on every sale. <br className="hidden sm:block" />
                                    We handle printing, shipping, and support.
                                </p>
                            </div>

                            {/* Authentication Card */}
                            <div className="animate-in fade-in zoom-in-95 duration-1000 delay-300 w-full flex justify-center">
                                <AuthForms />
                            </div>
                        </div>
                    )}
                </main>
                
                <Footer />
            </div>
        </div>
    );
}
