
'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, RefreshCw, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Design {
    id: string;
    imageUrl: string;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
    salesCount: number;
    uploadedAt: any; // Firestore timestamp
}

interface DesignCardProps {
    design: Design;
    onDelete: (id: string) => void;
    onView: (design: Design) => void;
    onReupload: (design: Design) => void;
}

export function DesignCard({ design, onDelete, onView, onReupload }: DesignCardProps) {
    const statusColor = {
        pending: 'bg-orange-500',
        approved: 'bg-green-500',
        rejected: 'bg-red-500',
    };

    const statusLabel = {
        pending: 'In Review',
        approved: 'Approved',
        rejected: 'Rejected',
    };

    return (
        <div className="group relative bg-[#1C252E] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            {/* Image Area */}
            <div className="relative aspect-square overflow-hidden bg-slate-800">
                <Image
                    src={design.imageUrl}
                    alt={design.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />

                {/* Floating Badge */}
                <div className="absolute top-3 left-3">
                    <Badge className={`${statusColor[design.status]} text-white border-0 px-3 uppercase text-[10px] tracking-wider font-bold shadow-md`}>
                        {statusLabel[design.status]}
                    </Badge>
                </div>
            </div>

            {/* Quick Actions Overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-end justify-between">
                <div>
                    <h3 className="font-bold text-white text-lg leading-tight truncate w-32 md:w-40" title={design.name}>
                        {design.name}
                    </h3>
                    <p className="text-white/70 text-xs">
                        {design.uploadedAt?.seconds
                            ? formatDistanceToNow(new Date(design.uploadedAt.seconds * 1000), {
                                addSuffix: true,
                            })
                            : 'Just now'}
                    </p>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/20 text-white hover:bg-white border-0 backdrop-blur-sm">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1C252E] border-slate-700 text-slate-200">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem onClick={() => onView(design)} className="focus:bg-slate-700 cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onReupload(design)} className="focus:bg-slate-700 cursor-pointer">
                            <RefreshCw className="mr-2 h-4 w-4" /> Re-upload
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem onClick={() => onDelete(design.id)} className="text-red-400 focus:text-red-300 focus:bg-red-900/20 cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
