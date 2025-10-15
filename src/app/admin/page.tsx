
'use client';

import { useState } from 'react';
import { AdminDashboard } from '@/components/admin-dashboard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Loader2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useFirebase, useUser } from '@/firebase';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { isAdmin } from '@/lib/auth-utils';


export default function AdminPage() {
  const { auth, isUserLoading } = useFirebase();
  const { user } = useUser();
  const [password, setPassword] = useState('password123');
  const [email, setEmail] = useState('admin@fgluxury.com');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);

  const handleLogin = () => {
    setIsLoggingIn(true);
    setLoginAttempted(true);
    setError('');
    initiateEmailSignIn(auth, email, password);

    // After 5 seconds, check the result
    setTimeout(() => {
        // useUser().user won't be updated instantly, so we check auth.currentUser
        if (!auth.currentUser || auth.currentUser.email !== email) {
             setError('Incorrect email or password. Please try again.');
        }
        setIsLoggingIn(false);
    }, 5000);
  };
  
  if (isUserLoading) {
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
        // This case handles a non-admin user who is already logged in
        return (
             <div className="flex flex-col justify-center items-center min-h-screen bg-background text-center px-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl font-headline text-destructive">Access Denied</CardTitle>
                        <CardDescription>You are not authorized to view this page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>You are logged in as {user.email}, which is not an admin account.</p>
                        <Button variant="link" className="mt-4" asChild>
                            <Link href="/">Go Back Home</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }
  }

  // If no user is logged in, show the login form
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
            {error && (
                <div className='text-center'>
                    <p className="text-sm text-destructive">{error}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                        If you haven't set up the admin account yet, you can do so here:
                    </p>
                     <Button variant="outline" size="sm" className="mt-2" asChild>
                        <Link href="/setup-admin">
                            <UserPlus className="mr-2" />
                            Setup Admin Account
                        </Link>
                    </Button>
                </div>
            )}
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
