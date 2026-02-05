'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, RefreshCw, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export interface Design {
    id: string;
    imageUrl: string;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
    sales: number;
    createdAt: any; // Firestore timestamp
}

interface DesignCardProps {
    design: Design;
    onDelete: (id: string) => void;
    onView: (design: Design) => void;
    onReupload: (design: Design) => void;
}

export function DesignCard({ design, onDelete, onView, onReupload }: DesignCardProps) {
    const statusColor = {
        pending: 'bg-yellow-500',
        approved: 'bg-green-500',
        rejected: 'bg-red-500',
    };

    return (
        <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
            <div className="relative aspect-square">
                <Image
                    src={design.imageUrl}
                    alt={design.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2">
                    <Badge className={`${statusColor[design.status]} text-white border-0`}>
                        {design.status}
                    </Badge>
                </div>
            </div>
            <CardContent className="p-4">
                <h3 className="font-semibold truncate" title={design.name}>
                    {design.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                    {design.createdAt?.seconds
                        ? formatDistanceToNow(new Date(design.createdAt.seconds * 1000), {
                            addSuffix: true,
                        })
                        : 'Just now'}
                </p>
                <div className="flex items-center mt-2 text-sm font-medium">
                    <ShoppingBag className="w-4 h-4 mr-1 text-primary" />
                    {design.sales} Sold
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onView(design)}
                                className="hover:text-primary"
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>View Details</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onReupload(design)}
                                className="hover:text-blue-500"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Re-upload/Update</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onDelete(design.id)}
                                className="hover:text-red-500 hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete Design</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </CardFooter>
        </Card>
    );
}
