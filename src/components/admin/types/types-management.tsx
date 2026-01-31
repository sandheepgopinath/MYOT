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
import TypeForm from './type-form';

export default function TypesManagement() {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const firestore = useFirestore();

  const typesRef = useMemoFirebase(
    () => collection(firestore, 'tshirt_types'),
    [firestore]
  );
  const { data: types, isLoading } = useCollection(typesRef);

  const handleEdit = (type: any) => {
    setSelectedType(type);
    setOpen(true);
  };

  const handleAddNew = () => {
    setSelectedType(null);
    setOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>T-Shirt Types</CardTitle>
        <CardDescription>Manage your T-shirt types.</CardDescription>
        <Button onClick={handleAddNew}>Add New</Button>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns({ onEdit: handleEdit })}
          data={types || []}
        />
      </CardContent>
      <TypeForm
        isOpen={open}
        setIsOpen={setOpen}
        initialData={selectedType}
      />
    </Card>
  );
}
