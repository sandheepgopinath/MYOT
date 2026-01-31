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
import GsmForm from './gsm-form';

export default function GsmsManagement() {
  const [open, setOpen] = useState(false);
  const [selectedGsm, setSelectedGsm] = useState(null);
  const firestore = useFirestore();

  const gsmsRef = useMemoFirebase(
    () => collection(firestore, 'tshirt_gsms'),
    [firestore]
  );
  const { data: gsms, isLoading } = useCollection(gsmsRef);

  const handleEdit = (gsm: any) => {
    setSelectedGsm(gsm);
    setOpen(true);
  };

  const handleAddNew = () => {
    setSelectedGsm(null);
    setOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>T-Shirt GSMs</CardTitle>
        <CardDescription>Manage your T-shirt GSM values.</CardDescription>
        <Button onClick={handleAddNew}>Add New</Button>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns({ onEdit: handleEdit })}
          data={gsms || []}
        />
      </CardContent>
      <GsmForm
        isOpen={open}
        setIsOpen={setOpen}
        initialData={selectedGsm}
      />
    </Card>
  );
}
