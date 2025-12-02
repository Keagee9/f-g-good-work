'use client';
import { useState } from 'react';
import { useCollection, useFirestore, useAuth } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import type { ServiceVariant, Addon } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Save, LogOut, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';

export default function ManageContentPage() {
  const db = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const servicesRef = collection(db, 'services');
  const addonsRef = collection(db, 'addons');

  const { data: services, isLoading: servicesLoading } = useCollection<ServiceVariant>(servicesRef);
  const { data: addons, isLoading: addonsLoading } = useCollection<Addon>(addonsRef);

  const [editableServices, setEditableServices] = useState<ServiceVariant[]>([]);
  const [editableAddons, setEditableAddons] = useState<Addon[]>([]);

  useState(() => {
    if (services) setEditableServices(services);
  }, [services]);

  useState(() => {
    if (addons) setEditableAddons(addons);
  }, [addons]);

  const handleServiceChange = (id: string, field: keyof ServiceVariant, value: string | number) => {
    setEditableServices(prev =>
      prev.map(s => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleAddonChange = (id: string, field: keyof Addon, value: string | number) => {
    setEditableAddons(prev =>
      prev.map(a => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const handleSaveService = async (service: ServiceVariant) => {
    const serviceRef = doc(db, 'services', service.id);
    const { id, ...serviceData } = service;
    updateDoc(serviceRef, serviceData)
        .then(() => {
            toast({ title: 'Success', description: `${service.name} updated.` });
        })
        .catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: serviceRef.path,
                operation: 'update',
                requestResourceData: serviceData,
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update service.' });
        });
  };

  const handleSaveAddon = async (addon: Addon) => {
    const addonRef = doc(db, 'addons', addon.id);
    const { id, ...addonData } = addon;
    updateDoc(addonRef, addonData)
        .then(() => {
            toast({ title: 'Success', description: `${addon.name} updated.` });
        })
        .catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: addonRef.path,
                operation: 'update',
                requestResourceData: addonData,
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update add-on.' });
        });
  };

  const isLoading = servicesLoading || addonsLoading;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <h1 className="text-xl md:text-2xl font-bold font-headline text-primary">
            Manage Website Content
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <Button variant="outline" size="icon" onClick={() => auth.signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 px-4 md:px-6 space-y-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
                <CardDescription>
                  Edit the names and prices of your services. Changes are saved
                  individually.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editableServices.map(service => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <Input
                            value={service.name}
                            onChange={e => handleServiceChange(service.id, 'name', e.target.value)}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={service.price}
                            onChange={e => handleServiceChange(service.id, 'price', parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => handleSaveService(service)}>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add-ons</CardTitle>
                <CardDescription>
                  Edit the names and prices of your add-ons.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Add-on Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editableAddons.map(addon => (
                      <TableRow key={addon.id}>
                        <TableCell>
                          <Input
                            value={addon.name}
                            onChange={e => handleAddonChange(addon.id, 'name', e.target.value)}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={addon.price}
                            onChange={e => handleAddonChange(addon.id, 'price', parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => handleSaveAddon(addon)}>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
