'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { ServiceCategory, Addon } from '@/lib/types';
import { BookingFlow } from '@/components/booking-flow';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function BookingFlowController() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceCategory[] | null>(null);
  const [addons, setAddons] = useState<Addon[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    const servicesCollection = collection(firestore, 'services');
    const addonsCollection = collection(firestore, 'addons');
    
    const servicesQuery = query(servicesCollection);
    const addonsQuery = query(addonsCollection);

    let servicesLoaded = false;
    let addonsLoaded = false;

    const checkLoadingComplete = () => {
      if (servicesLoaded && addonsLoaded) {
        setIsLoading(false);
      }
    };

    const unsubscribeServices = onSnapshot(servicesQuery, 
        (snapshot) => {
            if (snapshot.empty) {
                toast({
                    variant: 'destructive',
                    title: 'No Services Found',
                    description: 'The services list is empty. Please contact the administrator.',
                });
                setServices([]);
            } else {
                const servicesData = snapshot.docs.map(doc => doc.data() as ServiceCategory);
                setServices(servicesData);
            }
            servicesLoaded = true;
            checkLoadingComplete();
        },
        (error) => {
            console.error("Error fetching services:", error);
            toast({
                variant: 'destructive',
                title: 'Error Loading Services',
                description: 'Could not fetch the list of services. Please try again later.',
            });
            servicesLoaded = true;
            checkLoadingComplete();
        }
    );

    const unsubscribeAddons = onSnapshot(addonsQuery, 
        (snapshot) => {
            if (snapshot.empty) {
                 toast({
                    variant: 'destructive',
                    title: 'No Add-ons Found',
                    description: 'The add-ons list is empty. Please contact the administrator.',
                });
                setAddons([]);
            } else {
                const addonsData = snapshot.docs.map(doc => doc.data() as Addon);
                setAddons(addonsData);
            }
            addonsLoaded = true;
            checkLoadingComplete();
        },
        (error) => {
            console.error("Error fetching add-ons:", error);
            toast({
                variant: 'destructive',
                title: 'Error Loading Add-ons',
                description: 'Could not fetch the list of add-ons. Please try again later.',
            });
            addonsLoaded = true;
            checkLoadingComplete();
        }
    );

    return () => {
      unsubscribeServices();
      unsubscribeAddons();
    };
  }, [firestore, toast]);

  if (isLoading || services === null || addons === null) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return <BookingFlow serviceCategories={services} addons={addons} />;
}
