
'use client';

import { useState, useEffect } from 'react';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { serviceCategories as localServiceCategories } from '@/lib/data';
import { ServiceCategory, ServiceVariant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Home, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ManageServices } from '@/components/manage-services';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

type MigrationStatus = 'idle' | 'checking' | 'migrating' | 'complete' | 'error';

export default function ManageServicesPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>('idle');
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const checkAndMigrateData = async () => {
      if (!firestore || !user) return;

      setMigrationStatus('checking');
      const servicesCollection = collection(firestore, 'services');

      try {
        const snapshot = await getDocs(servicesCollection);
        if (snapshot.empty) {
          setMigrationStatus('migrating');
          toast({
            title: 'First-time Setup',
            description: 'Migrating your local services to the database. This will only happen once.',
          });

          const batch = writeBatch(firestore);
          localServiceCategories.forEach(category => {
            const docRef = doc(servicesCollection, category.id);
            // Ensure variants are stored as an array of objects
            const categoryToStore = {
                ...category,
                variants: category.variants.map(v => ({...v}))
            };
            batch.set(docRef, categoryToStore);
          });

          await batch.commit();
          
          toast({
            title: 'Migration Complete!',
            description: 'Your services are now managed in the database.',
          });
          setServices(localServiceCategories);
          setMigrationStatus('complete');
        } else {
          const dbServices = snapshot.docs.map(doc => doc.data() as ServiceCategory);
          setServices(dbServices);
          setMigrationStatus('complete');
        }
      } catch (error) {
        console.error('Error during service data migration/check:', error);
        toast({
          variant: 'destructive',
          title: 'Database Error',
          description: 'Could not read or write services. Check permissions.',
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
        <h2 className="text-xl font-semibold text-primary">Setting up your services...</h2>
        <p className="text-muted-foreground max-w-md">
          {migrationStatus === 'checking' 
            ? 'Checking your service database...' 
            : 'One moment, we are migrating your services to the database for the first time. This will allow you to edit them from this page.'}
        </p>
      </div>
    );
  }

  if (migrationStatus === 'error') {
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


  if (migrationStatus === 'complete' && services.length > 0) {
    return <ManageServices initialServices={services} />;
  }

  return (
     <div className="flex flex-col justify-center items-center min-h-screen bg-background text-center gap-4 p-4">
        <CheckCircle className="w-12 h-12 text-green-500" />
        <h2 className="text-xl font-semibold text-primary">No Services Found</h2>
        <p className="text-muted-foreground max-w-md">
            Your database is ready, but no services were found. You can add them here.
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
