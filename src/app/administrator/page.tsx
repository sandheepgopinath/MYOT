'use client';
import { useAdminRole } from '@/hooks/use-admin-role';
import Dashboard from '@/components/admin/dashboard';
import Login from '@/components/admin/login';
import { Loader2 } from 'lucide-react';

export default function AdministratorPage() {
  const { isAdmin, isLoading, user } = useAdminRole();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (user && isAdmin) {
    return <Dashboard />;
  }

  return <Login />;
}
