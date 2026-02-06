'use client';

import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Share2, Settings, Edit, Loader2, Plus, UploadCloud } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, deleteDoc, doc, orderBy, onSnapshot } from 'firebase/firestore';
import { DesignCard, Design } from './design-card';
import { UploadModal } from './upload-modal';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ProfileViewProps {
    user: User;
}

export function ProfileView({ user }: ProfileViewProps) {
    const [designs, setDesigns] = useState<Design[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('designs');
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();

    // Stats calculation
    const totalSales = designs.reduce((acc, design) => acc + (design.sales || 0), 0);
    const totalDesigns = designs.length;
    const totalApproved = designs.filter(d => d.status === 'approved').length;

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

    const filteredDesigns = designs.filter(d => {
        if (activeTab === 'designs') return true;
        if (activeTab === 'approved') return d.status === 'approved';
        if (activeTab === 'pending') return d.status === 'pending';
        return true;
    });

    return (
        <div className="min-h-screen bg-[#0B1116] text-slate-200 font-sans">
            <div className="container mx-auto px-4 pb-8 pt-0 max-w-7xl">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row gap-8 mb-16 items-start">
                    {/* Avatar Column */}
                    <div className="relative group">
                        <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-br from-slate-700 to-slate-800 shadow-xl overflow-hidden relative">
                            <Avatar className="w-full h-full border-4 border-[#0B1116]">
                                <AvatarImage src={user.photoURL || ''} className="object-cover" />
                                <AvatarFallback className="text-4xl bg-slate-800 text-slate-400">
                                    {user.displayName?.charAt(0) || user.email?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-500 transition-colors">
                            <Camera className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    {/* Info Column */}
                    <div className="flex-1 pt-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                                    {user.displayName || 'Designer'}
                                </h1>
                                <p className="text-slate-400 font-medium">@{user.email?.split('@')[0] || 'username'}</p>
                            </div>
                            <div className="flex gap-3">
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white border-0 font-medium px-6">
                                    Edit Profile
                                </Button>
                                <Button size="sm" variant="outline" className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300">
                                    <Settings className="w-4 h-4 mr-2" />
                                    Settings
                                </Button>
                                <Button size="icon" variant="outline" className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 w-9 h-9">
                                    <Share2 className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={handleSignOut} className="bg-transparent hover:bg-slate-800 text-red-400 hover:text-red-300 w-9 h-9" title="Sign Out">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                                </Button>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex gap-12 mb-8">
                            <div>
                                <span className="block text-2xl font-bold text-white">{totalDesigns}</span>
                                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">Designs</span>
                            </div>
                            <div>
                                <span className="block text-2xl font-bold text-white">{totalSales}</span>
                                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">Sales</span>
                            </div>
                            <div>
                                <span className="block text-2xl font-bold text-white">{totalApproved}</span>
                                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">Approved</span>
                            </div>
                        </div>

                        {/* Bio (Static for now) */}
                        <div className="max-w-2xl text-slate-400 leading-relaxed text-sm">
                            <p>Graphic illustrator specializing in minimalist and vintage T-shirt aesthetics. Helping brands tell stories through fabric. #vintage #streetwear #minimalist</p>
                        </div>
                    </div>
                </div>

                {/* Tabs & Content */}
                <Tabs defaultValue="designs" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex items-center justify-center border-b border-slate-800 mb-10">
                        <TabsList className="bg-transparent h-auto p-0 gap-8">
                            {['designs', 'approved', 'pending'].map((tab) => (
                                <TabsTrigger
                                    key={tab}
                                    value={tab}
                                    className={cn(
                                        "bg-transparent border-b-2 border-transparent px-2 py-4 rounded-none text-slate-400 hover:text-white transition-all uppercase text-xs font-bold tracking-widest data-[state=active]:border-blue-500 data-[state=active]:text-blue-500 shadow-none"
                                    )}
                                >
                                    {tab === 'designs' ? (
                                        <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
                                            Designs
                                        </div>
                                    ) : tab}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <TabsContent value="designs" className="mt-0">
                        {/* Designs Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {/* Upload Card - Always First */}
                            <div
                                onClick={() => setIsUploadOpen(true)}
                                className="aspect-square rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-blue-500/50 transition-all cursor-pointer flex flex-col items-center justify-center group"
                            >
                                <div className="w-16 h-16 rounded-full bg-slate-800 group-hover:bg-blue-600/20 flex items-center justify-center mb-4 transition-colors">
                                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-blue-500" />
                                </div>
                                <h3 className="font-semibold text-white mb-1">Upload Design</h3>
                                <p className="text-xs text-slate-500 text-center px-6">Drag and drop high-res PNG or PSD mockups</p>
                            </div>

                            {/* Render Designs */}
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="aspect-square rounded-2xl bg-slate-800/50 animate-pulse" />
                                ))
                            ) : (
                                filteredDesigns.map((design) => (
                                    <DesignCard
                                        key={design.id}
                                        design={design}
                                        onDelete={handleDelete}
                                        onView={(d) => console.log('View', d)}
                                        onReupload={(d) => console.log('Reupload', d)}
                                    />
                                ))
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="approved" className="mt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredDesigns.length === 0 && !isLoading ? (
                                <div className="col-span-full py-20 text-center text-slate-500">No approved designs found.</div>
                            ) : (
                                filteredDesigns.map((design) => (
                                    <DesignCard
                                        key={design.id}
                                        design={design}
                                        onDelete={handleDelete}
                                        onView={(d) => console.log('View', d)}
                                        onReupload={(d) => console.log('Reupload', d)}
                                    />
                                ))
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="pending" className="mt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredDesigns.length === 0 && !isLoading ? (
                                <div className="col-span-full py-20 text-center text-slate-500">No pending designs found.</div>
                            ) : (
                                filteredDesigns.map((design) => (
                                    <DesignCard
                                        key={design.id}
                                        design={design}
                                        onDelete={handleDelete}
                                        onView={(d) => console.log('View', d)}
                                        onReupload={(d) => console.log('Reupload', d)}
                                    />
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <UploadModal
                open={isUploadOpen}
                onOpenChange={setIsUploadOpen}
                userId={user.uid}
            />
        </div>
    );
}
