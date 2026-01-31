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

export type TShirtGSM = {
  id: string;
  gsm: number;
};

export const columns = ({
  onEdit,
}: {
  onEdit: (gsm: TShirtGSM) => void;
}): ColumnDef<TShirtGSM>[] => {
  const firestore = useFirestore();

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this GSM?')) {
      deleteDoc(doc(firestore, 'tshirt_gsms', id));
    }
  };

  return [
    {
      accessorKey: 'gsm',
      header: 'GSM',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const gsm = row.original;
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
              <DropdownMenuItem onClick={() => onEdit(gsm)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(gsm.id)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
