'use client';

import type { Addon } from '@/lib/types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, Edit, Home, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';

const AddonSchema = z.object({
  id: z.string(),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive('Price must be a positive number')
  ),
  duration: z.string().min(1, "Duration is required"),
});

type AddonFormData = z.infer<typeof AddonSchema>;

function EditAddonDialog({ addon, onSave }: { addon: Addon, onSave: (updatedAddon: Addon) => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const methods = useForm<AddonFormData>({
    resolver: zodResolver(AddonSchema),
    defaultValues: {
      ...addon,
      price: addon.price.toString(),
    },
  });

  const { register, handleSubmit, formState: { errors } } = methods;

  const onSubmit = async (data: AddonFormData) => {
    setIsSaving(true);
    try {
      const updatedAddon: Addon = { ...data };
      await onSave(updatedAddon);
      toast({
        title: 'Add-on Updated',
        description: `${data.name} has been saved successfully.`,
      });
      setIsOpen(false);
    } catch (e: any) {
       toast({
        variant: 'destructive',
        title: 'Error Saving',
        description: e.message || 'Could not update the add-on in the database.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Add-on: {addon.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Add-on Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input id="price" type="number" step="0.01" {...register('price')} />
            {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
             <Input id="duration" {...register('duration')} />
            {errors.duration && <p className="text-sm text-destructive">{errors.duration.message}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const NewAddonSchema = AddonSchema.omit({ id: true });
type NewAddonFormData = z.infer<typeof NewAddonSchema>;

function AddAddonDialog({ onAdd }: { onAdd: (newAddon: NewAddonFormData) => Promise<void> }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const methods = useForm<NewAddonFormData>({
        resolver: zodResolver(NewAddonSchema),
        defaultValues: {
            name: '',
            price: 0,
            duration: '',
        },
    });

    const { register, handleSubmit, formState: { errors }, reset } = methods;

    const onSubmit = async (data: NewAddonFormData) => {
        setIsSaving(true);
        try {
            await onAdd(data);
            toast({
                title: 'Add-on Added',
                description: `${data.name} has been added successfully.`,
            });
            setIsOpen(false);
            reset();
        } catch (e: any) {
            toast({
                variant: 'destructive',
                title: 'Error Adding',
                description: e.message || 'Could not add the new add-on.',
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Add-on
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add a New Add-on Service</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-name">Add-on Name</Label>
                        <Input id="new-name" {...register('name')} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-price">Price ($)</Label>
                        <Input id="new-price" type="number" step="0.01" {...register('price')} />
                        {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-duration">Duration</Label>
                        <Input id="new-duration" {...register('duration')} />
                        {errors.duration && <p className="text-sm text-destructive">{errors.duration.message}</p>}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Add-on
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface ManageAddonsProps {
  initialAddons: Addon[];
}


export function ManageAddons({ initialAddons }: ManageAddonsProps) {
  const [addons, setAddons] = useState<Addon[]>(initialAddons);
  const db = useFirestore();
  const { toast } = useToast();

  const handleSave = async (updatedAddon: Addon) => {
    const addonDocRef = doc(db, 'addons', updatedAddon.id);
    await updateDoc(addonDocRef, { ...updatedAddon });
    setAddons(prev => prev.map(a => a.id === updatedAddon.id ? updatedAddon : a));
  };

  const handleAdd = async (newAddonData: NewAddonFormData) => {
    const newId = crypto.randomUUID();
    const newAddon: Addon = { id: newId, ...newAddonData };
    const addonDocRef = doc(db, 'addons', newId);
    await setDoc(addonDocRef, newAddon);
    setAddons(prev => [...prev, newAddon].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleDelete = async (addonId: string) => {
    try {
        const addonDocRef = doc(db, 'addons', addonId);
        await deleteDoc(addonDocRef);
        setAddons(prev => prev.filter(a => a.id !== addonId));
        toast({
            title: 'Add-on Deleted',
            description: 'The add-on has been removed.',
        });
    } catch(e: any) {
        toast({
            variant: 'destructive',
            title: 'Error Deleting',
            description: e.message || 'Could not delete the add-on.',
        });
    }
  };
  
  return (
    <div className="container py-8 md:py-12 px-4 md:px-6">
       <header className="flex items-center justify-between mb-8">
            <div>
                 <h1 className="text-2xl md:text-3xl font-bold font-headline text-primary">Manage Add-ons</h1>
                 <p className="text-muted-foreground">Add, edit, or delete your add-on services.</p>
            </div>
            <div className='flex items-center gap-4'>
                <AddAddonDialog onAdd={handleAdd} />
                <Button variant="outline" asChild>
                    <Link href="/admin">
                        <Home className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Link>
                </Button>
            </div>
        </header>

      <Card>
        <CardHeader>
          <CardTitle>Your Add-on Services</CardTitle>
          <CardDescription>Changes are saved live to the database.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {addons.map(addon => (
            <div key={addon.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex flex-col">
                <span className="font-semibold text-primary">{addon.name}</span>
                <span className="text-sm text-muted-foreground">{addon.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-base md:text-lg font-bold text-foreground text-right">
                  ${addon.price.toFixed(2)}
                </div>
                <EditAddonDialog addon={addon} onSave={handleSave} />
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the add-on
                             <span className='font-bold text-primary/90'> {addon.name}</span>.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(addon.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
           {addons.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No add-ons found. Click "Add New Add-on" to create one.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
