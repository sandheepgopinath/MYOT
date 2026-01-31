'use client';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export type TShirt = {
  id: string;
  typeId: string;
  gsmId: string;
  colorId: string;
  price: number;
  typeName: string;
  gsmValue: number;
  colorName: string;
  colorHex: string;
};

export const columns = ({
  onEdit,
}: {
  onEdit: (tshirt: TShirt) => void;
}): ColumnDef<TShirt>[] => {
  const firestore = useFirestore();

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this T-shirt?')) {
      deleteDoc(doc(firestore, 'tshirts', id));
    }
  };

  return [
    {
      accessorKey: 'typeName',
      header: 'Type',
    },
    {
      accessorKey: 'gsmValue',
      header: 'GSM',
    },
    {
      accessorKey: 'colorName',
      header: 'Color',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded-full border"
            style={{ backgroundColor: row.original.colorHex }}
          ></div>
          <span>{row.original.colorName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('price'));
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);

        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const tshirt = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(tshirt)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(tshirt.id)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
