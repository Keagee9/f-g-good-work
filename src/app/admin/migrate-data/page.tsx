
'use client';

import { useState } from 'react';
import { useFirebase } from '@/firebase';
import { collection, writeBatch, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { serviceCategories } from '@/lib/data';
import { addons } from '@/lib/addons';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Database, AlertTriangle, PartyPopper } from 'lucide-react';
import Link from 'next/link';

export default function MigrateDataPage() {
  const { firestore: db } = useFirebase();
  const { toast } = useToast();
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleMigration = async () => {
    setIsMigrating(true);
    setMigrationStatus('idle');
    setErrorMessage('');

    try {
      const batch = writeBatch(db);

      // Clear existing services and addons to avoid duplicates
      const existingServicesSnapshot = await getDocs(collection(db, 'services'));
      existingServicesSnapshot.forEach(doc => batch.delete(doc.ref));

      const existingAddonsSnapshot = await getDocs(collection(db, 'addons'));
      existingAddonsSnapshot.forEach(doc => batch.delete(doc.ref));

      // Add services from local data file
      serviceCategories.forEach(category => {
        category.variants.forEach(variant => {
          const serviceRef = collection(db, 'services');
          // Important: create a new doc ref for each variant without specifying an ID
          // Firestore will auto-generate one. We use the variant `id` from the file
          // as a field in the document for consistency if needed.
          const docRef = doc(serviceRef, variant.id);
          batch.set(docRef, { 
            ...variant, 
            category: category.name, // Add category name to each service
            image: category.image,   // Add category image to each service
          });
        });
      });

      // Add addons from local data file
      const addonsCollection = collection(db, 'addons');
      addons.forEach(addon => {
        const docRef = doc(addonsCollection, addon.id);
        batch.set(docRef, addon);
      });

      // Commit the batch
      await batch.commit();

      setMigrationStatus('success');
      toast({
        title: 'Migration Successful',
        description: 'All services and add-ons have been saved to the database.',
      });
    } catch (error: any) {
      console.error('Migration failed:', error);
      setMigrationStatus('error');
      setErrorMessage(error.message || 'An unknown error occurred.');
      toast({
        variant: 'destructive',
        title: 'Migration Failed',
        description: 'Could not save data to the database. Check console for details.',
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Database className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline text-primary">Data Migration Utility</CardTitle>
          <CardDescription>
            This is a one-time process to move your services and add-ons from local files into the database, making them editable.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important!</AlertTitle>
            <AlertDescription>
              Clicking this button will overwrite any existing services and add-ons in your database with the content from your local code files. Only do this once, or if you need to reset your online data.
            </AlertDescription>
          </Alert>

          {migrationStatus === 'success' && (
            <Alert variant="default" className="bg-green-100/10 border-green-500/30">
               <PartyPopper className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-500">Migration Completed!</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                Your data has been successfully moved to Firestore. You can now manage it from the admin dashboard.
              </AlertDescription>
            </Alert>
          )}

          {migrationStatus === 'error' && (
             <Alert variant="destructive">
               <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Migration Failed</AlertTitle>
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleMigration} className="w-full" disabled={isMigrating}>
            {isMigrating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Migrating...
              </>
            ) : 'Migrate Data to Firestore'}
          </Button>
          <Button variant="link" asChild>
            <Link href="/admin">Back to Admin Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
