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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

const tshirtSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  typeId: z.string().min(1, 'Type is required'),
  gsmId: z.string().min(1, 'GSM is required'),
  colorId: z.string().min(1, 'Color is required'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  isAvailable: z.boolean().default(true),
  imageUrl: z.string().optional(),
});

type TShirtFormValues = z.infer<typeof tshirtSchema>;

interface TShirtFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  initialData?: any;
  types: any[];
  gsms: any[];
  colors: any[];
}

export default function TShirtForm({
  isOpen,
  setIsOpen,
  initialData,
  types,
  gsms,
  colors,
}: TShirtFormProps) {
  const firestore = useFirestore();
  const storage = useStorage();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<TShirtFormValues>({
    resolver: zodResolver(tshirtSchema),
    defaultValues: {
      name: '',
      typeId: '',
      gsmId: '',
      colorId: '',
      price: 0,
      isAvailable: true,
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        typeId: initialData.typeId || '',
        gsmId: initialData.gsmId || '',
        colorId: initialData.colorId || '',
        price: initialData.price || 0,
        isAvailable: initialData.isAvailable !== undefined ? initialData.isAvailable : true,
        imageUrl: initialData.imageUrl || '',
      });
    } else {
      form.reset({
        name: '',
        typeId: '',
        gsmId: '',
        colorId: '',
        price: 0,
        isAvailable: true,
        imageUrl: '',
      });
    }
    setImageFile(null);
  }, [initialData, form, isOpen]); // Reset when dialog opens/closes or initialData changes

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: TShirtFormValues) => {
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
      console.error("Error saving t-shirt:", error);
      // Ideally show a toast notification here
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Add New'} T-Shirt</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="T-Shirt Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="typeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gsmId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GSM</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select GSM" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {gsms.map((gsm) => (
                          <SelectItem key={gsm.id} value={gsm.id}>
                            {gsm.gsm}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="colorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Color" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colors.map((color) => (
                          <SelectItem key={color.id} value={color.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: color.hexCode }}></div>
                              {color.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Product Image</FormLabel>
              <Input type="file" accept="image/*" onChange={handleImageChange} />
              {initialData?.imageUrl && !imageFile && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Current Image:</p>
                  <img src={initialData.imageUrl} alt="Current" className="h-20 w-20 object-cover rounded-md border" />
                </div>
              )}
            </FormItem>

            <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Available</FormLabel>
                    <FormDescription>
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

            <Button type="submit" disabled={uploading}>
              {uploading ? 'Saving...' : 'Save T-Shirt'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
