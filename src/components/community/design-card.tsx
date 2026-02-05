'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2, UploadCloud, MoreVertical } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CommunityDesign } from '@/hooks/use-community-designs';
import { useState } from 'react';
import { format } from 'date-fns';

interface DesignCardProps {
    design: CommunityDesign;
    onDelete: (id: string) => void;
    onReupload: (design: CommunityDesign) => void;
}

export function DesignCard({ design, onDelete, onReupload }: DesignCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this design?')) {
            onDelete(design.id);
        }
    };

    return (
        <Card className="overflow-hidden glass-card group">
            <div className="relative aspect-square bg-zinc-900">
                {design.imageUrl ? (
                    <img
                        src={design.imageUrl}
                        alt={design.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                    </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white border-none">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onReupload(design)}>
                                <UploadCloud className="mr-2 h-4 w-4" /> Re-upload Image
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Design
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="absolute bottom-2 left-2">
                    <Badge variant={design.status === 'approved' ? 'default' : 'secondary'} className={design.status === 'approved' ? 'bg-green-500/80 hover:bg-green-500' : ''}>
                        {design.status}
                    </Badge>
                </div>
            </div>
            <CardContent className="p-4 pb-2">
                <h3 className="font-semibold truncate" title={design.name}>{design.name}</h3>
                <p className="text-xs text-muted-foreground">
                    {design.createdAt?.toDate ? format(design.createdAt.toDate(), 'MMM d, yyyy') : 'Just now'}
                </p>
            </CardContent>
            <CardFooter className="p-4 pt-2 flex justify-between items-center text-sm text-muted-foreground border-t border-border/50 mt-2 bg-black/20">
                <div className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    <span>{design.views || 0} views</span>
                </div>
                <div className="font-medium text-primary">
                    {design.sales || 0} sold
                </div>
            </CardFooter>
        </Card>
    );
}
