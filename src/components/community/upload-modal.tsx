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
import { useFirestore } from '@/firebase'; // Assuming useFirebaseStorage or I'll access storage directly from init
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/firebase'; // Make sure this import is correct
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
    const { storage } = initializeFirebase(); // Get storage instance
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<z.infer<typeof uploadSchema>>({
        resolver: zodResolver(uploadSchema),
    });

    const onSubmit = async (values: z.infer<typeof uploadSchema>) => {
        try {
            setIsUploading(true);
            const file = values.file[0];
            const storageRef = ref(storage, `designs/${userId}/${Date.now()}_${file.name}`);

            // Upload image
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Save to Firestore
            await addDoc(collection(firestore, 'designs'), {
                userId,
                name: values.name,
                imageUrl: downloadURL,
                status: 'pending', // Default status
                sales: 0,
                createdAt: serverTimestamp(),
            });

            toast({
                title: 'Design Uploaded',
                description: 'Your design has been submitted successfully.',
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload New Design</DialogTitle>
                    <DialogDescription>
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
                                        <Input placeholder="Cool T-Shirt" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="file"
                            render={({ field: { onChange, value, ...field } }) => (
                                <FormItem>
                                    <FormLabel>Design Image</FormLabel>
                                    <FormControl>
                                        <div className="grid w-full max-w-sm items-center gap-1.5">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => onChange(e.target.files)}
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={isUploading}>
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
