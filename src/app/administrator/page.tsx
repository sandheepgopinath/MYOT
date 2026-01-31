'use client';
import { useAdminRole } from '@/hooks/use-admin-role';
import Dashboard from '@/components/admin/dashboard';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdministratorPage() {
  const { isAdmin, isLoading } = useAdminRole();
  const router = useRouter();

  useEffect(() => {
    // When loading is finished, if the user is not an admin, redirect them.
    if (!isLoading && !isAdmin) {
      router.replace('/login');
    }
  }, [isLoading, isAdmin, router]);

  // Show a loader while checking for authentication and admin status,
  // or if the user is not an admin (and the redirect is about to happen).
  if (isLoading || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  // Only render the dashboard if loading is complete and the user is an admin.
  return <Dashboard />;
}
