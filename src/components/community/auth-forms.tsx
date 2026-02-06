
'use client';

import { useState, useEffect } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { useAuth, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    AuthError,
    GoogleAuthProvider,
    signInWithPopup,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Mail, Phone, Chrome } from 'lucide-react';

const authSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().optional(),
});

const phoneSchema = z.object({
    phoneNumber: z.string().min(10, 'Enter a valid phone number with country code (e.g. +1...)'),
});

const codeSchema = z.object({
    code: z.string().length(6, 'Verification code is 6 digits'),
});

type AuthTab = 'signin' | 'signup' | 'phone';

export function AuthForms() {
    const [activeTab, setActiveTab] = useState<AuthTab>('signin');
    const [phoneStep, setPhoneStep] = useState<'request' | 'verify'>('request');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();

    // ReCAPTCHA cleanup
    useEffect(() => {
        return () => {
            if ((window as any).recaptchaVerifier) {
                (window as any).recaptchaVerifier.clear();
            }
        };
    }, []);

    const form = useForm<z.infer<typeof authSchema>>({
        resolver: zodResolver(authSchema),
        defaultValues: { email: '', password: '', name: '' },
    });

    const phoneForm = useForm<z.infer<typeof phoneSchema>>({
        resolver: zodResolver(phoneSchema),
        defaultValues: { phoneNumber: '' },
    });

    const codeForm = useForm<z.infer<typeof codeSchema>>({
        resolver: zodResolver(codeSchema),
        defaultValues: { code: '' },
    });

    const setupRecaptcha = () => {
        if (!(window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
            });
        }
    };

    const handleSyncUserDoc = async (user: any, name?: string) => {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email || null,
                phoneNumber: user.phoneNumber || null,
                displayName: name || user.displayName || 'Designer',
                createdAt: serverTimestamp(),
                role: 'designer',
            });
        }
    };

    const onSubmit = async (values: z.infer<typeof authSchema>) => {
        try {
            if (activeTab === 'signup') {
                if (!values.name || values.name.length < 2) {
                    form.setError('name', { type: 'manual', message: 'Name must be at least 2 characters' });
                    return;
                }
                const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
                const user = userCredential.user;
                if (values.name) {
                    await updateProfile(user, { displayName: values.name });
                }
                await handleSyncUserDoc(user, values.name);
                toast({ title: 'Account Created', description: 'Welcome to the community!' });
            } else {
                await signInWithEmailAndPassword(auth, values.email, values.password);
                toast({ title: 'Welcome Back', description: 'Successfully signed in.' });
            }
        } catch (error) {
            const authError = error as AuthError;
            toast({
                variant: 'destructive',
                title: activeTab === 'signup' ? 'Sign Up Failed' : 'Login Failed',
                description: authError.message,
            });
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await handleSyncUserDoc(result.user);
            toast({ title: 'Welcome', description: 'Signed in with Google successfully.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Google Sign In Failed', description: error.message });
        }
    };

    const onPhoneSubmit = async (values: z.infer<typeof phoneSchema>) => {
        try {
            setupRecaptcha();
            const verifier = (window as any).recaptchaVerifier;
            const result = await signInWithPhoneNumber(auth, values.phoneNumber, verifier);
            setConfirmationResult(result);
            codeForm.reset({ code: '' }); // Ensure code form is empty
            setPhoneStep('verify');
            toast({ title: 'Code Sent', description: 'Verification code sent to your phone.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Failed to send code', description: error.message });
        }
    };

    const onCodeSubmit = async (values: z.infer<typeof codeSchema>) => {
        try {
            if (!confirmationResult) return;
            const result = await confirmationResult.confirm(values.code);
            await handleSyncUserDoc(result.user);
            toast({ title: 'Success', description: 'Phone verified successfully!' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Verification Failed', description: 'Invalid code provided.' });
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="text-2xl text-center text-white">Designer Community</CardTitle>
                    <CardDescription className="text-center text-white/80">Join our creative network.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Tabs
                        defaultValue="signin"
                        value={activeTab}
                        onValueChange={(v) => setActiveTab(v as AuthTab)}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/10">
                            <TabsTrigger value="signin">Sign In</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            <TabsTrigger value="phone"><Phone size={14} className="mr-2" /> Phone</TabsTrigger>
                        </TabsList>

                        <TabsContent value="signin" className="mt-0">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white">Email</FormLabel>
                                                <FormControl><Input placeholder="name@example.com" {...field} autoComplete="email" className="input-glass" /></FormControl>
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
                                                <FormControl><Input type="password" {...field} autoComplete="current-password" className="input-glass" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full btn-login-glow" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Sign In
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="signup" className="mt-0">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white">Display Name</FormLabel>
                                                <FormControl><Input placeholder="John Doe" {...field} autoComplete="name" className="input-glass" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white">Email</FormLabel>
                                                <FormControl><Input placeholder="name@example.com" {...field} autoComplete="email" className="input-glass" /></FormControl>
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
                                                <FormControl><Input type="password" {...field} autoComplete="new-password" className="input-glass" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full btn-login-glow" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create Account
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="phone" className="mt-0">
                            {phoneStep === 'request' ? (
                                <Form {...phoneForm} key="phone-request">
                                    <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                                        <FormField
                                            control={phoneForm.control}
                                            name="phoneNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white">Phone Number</FormLabel>
                                                    <FormControl><Input placeholder="+1234567890" {...field} autoComplete="tel" className="input-glass" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full btn-login-glow" disabled={phoneForm.formState.isSubmitting}>
                                            {phoneForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Send Verification Code
                                        </Button>
                                        <div id="recaptcha-container"></div>
                                    </form>
                                </Form>
                            ) : (
                                <Form {...codeForm} key="phone-verify">
                                    <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="space-y-4">
                                        <FormField
                                            control={codeForm.control}
                                            name="code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white">Verification Code</FormLabel>
                                                    <FormControl><Input placeholder="123456" {...field} autoComplete="one-time-code" className="input-glass text-center tracking-widest" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full btn-login-glow" disabled={codeForm.formState.isSubmitting}>
                                            {codeForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Verify Code
                                        </Button>
                                        <Button variant="ghost" onClick={() => setPhoneStep('request')} className="w-full text-white/50 text-xs">
                                            Change Number
                                        </Button>
                                    </form>
                                </Form>
                            )}
                        </TabsContent>
                    </Tabs>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><Separator className="bg-white/10" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-transparent px-2 text-white/40">Or continue with</span></div>
                    </div>

                    <Button 
                        variant="outline" 
                        type="button" 
                        className="w-full bg-white/5 hover:bg-white/10 border-white/10 text-white"
                        onClick={handleGoogleSignIn}
                    >
                        <Chrome className="mr-2 h-4 w-4" />
                        Google Account
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
