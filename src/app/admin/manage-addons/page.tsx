
'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { useFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
import { addons as localAddons } from '@/lib/addons';
import { Addon } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ManageAddons } from '@/components/manage-addons';

type FetchStatus = 'loading' | 'complete' | 'error';

export default function ManageAddonsPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const [status, setStatus] = useState<FetchStatus>('loading');
  const [addons, setAddons] = useState<Addon[]>([]);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    if (!firestore) return;
    setStatus('loading');
    const addonsCollection = collection(firestore, 'addons');

    try {
      let snapshot = await getDocs(addonsCollection);

      if (snapshot.empty) {
        toast({
          title: 'Setting up Add-ons',
          description: 'Please wait while we populate your database with the initial add-on data.',
        });

        try {
          await Promise.all(localAddons.map(addon => {
            const docRef = doc(firestore, 'addons', addon.id);
            return setDoc(docRef, addon);
          }));
          
          snapshot = await getDocs(addonsCollection);
        } catch (e: any) {
           const permissionError = new FirestorePermissionError({
              path: 'addons',
              operation: 'create'
           });
           errorEmitter.emit('permission-error', permissionError);
           setStatus('error');
           return;
        }
      }
      
      const dbAddons = snapshot.docs.map(doc => doc.data() as Addon);
      setAddons(dbAddons);
      setStatus('complete');
    } catch (error) {
      const permissionError = new FirestorePermissionError({
          path: 'addons',
          operation: 'list'
      });
      errorEmitter.emit('permission-error', permissionError);
      setStatus('error');
    }
  }, [firestore, toast]);
  
  useEffect(() => {
    if (!isUserLoading && user && firestore) {
      loadData();
    }
  }, [isUserLoading, user, firestore, loadData]);

  if (isUserLoading || status === 'loading') {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background text-center gap-4 p-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <h2 className="text-xl font-semibold text-primary">
            Loading your add-ons...
        </h2>
        <p className="text-muted-foreground max-w-md">
          Fetching your add-on data from the database.
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

  return null; // Fallback, should be handled by status states
}
