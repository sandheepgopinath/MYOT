'use client';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import TShirtsManagement from './tshirts/tshirts-management';
import TypesManagement from './types/types-management';
import GsmsManagement from './gsms/gsms-management';
import ColorsManagement from './colors/colors-management';
import { LogOut } from 'lucide-react';

export default function Dashboard() {
  const auth = useAuth();

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        <div className="ml-auto">
          <Button variant="outline" onClick={() => signOut(auth)}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 sm:px-6 sm:py-0">
        <Tabs defaultValue="tshirts">
          <TabsList>
            <TabsTrigger value="tshirts">T-Shirts</TabsTrigger>
            <TabsTrigger value="types">Types</TabsTrigger>
            <TabsTrigger value="gsms">GSMs</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
          </TabsList>
          <TabsContent value="tshirts">
            <TShirtsManagement />
          </TabsContent>
          <TabsContent value="types">
            <TypesManagement />
          </TabsContent>
          <TabsContent value="gsms">
            <GsmsManagement />
          </TabsContent>
          <TabsContent value="colors">
            <ColorsManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
