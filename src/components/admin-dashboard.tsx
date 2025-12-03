
'use client';

import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, orderBy, query, updateDoc, Timestamp, writeBatch, getDocs, collectionGroup, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, LogOut, FileImage, Edit, Save, X, Settings, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useFirebase, useUser, useMemoFirebase } from '@/firebase';
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


function ContentManager() {
    const { firestore: db } = useFirebase();
    const { toast } = useToast();

    // Services state
    const servicesRef = useMemoFirebase(() => db ? query(collection(db, 'services'), orderBy('category'), orderBy('name')) : null, [db]);
    const { data: servicesFromDb, isLoading: isLoadingServices } = useCollection<ServiceVariant>(servicesRef);
    const [editableServices, setEditableServices] = useState<EditableService[]>([]);

    // Addons state
    const addonsRef = useMemoFirebase(() => db ? query(collection(db, 'addons'), orderBy('name')) : null, [db]);
    const { data: addonsFromDb, isLoading: isLoadingAddons } = useCollection<Addon>(addonsRef);
    const [editableAddons, setEditableAddons] = useState<EditableAddon[]>([]);

    useEffect(() => {
        if (servicesFromDb) {
            setEditableServices(servicesFromDb.map(s => ({ ...s, isEditing: false })));
        }
    }, [servicesFromDb]);

    useEffect(() => {
        if (addonsFromDb) {
            setEditableAddons(addonsFromDb.map(a => ({ ...a, isEditing: false })));
        }
    }, [addonsFromDb]);

    const handleServiceChange = (id: string, field: keyof EditableService, value: string | number) => {
        setEditableServices(prev =>
            prev.map(s => (s.id === id ? { ...s, [field]: value } : s))
        );
    };

    const handleAddonChange = (id: string, field: keyof EditableAddon, value: string | number) => {
        setEditableAddons(prev =>
            prev.map(a => (a.id === id ? { ...a, [field]: value } : a))
        );
    };

    const toggleServiceEdit = (id: string) => {
        setEditableServices(prev =>
            prev.map(s => (s.id === id ? { ...s, isEditing: !s.isEditing } : { ...s, isEditing: false }))
        );
    };

    const toggleAddonEdit = (id: string) => {
        setEditableAddons(prev =>
            prev.map(a => (a.id === id ? { ...a, isEditing: !a.isEditing } : { ...a, isEditing: false }))
        );
    };

    const saveService = async (service: EditableService) => {
        if (!db) return;
        const { isEditing, ...serviceData } = service;
        const serviceRef = doc(db, 'services', service.id);

        setDoc(serviceRef, serviceData, { merge: true }).then(() => {
            toast({
                title: 'Success',
                description: `${service.name} updated successfully.`,
            });
            toggleServiceEdit(service.id);
        }).catch(serverError => {
             const permissionError = new FirestorePermissionError({
                path: serviceRef.path,
                operation: 'update',
                requestResourceData: serviceData,
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({
                variant: 'destructive',
                title: 'Error updating service',
                description: 'Could not save changes. Please check permissions.',
            });
        });
    };

    const saveAddon = async (addon: EditableAddon) => {
        if (!db) return;
        const { isEditing, ...addonData } = addon;
        const addonRef = doc(db, 'addons', addon.id);

        setDoc(addonRef, addonData, { merge: true }).then(() => {
            toast({
                title: 'Success',
                description: `${addon.name} updated successfully.`,
            });
            toggleAddonEdit(addon.id);
        }).catch(serverError => {
             const permissionError = new FirestorePermissionError({
                path: addonRef.path,
                operation: 'update',
                requestResourceData: addonData,
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({
                variant: 'destructive',
                title: 'Error updating add-on',
                description: 'Could not save changes. Please check permissions.',
            });
        });
    };


    const isLoading = isLoadingServices || isLoadingAddons;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Website Content</CardTitle>
                <CardDescription>Edit services and add-ons. Changes will appear on your website automatically after saving.</CardDescription>
                 <Button asChild variant="outline" className="w-fit">
                    <Link href="/admin/migrate-data" target="_blank">
                        Data Migration Tool <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : (
                    <Tabs defaultValue="services">
                        <TabsList>
                            <TabsTrigger value="services">Services</TabsTrigger>
                            <TabsTrigger value="addons">Add-ons</TabsTrigger>
                        </TabsList>
                        <TabsContent value="services">
                             <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Service Name</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Image URL</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {editableServices.map(service => (
                                            <TableRow key={service.id}>
                                                <TableCell>
                                                    {service.isEditing ? (
                                                        <Input value={service.name} onChange={(e) => handleServiceChange(service.id, 'name', e.target.value)} />
                                                    ) : (
                                                        service.name
                                                    )}
                                                </TableCell>
                                                <TableCell>{service.category}</TableCell>
                                                 <TableCell>
                                                    {service.isEditing ? (
                                                        <Input value={service.image} onChange={(e) => handleServiceChange(service.id, 'image', e.target.value)} />
                                                    ) : (
                                                        <span className="truncate max-w-[150px] inline-block">{service.image}</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {service.isEditing ? (
                                                        <Input type="number" value={service.price} onChange={(e) => handleServiceChange(service.id, 'price', parseFloat(e.target.value))} />
                                                    ) : (
                                                        `$${service.price.toFixed(2)}`
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {service.isEditing ? (
                                                        <div className="flex gap-2 justify-end">
                                                            <Button size="sm" onClick={() => saveService(service)}><Save className="w-4 h-4" /></Button>
                                                            <Button size="sm" variant="ghost" onClick={() => toggleServiceEdit(service.id)}><X className="w-4 h-4" /></Button>
                                                        </div>
                                                    ) : (
                                                        <Button size="sm" variant="outline" onClick={() => toggleServiceEdit(service.id)}><Edit className="w-4 h-4" /></Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                        <TabsContent value="addons">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Add-on Name</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {editableAddons.map(addon => (
                                            <TableRow key={addon.id}>
                                                <TableCell>
                                                    {addon.isEditing ? (
                                                        <Input value={addon.name} onChange={(e) => handleAddonChange(addon.id, 'name', e.target.value)} />
                                                    ) : (
                                                        addon.name
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {addon.isEditing ? (
                                                        <Input type="number" value={addon.price} onChange={(e) => handleAddonChange(addon.id, 'price', parseFloat(e.target.value))} />
                                                    ) : (
                                                        `$${addon.price.toFixed(2)}`
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {addon.isEditing ? (
                                                         <div className="flex gap-2 justify-end">
                                                            <Button size="sm" onClick={() => saveAddon(addon)}><Save className="w-4 h-4" /></Button>
                                                            <Button size="sm" variant="ghost" onClick={() => toggleAddonEdit(addon.id)}><X className="w-4 h-4" /></Button>
                                                        </div>
                                                    ) : (
                                                        <Button size="sm" variant="outline" onClick={() => toggleAddonEdit(addon.id)}><Edit className="w-4 h-4" /></Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </CardContent>
        </Card>
    );
}

function BookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { firestore: db } = useFirebase();
  
  useEffect(() => {
    if (!db) {
        setIsLoading(false);
        return;
    };
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
    if (!db) return;
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
    // This is a bit of a hack, but it forces a re-render and the useEffect will re-fetch.
    // In a more complex app, you might use a state management library to trigger a refetch.
    const bookingsCol = collection(db, 'bookings');
    const q = query(bookingsCol, orderBy('createdAt', 'desc'));
    getDocs(q).then((snapshot) => {
        const bookingsList = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        })) as Booking[];
        setBookings(bookingsList);
        setIsLoading(false);
    });
  }

  return (
      <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>View and manage all appointment requests. New bookings will appear in real-time.</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={refreshBookings} disabled={isLoading}>
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
                    </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
  )
}

export function AdminDashboard() {
  const { auth } = useFirebase();

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
       <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <h1 className="text-xl md:text-2xl font-bold font-headline text-primary">Admin Dashboard</h1>
          <Button variant="outline" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="container py-8 px-4 md:px-6">
        <Tabs defaultValue="bookings" className="w-full">
            <TabsList>
                <TabsTrigger value="bookings">Manage Bookings</TabsTrigger>
                <TabsTrigger value="content">Manage Content</TabsTrigger>
            </TabsList>
            <TabsContent value="bookings">
                <BookingsManager />
            </TabsContent>
            <TabsContent value="content">
                <ContentManager />
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
