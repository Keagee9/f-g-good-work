
'use client';

import { useState, useEffect } from 'react';
import { AdminDashboard } from '@/components/admin-dashboard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Loader2, UserPlus, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useFirebase, useUser } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const { auth, isUserLoading } = useFirebase();
  const { user } = useUser();
  const [password, setPassword] = useState('password123');
  const [email, setEmail] = useState('admin@fgluxury.com');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle the redirect to the dashboard
      // No need to do anything here.
    } catch (e: any) {
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found') {
        setError('Incorrect email or password. Have you created the admin account yet?');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setIsLoggingIn(false);
    }
  };
  
  const handleLogout = () => {
    auth.signOut();
    setIsLoggingIn(false);
  }

  if (isUserLoading) {
      return (
        <div className="flex justify-center items-center min-h-screen bg-background">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      )
  }

  // If user is logged in, check if they are an admin
  if (user) {
    // In this app, we identify admin by email. In a real app, use custom claims.
    if (user.email === 'admin@fgluxury.com') {
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
                        <div className="flex flex-col items-center gap-4 mt-4">
                            <Button variant="destructive" onClick={handleLogout}>
                                <LogOut className="mr-2" />
                                Logout
                            </Button>
                            <Button variant="link" asChild>
                                <Link href="/">Go Back Home</Link>
                            </Button>
                        </div>
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
                disabled
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
                <div className='text-center p-2 bg-destructive/10 border border-destructive/20 rounded-md'>
                    <p className="text-sm text-destructive">{error}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                        If you haven't set up the admin account yet, click below.
                    </p>
                     <Button variant="secondary" size="sm" className="mt-2" asChild>
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
