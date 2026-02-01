import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useMemo } from 'react';

export interface TshirtItem {
    id: string;
    name: string;
    type: string;
    gsm: string;
    color: string;
    price: number;
    imageUrl?: string;
    isAvailable: boolean;
}

export function useTShirtsData() {
    const firestore = useFirestore();

    // Fetch all available T-shirts
    const tshirtsRef = useMemoFirebase(
        () => query(collection(firestore, 'tshirts'), where('isAvailable', '==', true)),
        [firestore]
    );

    const { data: items, isLoading } = useCollection<TshirtItem>(tshirtsRef);

    // Derive unique types with their representative images
    const uniqueTypes = useMemo(() => {
        if (!items) return [];
        const typesMap = new Map<string, string | undefined>();

        items.forEach(item => {
            if (!typesMap.has(item.type)) {
                typesMap.set(item.type, item.imageUrl);
            }
        });

        return Array.from(typesMap.entries()).map(([type, imageUrl]) => ({
            type,
            imageUrl
        }));
    }, [items]);

    // Derive unique GSMs
    const uniqueGsms = useMemo(() => {
        if (!items) return [];
        const gsms = new Set<string>();
        items.forEach(item => gsms.add(item.gsm));
        return Array.from(gsms).sort((a, b) => parseInt(a) - parseInt(b)); // Sort numerically if possible
    }, [items]);

    // Helper to find specific item details
    const getPrice = (type: string, gsm: string) => {
        if (!items) return 0;
        // Find item matching type and gsm. Prioritize availability if multiple exist (though query filters available).
        // We might have multiple colors, so usually price is same for same type/gsm regardless of color.
        const match = items.find(
            item => item.type === type && item.gsm === gsm
        );
        return match ? match.price : null;
    };

    return {
        items,
        uniqueTypes,
        uniqueGsms,
        getPrice,
        isLoading
    };
}
