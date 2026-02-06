
'use client';

import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Share2, Settings, Loader2, UploadCloud, Check, X, Pencil } from 'lucide-react';
import { useAuth, useFirestore, useDoc, useCollection, useMemoFirebase, updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { signOut } from 'firebase/auth';
import { collection, doc, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { DesignCard, Design } from './design-card';
import { UploadModal } from './upload-modal';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ProfileViewProps {
    user: User;
}

export function ProfileView({ user }: ProfileViewProps) {
    const firestore = useFirestore();
    const auth = useAuth();
    const { toast } = useToast();
    
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('designs');
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [tempDescription, setTempDescription] = useState('');

    // Designer Profile Data
    const designerRef = useMemoFirebase(() => doc(firestore, 'users', user.uid), [user.uid, firestore]);
    const { data: designer, isLoading: isDesignerLoading } = useDoc(designerRef);

    // Designs Sub-collection - fetch and sort in memory to avoid index requirements for now
    const designsRef = useMemoFirebase(() => collection(firestore, 'users', user.uid, 'designs'), [user.uid, firestore]);
    const { data: designs, isLoading: isDesignsLoading } = useCollection(designsRef);

    // Initialize/Sync Profile
    useEffect(() => {
        if (!isDesignerLoading && designer === null && user) {
            // Document doesn't exist (e.g. for Admins or direct logins). Let's initialize it.
            const initialProfile = {
                uid: user.uid,
                name: user.displayName || 'New Designer',
                username: (user.displayName || user.email?.split('@')[0] || 'designer').toLowerCase().replace(/\s+/g, '_'),
                email: user.email || null,
                phone: user.phoneNumber || null,
                profilePhotoUrl: user.photoURL || null,
                description: "Passionate about creating unique t-shirt designs.",
                designsUploadedCount: 0,
                designsApprovedCount: 0,
                salesCount: 0,
                totalRevenue: 0,
                createdAt: serverTimestamp(),
                lastActiveAt: serverTimestamp()
            };
            setDocumentNonBlocking(designerRef, initialProfile, { merge: true });
        }
    }, [designer, isDesignerLoading, user, designerRef]);

    useEffect(() => {
        if (designer?.description) {
            setTempDescription(designer.description);
        }
    }, [designer]);

    const handleUpdateDescription = () => {
        updateDocumentNonBlocking(designerRef, {
            description: tempDescription,
            lastActiveAt: serverTimestamp()
        });
        setIsEditingDescription(false);
        toast({ title: 'Profile Updated', description: 'Your description has been saved.' });
    };

    const handleSignOut = () => {
        signOut(auth);
    };

    // Sort designs in memory by uploadedAt
    const sortedDesigns = designs ? [...designs].sort((a, b) => {
        const dateA = a.uploadedAt?.seconds || 0;
        const dateB = b.uploadedAt?.seconds || 0;
        return dateB - dateA;
    }) : [];

    const filteredDesigns = sortedDesigns.filter(d => {
        if (activeTab === 'designs') return true;
        if (activeTab === 'approved') return d.status === 'approved';
        if (activeTab === 'pending') return d.status === 'pending';
        return true;
    });

    if (isDesignerLoading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1116] text-slate-200 font-sans">
            <div className="container mx-auto px-4 pb-8 max-w-7xl pt-4">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row gap-8 mb-16 items-start">
                    <div className="relative group">
                        <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-br from-slate-700 to-slate-800 shadow-xl overflow-hidden relative">
                            <Avatar className="w-full h-full border-4 border-[#0B1116]">
                                <AvatarImage src={designer?.profilePhotoUrl || user.photoURL || ''} className="object-cover" />
                                <AvatarFallback className="text-4xl bg-slate-800 text-slate-400">
                                    {designer?.name?.charAt(0) || user.displayName?.charAt(0) || 'D'}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-500 transition-colors">
                            <Camera className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    <div className="flex-1 pt-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                                    {designer?.name || user.displayName || 'Designer'}
                                </h1>
                                <p className="text-slate-400 font-medium">@{designer?.username || user.email?.split('@')[0] || 'username'}</p>
                            </div>
                            <div className="flex gap-3">
                                <Button size="sm" variant="outline" className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300">
                                    <Settings className="w-4 h-4 mr-2" />
                                    Settings
                                </Button>
                                <Button size="icon" variant="outline" className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 w-9 h-9">
                                    <Share2 className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={handleSignOut} className="bg-transparent hover:bg-slate-800 text-red-400 hover:text-red-300 w-9 h-9">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                                </Button>
                            </div>
                        </div>

                        <div className="flex gap-12 mb-8">
                            <div>
                                <span className="block text-2xl font-bold text-white">{designer?.designsUploadedCount || 0}</span>
                                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">Designs</span>
                            </div>
                            <div>
                                <span className="block text-2xl font-bold text-white">{designer?.salesCount || 0}</span>
                                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">Sales</span>
                            </div>
                            <div>
                                <span className="block text-2xl font-bold text-white">₹{designer?.totalRevenue || 0}</span>
                                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">Earnings</span>
                            </div>
                        </div>

                        <div className="max-w-2xl text-slate-400 leading-relaxed text-sm group">
                            {isEditingDescription ? (
                                <div className="space-y-3">
                                    <Textarea 
                                        value={tempDescription} 
                                        onChange={(e) => setTempDescription(e.target.value)}
                                        className="bg-slate-900 border-slate-700 text-white min-h-[100px]"
                                        placeholder="Write about your design style..."
                                    />
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={handleUpdateDescription} className="bg-green-600 hover:bg-green-500">
                                            <Check className="w-4 h-4 mr-1" /> Save
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => setIsEditingDescription(false)}>
                                            <X className="w-4 h-4 mr-1" /> Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-4">
                                    <p className="flex-1">{designer?.description || 'No description yet. Click to add one.'}</p>
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        onClick={() => setIsEditingDescription(true)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
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
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <TabsContent value="designs" className="mt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            <div
                                onClick={() => setIsUploadOpen(true)}
                                className="aspect-square rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-blue-500/50 transition-all cursor-pointer flex flex-col items-center justify-center group"
                            >
                                <div className="w-16 h-16 rounded-full bg-slate-800 group-hover:bg-blue-600/20 flex items-center justify-center mb-4 transition-colors">
                                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-blue-500" />
                                </div>
                                <h3 className="font-semibold text-white mb-1">Upload Design</h3>
                                <p className="text-xs text-slate-500 text-center px-6">PNG or PSD mockups</p>
                            </div>

                            {isDesignsLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="aspect-square rounded-2xl bg-slate-800/50 animate-pulse" />
                                ))
                            ) : (
                                filteredDesigns.map((design) => (
                                    <DesignCard
                                        key={design.id}
                                        design={design as any}
                                        onDelete={() => {}} 
                                        onView={() => {}}
                                        onReupload={() => {}}
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
