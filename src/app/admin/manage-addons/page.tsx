
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, getDocs, writeBatch, doc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { addons as localAddons } from '@/lib/addons';
import { Addon } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Home, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ManageAddons } from '@/components/manage-addons';

type FetchStatus = 'loading' | 'migrating' | 'complete' | 'error';

export default function ManageAddonsPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const [status, setStatus] = useState<FetchStatus>('loading');
  const [addons, setAddons] = useState<Addon[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!firestore || !user || isUserLoading) return;

    const addonsCollection = collection(firestore, 'addons');

    const migrateData = async () => {
        setStatus('migrating');
        toast({
            title: 'Setting up Add-ons',
            description: 'Please wait while we populate your database with the initial add-on data.',
        });
        const batch = writeBatch(firestore);
        localAddons.forEach(addon => {
            const docRef = doc(firestore, 'addons', addon.id);
            batch.set(docRef, addon);
        });
        await batch.commit();
    };

    const unsubscribe = onSnapshot(addonsCollection, 
      async (snapshot) => {
        if (snapshot.empty) {
            try {
                await migrateData();
                // The onSnapshot will re-trigger with the new data after migration
            } catch (e: any) {
                 console.error('Error migrating add-ons:', e);
                 toast({
                    variant: 'destructive',
                    title: 'Migration Failed',
                    description: 'Could not write initial add-on data. Check Firestore permissions.',
                });
                setStatus('error');
            }
        } else {
            const dbAddons = snapshot.docs.map(doc => doc.data() as Addon);
            setAddons(dbAddons);
            setStatus('complete');
        }
      },
      (error) => {
        console.error('Error fetching add-ons:', error);
        toast({
          variant: 'destructive',
          title: 'Database Error',
          description: 'Could not read add-ons. Check Firestore permissions.',
        });
        setStatus('error');
      }
    );
    
    return () => unsubscribe();
  }, [firestore, user, isUserLoading, toast]);
  
  if (isUserLoading || status === 'loading' || status === 'migrating') {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background text-center gap-4 p-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <h2 className="text-xl font-semibold text-primary">
            {status === 'migrating' ? 'Migrating add-on data...' : 'Loading your add-ons...'}
        </h2>
        <p className="text-muted-foreground max-w-md">
          {status === 'migrating' 
            ? 'This is a one-time setup and may take a moment.' 
            : 'Fetching your add-on data from the database.'
          }
        </p>
      </div>
    );
  }

  if (status === 'error') {
     return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background text-center gap-4 p-4">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-semibold text-destructive">Error Accessing Add-ons</h2>
        <p className="text-muted-foreground max-w-md">
            There was a problem accessing your add-ons data. Please check your Firestore security rules to ensure the admin has read/write access to the 'addons' collection.
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
    return <ManageAddons initialAddons={addons} />;
  }

  // Fallback case, should not be reached
  return (
     <div className="flex flex-col justify-center items-center min-h-screen bg-background text-center gap-4 p-4">
        <CheckCircle className="w-12 h-12 text-green-500" />
        <h2 className="text-xl font-semibold text-primary">Ready to Manage Add-ons</h2>
         <Button variant="default" asChild>
            <Link href="/admin">
                <Home className="w-4 h-4 mr-2" />
                Back to Admin
            </Link>
        </Button>
      </div>
  );
}
