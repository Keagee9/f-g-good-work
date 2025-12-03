
'use client';

import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, orderBy, query, updateDoc, Timestamp, writeBatch, getDocs, collectionGroup } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, LogOut, FileImage, Edit, Save, X, Settings } from 'lucide-react';
import Image from 'next/image';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { sendConfirmationEmail } from '@/ai/flows/send-confirmation-email-flow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import type { ServiceVariant, Addon } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import Link from 'next/link';

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  date: string;
  totalPrice: number;
  addons: string[];
  receiptDataUri: string;
  status: 'pending' | 'confirmed';
  createdAt: Timestamp;
}

type EditableService = ServiceVariant & { isEditing?: boolean };
type EditableAddon = Addon & { isEditing?: boolean };

function BookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { firestore: db } = useFirebase();
  
  useEffect(() => {
    const bookingsCol = collection(db, 'bookings');
    const q = query(bookingsCol, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const bookingsList = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        })) as Booking[];
        setBookings(bookingsList);
        setIsLoading(false);
      },
      (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: bookingsCol.path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsLoading(false);
         toast({
          title: 'Error fetching bookings',
          description: 'You do not have permission to view bookings. Contact your administrator.',
          variant: 'destructive',
        });
      }
    );

    return () => unsubscribe();
  }, [db, toast]);


  const handleConfirmBooking = async (booking: Booking) => {
    const bookingRef = doc(db, 'bookings', booking.id);
    const updatedData = { status: 'confirmed' };
    
    updateDoc(bookingRef, updatedData)
      .then(() => {
        toast({
          title: 'Booking Confirmed!',
          description: 'The booking status has been updated and a confirmation email has been sent.',
        });

        // Send confirmation email
        sendConfirmationEmail({
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          serviceName: booking.serviceName,
          date: booking.date,
        }).catch(emailError => {
            console.error("Failed to send confirmation email:", emailError);
             toast({
                variant: 'destructive',
                title: 'Email Failed to Send',
                description: 'The booking was confirmed, but the confirmation email could not be sent.',
            });
        });

      })
      .catch(serverError => {
        const permissionError = new FirestorePermissionError({
          path: bookingRef.path,
          operation: 'update',
          requestResourceData: updatedData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };
  
  const refreshBookings = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  }

  return (
      <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>View and manage all appointment requests. New bookings will appear in real-time.</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={refreshBookings}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="font-medium">{booking.customerName}</div>
                          <div className="text-sm text-muted-foreground">{booking.customerEmail}</div>
                           <div className="text-sm text-muted-foreground">{booking.customerPhone}</div>
                        </TableCell>
                        <TableCell>{booking.serviceName}</TableCell>
                        <TableCell>{booking.date}</TableCell>
                        <TableCell>
                            {booking.createdAt ? new Date(booking.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                           <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" disabled={!booking.receiptDataUri}>
                                <FileImage className="w-4 h-4 mr-2" />
                                View Receipt
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Payment Receipt for {booking.customerName}</DialogTitle>
                              </DialogHeader>
                               {booking.receiptDataUri ? (
                                <div className="mt-4 relative w-full" style={{paddingBottom: '100%'}}>
                                  <Image
                                    src={booking.receiptDataUri}
                                    alt={`Receipt for ${booking.customerName}`}
                                    fill
                                    style={{ objectFit: 'contain' }}
                                    unoptimized
                                  />
                                </div>
                              ) : (
                                <p className="text-muted-foreground text-center py-8">No receipt was uploaded.</p>
                              )}
                            </DialogContent>
                          </Dialog>
                          {booking.status === 'pending' && (
                            <Button size="sm" onClick={() => handleConfirmBooking(booking)}>
                              Confirm Booking
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                 {bookings.length === 0 && !isLoading && (
                    <div className="text-center py-16">
                        <p className="text-muted-foreground">No bookings found.</p>
                        <p className="text-xs text-muted-foreground mt-2">If you have just migrated your data, please refresh the page.</p>
                    </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
  )
}

function ServicesManager() {
    const { firestore: db } = useFirebase();
    const servicesRef = useMemoFirebase(() => db ? query(collection(db, 'services'), orderBy('category'), orderBy('name')) : null, [db]);
    const { data: initialServices, isLoading } = useCollection<ServiceVariant>(servicesRef);
    const [services, setServices] = useState<EditableService[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        if (initialServices) {
            setServices(initialServices);
        }
    }, [initialServices]);

    const handleEdit = (id: string) => {
        setServices(services.map(s => s.id === id ? { ...s, isEditing: true } : s));
    };

    const handleCancel = (id: string) => {
        const originalService = initialServices?.find(s => s.id === id);
        if (originalService) {
            setServices(services.map(s => s.id === id ? { ...originalService, isEditing: false } : s));
        }
    };

    const handleSave = async (service: EditableService) => {
        if (!service.isEditing) return;
        const serviceRef = doc(db, 'services', service.id);
        const { isEditing, ...serviceData } = service;
        const updatedData = {
          name: serviceData.name,
          price: Number(serviceData.price),
        };

        try {
            await updateDoc(serviceRef, updatedData);
            setServices(services.map(s => s.id === service.id ? { ...s, isEditing: false } : s));
            toast({ title: "Success", description: `${service.name} updated.` });
        } catch (serverError: any) {
            const permissionError = new FirestorePermissionError({
              path: serviceRef.path,
              operation: 'update',
              requestResourceData: updatedData,
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({ variant: "destructive", title: "Error", description: serverError.message });
        }
    };
    
    const handleInputChange = (id: string, field: 'name' | 'price', value: string) => {
        setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <Card>
          <CardHeader>
            <CardTitle>Manage Services</CardTitle>
            <CardDescription>Edit the name and price of your services. Changes will be live immediately.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Service Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {services.map(service => (
                        <TableRow key={service.id}>
                            <TableCell>
                                {service.isEditing ? (
                                    <Input value={service.name} onChange={(e) => handleInputChange(service.id, 'name', e.target.value)} />
                                ) : (
                                    service.name
                                )}
                            </TableCell>
                            <TableCell>{service.category}</TableCell>
                            <TableCell>
                                {service.isEditing ? (
                                    <Input type="number" value={service.price} onChange={(e) => handleInputChange(service.id, 'price', e.target.value)} />
                                ) : (
                                    `$${service.price.toFixed(2)}`
                                )}
                            </TableCell>
                             <TableCell className="text-right">
                                {service.isEditing ? (
                                    <div className="flex gap-2 justify-end">
                                        <Button size="icon" variant="outline" onClick={() => handleSave(service)}><Save className="h-4 w-4"/></Button>
                                        <Button size="icon" variant="destructive" onClick={() => handleCancel(service.id)}><X className="h-4 w-4"/></Button>
                                    </div>
                                ) : (
                                    <Button size="icon" variant="outline" onClick={() => handleEdit(service.id)}><Edit className="h-4 w-4"/></Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
             {services.length === 0 && !isLoading && (
                    <div className="text-center py-16">
                        <p className="text-muted-foreground">No services found in the database.</p>
                         <p className="text-sm text-muted-foreground mt-4">
                            Have you migrated your data yet?
                        </p>
                        <Button asChild variant="link">
                            <Link href="/admin/migrate-data">Go to Data Migration Page</Link>
                        </Button>
                    </div>
                )}
          </CardContent>
        </Card>
    )
}

function AddonsManager() {
    const { firestore: db } = useFirebase();
    const addonsRef = useMemoFirebase(() => db ? query(collection(db, 'addons'), orderBy('name')) : null, [db]);
    const { data: initialAddons, isLoading } = useCollection<Addon>(addonsRef);
    const [addons, setAddons] = useState<EditableAddon[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        if (initialAddons) {
            setAddons(initialAddons);
        }
    }, [initialAddons]);

    const handleEdit = (id: string) => {
        setAddons(addons.map(s => s.id === id ? { ...s, isEditing: true } : s));
    };

    const handleCancel = (id: string) => {
        const originalAddon = initialAddons?.find(s => s.id === id);
        if (originalAddon) {
            setAddons(addons.map(s => s.id === id ? { ...originalAddon, isEditing: false } : s));
        }
    };

    const handleSave = async (addon: EditableAddon) => {
        if (!addon.isEditing) return;
        const addonRef = doc(db, 'addons', addon.id);
        const { isEditing, ...addonData } = addon;
        const updatedData = {
          name: addonData.name,
          price: Number(addonData.price),
        };

        try {
            await updateDoc(addonRef, updatedData);
            setAddons(addons.map(s => s.id === addon.id ? { ...s, isEditing: false } : s));
            toast({ title: "Success", description: `${addon.name} updated.` });
        } catch (serverError: any) {
            const permissionError = new FirestorePermissionError({
              path: addonRef.path,
              operation: 'update',
              requestResourceData: updatedData,
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({ variant: "destructive", title: "Error", description: serverError.message });
        }
    };
    
    const handleInputChange = (id: string, field: 'name' | 'price', value: string) => {
        setAddons(addons.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <Card>
          <CardHeader>
            <CardTitle>Manage Add-ons</CardTitle>
            <CardDescription>Edit the name and price of your add-on services.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Add-on Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {addons.map(addon => (
                        <TableRow key={addon.id}>
                            <TableCell>
                                {addon.isEditing ? (
                                    <Input value={addon.name} onChange={(e) => handleInputChange(addon.id, 'name', e.target.value)} />
                                ) : (
                                    addon.name
                                )}
                            </TableCell>
                            <TableCell>
                                {addon.isEditing ? (
                                    <Input type="number" value={addon.price} onChange={(e) => handleInputChange(addon.id, 'price', e.target.value)} />
                                ) : (
                                    `$${addon.price.toFixed(2)}`
                                )}
                            </TableCell>
                             <TableCell className="text-right">
                                {addon.isEditing ? (
                                    <div className="flex gap-2 justify-end">
                                        <Button size="icon" variant="outline" onClick={() => handleSave(addon)}><Save className="h-4 w-4"/></Button>
                                        <Button size="icon" variant="destructive" onClick={() => handleCancel(addon.id)}><X className="h-4 w-4"/></Button>
                                    </div>
                                ) : (
                                    <Button size="icon" variant="outline" onClick={() => handleEdit(addon.id)}><Edit className="h-4 w-4"/></Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
             {addons.length === 0 && !isLoading && (
                    <div className="text-center py-16">
                        <p className="text-muted-foreground">No add-ons found in the database.</p>
                         <p className="text-sm text-muted-foreground mt-4">
                            Have you migrated your data yet?
                        </p>
                        <Button asChild variant="link">
                            <Link href="/admin/migrate-data">Go to Data Migration Page</Link>
                        </Button>
                    </div>
                )}
          </CardContent>
        </Card>
    )
}

export function AdminDashboard() {
  const { auth } = useFirebase();

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
       <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <h1 className="text-xl md:text-2xl font-bold font-headline text-primary">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
                <Link href="/admin/migrate-data">
                    <Settings className="w-4 h-4 mr-2" />
                    Data Migration
                </Link>
            </Button>
            <Button variant="outline" size="icon" onClick={handleLogout}>
               <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 px-4 md:px-6">
          <Tabs defaultValue="bookings">
              <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="bookings">Bookings</TabsTrigger>
                  <TabsTrigger value="services">Services</TabsTrigger>
                  <TabsTrigger value="addons">Add-ons</TabsTrigger>
              </TabsList>
              <TabsContent value="bookings" className="mt-6">
                  <BookingsManager />
              </TabsContent>
              <TabsContent value="services" className="mt-6">
                  <ServicesManager />
              </TabsContent>
              <TabsContent value="addons" className="mt-6">
                  <AddonsManager />
              </TabsContent>
          </Tabs>
      </main>
    </div>
  );
}
