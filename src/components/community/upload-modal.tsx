'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useFirestore, useStorage, addDocumentNonBlocking, setDocumentNonBlocking, useFirebase } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, doc, serverTimestamp, increment } from 'firebase/firestore';
import { Loader2, Sparkles, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const uploadSchema = z.object({
    name: z.string().min(3, 'Give your creation a title (min 3 chars)'),
    description: z.string().min(10, 'Share the story or style of your design (min 10 chars)'),
    file: z.any().refine((files) => files?.length === 1, 'Artwork is required'),
});

interface UploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
}

export function UploadModal({ open, onOpenChange, userId }: UploadModalProps) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const storage = useStorage();
    const { user } = useFirebase();
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<z.infer<typeof uploadSchema>>({
        resolver: zodResolver(uploadSchema),
        defaultValues: {
            name: '',
            description: '',
            file: null,
        },
    });

    const onSubmit = async (values: z.infer<typeof uploadSchema>) => {
        try {
            setIsUploading(true);
            const file = values.file[0];
            const storagePath = `designs/${userId}/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, storagePath);

            // 1. Upload image
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // 2. Save design data
            const designData = {
                name: values.name,
                description: values.description,
                imageUrl: downloadURL,
                status: 'pending',
                isActive: true,
                salesCount: 0,
                profit: 0,
                uploadedAt: serverTimestamp(),
                userId: userId,
                authorName: user?.displayName || 'Designer'
            };

            // Save to Designer's Sub-collection
            const designsSubRef = collection(firestore, 'users', userId, 'designs');
            addDocumentNonBlocking(designsSubRef, designData);

            // Add to global collection for Admin moderation
            const globalDesignsRef = collection(firestore, 'community_designs');
            addDocumentNonBlocking(globalDesignsRef, designData);

            // 3. Update Aggregate Count in Profile
            const profileRef = doc(firestore, 'users', userId);
            setDocumentNonBlocking(profileRef, {
                designsUploadedCount: increment(1),
                lastActiveAt: serverTimestamp()
            }, { merge: true });

            toast({
                title: 'Creation Uploaded',
                description: 'Your design has been added to the studio and is currently in review.',
            });

            onOpenChange(false);
            form.reset();
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                variant: 'destructive',
                title: 'Studio Connection Failed',
                description: 'Could not upload your design. Please check your connection and try again.',
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] bg-[#0F1419]/90 backdrop-blur-3xl border border-amber-500/20 text-white rounded-2xl shadow-2xl overflow-hidden p-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-transparent pointer-events-none" />
                
                <div className="p-8 relative z-10 space-y-6">
                    <DialogHeader className="space-y-2 text-center">
                        <DialogTitle className="font-display text-2xl font-light tracking-tight flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-500/60" />
                            Upload Creation
                        </DialogTitle>
                        <DialogDescription className="text-white/40 font-tagline italic text-sm">
                            Showcase your artistic vision to the community.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-bold">Design Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Celestial Voyager" {...field} className="bg-white/5 border-white/10 text-white focus:border-amber-500/50 h-11 rounded-lg transition-all" />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-bold">The Story Behind the Art</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="Describe your style, inspiration, or the meaning behind this design..." 
                                                {...field} 
                                                className="bg-white/5 border-white/10 text-white min-h-[100px] focus:border-amber-500/50 rounded-lg resize-none text-xs leading-relaxed" 
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="file"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                        <FormLabel className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-bold">Artwork Source</FormLabel>
                                        <FormControl>
                                            <div className="relative group/upload">
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => onChange(e.target.files)}
                                                    className="bg-white/5 border-white/10 text-white h-11 rounded-lg file:bg-amber-500/10 file:text-amber-500 file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-4 file:text-xs file:font-bold file:uppercase file:tracking-widest cursor-pointer hover:border-amber-500/30 transition-all"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <div className="pt-4">
                                <Button 
                                    type="submit" 
                                    className="w-full h-12 bg-amber-500/80 hover:bg-amber-500 text-black font-bold tracking-widest rounded-lg transition-all shadow-lg shadow-black/40 disabled:opacity-50" 
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            SECURIING IN STUDIO...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            FINALIZE UPLOAD
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
