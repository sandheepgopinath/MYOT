'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, MoreHorizontal, Trash } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type Item = {
    id: string;
    name: string;
    type: string;
    gsm: string;
    color: string;
    price: number;
    imageUrl?: string;
    isAvailable: boolean;
};

interface ColumnsProps {
    onEdit: (item: Item) => void;
}

export const columns = ({ onEdit }: ColumnsProps): ColumnDef<Item>[] => [
    {
        accessorKey: 'imageUrl',
        header: 'Image',
        cell: ({ row }) => {
            const imageUrl = row.original.imageUrl;
            return imageUrl ? (
                <img
                    src={imageUrl}
                    alt={row.original.name}
                    className="h-10 w-10 rounded-md object-cover border border-white/10"
                />
            ) : (
                <div className="h-10 w-10 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-xs text-secondary-foreground">
                    No Img
                </div>
            );
        },
    },
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => <div className="text-white font-medium">{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => <div className="text-white/80">{row.getValue('type')}</div>,
    },
    {
        accessorKey: 'gsm',
        header: 'GSM',
        cell: ({ row }) => <div className="text-white/80">{row.getValue('gsm')}</div>,
    },
    {
        accessorKey: 'color',
        header: 'Color',
        cell: ({ row }) => <div className="text-white/80">{row.getValue('color')}</div>,
    },
    {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => {
            const price = parseFloat(row.getValue('price'));
            const formatted = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
            }).format(price);
            return <div className="text-white font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: 'isAvailable',
        header: 'Status',
        cell: ({ row }) => {
            const isAvailable = row.getValue('isAvailable');
            return (
                <Badge variant={isAvailable ? 'default' : 'destructive'} className={isAvailable ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : ""}>
                    {isAvailable ? 'Available' : 'Unavailable'}
                </Badge>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const item = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background/95 border-white/10 backdrop-blur-xl">
                        <DropdownMenuLabel className="text-white">Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => onEdit(item)}
                            className="text-white hover:bg-white/10 cursor-pointer"
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        {/* Add delete functionality if needed in future */}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
