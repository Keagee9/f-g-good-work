
'use client';

import { useState, useEffect } from 'react';
import { collection, doc, getDocs, updateDoc, query, orderBy } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, LogOut, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  price: number;
}

interface Addon {
  id: string;
  name: string;
  price: number;
}

export default function ManageContentPage() {
  const { firestore: db, auth } = useFirebase();
  const { toast } = useToast();

  const [services, setServices] = useState<Service[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editableServices, setEditableServices] = useState<Record<string, Service>>({});
  const [editableAddons, setEditableAddons] = useState<Record<string, Addon>>({});

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const servicesQuery = query(collection(db, 'services'), orderBy('name'));
      const servicesSnapshot = await getDocs(servicesQuery);
      const servicesList = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
      setServices(servicesList);
      setEditableServices(servicesList.reduce((acc, service) => ({ ...acc, [service.id]: service }), {}));

      const addonsQuery = query(collection(db, 'addons'), orderBy('name'));
      const addonsSnapshot = await getDocs(addonsQuery);
      const addonsList = addonsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Addon));
      setAddons(addonsList);
      setEditableAddons(addonsList.reduce((acc, addon) => ({ ...acc, [addon.id]: addon }), {}));

    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: 'destructive',
        title: 'Failed to load data',
        description: 'Could not fetch services and add-ons from the database.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleServiceChange = (id: string, field: keyof Service, value: string) => {
    const isPrice = field === 'price';
    setEditableServices(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: isPrice ? Number(value) : value,
      },
    }));
  };

  const handleAddonChange = (id: string, field: keyof Addon, value: string) => {
     const isPrice = field === 'price';
    setEditableAddons(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: isPrice ? Number(value) : value,
      },
    }));
  };

  const handleSaveService = async (id: string) => {
    const serviceToUpdate = editableServices[id];
    if (!serviceToUpdate) return;

    try {
      const serviceRef = doc(db, 'services', id);
      await updateDoc(serviceRef, {
        name: serviceToUpdate.name,
        price: serviceToUpdate.price,
      });
      toast({
        title: `Success`,
        description: `${serviceToUpdate.name} updated successfully.`,
      });
    } catch (error) {
      console.error("Error updating service:", error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: `Could not update ${serviceToUpdate.name}.`,
      });
    }
  };

  const handleSaveAddon = async (id: string) => {
    const addonToUpdate = editableAddons[id];
    if (!addonToUpdate) return;
    try {
      const addonRef = doc(db, 'addons', id);
      await updateDoc(addonRef, {
        name: addonToUpdate.name,
        price: addonToUpdate.price,
      });
      toast({
        title: `Success`,
        description: `${addonToUpdate.name} updated successfully.`,
      });
    } catch (error) {
      console.error("Error updating addon:", error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: `Could not update ${addonToUpdate.name}.`,
      });
    }
  };
  
  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <h1 className="text-xl md:text-2xl font-bold font-headline text-primary">Manage Content</h1>
           <div className="flex items-center gap-2">
             <Button variant="outline" asChild>
                <Link href="/admin">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <Button variant="outline" size="icon" onClick={fetchData}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" size="icon" onClick={handleLogout}>
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
                <CardDescription>Edit the name and price of each service.</CardDescription>
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
                    {Object.values(editableServices).map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <Input
                            value={service.name}
                            onChange={(e) => handleServiceChange(service.id, 'name', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={service.price}
                            onChange={(e) => handleServiceChange(service.id, 'price', e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => handleSaveService(service.id)}>Save</Button>
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
                <CardDescription>Edit the name and price of each add-on.</CardDescription>
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
                    {Object.values(editableAddons).map((addon) => (
                      <TableRow key={addon.id}>
                        <TableCell>
                          <Input
                            value={addon.name}
                            onChange={(e) => handleAddonChange(addon.id, 'name', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={addon.price}
                            onChange={(e) => handleAddonChange(addon.id, 'price', e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => handleSaveAddon(addon.id)}>Save</Button>
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
