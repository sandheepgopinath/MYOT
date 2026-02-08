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
import { Loader2, Chrome, Mail, Phone } from 'lucide-react';

const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name is required'),
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    bio: z.string().optional(),
});

const phoneSignupSchema = z.object({
    phoneNumber: z.string().length(10, 'Enter a valid 10-digit mobile number'),
    name: z.string().min(2, 'Name is required'),
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    bio: z.string().optional(),
});

const signinSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

const phoneSigninSchema = z.object({
    phoneNumber: z.string().length(10, 'Enter a valid 10-digit mobile number'),
});

const codeSchema = z.object({
    code: z.string().length(6, 'Verification code is 6 digits'),
});

type AuthTab = 'signin' | 'signup';
type AuthMethod = 'email' | 'phone';

export function AuthForms() {
    const [activeTab, setActiveTab] = useState<AuthTab>('signin');
    const [method, setMethod] = useState<AuthMethod>('phone');
    const [phoneStep, setPhoneStep] = useState<'request' | 'verify'>('request');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [pendingProfile, setPendingProfile] = useState<any>(null);

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

    const phoneSignupForm = useForm<z.infer<typeof phoneSignupSchema>>({
        resolver: zodResolver(phoneSignupSchema),
        defaultValues: { phoneNumber: '', name: '', username: '', bio: '' },
    });

    const signinForm = useForm<z.infer<typeof signinSchema>>({
        resolver: zodResolver(signinSchema),
        defaultValues: { email: '', password: '' },
    });

    const phoneSigninForm = useForm<z.infer<typeof phoneSigninSchema>>({
        resolver: zodResolver(phoneSigninSchema),
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
            
            toast({ title: 'Legacy Created', description: 'Welcome to the designer community.' });
        } catch (error) {
            const authError = error as AuthError;
            if (authError.code === 'auth/email-already-in-use') {
                signupForm.setError('email', { message: 'This email is already in use.' });
            } else {
                toast({ variant: 'destructive', title: 'Registration Failed', description: authError.message });
            }
        }
    };

    const onPhoneSignupSubmit = async (values: z.infer<typeof phoneSignupSchema>) => {
        try {
            const isUnique = await checkUsernameUnique(values.username);
            if (!isUnique) {
                phoneSignupForm.setError('username', { message: 'Username is already taken' });
                return;
            }

            setupRecaptcha();
            const verifier = (window as any).recaptchaVerifier;
            const fullNumber = `+91${values.phoneNumber}`;
            const result = await signInWithPhoneNumber(auth, fullNumber, verifier);
            
            setConfirmationResult(result);
            setPendingProfile({
                name: values.name,
                username: values.username,
                bio: values.bio
            });
            setPhoneStep('verify');
            toast({ title: 'Verification Sent', description: `Check your device for the legacy access code.` });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Failed to send code', description: error.message });
        }
    };

    const onSigninSubmit = async (values: z.infer<typeof signinSchema>) => {
        try {
            await signInWithEmailAndPassword(auth, values.email, values.password);
            toast({ title: 'Welcome Back', description: 'Accessing your designer studio...' });
        } catch (error) {
            const authError = error as AuthError;
            toast({ variant: 'destructive', title: 'Login Failed', description: authError.message });
        }
    };

    const onPhoneSigninSubmit = async (values: z.infer<typeof phoneSigninSchema>) => {
        try {
            setupRecaptcha();
            const verifier = (window as any).recaptchaVerifier;
            const fullNumber = `+91${values.phoneNumber}`;
            const result = await signInWithPhoneNumber(auth, fullNumber, verifier);
            setConfirmationResult(result);
            setPhoneStep('verify');
            toast({ title: 'OTP Sent', description: `Verification code sent to ${fullNumber}` });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Failed to send OTP', description: error.message });
        }
    };

    const onCodeSubmit = async (values: z.infer<typeof codeSchema>) => {
        try {
            if (!confirmationResult) return;
            const result = await confirmationResult.confirm(values.code);
            await handleSyncUserDoc(result.user, pendingProfile);
            toast({ title: 'Verified', description: 'Studio access granted.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Verification Failed', description: 'Invalid code provided.' });
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

    return (
        <div className="w-full max-w-md mx-auto">
            <Card className="bg-[#0F1419]/60 backdrop-blur-3xl border border-amber-500/20 shadow-[0_0_60px_-15px_rgba(245,158,11,0.3)] rounded-2xl overflow-hidden relative group">
                {/* Inner Glow Decorative Layer */}
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-transparent pointer-events-none" />
                
                <div className="p-8 md:p-10 relative z-10 space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl md:text-3xl font-display text-white tracking-wide">Join Community</h2>
                        <p className="text-sm text-white/40 font-tagline italic">
                            {activeTab === 'signin' ? 'Sign in to manage your designs' : 'Register your creative legacy'}
                        </p>
                    </div>

                    <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as AuthTab); setPhoneStep('request'); }} className="w-full">
                        {/* Styled Tabs List */}
                        <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 border border-white/10 p-1 h-11 rounded-lg">
                            <TabsTrigger value="signin" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-500 rounded-md transition-all duration-300">Sign In</TabsTrigger>
                            <TabsTrigger value="signup" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-500 rounded-md transition-all duration-300">Sign Up</TabsTrigger>
                        </TabsList>

                        {/* SIGN IN VIEW */}
                        <TabsContent value="signin" className="mt-0 space-y-6">
                            {method === 'email' ? (
                                <Form {...signinForm}>
                                    <form onSubmit={signinForm.handleSubmit(onSigninSubmit)} className="space-y-5">
                                        <FormField
                                            control={signinForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-bold">Email</FormLabel>
                                                    <FormControl><Input placeholder="name@example.com" {...field} className="bg-white/5 border-white/10 text-white focus:border-amber-500/50 h-12 rounded-lg transition-all" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={signinForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-bold">Password</FormLabel>
                                                    <FormControl><Input type="password" placeholder="••••••••" {...field} className="bg-white/5 border-white/10 text-white focus:border-amber-500/50 h-12 rounded-lg transition-all" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full h-12 bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/5 text-white font-medium tracking-wide transition-all duration-500 shadow-lg shadow-black/40" disabled={signinForm.formState.isSubmitting}>
                                            {signinForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Enter Studio'}
                                        </Button>
                                    </form>
                                </Form>
                            ) : (
                                phoneStep === 'request' ? (
                                    <Form {...phoneSigninForm}>
                                        <form onSubmit={phoneSigninForm.handleSubmit(onPhoneSigninSubmit)} className="space-y-5">
                                            <FormField
                                                control={phoneSigninForm.control}
                                                name="phoneNumber"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-bold">Phone Number</FormLabel>
                                                        <div className="relative flex items-center">
                                                            <span className="absolute left-4 text-white/30 font-medium">+91</span>
                                                            <FormControl><Input placeholder="9876543210" {...field} className="bg-white/5 border-white/10 text-white focus:border-amber-500/50 h-12 pl-14 rounded-lg" maxLength={10} /></FormControl>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="submit" className="w-full h-12 bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/5 text-white font-medium tracking-wide transition-all duration-500 shadow-lg shadow-black/40" disabled={phoneSigninForm.formState.isSubmitting}>
                                                {phoneSigninForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Request Code'}
                                            </Button>
                                            <div id="recaptcha-container"></div>
                                        </form>
                                    </Form>
                                ) : (
                                    <Form {...codeForm}>
                                        <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="space-y-5">
                                            <FormField
                                                control={codeForm.control}
                                                name="code"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-white/60 text-center block text-[10px] uppercase tracking-[0.2em] font-bold">Verify Access Code</FormLabel>
                                                        <FormControl><Input placeholder="123456" {...field} className="bg-white/5 border-white/10 text-white h-14 text-center tracking-[0.8em] font-bold text-xl rounded-lg" maxLength={6} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="submit" className="w-full h-12 bg-amber-500/80 hover:bg-amber-500 text-black font-bold tracking-widest rounded-lg transition-all" disabled={codeForm.formState.isSubmitting}>
                                                {codeForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirm Identity'}
                                            </Button>
                                        </form>
                                    </Form>
                                )
                            )}
                        </TabsContent>

                        {/* SIGN UP VIEW */}
                        <TabsContent value="signup" className="mt-0 space-y-6">
                            {method === 'email' ? (
                                <Form {...signupForm}>
                                    <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={signupForm.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-bold">Full Name</FormLabel>
                                                        <FormControl><Input placeholder="Artist Name" {...field} className="bg-white/5 border-white/10 text-white h-11 rounded-lg" /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={signupForm.control}
                                                name="username"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-bold">Username</FormLabel>
                                                        <FormControl><Input placeholder="handle" {...field} className="bg-white/5 border-white/10 text-white h-11 rounded-lg" /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={signupForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-bold">Email</FormLabel>
                                                    <FormControl><Input placeholder="name@example.com" {...field} className="bg-white/5 border-white/10 text-white h-11 rounded-lg" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={signupForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-bold">Password</FormLabel>
                                                    <FormControl><Input type="password" placeholder="••••••••" {...field} className="bg-white/5 border-white/10 text-white h-11 rounded-lg" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={signupForm.control}
                                            name="bio"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-bold">Creative Bio</FormLabel>
                                                    <FormControl><Textarea placeholder="Share your style..." {...field} className="bg-white/5 border-white/10 text-white min-h-[80px] rounded-lg resize-none" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full h-12 bg-amber-500/80 hover:bg-amber-500 text-black font-bold tracking-widest rounded-lg transition-all mt-4" disabled={signupForm.formState.isSubmitting}>
                                            {signupForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Begin Legacy'}
                                        </Button>
                                    </form>
                                </Form>
                            ) : (
                                // Phone signup steps (Same style as Sign In but with additional fields)
                                phoneStep === 'request' ? (
                                    <Form {...phoneSignupForm}>
                                        <form onSubmit={phoneSignupForm.handleSubmit(onPhoneSignupSubmit)} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField control={phoneSignupForm.control} name="name" render={({ field }) => (
                                                    <FormItem><FormLabel className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-bold">Full Name</FormLabel><FormControl><Input placeholder="Artist Name" {...field} className="bg-white/5 border-white/10 h-11 rounded-lg text-white" /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={phoneSignupForm.control} name="username" render={({ field }) => (
                                                    <FormItem><FormLabel className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-bold">Username</FormLabel><FormControl><Input placeholder="handle" {...field} className="bg-white/5 border-white/10 h-11 rounded-lg text-white" /></FormControl><FormMessage /></FormItem>
                                                )} />
                                            </div>
                                            <FormField control={phoneSignupForm.control} name="phoneNumber" render={({ field }) => (
                                                <FormItem><FormLabel className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-bold">Mobile</FormLabel><div className="relative flex items-center"><span className="absolute left-4 text-white/30 font-medium">+91</span><FormControl><Input placeholder="9876543210" {...field} className="bg-white/5 border-white/10 h-11 pl-14 rounded-lg text-white" maxLength={10} /></FormControl></div><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={phoneSignupForm.control} name="bio" render={({ field }) => (
                                                <FormItem><FormLabel className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-bold">Bio</FormLabel><FormControl><Textarea placeholder="Share your style..." {...field} className="bg-white/5 border-white/10 min-h-[80px] rounded-lg text-white resize-none" /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <Button type="submit" className="w-full h-12 bg-amber-500/80 hover:bg-amber-500 text-black font-bold tracking-widest rounded-lg mt-4" disabled={phoneSignupForm.formState.isSubmitting}>
                                                {phoneSignupForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Get Legacy Code'}
                                            </Button>
                                            <div id="recaptcha-container"></div>
                                        </form>
                                    </Form>
                                ) : (
                                    <Form {...codeForm}>
                                        <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="space-y-5">
                                            <FormField control={codeForm.control} name="code" render={({ field }) => (
                                                <FormItem><FormLabel className="text-white/60 text-center block text-[10px] uppercase tracking-[0.2em] font-bold">Verify Access Code</FormLabel><FormControl><Input placeholder="123456" {...field} className="bg-white/5 border-white/10 text-white h-14 text-center tracking-[0.8em] font-bold text-xl rounded-lg" maxLength={6} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <Button type="submit" className="w-full h-12 bg-amber-500/80 hover:bg-amber-500 text-black font-bold tracking-widest rounded-lg" disabled={codeForm.formState.isSubmitting}>Confirm Identity</Button>
                                        </form>
                                    </Form>
                                )
                            )}
                        </TabsContent>
                    </Tabs>

                    {/* Method Toggle / Mobile Switcher */}
                    <div className="relative flex items-center justify-center pt-2">
                        <Separator className="bg-white/10" />
                        <div className="absolute flex justify-center w-full">
                            <button 
                                type="button"
                                onClick={() => {
                                    setMethod(method === 'email' ? 'phone' : 'email');
                                    setPhoneStep('request');
                                }}
                                className="bg-[#0F1419]/80 backdrop-blur-md px-6 py-2 text-[10px] uppercase tracking-[0.2em] text-amber-500/80 hover:text-amber-500 border border-amber-500/30 hover:border-amber-500/60 transition-all font-bold whitespace-nowrap rounded-full shadow-[0_0_15px_-5px_rgba(245,158,11,0.4)]"
                            >
                                {method === 'email' ? 'Use mobile instead' : 'Use email instead'}
                            </button>
                        </div>
                    </div>

                    {/* Social Auth */}
                    <div className="pt-4">
                        <Button 
                            variant="outline" 
                            type="button" 
                            className="w-full h-12 bg-white/5 hover:bg-white/10 border-white/10 text-white font-medium flex items-center justify-center gap-3 transition-all rounded-lg shadow-lg"
                            onClick={handleGoogleSignIn}
                        >
                            <Chrome className="w-5 h-5 text-white/80" />
                            Sign in with Google
                        </Button>
                    </div>

                    {/* Footer Attribution Section */}
                    <div className="text-center mt-10 space-y-4">
                        <p className="text-[10px] md:text-[11px] text-white/20 uppercase tracking-[0.2em] leading-relaxed font-tagline font-bold">
                            We handle printing, shipping, and support—<br />
                            so you can focus on creating.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
