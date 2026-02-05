import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore'; // Removed 'where' as we might filter manually or fetch all
import { useMemo } from 'react';
import { getImageById } from '@/lib/placeholder-images';

export interface Variant {
    id: string;
    gsm: string;
    color: string;
    price: number;
    isAvailable: boolean;
}

export interface Product {
    id: string;
    name: string;
    type: string;
    imageUrl?: string;
    variants: Variant[];
    // Legacy support fields for migration
    gsm?: string;
    color?: string;
    price?: number;
    isAvailable?: boolean;
}

export function useTShirtsData() {
    const firestore = useFirestore();

    // Fetch all T-shirts (Available filter moved to logic if needed, or we fetch all to show structure)
    // For Craft page we probably only want available stuff.
    // But Admin usage (if this hook is used there) needs everything.
    // Let's assume this hook is primarily for CraftPage usage or general data fetching.
    const tshirtsRef = useMemoFirebase(
        () => query(collection(firestore, 'tshirts')),
        [firestore]
    );

    const { data: items, isLoading } = useCollection<Product>(tshirtsRef);

    // Derive unique types with their representative images
    const uniqueTypes = useMemo(() => {
        if (!items) return [];
        const typesMap = new Map<string, string | undefined>();

        items.forEach(item => {
            // Check if product OR any variant is available? 
            const isAvailable = item.isAvailable || item.variants?.some(v => v.isAvailable);

            if (isAvailable && !typesMap.has(item.type)) {
                // Resolve image URL if it looks like an ID
                let imageUrl = item.imageUrl;
                if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
                    const placeholder = getImageById(imageUrl);
                    if (placeholder) {
                        imageUrl = placeholder.imageUrl;
                    }
                }
                typesMap.set(item.type, imageUrl);
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

        items.forEach(item => {
            if (item.variants && Array.isArray(item.variants)) {
                item.variants.forEach(v => {
                    if (v.isAvailable) gsms.add(v.gsm);
                });
            } else if (item.gsm && item.isAvailable !== false) {
                // Legacy fallback
                gsms.add(item.gsm);
            }
        });

        return Array.from(gsms).sort((a, b) => parseInt(a) - parseInt(b));
    }, [items]);

    // Helper to find specific item details
    const getPrice = (type: string, gsm: string) => {
        if (!items) return 0;

        // Find product matching type
        const product = items.find(p => p.type === type);
        if (!product) return 0;

        // Check nested variants
        if (product.variants && Array.isArray(product.variants)) {
            const variant = product.variants.find(v => v.gsm === gsm && v.isAvailable);
            return variant ? variant.price : 0;
        }

        // Legacy fallback
        if (product.gsm === gsm && product.isAvailable !== false) {
            return product.price || 0;
        }

        return 0;
    };

    // Helper to get available GSMs for a specific type
    const getGsmsForType = (type: string) => {
        if (!items) return [];
        const product = items.find(p => p.type === type);
        if (!product) return [];

        const gsms = new Set<string>();
        if (product.variants && Array.isArray(product.variants)) {
            product.variants.forEach(v => {
                if (v.isAvailable) gsms.add(v.gsm);
            });
        } else if (product.gsm && product.isAvailable !== false) {
            gsms.add(product.gsm);
        }
        return Array.from(gsms).sort((a, b) => parseInt(a) - parseInt(b));
    };

    return {
        items,
        uniqueTypes,
        uniqueGsms,
        getGsmsForType,
        getPrice,
        isLoading
    };
}
