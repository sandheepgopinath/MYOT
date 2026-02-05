'use client';

import { useAuth, useFirestore, deleteDocumentNonBlocking } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, LogOut, Settings } from 'lucide-react';
import { useCommunityDesigns, CommunityDesign } from '@/hooks/use-community-designs';
import { DesignCard } from '@/components/community/design-card';
import { UploadModal } from '@/components/community/upload-modal';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function ProfilePage() {
    const auth = useAuth();
    const user = auth.currentUser;
    const router = useRouter();
    const { designs, isLoading, error } = useCommunityDesigns();
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();

    useEffect(() => {
        // Determine auth state. 
        // Ideally use a proper auth hook that emits loading state.
        // For now, if no user is found after specific timeout/check, redirect.
        // Relying on onAuthStateChanged in parent or simple check here.
        const unsubscribe = auth.onAuthStateChanged((u) => {
            if (!u) {
                router.push('/community');
            }
        });
        return () => unsubscribe();
    }, [auth, router]);

    const stats = useMemo(() => {
        if (!designs) return { total: 0, sales: 0, views: 0 };
        return designs.reduce((acc, curr) => ({
            total: acc.total + 1,
            sales: acc.sales + (curr.sales || 0),
            views: acc.views + (curr.views || 0)
        }), { total: 0, sales: 0, views: 0 });
    }, [designs]);

    const handleDelete = async (id: string) => {
        try {
            await deleteDocumentNonBlocking(doc(firestore, 'community_designs', id));
            toast({
                title: 'Design Deleted',
                description: 'Your design has been removed.'
            });
        } catch (e) {
            console.error(e);
            toast({
                variant: 'destructive',
                title: 'Delete Failed',
                description: 'Could not delete design.'
            });
        }
    };

    const handleReupload = (design: CommunityDesign) => {
        toast({
            title: 'Coming Soon',
            description: 'Edit functionality will be available shortly.'
        });
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/community');
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">

                {/* Profile Header */}
                <section className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
                    <Avatar className="w-32 h-32 border-4 border-white/10">
                        <AvatarImage src={user.photoURL || ''} />
                        <AvatarFallback className="text-4xl">{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <h1 className="text-2xl font-bold">{user.displayName || 'Designer'}</h1>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                    <Settings className="h-4 w-4 mr-2" /> Edit Profile
                                </Button>
                                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                    <LogOut className="h-4 w-4 mr-2" /> Logout
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-center md:justify-start gap-8 text-center">
                            <div>
                                <div className="font-bold text-xl">{stats.total}</div>
                                <div className="text-muted-foreground text-sm">Designs</div>
                            </div>
                            <div>
                                <div className="font-bold text-xl">{stats.sales}</div>
                                <div className="text-muted-foreground text-sm">Sales</div>
                            </div>
                            <div>
                                <div className="font-bold text-xl">{stats.views}</div>
                                <div className="text-muted-foreground text-sm">Views</div>
                            </div>
                        </div>

                        <div className="max-w-md text-sm text-muted-foreground">
                            Create and manage your t-shirt designs. Earn royalties for every sale.
                        </div>
                    </div>
                </section>

                {/* Content Tabs */}
                <Tabs defaultValue="designs" className="w-full">
                    <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-2">
                        <TabsList className="bg-transparent p-0">
                            <TabsTrigger value="designs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-2">
                                My Designs
                            </TabsTrigger>
                            {/* Add more tabs like 'Earnings' or 'Settings' later */}
                        </TabsList>
                        <Button onClick={() => setIsUploadOpen(true)} className="btn-login-glow">
                            <Plus className="h-4 w-4 mr-2" /> Upload Design
                        </Button>
                    </div>

                    <TabsContent value="designs" className="mt-0">
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : designs && designs.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {designs.map((design) => (
                                    <DesignCard
                                        key={design.id}
                                        design={design}
                                        onDelete={handleDelete}
                                        onReupload={handleReupload}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 border rounded-lg border-dashed border-border/50 bg-white/5">
                                <h3 className="text-lg font-semibold mb-2">No designs yet</h3>
                                <p className="text-muted-foreground mb-6">Upload your first design to start selling!</p>
                                <Button onClick={() => setIsUploadOpen(true)}>
                                    Upload Design
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                <UploadModal isOpen={isUploadOpen} onOpenChange={setIsUploadOpen} />

            </main>
        </div>
    );
}
