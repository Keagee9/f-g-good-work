'use client';

import { useState } from 'react';
import { AdminDashboard } from '@/components/admin-dashboard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useFirebase, useUser } from '@/firebase';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { isAdmin } from '@/lib/auth-utils';


export default function AdminPage() {
  const { auth, isUserLoading } = useFirebase();
  const { user } = useUser();
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('admin@fgluxury.com');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = () => {
    setIsLoggingIn(true);
    setError('');
    initiateEmailSignIn(auth, email, password);
    // The useUser hook will handle the auth state change.
    // We'll add a timeout to show an error if login takes too long or fails.
    setTimeout(() => {
        if (!user) {
            setError('Incorrect email or password. Please try again.');
            setIsLoggingIn(false);
        }
    }, 5000); // 5-second timeout for login attempt
  };

  if (isUserLoading || isLoggingIn) {
      return (
        <div className="flex justify-center items-center min-h-screen bg-background">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      )
  }

  // If user is logged in, check if they are an admin
  if (user) {
    if (isAdmin(user)) {
        return <AdminDashboard />;
    } else {
        return (
             <div className="flex flex-col justify-center items-center min-h-screen bg-background text-center px-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl font-headline text-destructive">Access Denied</CardTitle>
                        <CardDescription>You are not authorized to view this page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Please contact the site administrator if you believe this is a mistake.</p>
                        <Button variant="link" className="mt-4" asChild>
                            <Link href="/">Go Back Home</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }
  }


  // If no user, show login form
  return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <ShieldCheck className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline text-primary">Admin Access</CardTitle>
            <CardDescription>Please enter your credentials to view the dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
               <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleLogin} className="w-full" disabled={isLoggingIn}>
               {isLoggingIn ? <Loader2 className="animate-spin" /> : 'Login'}
            </Button>
            <Button variant="link" className="w-full" asChild>
                <Link href="/">Go Back Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );

}
