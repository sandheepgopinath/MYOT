'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, AuthError, signOut } from 'firebase/auth';
import {
  doc,
  getDoc,
  collection,
  query,
  limit,
  getDocs,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useAdminRole } from '@/hooks/use-admin-role';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const { isAdmin, user, isLoading } = useAdminRole();

  useEffect(() => {
    // If user is logged in and is an admin, redirect to the dashboard
    if (!isLoading && user && isAdmin) {
      router.replace('/administrator');
    }
  }, [isLoading, user, isAdmin, router]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@example.com',
      password: 'password',
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
      const adminRoleSnap = await getDoc(adminRoleRef);

      if (adminRoleSnap.exists()) {
        // User is a confirmed admin.
        toast({
          title: 'Login Successful',
          description: 'Redirecting to your dashboard...',
        });
      } else {
        // User is not an admin. Check if they can be bootstrapped as the first one.
        const adminCollectionRef = collection(firestore, 'roles_admin');
        const allAdminsQuery = query(adminCollectionRef, limit(1));
        const allAdminsSnap = await getDocs(allAdminsQuery);

        if (allAdminsSnap.empty) {
          // No admins exist, make this user the first admin.
          try {
            await setDoc(adminRoleRef, {
              createdAt: serverTimestamp(),
              email: user.email,
            });
            toast({
              title: 'Admin Account Created',
              description: 'You have been set as the first administrator.',
            });
            // The useEffect will handle the redirect now that isAdmin will be true.
          } catch (setupError) {
            await signOut(auth);
            toast({
              variant: 'destructive',
              title: 'Setup Failed',
              description: 'Could not create the initial admin account.',
            });
          }
        } else {
          // Admins exist, and this user is not one.
          await signOut(auth);
          toast({
            variant: 'destructive',
            title: 'Authentication Failed',
            description: 'You do not have permission to access this page.',
          });
        }
      }
    } catch (error) {
      const authError = error as AuthError;
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: authError.message,
      });
    }
  };

  // If loading auth state or if user is already an admin, show a loader while redirecting
  if (isLoading || (user && isAdmin)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="mx-auto max-w-sm glass-card">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Login
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
