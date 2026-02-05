'use client';

import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, orderBy, query } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

export default function DesignsManagement() {
    const firestore = useFirestore();

    const designsRef = useMemoFirebase(
        () => query(collection(firestore, 'community_designs'), orderBy('createdAt', 'desc')),
        [firestore]
    );

    const { data: designs, isLoading } = useCollection(designsRef);

    const handleStatusUpdate = (designId: string, status: 'approved' | 'rejected') => {
        updateDocumentNonBlocking(doc(firestore, 'community_designs', designId), {
            status,
            updatedAt: new Date(),
        });
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white/50" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Community Designs</h2>
                    <p className="text-white/60">Review and moderate designs submitted by the community.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {designs && designs.length > 0 ? (
                    designs.map((design: any) => (
                        <Card key={design.id} className="glass-card overflow-hidden border-white/10 bg-black/20 group">
                            <div className="relative aspect-square bg-zinc-900">
                                {design.imageUrl ? (
                                    <img
                                        src={design.imageUrl}
                                        alt={design.name}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/20">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute top-2 left-2">
                                    <Badge 
                                        variant={design.status === 'approved' ? 'default' : design.status === 'rejected' ? 'destructive' : 'secondary'}
                                        className="backdrop-blur-md"
                                    >
                                        {design.status}
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="p-4 space-y-4">
                                <div>
                                    <h3 className="font-semibold text-white truncate" title={design.name}>{design.name}</h3>
                                    <p className="text-xs text-white/50">
                                        by {design.authorName || 'Unknown'} • {design.createdAt?.toDate ? format(design.createdAt.toDate(), 'MMM d, yyyy') : 'Recently'}
                                    </p>
                                </div>
                                
                                {design.status === 'pending' && (
                                    <div className="flex gap-2 pt-2">
                                        <Button 
                                            size="sm" 
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => handleStatusUpdate(design.id, 'approved')}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" /> Approve
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="destructive" 
                                            className="flex-1"
                                            onClick={() => handleStatusUpdate(design.id, 'rejected')}
                                        >
                                            <XCircle className="h-4 w-4 mr-2" /> Reject
                                        </Button>
                                    </div>
                                )}
                                
                                {design.status !== 'pending' && (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full border-white/10 text-white/50 hover:text-white"
                                        onClick={() => handleStatusUpdate(design.id, 'pending')}
                                    >
                                        <Clock className="h-4 w-4 mr-2" /> Reset to Pending
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center glass-card border-dashed border-white/10">
                        <p className="text-white/40 italic">No community designs found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
