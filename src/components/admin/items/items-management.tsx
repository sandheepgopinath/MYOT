'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, orderBy, query } from 'firebase/firestore';
import { columns } from './columns';
import { DataTable } from '../data-table/data-table';
import ItemForm from './item-form';
import { Plus } from 'lucide-react';
import { deleteDocumentNonBlocking } from '@/firebase';

export default function ItemsManagement() {
    const [open, setOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const firestore = useFirestore();

    const itemsRef = useMemoFirebase(
        () => query(collection(firestore, 'tshirts'), orderBy('name')),
        [firestore]
    );

    const { data: items, isLoading } = useCollection(itemsRef);

    const handleEdit = (item: any) => {
        setSelectedItem(item);
        setOpen(true);
    };

    const handleDelete = (item: any) => {
        if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
            deleteDocumentNonBlocking(doc(firestore, 'tshirts', item.id));
        }
    };

    const handleAddNew = () => {
        setSelectedItem(null);
        setOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex h-[200px] w-full items-center justify-center text-white/50">
                Loading items...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Inventory</h2>
                    <p className="text-white/60">Manage your T-Shirts and products.</p>
                </div>
                <Button onClick={handleAddNew} className="btn-login-glow gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20">
                    <Plus className="h-4 w-4" /> Add New Item
                </Button>
            </div>

            <Card className="glass-card border-white/10 bg-black/20">
                <CardContent className="p-0">
                    <DataTable
                        columns={columns({ onEdit: handleEdit, onDelete: handleDelete })}
                        data={items || []}
                        getRowCanExpand={(row) => !!(row.original as any).variants?.length}
                        renderSubComponent={({ row }) => {
                            const variants = (row.original as any).variants;
                            return (
                                <div className="p-4 grid grid-cols-1 gap-2">
                                    <h4 className="text-sm font-semibold text-white mb-2">Variant Details</h4>
                                    <div className="grid grid-cols-4 gap-4 text-xs font-semibold text-white/50 border-b border-white/10 pb-2">
                                        <div>GSM</div>
                                        <div>Color</div>
                                        <div>Price</div>
                                        <div>Status</div>
                                    </div>
                                    {variants.map((v: any, i: number) => (
                                        <div key={i} className="grid grid-cols-4 gap-4 text-sm text-white border-b border-white/5 last:border-0 py-2">
                                            <div>{v.gsm}</div>
                                            <div>{v.color}</div>
                                            <div>₹{v.price}</div>
                                            <div className={v.isAvailable ? 'text-green-400' : 'text-red-400'}>
                                                {v.isAvailable ? 'Available' : 'Unavailable'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        }}
                    />
                </CardContent>
            </Card>

            <ItemForm
                isOpen={open}
                setIsOpen={setOpen}
                initialData={selectedItem}
            />
        </div>
    );
}
