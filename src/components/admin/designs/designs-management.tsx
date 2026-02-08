
'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, orderBy, query, collectionGroup, where, increment, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, ImageOff, Maximize2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function DesignsManagement() {
    const firestore = useFirestore();
    const [reviewDesign, setReviewDesign] = useState<any>(null);
    const [moderationComment, setModerationComment] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Query all designs from all user collections that are pending
    const designsRef = useMemoFirebase(
        () => query(
            collectionGroup(firestore, 'designs'), 
            where('status', '==', 'pending'),
            orderBy('uploadedAt', 'desc')
        ),
        [firestore]
    );

    const { data: designs, isLoading } = useCollection(designsRef);

    const handleModeration = async (status: 'approved' | 'not approved') => {
        if (!reviewDesign) return;
        
        setIsUpdating(true);
        try {
            const updateData = {
                status,
                moderationComment,
                moderatedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            // 1. Update source document in user's collection
            const userDesignRef = doc(firestore, 'users', reviewDesign.userId, 'designs', reviewDesign.id);
            updateDocumentNonBlocking(userDesignRef, updateData);

            // 2. Update global mirror
            const globalDesignRef = doc(firestore, 'community_designs', reviewDesign.id);
            updateDocumentNonBlocking(globalDesignRef, updateData);

            // 3. If approved, increment the designer's total approved count
            if (status === 'approved') {
                const userRef = doc(firestore, 'users', reviewDesign.userId);
                updateDocumentNonBlocking(userRef, {
                    designsApprovedCount: increment(1)
                });
            }

            setReviewDesign(null);
            setModerationComment('');
        } catch (error) {
            console.error("Moderation error:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white/50" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Design Moderation Queue</h2>
                    <p className="text-white/60">Review and moderate designs submitted to user collections.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {designs && designs.length > 0 ? (
                    designs.map((design: any) => (
                        <Card key={design.id} className="glass-card overflow-hidden border-white/10 bg-black/20 group flex flex-col">
                            <div className="relative aspect-square bg-zinc-900 flex-shrink-0">
                                {design.imageUrl ? (
                                    <img
                                        src={design.imageUrl}
                                        alt={design.name}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-2">
                                        <ImageOff className="h-10 w-10" />
                                        <span className="text-xs">No Image</span>
                                    </div>
                                )}
                                <div className="absolute top-2 left-2">
                                    <Badge variant="secondary" className="backdrop-blur-md bg-amber-500/20 text-amber-500 border-amber-500/30 uppercase text-[10px] tracking-widest font-bold">
                                        {design.status}
                                    </Badge>
                                </div>
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="border-white/20 text-white hover:bg-white/10"
                                        onClick={() => setReviewDesign(design)}
                                    >
                                        <Maximize2 className="h-4 w-4 mr-2" /> Review Design
                                    </Button>
                                </div>
                            </div>
                            <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-white truncate">{design.name}</h3>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                                        by {design.authorName || 'Unknown'}
                                    </p>
                                    <p className="text-[10px] text-white/30 italic">
                                        Uploaded {design.uploadedAt?.toDate ? format(design.uploadedAt.toDate(), 'MMM d, yyyy') : 'Recently'}
                                    </p>
                                </div>
                                
                                <Button 
                                    className="mt-auto w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest h-9"
                                    onClick={() => setReviewDesign(design)}
                                >
                                    Review
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center glass-card border-dashed border-white/10">
                        <p className="text-white/40 italic">Queue is empty. No pending designs found.</p>
                    </div>
                )}
            </div>

            {/* Moderation Review Modal */}
            <Dialog open={!!reviewDesign} onOpenChange={(open) => !open && setReviewDesign(null)}>
                <DialogContent className="max-w-3xl bg-zinc-950 border-white/10 text-white overflow-hidden p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="bg-black flex items-center justify-center p-6 border-r border-white/5">
                            {reviewDesign?.imageUrl ? (
                                <img 
                                    src={reviewDesign.imageUrl} 
                                    alt="Enlarged design" 
                                    className="max-w-full max-h-[70vh] object-contain shadow-2xl rounded-lg"
                                />
                            ) : (
                                <ImageOff className="h-20 w-20 text-white/10" />
                            )}
                        </div>
                        <div className="p-8 flex flex-col gap-6">
                            <DialogHeader>
                                <div className="space-y-1">
                                    <DialogTitle className="text-2xl font-display font-light text-white">{reviewDesign?.name}</DialogTitle>
                                    <p className="text-[10px] text-amber-500 uppercase tracking-[0.2em] font-bold">by {reviewDesign?.authorName}</p>
                                </div>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">The Story Behind the Art</Label>
                                    <p className="text-sm text-white/70 leading-relaxed italic bg-white/5 p-4 rounded-lg border border-white/5">
                                        "{reviewDesign?.description || 'No description provided.'}"
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest text-white/40 font-bold flex items-center gap-2">
                                        <MessageSquare className="h-3 w-3" /> Moderation Feedback
                                    </Label>
                                    <Textarea 
                                        placeholder="Add a comment explaining your decision..."
                                        className="bg-black border-white/10 text-white min-h-[100px] resize-none focus:border-amber-500/50"
                                        value={moderationComment}
                                        onChange={(e) => setModerationComment(e.target.value)}
                                    />
                                </div>
                            </div>

                            <DialogFooter className="mt-auto grid grid-cols-2 gap-4">
                                <Button 
                                    className="bg-red-600/20 hover:bg-red-600 border border-red-600/30 text-red-500 hover:text-white font-bold uppercase tracking-widest transition-all"
                                    onClick={() => handleModeration('not approved')}
                                    disabled={isUpdating}
                                >
                                    <XCircle className="mr-2 h-4 w-4" /> Deny
                                </Button>
                                <Button 
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-widest transition-all"
                                    onClick={() => handleModeration('approved')}
                                    disabled={isUpdating}
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                </Button>
                            </DialogFooter>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
