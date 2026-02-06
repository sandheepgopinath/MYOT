'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { AuthForms } from '@/components/community/auth-forms';
import { ProfileView } from '@/components/community/profile-view';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Loader2 } from 'lucide-react';

export default function CommunityPage() {
    const auth = useAuth();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Force dark mode for Community page
        const originalTheme = localStorage.getItem('theme');
        document.documentElement.classList.add('dark');
        
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setCurrentUser(u);
            setLoading(false);
        });

        return () => {
            unsubscribe();
            // Revert theme if we leave the page (optional, but good practice)
            if (originalTheme !== 'dark') {
                // We keep it dark for now as per user request "Always keep it in dark mode"
                // document.documentElement.classList.remove('dark');
            }
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
        <div className="min-h-screen bg-[#0B1116] flex flex-col transition-colors duration-500">
            <Header scrollY={0} />
            <main className="flex-grow pb-12">
                {currentUser ? (
                    <ProfileView user={currentUser} />
                ) : (
                    <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[70vh]">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 tracking-tighter">
                                JOIN THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-gradient">REVOLUTION</span>
                            </h1>
                            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                                Upload your designs, set your price, and earn on every sale. We handle printing, shipping, and support.
                            </p>
                        </div>
                        <AuthForms />
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
