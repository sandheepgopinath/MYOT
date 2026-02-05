'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
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
import { useAuth, useFirestore, useStorage, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Loader2, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const uploadSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().optional(),
});

interface UploadModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UploadModal({ isOpen, onOpenChange }: UploadModalProps) {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const auth = useAuth();
    const firestore = useFirestore();
    const storage = useStorage();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof uploadSchema>>({
        resolver: zodResolver(uploadSchema),
        defaultValues: {
            name: '',
            description: '',
        },
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const onSubmit = async (values: z.infer<typeof uploadSchema>) => {
        if (!imageFile) {
            toast({
                variant: 'destructive',
                title: 'Image Required',
                description: 'Please select an image to upload.',
            });
            return;
        }

        if (!auth.currentUser) return;

        try {
            setIsUploading(true);

            // Upload Image
            const storageRef = ref(storage, `designs/${auth.currentUser.uid}/${Date.now()}_${imageFile.name}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Create Document
            await addDocumentNonBlocking(collection(firestore, 'community_designs'), {
                userId: auth.currentUser.uid,
                name: values.name,
                description: values.description,
                imageUrl: downloadURL,
                status: 'pending',
                sales: 0,
                views: 0,
                createdAt: serverTimestamp(),
                authorName: auth.currentUser.displayName || 'Anonymous',
            });

            toast({
                title: 'Design Uploaded!',
                description: 'Your design has been submitted for approval.',
            });

            form.reset();
            setImageFile(null);
            onOpenChange(false);

        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Upload Failed',
                description: 'Something went wrong. Please try again.',
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-zinc-900 border-white/20">
                <DialogHeader>
                    <DialogTitle>Upload New Design</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <FormLabel className="text-white">Design Image</FormLabel>
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-white/5 border-white/20 hover:border-white/40 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {imageFile ? (
                                            <p className="text-sm text-green-400 font-medium truncate max-w-[200px]">{imageFile.name}</p>
                                        ) : (
                                            <>
                                                <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                                <p className="text-xs text-muted-foreground">Click to upload image</p>
                                            </>
                                        )}
                                    </div>
                                    <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Design Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Cool T-Shirt Design" {...field} className="input-glass" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Tell us about your design..." {...field} className="input-glass" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={isUploading}>
                            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isUploading ? 'Uploading...' : 'Submit Design'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
