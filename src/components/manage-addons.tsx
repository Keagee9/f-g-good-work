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
import { ArrowLeft, Loader2, Edit, PackagePlus, Trash2, Home } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, writeBatch } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

interface ManageAddonsProps {
  initialAddons: Addon[];
}

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

export function ManageAddons({ initialAddons }: ManageAddonsProps) {
  const [addons, setAddons] = useState<Addon[]>(initialAddons);
  const db = useFirestore();
  const { toast } = useToast();

  const handleSave = async (updatedAddon: Addon) => {
    const addonDocRef = doc(db, 'addons', updatedAddon.id);
    await updateDoc(addonDocRef, { ...updatedAddon });
    setAddons(prev => prev.map(a => a.id === updatedAddon.id ? updatedAddon : a));
  };
  
  return (
    <div className="container py-8 md:py-12 px-4 md:px-6">
       <header className="flex items-center justify-between mb-8">
            <div>
                 <h1 className="text-2xl md:text-3xl font-bold font-headline text-primary">Manage Add-ons</h1>
                 <p className="text-muted-foreground">Edit prices and details for your add-on services.</p>
            </div>
            <Button variant="outline" asChild>
                 <Link href="/admin">
                    <Home className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>
            </Button>
        </header>

      <Card>
        <CardHeader>
          <CardTitle>Your Add-on Services</CardTitle>
          <CardDescription>Click the edit icon to modify an add-on. Changes are saved live.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {addons.map(addon => (
            <div key={addon.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex flex-col">
                <span className="font-semibold text-primary">{addon.name}</span>
                <span className="text-sm text-muted-foreground">{addon.duration}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-base md:text-lg font-bold text-foreground text-right">
                  ${addon.price.toFixed(2)}
                </div>
                <EditAddonDialog addon={addon} onSave={handleSave} />
              </div>
            </div>
          ))}
           {addons.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No add-ons found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
