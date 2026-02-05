'use client';

import { useAuth } from '@/firebase';
import { AuthForms } from '@/components/community/auth-forms';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Header from '@/components/layout/header';

export default function CommunityPage() {
    const auth = useAuth();
    const router = useRouter();

    // If user is already logged in, redirect to profile
    useEffect(() => {
        // We need a way to check auth state synchronously or rely on onAuthStateChanged
        // but auth.currentUser is usually available if initialized. 
        // Ideally we should use an auth hook that gives us { user, loading }
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                router.push('/community/profile');
            }
        });
        return () => unsubscribe();
    }, [auth, router]);

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6 text-center md:text-left">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                            Join the <span className="text-primary">Makers</span>
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Upload your unique designs, track your sales, and manage your portfolio.
                            Earn with every t-shirt sold featuring your art.
                        </p>
                        <div className="flex gap-4 justify-center md:justify-start">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-background flex items-center justify-center text-xs font-medium text-white">
                                        {String.fromCharCode(64 + i)}
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <span className="font-bold text-foreground mr-1">500+</span> designers joined
                            </div>
                        </div>
                    </div>

                    <div>
                        <AuthForms />
                    </div>
                </div>
            </main>
        </div>
    );
}
