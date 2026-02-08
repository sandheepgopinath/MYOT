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
  where,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useAdminRole } from '@/hooks/use-admin-role';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const { isAdmin, user, isLoading } = useAdminRole();
  
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [checkingEmail, setCheckingEmail] = useState(false);

  useEffect(() => {
    // If user is logged in and is an admin, redirect to the dashboard
    if (!isLoading && user && isAdmin) {
      router.replace('/administrator');
    }
  }, [isLoading, user, isAdmin, router]);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onEmailSubmit = async (values: LoginValues) => {
    setCheckingEmail(true);
    try {
      const email = values.email.toLowerCase().trim();
      const adminCollectionRef = collection(firestore, 'roles_admin');
      
      // 1. Check if ANY admin exists (Bootstrap case)
      const allAdminsQuery = query(adminCollectionRef, limit(1));
      const allAdminsSnap = await getDocs(allAdminsQuery);
      
      if (allAdminsSnap.empty) {
        // No admins exist at all. Proceed to password for bootstrap.
        setStep('password');
        return;
      }

      // 2. Check if THIS email is registered as an admin
      const specificAdminQuery = query(adminCollectionRef, where('email', '==', email), limit(1));
      const specificAdminSnap = await getDocs(specificAdminQuery);

      if (!specificAdminSnap.empty) {
        setStep('password');
      } else {
        form.setError('email', { 
          message: 'Access denied. This email does not have administrator privileges.' 
        });
      }
    } catch (error: any) {
      console.error("Privilege check error:", error);
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.message || 'Could not verify administrator status. Please try again.',
      });
    } finally {
      setCheckingEmail(false);
    }
  };

  const onLoginSubmit = async (values: LoginValues) => {
    if (!values.password) return;
    
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const loggedUser = userCredential.user;

      const adminRoleRef = doc(firestore, 'roles_admin', loggedUser.uid);
      const adminRoleSnap = await getDoc(adminRoleRef);

      if (adminRoleSnap.exists()) {
        toast({
          title: 'Login Successful',
          description: 'Redirecting to your dashboard...',
        });
      } else {
        // Check for bootstrap if doc doesn't exist
        const adminCollectionRef = collection(firestore, 'roles_admin');
        const allAdminsQuery = query(adminCollectionRef, limit(1));
        const allAdminsSnap = await getDocs(allAdminsQuery);

        if (allAdminsSnap.empty) {
          try {
            await setDoc(adminRoleRef, {
              createdAt: serverTimestamp(),
              email: loggedUser.email?.toLowerCase(),
            });
            toast({
              title: 'Admin Account Created',
              description: 'You have been registered as the first administrator.',
            });
          } catch (setupError) {
            await signOut(auth);
            toast({
              variant: 'destructive',
              title: 'Setup Failed',
              description: 'Could not initialize your administrator account.',
            });
          }
        } else {
          // Admin exists elsewhere, but this user isn't one
          await signOut(auth);
          toast({
            variant: 'destructive',
            title: 'Authentication Failed',
            description: 'Your account is not authorized for administrator access.',
          });
          setStep('email');
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

  const handleFinalSubmit = async (values: LoginValues) => {
    if (step === 'email') {
      await onEmailSubmit(values);
    } else {
      await onLoginSubmit(values);
    }
  };

  // Show a loader while checking for authentication and admin status
  if (isLoading || (user && isAdmin)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-admin p-4">
      <Card className="w-full max-w-sm glass-card border-white/10 shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-white tracking-tight">Admin Portal</CardTitle>
          <CardDescription className="text-center text-white/50 text-xs">
            {step === 'email' 
              ? 'Enter your email to verify administrative access' 
              : 'Please enter your password to continue'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(handleFinalSubmit)} 
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70 text-[10px] uppercase tracking-widest font-bold">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="admin@mmt.com" 
                        {...field} 
                        className="input-glass h-11"
                        disabled={step === 'password' || checkingEmail}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              {step === 'password' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-white/70 text-[10px] uppercase tracking-widest font-bold">Password</FormLabel>
                          <button 
                            type="button" 
                            onClick={() => setStep('email')}
                            className="text-[9px] text-amber-500 hover:text-amber-400 uppercase tracking-widest font-bold flex items-center gap-1 transition-colors"
                          >
                            <ArrowLeft className="h-2.5 w-2.5" /> Back
                          </button>
                        </div>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            {...field} 
                            className="input-glass h-11"
                            autoFocus
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 btn-login-glow mt-2 font-bold tracking-widest text-[10px] uppercase"
                disabled={form.formState.isSubmitting || checkingEmail}
              >
                { (form.formState.isSubmitting || checkingEmail) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {step === 'email' ? 'Verify Privilege' : 'Access Dashboard'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
