
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck, ServerCrash, Home } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function SetupAdminPage() {
  const { auth, isUserLoading } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);

  // This check is a client-side approximation. In a real-world scenario,
  // you would use a server-side mechanism (like a Cloud Function) to securely
  // check if an admin account already exists before rendering this page.
  useEffect(() => {
    const checkAdminStatus = async () => {
      // For this prototype, we'll try to create the user and if it fails with
      // 'email-already-in-use', we know the admin exists. This is not ideal,
      // but a reasonable client-side proxy without a backend function.
      // We can't list users from the client.
      // A dummy fetch to a protected resource could also work.
      // For now, we'll just handle the error on creation.
      setAdminExists(false); // Assume it doesn't exist until creation fails.
    };
    if (!isUserLoading) {
        checkAdminStatus();
    }
  }, [isUserLoading]);

  const handleSetup = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSettingUp(true);
    setError(null);

    try {
      await createUserWithEmailAndPassword(auth, 'admin@fgluxury.com', password);
      toast({
        title: 'Admin Account Created!',
        description: 'Redirecting you to the admin login page.',
      });
      router.push('/admin');
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        setError('An admin account already exists.');
        setAdminExists(true);
      } else {
        setError(`An unexpected error occurred: ${e.message}`);
      }
    } finally {
      setIsSettingUp(false);
    }
  };

  if (adminExists === null || isUserLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (adminExists) {
    return (
         <div className="flex justify-center items-center min-h-screen bg-background text-center px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <ServerCrash className="w-12 h-12 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl font-headline text-primary">
                        Setup Not Available
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <p className="text-muted-foreground">
                        An admin account already exists for this application. This setup page can only be used once.
                    </p>
                    <Button variant="default" className="mt-6 w-full" asChild>
                        <Link href="/admin">Proceed to Admin Login</Link>
                    </Button>
                     <Button variant="link" className="mt-2" asChild>
                        <Link href="/">Go Back Home</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
  }


  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline text-primary">Admin Account Setup</CardTitle>
          <CardDescription>Create the initial admin account for the website. This can only be done once.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Admin Email</Label>
            <Input id="email" type="email" value="admin@fgluxury.com" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Choose a strong password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input id="confirm-password" type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>

          {error && <p className="text-sm text-center text-destructive bg-destructive/10 p-2 rounded-md">{error}</p>}

          <Button onClick={handleSetup} className="w-full" disabled={isSettingUp}>
            {isSettingUp ? <Loader2 className="animate-spin" /> : 'Create Admin Account'}
          </Button>

           <Button variant="link" className="w-full text-sm" asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" /> Go Back Home
              </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
