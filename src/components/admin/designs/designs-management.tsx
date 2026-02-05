'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function DesignsManagement() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Designs</h2>
                    <p className="text-white/60">Manage submitted designs.</p>
                </div>
            </div>

            <Card className="glass-card border-white/10 bg-black/20">
                <CardContent className="p-12 flex items-center justify-center text-white/50">
                    <p>Designs Management Coming Soon</p>
                </CardContent>
            </Card>
        </div>
    );
}
