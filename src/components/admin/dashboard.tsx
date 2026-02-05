'use client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import ItemsManagement from './items/items-management';
import DesignsManagement from './designs/designs-management';
import { LogOut, Package, Palette } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils'; // Assuming cn utility exists, otherwise standard class strings

export default function Dashboard() {
  const auth = useAuth();
  const [currentView, setCurrentView] = useState<'inventory' | 'designs'>('inventory');

  const navItems = [
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'designs', label: 'Designs', icon: Palette },
  ];

  return (
    <div className="flex min-h-screen w-full bg-admin text-foreground">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="flex h-16 items-center px-6 border-b border-white/10">
          <h1 className="text-xl font-bold text-white tracking-wide">MYOT Admin</h1>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => setCurrentView(item.id as 'inventory' | 'designs')}
                className={`w-full justify-start ${currentView === item.id ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Button>
            )
          })}
        </nav>
        <div className="absolute bottom-4 left-0 w-full px-4">
          <Button
            variant="ghost"
            onClick={() => signOut(auth)}
            className="w-full justify-start text-white/60 hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-white/10 bg-background/50 px-8 backdrop-blur-xl">
          <h2 className="text-lg font-medium text-white/80 capitalize">{currentView}</h2>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          {currentView === 'inventory' ? <ItemsManagement /> : <DesignsManagement />}
        </div>
      </main>
    </div>
  );
}
