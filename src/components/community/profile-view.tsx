'use client';

import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Loader2, LogOut } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy, onSnapshot } from 'firebase/firestore';
import { DesignCard, Design } from './design-card';
import { UploadModal } from './upload-modal';
import { useToast } from '@/hooks/use-toast';

interface ProfileViewProps {
    user: User;
}

export function ProfileView({ user }: ProfileViewProps) {
    const [designs, setDesigns] = useState<Design[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();

    // Stats calculation
    const totalSales = designs.reduce((acc, design) => acc + (design.sales || 0), 0);
    const totalDesigns = designs.length;

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(firestore, 'designs'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const designList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Design[];
            setDesigns(designList);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching designs:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, firestore]);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this design?')) {
            try {
                await deleteDoc(doc(firestore, 'designs', id));
                toast({
                    title: 'Design Deleted',
                    description: 'The design has been removed from your profile.',
                });
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Delete Failed',
                    description: 'Could not delete the design.',
                });
            }
        }
    };

    const handleSignOut = () => {
        signOut(auth);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 glass-card p-6 rounded-xl">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-2 border-primary">
                        <AvatarImage src={user.photoURL || ''} />
                        <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                            {user.displayName?.charAt(0) || user.email?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">
                            {user.displayName || 'Designer'}
                        </h1>
                        <p className="text-white/70">{user.email}</p>
                    </div>
                </div>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <Button variant="outline" className="text-white border-white/20 hover:bg-white/10" onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                    <Button onClick={() => setIsUploadOpen(true)} className="bg-white text-black hover:bg-white/90">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Upload Design
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="bg-white/5 border-white/10 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-white/70">Total Designs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalDesigns}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-white/70">Total Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalSales}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-white/70">Earnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">${(totalSales * 5).toFixed(2)}</div>
                        <p className="text-xs text-white/50">Estimated ($5/sale)</p>
                    </CardContent>
                </Card>
            </div>

            {/* Designs Grid */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white mb-4">Your Designs</h2>

                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                ) : designs.length === 0 ? (
                    <div className="text-center py-12 glass-card rounded-xl">
                        <h3 className="text-lg font-medium text-white mb-2">No designs yet</h3>
                        <p className="text-white/60 mb-4">Upload your first design to start earning.</p>
                        <Button onClick={() => setIsUploadOpen(true)} className="bg-white text-black hover:bg-white/90">
                            Upload Design
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {designs.map((design) => (
                            <DesignCard
                                key={design.id}
                                design={design}
                                onDelete={handleDelete}
                                onView={(d) => console.log('View', d)}
                                onReupload={(d) => console.log('Reupload', d)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <UploadModal
                open={isUploadOpen}
                onOpenChange={setIsUploadOpen}
                userId={user.uid}
            />
        </div>
    );
}
