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

    return (
        <div className="min-h-screen bg-[#0B1116] flex flex-col relative overflow-hidden">
            {/* Cinematic Background Layer - Effects removed as requested */}
            {!currentUser && (
                <div className="absolute inset-0 z-0">
                    <Image 
                        src="/admin-background.png" 
                        alt="Studio Background" 
                        fill 
                        className="object-cover"
                        priority
                    />
                </div>
            )}

            <div className="relative z-10 flex flex-col min-h-screen">
                <Header scrollY={0} />
                
                <main className="flex-grow flex flex-col items-center justify-start pt-20">
                    {currentUser ? (
                        <div className="w-full">
                            <ProfileView user={currentUser} />
                        </div>
                    ) : (
                        <div className="container mx-auto px-4 py-12 flex flex-col items-center">
                            {/* Refined Heading to match reference image typography and size */}
                            <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                <h1 className="text-lg md:text-xl lg:text-2xl font-display text-stone-200 leading-tight tracking-tight">
                                    Where independent designers build their legacy.
                                </h1>
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
