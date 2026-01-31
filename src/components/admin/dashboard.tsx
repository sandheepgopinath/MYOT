'use client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import ItemsManagement from './items/items-management';
import { LogOut } from 'lucide-react';

export default function Dashboard() {
  const auth = useAuth();

  return (
    <div className="flex min-h-screen w-full flex-col bg-admin text-foreground">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/10 bg-background/50 px-6 backdrop-blur-xl">
        <h1 className="text-xl font-bold text-white tracking-wide">MYOT Admin</h1>
        <div className="ml-auto">
          <Button
            variant="ghost"
            onClick={() => signOut(auth)}
            className="text-white hover:bg-white/10 hover:text-white"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>
      <main className="flex-1 p-6 container mx-auto max-w-7xl">
        <ItemsManagement />
      </main>
    </div>
  );
}
