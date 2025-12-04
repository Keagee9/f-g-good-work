
'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, writeBatch, doc } from 'firebase/firestore';
import { useFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
import { serviceCategories as localServiceCategories } from '@/lib/data';
import { ServiceCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ManageServices } from '@/components/manage-services';

type FetchStatus = 'loading' | 'complete' | 'error';

export default function ManageServicesPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const [status, setStatus] = useState<FetchStatus>('loading');
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const { toast } = useToast();

  const migrateData = useCallback(async () => {
    if (!firestore) return;
    toast({
      title: 'Setting up Services',
      description: 'Please wait while we populate your database with the initial service data.',
    });
    try {
      const batch = writeBatch(firestore);
      localServiceCategories.forEach(category => {
        const docId = category.id.replace(/\//g, '-');
        const docRef = doc(firestore, 'services', docId);
        batch.set(docRef, { ...category, id: docId });
      });
      await batch.commit();
      // Data will be set by the onSnapshot listener
    } catch (e: any) {
      const permissionError = new FirestorePermissionError({
        path: 'services',
        operation: 'write'
      });
      errorEmitter.emit('permission-error', permissionError);
      setStatus('error');
    }
  }, [firestore, toast]);

  useEffect(() => {
    if (!firestore || !user) {
      if (!isUserLoading) setStatus('error');
      return;
    }

    setStatus('loading');
    const servicesCollection = collection(firestore, 'services');
    
    const unsubscribe = onSnapshot(servicesCollection, (snapshot) => {
      if (snapshot.empty) {
        migrateData();
      } else {
        const dbServices = snapshot.docs.map(doc => doc.data() as ServiceCategory);
        setServices(dbServices);
        setStatus('complete');
      }
    }, (error) => {
      const permissionError = new FirestorePermissionError({
        path: 'services',
        operation: 'list'
      });
      errorEmitter.emit('permission-error', permissionError);
      setStatus('error');
    });

    return () => unsubscribe();
  }, [firestore, user, isUserLoading, migrateData]);
  
  if (isUserLoading || status === 'loading') {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background text-center gap-4 p-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <h2 className="text-xl font-semibold text-primary">
            Loading your services...
        </h2>
        <p className="text-muted-foreground max-w-md">
          Fetching your service data from the database. This may include a one-time setup.
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

  return null; // Fallback for loading state
}
