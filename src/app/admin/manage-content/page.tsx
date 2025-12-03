
'use client';

import { AdminDashboard } from '@/components/admin-dashboard';
import { useFirebase, useUser } from '@/firebase';
import { Loader2, LogOut, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

// This is a wrapper page to protect the dashboard.
// The actual UI is in the AdminDashboard component.
// We redirect to the main admin login if the user is not authenticated as an admin.

export default function ManageContentPage() {
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();

  const handleLogout = () => {
    auth.signOut();
  };

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (user && user.email === 'admin@fgluxury.com') {
    return <AdminDashboard />;
  }

  // If not logged in as admin, show an access denied message and redirect.
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-background text-center px-4">
      <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-md">
        <ShieldCheck className="w-16 h-16 mx-auto text-destructive" />
        <h1 className="text-2xl font-bold font-headline text-destructive mt-4">Access Denied</h1>
        <p className="text-muted-foreground mt-2">
          You must be logged in as an administrator to access this page.
        </p>
        <div className="flex flex-col items-center gap-4 mt-6">
          {user && (
            <div className="text-sm">
              <p>You are currently logged in as {user.email}.</p>
              <Button variant="destructive" onClick={handleLogout} className="mt-2">
                <LogOut className="mr-2" />
                Logout
              </Button>
            </div>
          )}
          <Button asChild>
            <Link href="/admin">Go to Admin Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
