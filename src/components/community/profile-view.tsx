'use client';

import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Share2, Loader2, UploadCloud, Check, X, Pencil, UserPen, Mail, Phone, Lock, ShieldCheck } from 'lucide-react';
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

    // Pre-fill modal fields when modal opens or designer data changes
    useEffect(() => {
        if (designer) {
            setTempDescription(designer.description || '');
            // Always sync Name and Username to the modal state when it's open
            if (isEditProfileOpen) {
                setEditName(designer.name || '');
                setEditUsername(designer.username || '');
            }
        }
    }, [designer, isEditProfileOpen]);

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
            // Check uniqueness if username changed
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
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1116] text-slate-200 font-sans">
            <div className="container mx-auto px-4 pb-8 max-w-7xl">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row gap-8 mb-16 items-start pt-0">
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
                                <p className="text-slate-400 font-medium">@{designer?.username || 'username'}</p>
                            </div>
                            <div className="flex gap-3">
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
                                    onClick={() => setIsEditProfileOpen(true)}
                                >
                                    <UserPen className="w-4 h-4 mr-2" />
                                    Edit Profile
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
                                    <p className="flex-1">{designer?.description || 'No description yet. Click the pencil to add one.'}</p>
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        onClick={() => setIsEditingDescription(true)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
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
                                <p className="text-xs text-slate-500 text-center px-6">Drag and drop high-res PNG or PSD mockups</p>
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

            {/* Edit Profile Modal */}
            <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        {/* Name Field */}
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-sm font-medium leading-none text-white flex items-center justify-between">
                                <span className="flex items-center gap-2"><UserPen className="w-3 h-3" /> Full Name</span>
                                {!isEditingName && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 px-2 text-[10px] text-blue-400 hover:text-blue-400 hover:bg-transparent flex items-center gap-1"
                                        onClick={() => setIsEditingName(true)}
                                    >
                                        <Pencil className="w-3 h-3" /> Edit
                                    </Button>
                                )}
                            </Label>
                            <div className="relative">
                                <Input 
                                    id="name" 
                                    value={editName} 
                                    onChange={(e) => setEditName(e.target.value)} 
                                    disabled={!isEditingName}
                                    className={cn(
                                        "bg-slate-800 border-slate-700 text-white pr-10 focus:ring-blue-500",
                                        !isEditingName && "opacity-60 cursor-not-allowed select-none"
                                    )}
                                    placeholder="Your Name"
                                />
                                {!isEditingName && <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />}
                            </div>
                        </div>

                        {/* Username Field */}
                        <div className="grid gap-2">
                            <Label htmlFor="username" className="text-sm font-medium leading-none text-white flex items-center justify-between">
                                <span className="flex items-center gap-2">@ Username</span>
                                {!isEditingUsername && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 px-2 text-[10px] text-blue-400 hover:text-blue-400 hover:bg-transparent flex items-center gap-1"
                                        onClick={() => setIsEditingUsername(true)}
                                    >
                                        <Pencil className="w-3 h-3" /> Edit
                                    </Button>
                                )}
                            </Label>
                            <div className="relative">
                                <Input 
                                    id="username" 
                                    value={editUsername} 
                                    onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))} 
                                    disabled={!isEditingUsername}
                                    className={cn(
                                        "bg-slate-800 border-slate-700 text-white pr-10 focus:ring-blue-500",
                                        !isEditingUsername && "opacity-60 cursor-not-allowed select-none"
                                    )}
                                    placeholder="unique_username"
                                />
                                {!isEditingUsername && <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />}
                            </div>
                            <p className="text-[10px] text-slate-500">Only letters, numbers, and underscores.</p>
                        </div>

                        {/* Read-Only Contact Info */}
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium leading-none text-white flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3" /> Registered Contact
                            </Label>
                            <div className="relative">
                                <Input 
                                    value={designer?.email || designer?.phone || user?.email || user?.phoneNumber || 'Not available'} 
                                    readOnly
                                    className="bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed pl-10"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                    {(designer?.email || user?.email) ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                                </div>
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                            </div>
                            <p className="text-[10px] text-slate-600">This cannot be changed manually.</p>
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button 
                            type="submit" 
                            onClick={handleSaveProfile} 
                            disabled={isSavingProfile || (!isEditingName && !isEditingUsername)}
                            className="bg-blue-600 hover:bg-blue-500 w-full sm:w-auto"
                        >
                            {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}