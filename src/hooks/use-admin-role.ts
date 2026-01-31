'use client';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';

export function useAdminRole() {
  const { user, isUserLoading, userError } = useUser();
  const firestore = useFirestore();

  const adminRoleRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [user, firestore]);

  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);

  const isAdmin = !!adminRole;
  const isLoading = isUserLoading || (user ? (isAdminRoleLoading || adminRole === undefined) : false);

  return { isAdmin, isLoading, user, userError };
}
