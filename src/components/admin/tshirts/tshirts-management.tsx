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
import TShirtForm from './tshirt-form';

export default function TShirtsManagement() {
  const [open, setOpen] = useState(false);
  const [selectedTShirt, setSelectedTShirt] = useState(null);
  const firestore = useFirestore();

  const tshirtsRef = useMemoFirebase(
    () => collection(firestore, 'tshirts'),
    [firestore]
  );
  const typesRef = useMemoFirebase(
    () => collection(firestore, 'tshirt_types'),
    [firestore]
  );
  const gsmsRef = useMemoFirebase(
    () => collection(firestore, 'tshirt_gsms'),
    [firestore]
  );
  const colorsRef = useMemoFirebase(
    () => collection(firestore, 'tshirt_colors'),
    [firestore]
  );

  const { data: tshirts, isLoading: tshirtsLoading } = useCollection(tshirtsRef);
  const { data: types, isLoading: typesLoading } = useCollection(typesRef);
  const { data: gsms, isLoading: gsmsLoading } = useCollection(gsmsRef);
  const { data: colors, isLoading: colorsLoading } = useCollection(colorsRef);

  const isLoading =
    tshirtsLoading || typesLoading || gsmsLoading || colorsLoading;

  const handleEdit = (tshirt: any) => {
    setSelectedTShirt(tshirt);
    setOpen(true);
  };

  const handleAddNew = () => {
    setSelectedTShirt(null);
    setOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;

  const tableData = tshirts?.map(tshirt => {
    const type = types?.find(t => t.id === tshirt.typeId);
    const gsm = gsms?.find(g => g.id === tshirt.gsmId);
    const color = colors?.find(c => c.id === tshirt.colorId);
    return {
      ...tshirt,
      typeName: type?.name,
      gsmValue: gsm?.gsm,
      colorName: color?.name,
      colorHex: color?.hexCode,
      isAvailable: tshirt.isAvailable,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>T-Shirts</CardTitle>
        <CardDescription>Manage your T-shirts.</CardDescription>
        <Button onClick={handleAddNew}>Add New</Button>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns({ onEdit: handleEdit })}
          data={tableData || []}
        />
      </CardContent>
      <TShirtForm
        isOpen={open}
        setIsOpen={setOpen}
        initialData={selectedTShirt}
        types={types || []}
        gsms={gsms || []}
        colors={colors || []}
      />
    </Card>
  );
}
