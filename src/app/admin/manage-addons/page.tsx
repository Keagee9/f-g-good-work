'use client';

import { useState, useEffect } from 'react';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { addons as localAddons } from '@/lib/addons';
import { Addon } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Home, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ManageAddons } from '@/components/manage-addons';

type MigrationStatus = 'idle' | 'checking' | 'migrating' | 'complete' | 'error';

export default function ManageAddonsPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>('idle');
  const [addons, setAddons] = useState<Addon[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const checkAndMigrateData = async () => {
      if (!firestore || !user) return;

      setMigrationStatus('checking');
      const addonsCollection = collection(firestore, 'addons');

      try {
        const snapshot = await getDocs(addonsCollection);
        if (snapshot.empty) {
          setMigrationStatus('migrating');
          toast({
            title: 'First-time Setup',
            description: 'Migrating your local add-ons to the database. This will only happen once.',
          });

          const batch = writeBatch(firestore);
          localAddons.forEach(addon => {
            const docRef = doc(addonsCollection, addon.id);
            const addonToStore = { ...addon };
            batch.set(docRef, addonToStore);
          });

          await batch.commit();
          
          toast({
            title: 'Migration Complete!',
            description: 'Your add-ons are now managed in the database.',
          });
          setAddons(localAddons);
          setMigrationStatus('complete');
        } else {
          const dbAddons = snapshot.docs.map(doc => doc.data() as Addon);
          setAddons(dbAddons);
          setMigrationStatus('complete');
        }
      } catch (error) {
        console.error('Error during add-on data migration/check:', error);
        toast({
          variant: 'destructive',
          title: 'Database Error',
          description: 'Could not read or write add-ons. Check permissions.',
        });
        setMigrationStatus('error');
      }
    };

    if (!isUserLoading) {
      checkAndMigrateData();
    }
  }, [firestore, user, isUserLoading, toast]);
  
  if (isUserLoading || migrationStatus === 'checking' || migrationStatus === 'migrating') {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background text-center gap-4 p-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <h2 className="text-xl font-semibold text-primary">Setting up your add-ons...</h2>
        <p className="text-muted-foreground max-w-md">
          {migrationStatus === 'checking' 
            ? 'Checking your add-on database...' 
            : 'One moment, we are migrating your add-ons to the database for the first time.'}
        </p>
      </div>
    );
  }

  if (migrationStatus === 'error') {
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

  if (migrationStatus === 'complete' && addons.length > 0) {
    return <ManageAddons initialAddons={addons} />;
  }

  return (
     <div className="flex flex-col justify-center items-center min-h-screen bg-background text-center gap-4 p-4">
        <CheckCircle className="w-12 h-12 text-green-500" />
        <h2 className="text-xl font-semibold text-primary">No Add-ons Found</h2>
        <p className="text-muted-foreground max-w-md">
            Your database is ready, but no add-ons were found. You can add them here.
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
