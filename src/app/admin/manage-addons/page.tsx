
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, writeBatch, doc } from 'firebase/firestore';
import { useFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
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
        try {
            const batch = writeBatch(firestore);
            localAddons.forEach(addon => {
                const docRef = doc(firestore, 'addons', addon.id);
                batch.set(docRef, addon);
            });
            await batch.commit();
        } catch (e: any) {
             const permissionError = new FirestorePermissionError({
                path: 'addons',
                operation: 'write'
             });
             errorEmitter.emit('permission-error', permissionError);
            setStatus('error');
            throw permissionError;
        }
    };

    const unsubscribe = onSnapshot(addonsCollection,
      (snapshot) => {
        if (snapshot.empty && status !== 'migrating' && status !== 'error') {
            migrateData().catch(() => {
                // Error is handled in migrateData
            });
        } else if (!snapshot.empty) {
            const dbAddons = snapshot.docs.map(doc => doc.data() as Addon);
            setAddons(dbAddons);
            setStatus('complete');
        }
      },
      (error) => {
        const permissionError = new FirestorePermissionError({
            path: 'addons',
            operation: 'list'
        });
        errorEmitter.emit('permission-error', permissionError);
        setStatus('error');
      }
    );

    return () => unsubscribe();
  }, [firestore, user, isUserLoading]);

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

  