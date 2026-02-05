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
    imageUrl?: string;
    variants?: { gsm: string; price: number; color: string; isAvailable: boolean }[];
    // Legacy
    gsm?: string;
    color?: string;
    price?: number;
    isAvailable?: boolean;
};

interface ColumnsProps {
    onEdit: (item: Item) => void;
    onDelete: (item: Item) => void;
}

export const columns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Item>[] => [
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
        id: 'variants_count',
        header: 'Variants',
        cell: ({ row }) => {
            // @ts-ignore
            const variants = row.original.variants;
            if (variants && variants.length > 0) {
                return (
                    <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => row.toggleExpanded()}
                    >
                        {variants.length} Variants {row.getIsExpanded() ? '▲' : '▼'}
                    </Badge>
                )
            }
            return <span className="text-white/50 text-xs">Legacy / No Variants</span>
        }
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
                        <DropdownMenuItem
                            onClick={() => onDelete(item)}
                            className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                        >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
