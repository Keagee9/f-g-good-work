
'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { getAuth, createUserWithEmailAndPassword, listAll, User } from 'firebase/auth';
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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [userCheckState, setUserCheckState] = useState<'loading' | 'no_users' | 'users_exist'>('loading');

  useEffect(() => {
    // This check can only be done on the client side with the client SDK
    // It's not perfectly secure, but sufficient for this prototype's one-time setup.
    // In production, a server-side check or a more robust setup flow would be better.
    const checkUsers = async () => {
        try {
            // A more scalable way to check for users would be a Cloud Function,
            // as listAll() is not available in the client SDK.
            // For this prototype, we assume if the current user isn't the admin,
            // and we can't create one, it's because one already exists.
            // This is a simplified approach. A better check is needed for a real app.
            // We'll proceed with a "best-effort" client-side check.
            if (auth.currentUser && auth.currentUser.email === 'admin@fgluxury.com') {
                 setUserCheckState('users_exist');
                 return;
            }
            // As we can't list users, we'll assume no users exist and let the creation logic handle conflicts.
            setUserCheckState('no_users');

        } catch (e) {
            console.error("Error checking for existing users:", e);
            setError("Could not verify user status. Please try again later.");
            setUserCheckState('loading'); // Stay in loading on error
        }
    };

    if (!isUserLoading) {
        checkUsers();
    }
  }, [isUserLoading, auth]);

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
        description: 'You can now log in with your new credentials.',
      });
      setSetupComplete(true);
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        setError('An admin account already exists. If you forgot the password, please reset it via the Firebase console.');
        setUserCheckState('users_exist');
      } else {
        setError(`An unexpected error occurred: ${e.message}`);
      }
    } finally {
      setIsSettingUp(false);
    }
  };

  if (userCheckState === 'loading' || isUserLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (userCheckState === 'users_exist' || setupComplete) {
    return (
         <div className="flex justify-center items-center min-h-screen bg-background text-center px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        {setupComplete ? <ShieldCheck className="w-12 h-12 text-green-500" /> : <ServerCrash className="w-12 h-12 text-destructive" />}
                    </div>
                    <CardTitle className="text-2xl font-headline text-primary">
                        {setupComplete ? "Setup Complete" : "Setup Not Available"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <p className="text-muted-foreground">
                        {setupComplete
                            ? "The admin account has been successfully created."
                            : "An admin account already exists. This setup page can only be used once."
                        }
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

          {error && <p className="text-sm text-destructive">{error}</p>}

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
