'use client';

import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Share2, Loader2, UploadCloud, Check, X, Pencil, UserPen, Mail, Phone, Lock, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth, useFirestore, useDoc, useCollection, useMemoFirebase, updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { signOut } from 'firebase/auth';
import { collection, doc, getDocs, limit, query, serverTimestamp, where } from 'firebase/firestore';
import { DesignCard } from './design-card';
import { UploadModal } from './upload-modal';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

interface ProfileViewProps {
    user: User;
}

export function ProfileView({ user }: ProfileViewProps) {
    const firestore = useFirestore();
    const auth = useAuth();
    const { toast } = useToast();
    
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('designs');
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [tempDescription, setTempDescription] = useState('');
    
    // Edit Profile states
    const [editName, setEditName] = useState('');
    const [editUsername, setEditUsername] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Designer Profile Data
    const designerRef = useMemoFirebase(() => doc(firestore, 'users', user.uid), [user.uid, firestore]);
    const { data: designer, isLoading: isDesignerLoading } = useDoc(designerRef);

    // Designs Sub-collection
    const designsRef = useMemoFirebase(() => collection(firestore, 'users', user.uid, 'designs'), [user.uid, firestore]);
    const { data: designs, isLoading: isDesignsLoading } = useCollection(designsRef);

    // Initialize/Sync Profile
    useEffect(() => {
        if (!isDesignerLoading && designer === null && user) {
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

    // Pre-fill modal fields when data is available
    useEffect(() => {
        if (designer && isEditProfileOpen) {
            if (!isEditingName) setEditName(designer.name || '');
            if (!isEditingUsername) setEditUsername(designer.username || '');
            setTempDescription(designer.description || '');
        }
    }, [designer, isEditProfileOpen, isEditingName, isEditingUsername]);

    // Reset editing states when modal closes
    useEffect(() => {
        if (!isEditProfileOpen) {
            setIsEditingName(false);
            setIsEditingUsername(false);
        }
    }, [isEditProfileOpen]);

    const handleUpdateDescription = () => {
        updateDocumentNonBlocking(designerRef, {
            description: tempDescription,
            lastActiveAt: serverTimestamp()
        });
        setIsEditingDescription(false);
        toast({ title: 'Profile Updated', description: 'Your description has been saved.' });
    };

    const handleSaveProfile = async () => {
        if (!editName.trim() || !editUsername.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Name and Username are required.' });
            return;
        }

        setIsSavingProfile(true);

        try {
            if (editUsername.toLowerCase() !== designer?.username?.toLowerCase()) {
                const q = query(
                    collection(firestore, 'users'), 
                    where('username', '==', editUsername.toLowerCase()), 
                    limit(1)
                );
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    toast({ 
                        variant: 'destructive', 
                        title: 'Username Taken', 
                        description: 'This username is already claimed by another designer.' 
                    });
                    setIsSavingProfile(false);
                    return;
                }
            }

            updateDocumentNonBlocking(designerRef, {
                name: editName,
                username: editUsername.toLowerCase(),
                lastActiveAt: serverTimestamp()
            });

            toast({ title: 'Success', description: 'Your profile has been updated.' });
            setIsEditProfileOpen(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update profile.' });
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleSignOut = () => {
        signOut(auth);
    };

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
                <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen text-slate-200">
            <div className="container mx-auto px-4 pb-12 max-w-6xl">
                {/* Profile Banner-style Header */}
                <div className="glass-card p-8 md:p-12 mb-12 flex flex-col md:flex-row gap-10 items-center md:items-start relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] pointer-events-none" />
                    
                    <div className="relative">
                        <div className="w-36 h-36 md:w-44 md:h-44 rounded-full p-1 bg-gradient-to-br from-amber-500/40 to-transparent shadow-2xl overflow-hidden relative group">
                            <Avatar className="w-full h-full border-4 border-black/40">
                                <AvatarImage src={designer?.profilePhotoUrl || user.photoURL || ''} className="object-cover" />
                                <AvatarFallback className="text-4xl bg-zinc-900 text-amber-500/50">
                                    {designer?.name?.charAt(0) || user.displayName?.charAt(0) || 'D'}
                                </AvatarFallback>
                            </Avatar>
                            <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera className="w-6 h-6 text-white" />
                                <input type="file" className="hidden" accept="image/*" />
                            </label>
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-6">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-1">
                                <h1 className="text-4xl md:text-5xl font-display font-light text-white tracking-tight">
                                    {designer?.name || user.displayName || 'Designer'}
                                </h1>
                                <p className="text-amber-500/80 font-medium tracking-wide">@{designer?.username || 'username'}</p>
                            </div>
                            
                            <div className="flex flex-wrap justify-center md:justify-end gap-3">
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-full px-6"
                                    onClick={() => setIsEditProfileOpen(true)}
                                >
                                    <UserPen className="w-4 h-4 mr-2" />
                                    Edit Profile
                                </Button>
                                <Button size="icon" variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-full w-9 h-9">
                                    <Share2 className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={handleSignOut} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full w-9 h-9">
                                    <LogOut className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Stats Section */}
                        <div className="grid grid-cols-3 gap-6 md:gap-12 py-6 border-y border-white/5">
                            <div className="space-y-1">
                                <span className="block text-3xl font-brand text-white">{designer?.designsUploadedCount || 0}</span>
                                <span className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">Uploaded</span>
                            </div>
                            <div className="space-y-1">
                                <span className="block text-3xl font-brand text-white">{designer?.salesCount || 0}</span>
                                <span className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">Total Sales</span>
                            </div>
                            <div className="space-y-1">
                                <span className="block text-3xl font-brand gold-gradient">₹{designer?.totalRevenue || 0}</span>
                                <span className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">Revenue</span>
                            </div>
                        </div>

                        {/* Bio Section */}
                        <div className="max-w-2xl text-white/60 leading-relaxed text-sm group relative">
                            {isEditingDescription ? (
                                <div className="space-y-3 mt-4">
                                    <Textarea 
                                        value={tempDescription} 
                                        onChange={(e) => setTempDescription(e.target.value)}
                                        className="bg-black/40 border-white/10 text-white min-h-[100px] focus:border-amber-500/50"
                                        placeholder="Write about your design style..."
                                    />
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={handleUpdateDescription} className="bg-amber-600 hover:bg-amber-500 text-white">
                                            <Check className="w-4 h-4 mr-1" /> Save
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => setIsEditingDescription(false)} className="text-white/60">
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-4">
                                    <p className="italic font-tagline text-base leading-relaxed">
                                        "{designer?.description || 'No description yet. Add a few words about your creative style.'}"
                                    </p>
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        onClick={() => setIsEditingDescription(true)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-white/40 hover:text-white"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Designs Navigation & Upload */}
                <Tabs defaultValue="designs" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                        <TabsList className="bg-white/5 border border-white/10 p-1 h-12 rounded-full px-2">
                            {['designs', 'approved', 'pending'].map((tab) => (
                                <TabsTrigger
                                    key={tab}
                                    value={tab}
                                    className={cn(
                                        "rounded-full px-8 py-2 text-[10px] uppercase tracking-widest font-bold transition-all",
                                        "data-[state=active]:bg-amber-500 data-[state=active]:text-black"
                                    )}
                                >
                                    {tab === 'designs' ? 'All Portfolio' : tab}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        
                        <Button 
                            onClick={() => setIsUploadOpen(true)}
                            className="bg-white/10 hover:bg-amber-500 hover:text-black border border-white/10 text-white rounded-full px-8 h-12 transition-all duration-300 font-bold uppercase text-[10px] tracking-widest"
                        >
                            <UploadCloud className="w-4 h-4 mr-2" />
                            New Design
                        </Button>
                    </div>

                    <TabsContent value={activeTab} className="mt-0 outline-none">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {/* Empty State / Prompt */}
                            {filteredDesigns.length === 0 && !isDesignsLoading && (
                                <div
                                    onClick={() => setIsUploadOpen(true)}
                                    className="aspect-square rounded-3xl border-2 border-dashed border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-amber-500/30 transition-all cursor-pointer flex flex-col items-center justify-center group"
                                >
                                    <div className="w-20 h-20 rounded-full bg-white/5 group-hover:bg-amber-500/10 flex items-center justify-center mb-6 transition-all">
                                        <UploadCloud className="w-10 h-10 text-white/20 group-hover:text-amber-500" />
                                    </div>
                                    <h3 className="font-display text-xl text-white/40 group-hover:text-white mb-2">Build Your Studio</h3>
                                    <p className="text-[10px] uppercase tracking-widest text-white/20">Click to upload your first design</p>
                                </div>
                            )}

                            {isDesignsLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="aspect-square rounded-3xl bg-white/[0.02] animate-pulse" />
                                ))
                            ) : (
                                filteredDesigns.map((design) => (
                                    <div key={design.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <DesignCard
                                            design={design as any}
                                            onDelete={() => {}} 
                                            onView={() => {}}
                                            onReupload={() => {}}
                                        />
                                    </div>
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

            {/* Edit Profile Modal */}
            <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                <DialogContent className="sm:max-w-[425px] bg-[#0F1419]/90 backdrop-blur-3xl border-amber-500/20 text-white rounded-2xl shadow-2xl overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-transparent pointer-events-none" />
                    
                    <DialogHeader className="relative z-10 pb-4 border-b border-white/5">
                        <DialogTitle className="font-display text-3xl font-light tracking-tight">Edit Profile</DialogTitle>
                    </DialogHeader>

                    <div className="relative z-10 grid gap-8 py-8">
                        <div className="grid gap-3">
                            <Label htmlFor="name" className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">Full Name</Label>
                            <div className="relative flex items-center">
                                <Input 
                                    id="name" 
                                    value={editName} 
                                    onChange={(e) => setEditName(e.target.value)} 
                                    disabled={!isEditingName}
                                    className={cn(
                                        "bg-white/5 border-white/10 text-white h-12 focus:border-amber-500/50 rounded-lg pr-12 transition-all",
                                        !isEditingName && "opacity-50 cursor-not-allowed border-transparent"
                                    )}
                                />
                                {!isEditingName && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="absolute right-2 text-amber-500/60 hover:text-amber-500 h-8 hover:bg-transparent transition-colors"
                                        onClick={() => setIsEditingName(true)}
                                    >
                                        Edit
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="username" className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">Designer Handle</Label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-white/20 font-medium">@</span>
                                <Input 
                                    id="username" 
                                    value={editUsername} 
                                    onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))} 
                                    disabled={!isEditingUsername}
                                    className={cn(
                                        "bg-white/5 border-white/10 text-white h-12 focus:border-amber-500/50 rounded-lg pl-9 pr-12 transition-all",
                                        !isEditingUsername && "opacity-50 cursor-not-allowed border-transparent"
                                    )}
                                />
                                {!isEditingUsername && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="absolute right-2 text-amber-500/60 hover:text-amber-500 h-8 hover:bg-transparent transition-colors"
                                        onClick={() => setIsEditingUsername(true)}
                                    >
                                        Edit
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 space-y-4">
                            <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 block">Studio Access Info</Label>
                            <div className="flex items-center justify-between text-[11px] text-white/40 bg-white/[0.02] p-3 rounded-lg border border-white/5">
                                <span className="flex items-center gap-2 font-medium tracking-wide"><Mail className="w-3 h-3 text-amber-500/40" /> EMAIL</span>
                                <span className="font-mono text-white/30">{designer?.email || user?.email || '—'}</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="relative z-10 sm:justify-center">
                        <Button 
                            type="submit" 
                            onClick={handleSaveProfile} 
                            disabled={isSavingProfile || (!isEditingName && !isEditingUsername)}
                            className="bg-amber-500 hover:bg-amber-400 text-black font-bold w-full h-12 rounded-lg transition-all duration-300 shadow-lg shadow-black/40 disabled:bg-white/5 disabled:text-white/20"
                        >
                            {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Profile Update'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}