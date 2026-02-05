'use client';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const variantSchema = z.object({
    id: z.string(),
    gsm: z.string().min(1, 'GSM is required'),
    color: z.string().min(1, 'Color is required'),
    price: z.coerce.number().min(0, 'Price > 0'),
    isAvailable: z.boolean().default(true),
});

const itemSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.string().min(1, 'Type is required'),
    imageUrl: z.string().optional(),
    variants: z.array(variantSchema),
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
            imageUrl: '',
            variants: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "variants",
    });

    useEffect(() => {
        if (initialData) {
            // Migrate legacy data to variants structure if needed
            let variants = initialData.variants || [];
            if (!variants.length && initialData.gsm) {
                variants = [{
                    id: uuidv4(),
                    gsm: initialData.gsm,
                    color: initialData.color,
                    price: initialData.price,
                    isAvailable: initialData.isAvailable ?? true,
                }]
            }

            form.reset({
                name: initialData.name || '',
                type: initialData.type || '',
                imageUrl: initialData.imageUrl || '',
                variants: variants,
            });
        } else {
            form.reset({
                name: '',
                type: '',
                imageUrl: '',
                variants: [{ id: uuidv4(), gsm: '', color: '', price: 0, isAvailable: true }],
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

            const finalData: any = {
                ...data,
                imageUrl: downloadURL,
            };

            if (initialData?.id) {
                finalData.id = initialData.id;
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-white/20 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-white">{initialData ? 'Edit' : 'Add New'} Product</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Global Product Details */}
                        <div className="space-y-4 border-b border-white/10 pb-4">
                            <h3 className="text-white font-semibold">Product Details</h3>
                            <div className="grid grid-cols-2 gap-4">
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
                        </div>

                        {/* Variants Management */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-white font-semibold">Variants</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ id: uuidv4(), gsm: '', color: '', price: 0, isAvailable: true })}
                                    className="text-xs"
                                >
                                    <Plus className="h-3 w-3 mr-1" /> Add Variant
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-10 gap-2 items-end p-3 rounded-md bg-white/5 border border-white/10">
                                        <FormField
                                            control={form.control}
                                            name={`variants.${index}.gsm`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-2">
                                                    <FormLabel className="text-xs text-white/70">GSM</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="180" {...field} className="input-glass h-8 text-sm" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`variants.${index}.color`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-3">
                                                    <FormLabel className="text-xs text-white/70">Color</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Color" {...field} className="input-glass h-8 text-sm" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`variants.${index}.price`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-2">
                                                    <FormLabel className="text-xs text-white/70">Price</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} className="input-glass h-8 text-sm" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`variants.${index}.isAvailable`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-2 flex flex-col justify-center items-center">
                                                    <FormLabel className="text-xs text-white/70 mb-2">Avail.</FormLabel>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            className="scale-75"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <div className="col-span-1 flex justify-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => remove(index)}
                                                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button type="submit" disabled={uploading} className="w-full btn-login-glow mt-4">
                            {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {uploading ? 'Saving Product...' : 'Save Product'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
