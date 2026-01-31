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

export type TShirtColor = {
  id: string;
  name: string;
  hexCode: string;
};

export const columns = ({
  onEdit,
}: {
  onEdit: (color: TShirtColor) => void;
}): ColumnDef<TShirtColor>[] => {
  const firestore = useFirestore();

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this color?')) {
      deleteDoc(doc(firestore, 'tshirt_colors', id));
    }
  };

  return [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'hexCode',
      header: 'Hex Code',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded-full border"
            style={{ backgroundColor: row.original.hexCode }}
          ></div>
          <span>{row.original.hexCode}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const color = row.original;
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
              <DropdownMenuItem onClick={() => onEdit(color)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(color.id)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
