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
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  useFirestore,
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useEffect } from 'react';

const colorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  hexCode: z
    .string()
    .min(1, 'Hex code is required')
    .regex(/^#([0-9a-f]{3}){1,2}$/i, 'Must be a valid hex code'),
});

type ColorFormValues = z.infer<typeof colorSchema>;

interface ColorFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  initialData?: any;
}

export default function ColorForm({
  isOpen,
  setIsOpen,
  initialData,
}: ColorFormProps) {
  const firestore = useFirestore();
  const form = useForm<ColorFormValues>({
    resolver: zodResolver(colorSchema),
    defaultValues: initialData || { name: '', hexCode: '' },
  });

  useEffect(() => {
    form.reset(initialData || { name: '', hexCode: '' });
  }, [initialData, form]);

  const onSubmit = (data: ColorFormValues) => {
    if (initialData) {
      updateDocumentNonBlocking(
        doc(firestore, 'tshirt_colors', initialData.id),
        data
      );
    } else {
      addDocumentNonBlocking(collection(firestore, 'tshirt_colors'), data);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Add'} T-Shirt Color</DialogTitle>
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hexCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hex Code</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        className="w-12 h-10 p-1"
                        {...field}
                      />
                      <Input {...field} />
                    </div>
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
