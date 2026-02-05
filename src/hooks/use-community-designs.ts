'use client';

import { useAuth, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';

export interface CommunityDesign {
    id: string;
    userId: string;
    name: string;
    description?: string;
    imageUrl: string;
    status: 'pending' | 'approved' | 'rejected';
    sales: number;
    views: number;
    createdAt: Timestamp;
}

export function useCommunityDesigns() {
    const auth = useAuth();
    const firestore = useFirestore();
    const user = auth.currentUser;

    const designsQuery = useMemoFirebase(
        () => {
            if (!user) return null;
            return query(
                collection(firestore, 'community_designs'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );
        },
        [firestore, user]
    );

    const { data: designs, isLoading, error } = useCollection<CommunityDesign>(designsQuery);

    return {
        designs,
        isLoading,
        error
    };
}
