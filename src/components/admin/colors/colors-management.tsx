'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { columns } from './columns';
import { DataTable } from '../data-table/data-table';
import ColorForm from './color-form';

export default function ColorsManagement() {
  const [open, setOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const firestore = useFirestore();

  const colorsRef = useMemoFirebase(
    () => collection(firestore, 'tshirt_colors'),
    [firestore]
  );
  const { data: colors, isLoading } = useCollection(colorsRef);

  const handleEdit = (color: any) => {
    setSelectedColor(color);
    setOpen(true);
  };

  const handleAddNew = () => {
    setSelectedColor(null);
    setOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>T-Shirt Colors</CardTitle>
        <CardDescription>Manage your T-shirt colors.</CardDescription>
        <Button onClick={handleAddNew}>Add New</Button>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns({ onEdit: handleEdit })}
          data={colors || []}
        />
      </CardContent>
      <ColorForm
        isOpen={open}
        setIsOpen={setOpen}
        initialData={selectedColor}
      />
    </Card>
  );
}
