'use client';
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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    addDocumentNonBlocking,
    updateDocumentNonBlocking,
    useFirestore,
    useStorage,
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const itemSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.string().min(1, 'Type is required'),
    gsm: z.string().min(1, 'GSM is required'),
    color: z.string().min(1, 'Color is required'),
    price: z.coerce.number().min(0, 'Price must be a positive number'),
    isAvailable: z.boolean().default(true),
    imageUrl: z.string().optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

interface ItemFormProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    initialData?: any;
}

export default function ItemForm({
    isOpen,
    setIsOpen,
    initialData,
}: ItemFormProps) {
    const firestore = useFirestore();
    const storage = useStorage();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const form = useForm<ItemFormValues>({
        resolver: zodResolver(itemSchema),
        defaultValues: {
            name: '',
            type: '',
            gsm: '',
            color: '',
            price: 0,
            isAvailable: true,
            imageUrl: '',
        },
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                name: initialData.name || '',
                type: initialData.type || '',
                gsm: initialData.gsm || '',
                color: initialData.color || '',
                price: initialData.price || 0,
                isAvailable: initialData.isAvailable !== undefined ? initialData.isAvailable : true,
                imageUrl: initialData.imageUrl || '',
            });
        } else {
            form.reset({
                name: '',
                type: '',
                gsm: '',
                color: '',
                price: 0,
                isAvailable: true,
                imageUrl: '',
            });
        }
        setImageFile(null);
    }, [initialData, form, isOpen]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const onSubmit = async (data: ItemFormValues) => {
        try {
            setUploading(true);
            let downloadURL = data.imageUrl;

            if (imageFile) {
                const storageRef = ref(storage, `tshirts/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                downloadURL = await getDownloadURL(snapshot.ref);
            }

            const finalData = {
                ...data,
                imageUrl: downloadURL,
            };

            if (initialData) {
                updateDocumentNonBlocking(doc(firestore, 'tshirts', initialData.id), finalData);
            } else {
                addDocumentNonBlocking(collection(firestore, 'tshirts'), finalData);
            }
            setIsOpen(false);
        } catch (error) {
            console.error("Error saving item:", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-background/95 border-white/10 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-white">{initialData ? 'Edit' : 'Add New'} Item</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="T-Shirt Name" {...field} className="input-glass" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white">Type</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Regular" {...field} className="input-glass" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="gsm"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white">GSM</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 180" {...field} className="input-glass" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white">Color</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Black" {...field} className="input-glass" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white">Price</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} className="input-glass" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormItem>
                            <FormLabel className="text-white">Product Image</FormLabel>
                            <Input type="file" accept="image/*" onChange={handleImageChange} className="input-glass" />
                            {initialData?.imageUrl && !imageFile && (
                                <div className="mt-2 text-white">
                                    <p className="text-xs text-secondary-foreground mb-1">Current Image:</p>
                                    <img src={initialData.imageUrl} alt="Current" className="h-20 w-20 object-cover rounded-md border border-white/10" />
                                </div>
                            )}
                        </FormItem>

                        <FormField
                            control={form.control}
                            name="isAvailable"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-white">Available</FormLabel>
                                        <FormDescription className="text-white/70">
                                            Mark this product as available for purchase.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={uploading} className="w-full btn-login-glow mt-4">
                            {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {uploading ? 'Saving...' : 'Save Item'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
