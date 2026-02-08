'use client';

import { Button } from '@/components/ui/button';
import { Trash2, Eye, RefreshCw, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

export interface Design {
    id: string;
    imageUrl: string;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
    profit: number;
    uploadedAt: any;
}

interface DesignCardProps {
    design: Design;
    onDelete: (id: string) => void;
    onView: (design: Design) => void;
    onReupload: (design: Design) => void;
}

export function DesignCard({ design, onDelete, onView, onReupload }: DesignCardProps) {
    const statusLabel = {
        pending: 'In Review',
        approved: 'Live Now',
        rejected: 'Rejected',
    };

    return (
        <div className="group relative bg-[#120D0B]/60 backdrop-blur-2xl rounded-[24px] border border-white/5 overflow-hidden transition-all duration-500 hover:bg-[#120D0B]/80 hover:border-white/10 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col h-full">
            {/* Design Showcase Area */}
            <div className="relative aspect-[4/5] w-full overflow-hidden p-5 pb-0">
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/30 border border-white/[0.03]">
                    <Image
                        src={design.imageUrl}
                        alt={design.name}
                        fill
                        className="object-contain transition-transform duration-1000 ease-out group-hover:scale-110 p-6"
                    />
                    
                    {/* Discrete Action Menu */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/60 text-white hover:bg-black/80 border border-white/10 backdrop-blur-md shadow-2xl">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#120D0B]/95 backdrop-blur-xl border-white/10 text-slate-200">
                                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-white/40">Management</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <DropdownMenuItem onClick={() => onView(design)} className="focus:bg-white/10 cursor-pointer text-sm">
                                    <Eye className="mr-2 h-4 w-4" /> View Studio
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onReupload(design)} className="focus:bg-white/10 cursor-pointer text-sm">
                                    <RefreshCw className="mr-2 h-4 w-4" /> Re-upload
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <DropdownMenuItem onClick={() => onDelete(design.id)} className="text-red-400 focus:text-red-300 focus:bg-red-900/20 cursor-pointer text-sm">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Design
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Portfolio Info Area */}
            <div className="p-6 pt-5 space-y-2 mt-auto">
                <h3 className="text-lg font-medium text-white tracking-tight truncate leading-tight">
                    {design.name}
                </h3>
                <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide">
                    <span className="text-amber-500/90 font-semibold">
                        ₹{new Intl.NumberFormat('en-IN').format(design.profit || 0)}.00 Earnings
                    </span>
                    <span className="text-white/10">|</span>
                    <span className={cn(
                        "uppercase tracking-[0.15em] text-[9px] font-bold",
                        design.status === 'approved' ? "text-emerald-400/60" : 
                        design.status === 'pending' ? "text-amber-400/60" : "text-red-400/60"
                    )}>
                        {statusLabel[design.status]}
                    </span>
                </div>
            </div>
            
            {/* Internal Atmospheric Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-tr from-amber-500/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[24px]" />
        </div>
    );
}
