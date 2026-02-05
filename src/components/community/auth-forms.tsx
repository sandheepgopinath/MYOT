'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const authSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().optional(),
});

type AuthApiError = {
    code?: string;
    message: string;
}

export function AuthForms() {
    const [isLoading, setIsLoading] = useState(false);
    const auth = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const loginForm = useForm<z.infer<typeof authSchema>>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const signupForm = useForm<z.infer<typeof authSchema>>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
        },
    });

    const onLogin = async (values: z.infer<typeof authSchema>) => {
        try {
            setIsLoading(true);
            await signInWithEmailAndPassword(auth, values.email, values.password);
            toast({
                title: 'Welcome back!',
                description: 'Successfully logged in.',
            });
            router.push('/community/profile');
        } catch (error) {
            const err = error as AuthApiError;
            toast({
                variant: 'destructive',
                title: 'Login failed',
                description: err.message || 'Please check your credentials.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const onSignup = async (values: z.infer<typeof authSchema>) => {
        try {
            setIsLoading(true);
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                values.email,
                values.password
            );

            if (values.name) {
                await updateProfile(userCredential.user, {
                    displayName: values.name,
                });
            }

            toast({
                title: 'Account created!',
                description: 'Welcome to the community.',
            });
            router.push('/community/profile');
        } catch (error) {
            const err = error as AuthApiError;
            toast({
                variant: 'destructive',
                title: 'Signup failed',
                description: err.message || 'Could not create account.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto glass-card">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Join the Community</CardTitle>
                <CardDescription className="text-center">
                    Login or create an account to manage your designs
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                        <Form {...loginForm}>
                            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                                <FormField
                                    control={loginForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="name@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={loginForm.control}
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
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Login
                                </Button>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="signup">
                        <Form {...signupForm}>
                            <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                                <FormField
                                    control={signupForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={signupForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="name@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={signupForm.control}
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
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Account
                                </Button>
                            </form>
                        </Form>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
