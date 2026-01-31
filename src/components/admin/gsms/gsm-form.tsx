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

const gsmSchema = z.object({
  gsm: z.coerce.number().min(1, 'GSM value is required'),
});

type GsmFormValues = z.infer<typeof gsmSchema>;

interface GsmFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  initialData?: any;
}

export default function GsmForm({
  isOpen,
  setIsOpen,
  initialData,
}: GsmFormProps) {
  const firestore = useFirestore();
  const form = useForm<GsmFormValues>({
    resolver: zodResolver(gsmSchema),
    defaultValues: initialData || { gsm: 0 },
  });

  useEffect(() => {
    form.reset(initialData || { gsm: 0 });
  }, [initialData, form]);

  const onSubmit = (data: GsmFormValues) => {
    if (initialData) {
      updateDocumentNonBlocking(doc(firestore, 'tshirt_gsms', initialData.id), data);
    } else {
      addDocumentNonBlocking(collection(firestore, 'tshirt_gsms'), data);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Add'} T-Shirt GSM</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="gsm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GSM</FormLabel>
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
