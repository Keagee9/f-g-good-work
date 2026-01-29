'use client';

import type { ServiceCategory, ServiceVariant } from '@/lib/types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import Image from 'next/image';
import { Loader2, Edit, Home } from 'lucide-react';
import { Separator } from './ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface ManageServicesProps {
  initialServices: ServiceCategory[];
}

const VariantSchema = z.object({
  id: z.string(),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive('Price must be a positive number')
  ),
  duration: z.string(),
  description: z.string(),
});

type VariantFormData = z.infer<typeof VariantSchema>;


function EditVariantDialog({ variant, categoryId, onSave }: { variant: ServiceVariant, categoryId: string, onSave: (categoryId: string, updatedVariant: ServiceVariant) => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const methods = useForm<VariantFormData>({
    resolver: zodResolver(VariantSchema),
    defaultValues: {
      ...variant,
      price: variant.price.toString(),
    },
  });

  const { register, handleSubmit, formState: { errors } } = methods;

  const onSubmit = async (data: VariantFormData) => {
    setIsSaving(true);
    try {
      const updatedVariant: ServiceVariant = {
        ...variant,
        name: data.name,
        price: Number(data.price),
      };
      await onSave(categoryId, updatedVariant);
      toast({
        title: 'Service Updated',
        description: `${data.name} has been saved successfully.`,
      });
      setIsOpen(false);
    } catch (e: any) {
       toast({
        variant: 'destructive',
        title: 'Error Saving',
        description: e.message || 'Could not update the service in the database.',
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
          <DialogTitle>Edit Service Variant: {variant.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Variant Name</Label>
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
            <Input id="duration" defaultValue={variant.duration} disabled />
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

const CategorySchema = z.object({
  id: z.string(),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  image: z.string().url('Must be a valid image URL'),
});

type CategoryFormData = z.infer<typeof CategorySchema>;

function EditCategoryDialog({ category, onSave }: { category: ServiceCategory, onSave: (data: CategoryFormData) => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      id: category.id,
      name: category.name,
      image: category.image,
    },
  });

  const currentImageUrl = watch('image');

  const onSubmit = async (data: CategoryFormData) => {
    setIsSaving(true);
    try {
      await onSave(data);
      toast({
        title: 'Category Updated',
        description: `${data.name} has been saved successfully.`,
      });
      setIsOpen(false);
    } catch (e: any) {
       toast({
        variant: 'destructive',
        title: 'Error Saving',
        description: e.message || 'Could not update the category.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Category: {category.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Category Name</Label>
            <Input id="cat-name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-image">Image URL</Label>
            <Input id="cat-image" {...register('image')} />
            {errors.image && <p className="text-sm text-destructive">{errors.image.message}</p>}
          </div>
           {currentImageUrl && (
              <div className="relative w-full h-32 mt-2 rounded-md overflow-hidden border">
                <Image src={currentImageUrl} alt={category.name} fill style={{ objectFit: 'contain' }}/>
              </div>
            )}
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


export function ManageServices({ initialServices }: ManageServicesProps) {
  const [services, setServices] = useState<ServiceCategory[]>(initialServices);
  const db = useFirestore();

  const handleVariantSave = async (categoryId: string, updatedVariant: ServiceVariant) => {
      const categoryToUpdate = services.find(c => c.id === categoryId);
      if (!categoryToUpdate) throw new Error("Category not found");

      const updatedVariants = categoryToUpdate.variants.map(v => v.id === updatedVariant.id ? updatedVariant : v);
      
      const serviceDocRef = doc(db, 'services', categoryId);
      await updateDoc(serviceDocRef, { variants: updatedVariants });

      setServices(prevServices => prevServices.map(s => s.id === categoryId ? { ...s, variants: updatedVariants } : s));
  };
  
  const handleCategorySave = async (data: CategoryFormData) => {
    const serviceDocRef = doc(db, 'services', data.id);
    await updateDoc(serviceDocRef, { name: data.name, image: data.image });
    setServices(prevServices => prevServices.map(s => s.id === data.id ? { ...s, name: data.name, image: data.image } : s));
  };


  return (
    <div className="container py-8 md:py-12 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline text-primary">
            Manage Services
          </h2>
          <p className="text-muted-foreground">
            Update category and service details. Changes are saved live to the database.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin">
            <Home className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>
        </Button>
      </div>

      <Accordion type="single" collapsible className="w-full" defaultValue={services.length > 0 ? services[0].id : undefined}>
        {services.map(category => (
          <AccordionItem value={category.id} key={category.id}>
            <AccordionTrigger className="text-lg md:text-xl font-headline text-primary hover:no-underline">
              <div className="flex items-center gap-4 text-left">
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-md overflow-hidden flex-shrink-0">
                  <Image src={category.image} alt={category.name} fill style={{ objectFit: 'contain' }} data-ai-hint={category.name} />
                </div>
                {category.name}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="border-l-2 border-primary/20 pl-4 ml-4 sm:ml-6 md:ml-12">
                 <div className="py-4">
                    <EditCategoryDialog category={category} onSave={handleCategorySave} />
                 </div>
                 <Separator/>
                {category.variants.map((variant, index) => (
                  <div key={variant.id}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4">
                      <div className="flex-1 pr-4">
                        <h3 className="text-base md:text-lg font-semibold text-primary">{variant.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{variant.description}</p>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                        <div className="text-left sm:text-right flex-grow">
                          <p className="text-lg font-bold text-foreground">${variant.price.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">{variant.duration}</p>
                        </div>
                        <EditVariantDialog variant={variant} categoryId={category.id} onSave={handleVariantSave} />
                      </div>
                    </div>
                    {index < category.variants.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
