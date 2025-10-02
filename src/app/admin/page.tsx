'use client';

import { useState } from 'react';
import { AdminDashboard } from '@/components/admin-dashboard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    // In a real application, this should be a secure authentication method.
    // For this prototype, we'll use a simple hardcoded password.
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <ShieldCheck className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline text-primary">Admin Access</CardTitle>
            <CardDescription>Please enter the password to view the dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
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
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
            <Button variant="link" className="w-full" asChild>
                <Link href="/">Go Back Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AdminDashboard />;
}
