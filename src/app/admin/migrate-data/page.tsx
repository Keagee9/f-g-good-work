'use client';
import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { writeBatch, doc, getDocs, collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { serviceCategories as localServiceCategories } from '@/lib/data';
import { addons as localAddons } from '@/lib/addons';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function MigrateDataPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationDone, setMigrationDone] = useState(false);

  const handleMigration = async () => {
    setIsMigrating(true);
    
    try {
      const batch = writeBatch(db);

      // Clear existing services to prevent duplicates
      const servicesSnapshot = await getDocs(collection(db, 'services'));
      servicesSnapshot.forEach(doc => batch.delete(doc.ref));

      // Clear existing addons
      const addonsSnapshot = await getDocs(collection(db, 'addons'));
      addonsSnapshot.forEach(doc => batch.delete(doc.ref));

      // Migrate Services
      localServiceCategories.forEach(category => {
        category.variants.forEach(variant => {
          const serviceRef = doc(db, 'services', variant.id);
          batch.set(serviceRef, {
            ...variant,
            category: category.name,
            image: category.image
          });
        });
      });

      // Migrate Addons
      localAddons.forEach(addon => {
        const addonRef = doc(db, 'addons', addon.id);
        batch.set(addonRef, addon);
      });

      await batch.commit();
      toast({
        title: 'Migration Successful!',
        description: 'All services and add-ons have been moved to the database.',
      });
      setMigrationDone(true);
    } catch (error: any) {
      console.error('Migration failed:', error);
      toast({
        variant: 'destructive',
        title: 'Migration Failed',
        description: error.message || 'Could not migrate data to Firestore.',
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">
            Data Migration Utility
          </CardTitle>
          <CardDescription>
            This is a one-time process to move your website's services and add-ons from code files into the Firestore database. If you have run this before, running it again will reset your data to the initial state from the code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {migrationDone ? (
            <div className="space-y-4">
              <p className="text-green-500">Migration completed successfully!</p>
              <Button asChild>
                <Link href="/admin">Go to Admin Dashboard</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Click the button below to start the migration. This should only be done once.
              </p>
              <Button
                onClick={handleMigration}
                disabled={isMigrating}
                className="w-full"
                size="lg"
              >
                {isMigrating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Migrating...
                  </>
                ) : (
                  'Migrate Data to Firestore'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
