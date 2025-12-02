
'use client';

import { useState } from 'react';
import { collection, writeBatch, getDocs, deleteDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { serviceCategories } from '@/lib/data';
import { addons } from '@/lib/addons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Database, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

// Helper function to check if a UUID is available
const isUUID = (id: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

export default function MigrateDataPage() {
  const { firestore: db } = useFirebase();
  const { toast } = useToast();
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleMigration = async () => {
    setIsMigrating(true);
    setMigrationStatus('idle');

    try {
      const batch = writeBatch(db);

      // Clear existing services
      const servicesCollection = collection(db, 'services');
      const servicesSnapshot = await getDocs(servicesCollection);
      servicesSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Clear existing addons
      const addonsCollection = collection(db, 'addons');
      const addonsSnapshot = await getDocs(addonsCollection);
      addonsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add new services from lib/data.ts
      serviceCategories.forEach(category => {
        category.variants.forEach(variant => {
          const docId = isUUID(variant.id) ? variant.id : uuidv4();
          const serviceRef = collection(db, 'services').doc(docId);
          const serviceData = {
            name: variant.name,
            duration: variant.duration,
            price: variant.price,
            description: variant.description,
            category: category.name,
            image: category.image, // Include category image
          };
          batch.set(serviceRef, serviceData);
        });
      });
      
      // Add new addons from lib/addons.ts
      addons.forEach(addon => {
          const docId = isUUID(addon.id) ? addon.id : uuidv4();
          const addonRef = collection(db, 'addons').doc(docId);
          batch.set(addonRef, {
            name: addon.name,
            duration: addon.duration,
            price: addon.price,
          });
      });

      await batch.commit();

      setMigrationStatus('success');
      toast({
        title: 'Migration Successful!',
        description: 'Your services and add-ons have been migrated to the database.',
      });
    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationStatus('error');
      toast({
        variant: 'destructive',
        title: 'Migration Failed',
        description: 'There was an error migrating your data. Check the console for details.',
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Database className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline text-primary">Data Migration Utility</CardTitle>
          <CardDescription>This is a one-time process to move your services and add-ons from the code files into the Firestore database.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-3">
                <AlertTriangle className="w-8 h-8 text-destructive flex-shrink-0" />
                <span>
                    <strong className="text-destructive">Important:</strong> Clicking this button will delete all existing data in your 'services' and 'addons' collections and replace it with the data from your local code files.
                </span>
            </p>
          
          <Button onClick={handleMigration} disabled={isMigrating} className="w-full" size="lg">
            {isMigrating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Migrating Data...
              </>
            ) : (
              'Migrate Data to Firestore'
            )}
          </Button>

           {migrationStatus === 'success' && (
            <p className="text-sm text-green-500">Migration completed successfully!</p>
          )}
          {migrationStatus === 'error' && (
            <p className="text-sm text-destructive">Migration failed. Please check the console for errors.</p>
          )}

        </CardContent>
      </Card>
    </div>
  );
}

