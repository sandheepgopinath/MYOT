
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
import { Textarea } from '@/components/ui/textarea';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
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
import { doc, getDoc, collection, query, where, getDocs, limit, serverTimestamp } from 'firebase/firestore';
import { Loader2, Phone, Chrome } from 'lucide-react';

const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name is required'),
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    bio: z.string().optional(),
});

const signinSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Password is required'),
});

const phoneSchema = z.object({
    phoneNumber: z.string().length(10, 'Enter a valid 10-digit mobile number'),
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

    useEffect(() => {
        return () => {
            if ((window as any).recaptchaVerifier) {
                (window as any).recaptchaVerifier.clear();
            }
        };
    }, []);

    const signupForm = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: { email: '', password: '', name: '', username: '', bio: '' },
    });

    const signinForm = useForm<z.infer<typeof signinSchema>>({
        resolver: zodResolver(signinSchema),
        defaultValues: { email: '', password: '' },
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

    const checkUsernameUnique = async (username: string) => {
        const q = query(collection(firestore, 'users'), where('username', '==', username.toLowerCase()), limit(1));
        const querySnapshot = await getDocs(q);
        return querySnapshot.empty;
    };

    const handleSyncUserDoc = async (user: any, details?: { name: string; username: string; bio?: string }) => {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
            const initialProfile = {
                uid: user.uid,
                name: details?.name || user.displayName || 'New Designer',
                username: (details?.username || user.displayName || user.email?.split('@')[0] || 'designer').toLowerCase().replace(/\s+/g, '_'),
                email: user.email || null,
                phone: user.phoneNumber || null,
                profilePhotoUrl: user.photoURL || null,
                description: details?.bio || "Passionate about creating unique t-shirt designs.",
                designsUploadedCount: 0,
                designsApprovedCount: 0,
                salesCount: 0,
                totalRevenue: 0,
                createdAt: serverTimestamp(),
                lastActiveAt: serverTimestamp()
            };
            setDocumentNonBlocking(userDocRef, initialProfile, { merge: true });
        }
    };

    const onSignupSubmit = async (values: z.infer<typeof signupSchema>) => {
        try {
            // Uniqueness check
            const isUnique = await checkUsernameUnique(values.username);
            if (!isUnique) {
                signupForm.setError('username', { message: 'Username is already taken' });
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;
            await updateProfile(user, { displayName: values.name });
            
            await handleSyncUserDoc(user, { 
                name: values.name, 
                username: values.username.toLowerCase(), 
                bio: values.bio 
            });
            
            toast({ title: 'Account Created', description: 'Welcome to the community!' });
        } catch (error) {
            const authError = error as AuthError;
            toast({
                variant: 'destructive',
                title: 'Sign Up Failed',
                description: authError.message,
            });
        }
    };

    const onSigninSubmit = async (values: z.infer<typeof signinSchema>) => {
        try {
            await signInWithEmailAndPassword(auth, values.email, values.password);
            toast({ title: 'Welcome Back', description: 'Successfully signed in.' });
        } catch (error) {
            const authError = error as AuthError;
            toast({
                variant: 'destructive',
                title: 'Login Failed',
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
            const fullNumber = `+91${values.phoneNumber}`;
            const result = await signInWithPhoneNumber(auth, fullNumber, verifier);
            setConfirmationResult(result);
            codeForm.reset({ code: '' });
            setPhoneStep('verify');
            toast({ title: 'Code Sent', description: `Verification code sent to ${fullNumber}` });
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
            <Card className="glass-card border-white/10 shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl text-center text-white font-bold">Designer Community</CardTitle>
                    <CardDescription className="text-center text-white/60">Join our creative network.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Tabs
                        defaultValue="signin"
                        value={activeTab}
                        onValueChange={(v) => setActiveTab(v as AuthTab)}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/5 border border-white/10 p-1">
                            <TabsTrigger value="signin">Sign In</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            <TabsTrigger value="phone"><Phone size={14} className="mr-2" /> Phone</TabsTrigger>
                        </TabsList>

                        <TabsContent value="signin" className="mt-0">
                            <Form {...signinForm}>
                                <form onSubmit={signinForm.handleSubmit(onSigninSubmit)} className="space-y-4">
                                    <FormField
                                        control={signinForm.control}
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
                                        control={signinForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white">Password</FormLabel>
                                                <FormControl><Input type="password" {...field} autoComplete="current-password" className="input-glass" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full btn-login-glow" disabled={signinForm.formState.isSubmitting}>
                                        {signinForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Sign In
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="signup" className="mt-0">
                            <Form {...signupForm}>
                                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                                    <FormField
                                        control={signupForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white">Full Name *</FormLabel>
                                                <FormControl><Input placeholder="John Doe" {...field} autoComplete="name" className="input-glass" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={signupForm.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white">Username *</FormLabel>
                                                <FormControl><Input placeholder="johndoe_creative" {...field} autoComplete="username" className="input-glass" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={signupForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white">Email *</FormLabel>
                                                <FormControl><Input placeholder="name@example.com" {...field} autoComplete="email" className="input-glass" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={signupForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white">Password *</FormLabel>
                                                <FormControl><Input type="password" {...field} autoComplete="new-password" className="input-glass" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={signupForm.control}
                                        name="bio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white">Bio (Optional)</FormLabel>
                                                <FormControl><Textarea placeholder="Tell us about your style..." {...field} className="input-glass min-h-[80px]" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full btn-login-glow" disabled={signupForm.formState.isSubmitting}>
                                        {signupForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create Designer Account
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
                                                    <div className="relative flex items-center">
                                                        <span className="absolute left-3 text-white/50 font-medium">+91</span>
                                                        <FormControl>
                                                            <Input 
                                                                placeholder="9876543210" 
                                                                {...field} 
                                                                autoComplete="tel-national" 
                                                                className="input-glass pl-12"
                                                                maxLength={10}
                                                            />
                                                        </FormControl>
                                                    </div>
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
                                                    <FormLabel className="text-white text-center block w-full">Verification Code</FormLabel>
                                                    <FormControl><Input placeholder="123456" {...field} autoComplete="one-time-code" className="input-glass text-center tracking-[1em] font-bold text-xl" maxLength={6} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full btn-login-glow" disabled={codeForm.formState.isSubmitting}>
                                            {codeForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Verify Code
                                        </Button>
                                        <Button variant="ghost" onClick={() => setPhoneStep('request')} className="w-full text-white/40 text-xs hover:text-white transition-colors">
                                            Change Phone Number
                                        </Button>
                                    </form>
                                </Form>
                            )}
                        </TabsContent>
                    </Tabs>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><Separator className="bg-white/10" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0B1116] px-2 text-white/30">Or continue with</span></div>
                    </div>

                    <Button 
                        variant="outline" 
                        type="button" 
                        className="w-full bg-white/5 hover:bg-white/10 border-white/10 text-white font-semibold"
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
