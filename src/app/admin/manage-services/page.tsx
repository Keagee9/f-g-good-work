
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { ServiceCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Home, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ManageServices } from '@/components/manage-services';

type FetchStatus = 'loading' | 'complete' | 'error';

export default function ManageServicesPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const [status, setStatus] = useState<FetchStatus>('loading');
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!firestore || !user || isUserLoading) return;

    setStatus('loading');
    const servicesCollection = collection(firestore, 'services');
    
    const unsubscribe = onSnapshot(servicesCollection, 
      (snapshot) => {
        if (snapshot.empty) {
            toast({
                title: 'No Services Found',
                description: 'Your services collection is empty. You can manage them here once they are added.',
                variant: 'default',
            });
        }
        const dbServices = snapshot.docs.map(doc => doc.data() as ServiceCategory);
        setServices(dbServices);
        setStatus('complete');
      },
      (error) => {
        console.error('Error fetching services:', error);
        toast({
          variant: 'destructive',
          title: 'Database Error',
          description: 'Could not read services. Check Firestore permissions.',
        });
        setStatus('error');
      }
    );
    
    return () => unsubscribe();
  }, [firestore, user, isUserLoading, toast]);
  
  if (isUserLoading || status === 'loading') {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background text-center gap-4 p-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <h2 className="text-xl font-semibold text-primary">Loading your services...</h2>
        <p className="text-muted-foreground max-w-md">
          Fetching your service data from the database.
        </p>
      </div>
    );
  }

  if (status === 'error') {
     return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background text-center gap-4 p-4">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-semibold text-destructive">Error Accessing Services</h2>
        <p className="text-muted-foreground max-w-md">
            There was a problem accessing your services data. Please check your Firestore security rules to ensure the admin has read/write access to the 'services' collection.
        </p>
        <Button variant="default" asChild>
            <Link href="/admin">
                <Home className="w-4 h-4 mr-2" />
                Back to Admin
            </Link>
        </Button>
      </div>
    );
  }

  if (status === 'complete') {
    return <ManageServices initialServices={services} />;
  }

  // Fallback case, should not be reached
  return (
     <div className="flex flex-col justify-center items-center min-h-screen bg-background text-center gap-4 p-4">
        <CheckCircle className="w-12 h-12 text-green-500" />
        <h2 className="text-xl font-semibold text-primary">Ready to Manage Services</h2>
         <Button variant="default" asChild>
            <Link href="/admin">
                <Home className="w-4 h-4 mr-2" />
                Back to Admin
            </Link>
        </Button>
      </div>
  );
}
