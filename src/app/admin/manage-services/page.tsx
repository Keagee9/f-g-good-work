
'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { useFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
import { serviceCategories as localServiceCategories } from '@/lib/data';
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

  const loadServices = useCallback(async () => {
    if (!firestore) return;
    setStatus('loading');
    
    const servicesCollection = collection(firestore, 'services');

    try {
      let snapshot = await getDocs(servicesCollection);

      if (snapshot.empty) {
        toast({
            title: 'Setting up Services',
            description: 'One-time data migration in progress. Please wait...',
        });
        
        const batch = writeBatch(firestore);
        localServiceCategories.forEach(category => {
            const docId = category.id.replace(/\//g, '-');
            const docRef = doc(firestore, 'services', docId);
            batch.set(docRef, { ...category, id: docId });
        });
        
        try {
            await batch.commit();
            // After migration, refetch the data
            snapshot = await getDocs(servicesCollection);
        } catch (e) {
            const permissionError = new FirestorePermissionError({ path: 'services', operation: 'write' });
            errorEmitter.emit('permission-error', permissionError);
            setStatus('error');
            return;
        }
      }
      
      const dbServices = snapshot.docs.map(doc => doc.data() as ServiceCategory);
      setServices(dbServices);
      setStatus('complete');

    } catch (error) {
        console.error("Error loading services:", error);
        const permissionError = new FirestorePermissionError({ path: 'services', operation: 'list' });
        errorEmitter.emit('permission-error', permissionError);
        setStatus('error');
    }
  }, [firestore, toast]);

  useEffect(() => {
    if (!isUserLoading && user) {
        loadServices();
    }
  }, [isUserLoading, user, loadServices]);

  if (isUserLoading || status === 'loading') {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background text-center gap-4 p-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <h2 className="text-xl font-semibold text-primary">Loading your services...</h2>
        <p className="text-muted-foreground max-w-md">Fetching your service data from the database. One-time migration may occur.</p>
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

  // Fallback case
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
