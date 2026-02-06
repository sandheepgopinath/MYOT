
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
import { Button } from '@/components/ui/button';
import { useFirestore, useStorage, addDocumentNonBlocking, setDocumentNonBlocking, useFirebase } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, doc, serverTimestamp, increment } from 'firebase/firestore';
import { Loader2, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const uploadSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    file: z.any().refine((files) => files?.length === 1, 'Image is required'),
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

            // 2. Save to Designer's Sub-collection
            const designData = {
                name: values.name,
                imageUrl: downloadURL,
                status: 'pending',
                isActive: true,
                salesCount: 0,
                profit: 0,
                uploadedAt: serverTimestamp(),
                userId: userId, // For easy filtering/moderation
                authorName: user?.displayName || 'Designer'
            };

            const designsSubRef = collection(firestore, 'users', userId, 'designs');
            addDocumentNonBlocking(designsSubRef, designData);

            // Also add to global collection for Admin moderation
            const globalDesignsRef = collection(firestore, 'community_designs');
            addDocumentNonBlocking(globalDesignsRef, designData);

            // 3. Update Aggregate Count in Profile
            // Using setDocumentNonBlocking with merge: true is safer if the profile document is missing
            const profileRef = doc(firestore, 'users', userId);
            setDocumentNonBlocking(profileRef, {
                designsUploadedCount: increment(1),
                lastActiveAt: serverTimestamp()
            }, { merge: true });

            toast({
                title: 'Design Uploaded',
                description: 'Your design has been added to your profile and is pending review.',
            });

            onOpenChange(false);
            form.reset();
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                variant: 'destructive',
                title: 'Upload Failed',
                description: 'Could not upload your design. Please try again.',
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle>Upload New Design</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Share your creativity with the community.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Design Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Cool T-Shirt" {...field} className="bg-slate-800 border-slate-700" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="file"
                            render={({ field: { onChange, ...field } }) => (
                                <FormItem>
                                    <FormLabel>Design Image</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => onChange(e.target.files)}
                                            className="bg-slate-800 border-slate-700"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500" disabled={isUploading}>
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    Upload Design
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
