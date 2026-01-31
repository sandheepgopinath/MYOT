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
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  useFirestore,
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useEffect } from 'react';

const tshirtSchema = z.object({
  typeId: z.string().min(1, 'Type is required'),
  gsmId: z.string().min(1, 'GSM is required'),
  colorId: z.string().min(1, 'Color is required'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
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
  const form = useForm<TShirtFormValues>({
    resolver: zodResolver(tshirtSchema),
    defaultValues: initialData || {
      typeId: '',
      gsmId: '',
      colorId: '',
      price: 0,
    },
  });

  useEffect(() => {
    form.reset(
      initialData || { typeId: '', gsmId: '', colorId: '', price: 0 }
    );
  }, [initialData, form]);

  const onSubmit = (data: TShirtFormValues) => {
    if (initialData) {
      updateDocumentNonBlocking(doc(firestore, 'tshirts', initialData.id), data);
    } else {
      addDocumentNonBlocking(collection(firestore, 'tshirts'), data);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Add'} T-Shirt</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="typeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
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
            <FormField
              control={form.control}
              name="gsmId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GSM</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a GSM" />
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
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color.id} value={color.id}>
                          {color.name}
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
            <Button type="submit">Save</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
