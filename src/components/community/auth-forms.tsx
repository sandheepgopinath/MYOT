'use client';

import { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    AuthError,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

const authSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().optional(),
});

type AuthStats = 'signin' | 'signup';

export function AuthForms() {
    const [activeTab, setActiveTab] = useState<AuthStats>('signin');
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof authSchema>>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            email: '',
            password: '',
            name: '',
        },
    });

    const onSubmit = async (values: z.infer<typeof authSchema>) => {
        console.log("Submitting form", activeTab, values);
        try {
            if (activeTab === 'signup') {
                if (!values.name || values.name.length < 2) {
                    form.setError('name', { type: 'manual', message: 'Name must be at least 2 characters' });
                    return;
                }
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    values.email,
                    values.password
                );
                const user = userCredential.user;

                // Update profile with name
                if (values.name) {
                    await updateProfile(user, {
                        displayName: values.name,
                    });
                }

                // Create user document in Firestore
                await setDoc(doc(firestore, 'users', user.uid), {
                    uid: user.uid,
                    email: user.email,
                    displayName: values.name || '',
                    createdAt: serverTimestamp(),
                    role: 'designer', // Tagging them as a designer
                });

                toast({
                    title: 'Account Created',
                    description: 'Welcome to the community!',
                });
            } else {
                await signInWithEmailAndPassword(auth, values.email, values.password);
                toast({
                    title: 'Welcome Back',
                    description: 'Successfully signed in.',
                });
            }
        } catch (error) {
            const authError = error as AuthError;
            let errorMessage = authError.message;

            // Improve error messages
            if (authError.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered. Please sign in instead.';
            } else if (authError.code === 'auth/invalid-credential') {
                errorMessage = 'Invalid email or password.';
            }

            toast({
                variant: 'destructive',
                title: activeTab === 'signup' ? 'Sign Up Failed' : 'Login Failed',
                description: errorMessage,
            });
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="text-2xl text-center text-white">
                        Designer Community
                    </CardTitle>
                    <CardDescription className="text-center text-white/80">
                        Join other designers, start earning.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs
                        defaultValue="signin"
                        value={activeTab}
                        onValueChange={(v) => setActiveTab(v as AuthStats)}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-2 mb-4 bg-white/10">
                            <TabsTrigger value="signin" className="data-[state=active]:bg-white/20 text-white">Sign In</TabsTrigger>
                            <TabsTrigger value="signup" className="data-[state=active]:bg-white/20 text-white">Sign Up</TabsTrigger>
                        </TabsList>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                {activeTab === 'signup' && (
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white">Display Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Doe" {...field} className="input-glass text-white placeholder:text-white/50" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white">Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="name@example.com" {...field} className="input-glass text-white placeholder:text-white/50" />
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
                                            <FormLabel className="text-white">Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} className="input-glass text-white placeholder:text-white/50" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full btn-login-glow"
                                    disabled={form.formState.isSubmitting}
                                >
                                    {form.formState.isSubmitting && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {activeTab === 'signup' ? 'Create Account' : 'Sign In'}
                                </Button>
                            </form>
                        </Form>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
