
'use client';

import { useState } from 'react';
import { useFirebase } from '@/firebase';
import { collection, writeBatch, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { serviceCategories } from '@/lib/data';
import { addons } from '@/lib/addons';
import { Loader2, Database, AlertTriangle } from 'lucide-react';

export default function MigrateDataPage() {
  const { firestore: db } = useFirebase();
  const { toast } = useToast();
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<string | null>(null);

  const handleMigration = async () => {
    if (!db) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firestore is not initialized.',
      });
      return;
    }

    setIsMigrating(true);
    setMigrationResult(null);

    try {
      const batch = writeBatch(db);

      // Clear existing collections first to avoid duplicates
      const servicesCollection = collection(db, 'services');
      const addonsCollection = collection(db, 'addons');
      const servicesSnapshot = await getDocs(servicesCollection);
      const addonsSnapshot = await getDocs(addonsCollection);
      servicesSnapshot.forEach(doc => batch.delete(doc.ref));
      addonsSnapshot.forEach(doc => batch.delete(doc.ref));
      
      // Add services
      let servicesCount = 0;
      serviceCategories.forEach(category => {
        category.variants.forEach(variant => {
          const serviceDocRef = doc(db, 'services', variant.id);
          const serviceData = {
              ...variant,
              category: category.name,
              image: category.image
          };
          batch.set(serviceDocRef, serviceData);
          servicesCount++;
        });
      });

      // Add addons
      let addonsCount = 0;
      addons.forEach(addon => {
        const addonDocRef = doc(db, 'addons', addon.id);
        batch.set(addonDocRef, addon);
        addonsCount++;
      });

      // Commit the batch
      await batch.commit();

      const resultMessage = `Migration completed successfully! ${servicesCount} services and ${addonsCount} add-ons migrated.`;
      setMigrationResult(resultMessage);
      toast({
        title: 'Success',
        description: resultMessage,
      });

    } catch (error: any) {
      console.error('Migration failed:', error);
      setMigrationResult(`Migration failed: ${error.message}`);
      toast({
        variant: 'destructive',
        title: 'Migration Failed',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="container py-12 flex justify-center items-center px-4 md:px-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Database className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline text-primary text-center">Data Migration Utility</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            This tool will migrate your services and add-ons from local files to the Firestore database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-destructive/10 border-l-4 border-destructive text-destructive-foreground p-4" role="alert">
            <div className="flex">
              <div className="py-1">
                <AlertTriangle className="h-5 w-5 mr-3" />
              </div>
              <div>
                <p className="font-bold">Important!</p>
                <p className="text-sm">
                  Run this migration only once. Running it again will delete all existing services and add-ons in the database and replace them with the data from your local files.
                </p>
              </div>
            </div>
          </div>
          <Button onClick={handleMigration} className="w-full" size="lg" disabled={isMigrating}>
            {isMigrating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Migrating...
              </>
            ) : (
              'Migrate Data to Firestore'
            )}
          </Button>

          {migrationResult && (
            <div className="mt-4 p-4 border rounded-md bg-muted text-muted-foreground text-sm">
              <p className="font-semibold">Migration Result:</p>
              <p>{migrationResult}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
