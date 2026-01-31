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

const typeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type TypeFormValues = z.infer<typeof typeSchema>;

interface TypeFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  initialData?: any;
}

export default function TypeForm({
  isOpen,
  setIsOpen,
  initialData,
}: TypeFormProps) {
  const firestore = useFirestore();
  const form = useForm<TypeFormValues>({
    resolver: zodResolver(typeSchema),
    defaultValues: initialData || { name: '', description: '' },
  });

  useEffect(() => {
    form.reset(initialData || { name: '', description: '' });
  }, [initialData, form]);

  const onSubmit = (data: TypeFormValues) => {
    if (initialData) {
      updateDocumentNonBlocking(doc(firestore, 'tshirt_types', initialData.id), data);
    } else {
      addDocumentNonBlocking(collection(firestore, 'tshirt_types'), data);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Add'} T-Shirt Type</DialogTitle>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
