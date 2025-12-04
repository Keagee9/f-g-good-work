
'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { ServiceCategory } from '@/lib/types';
import { addons as localAddons } from '@/lib/addons';
import { BookingFlow } from '@/components/booking-flow';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function BookingFlowController() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceCategory[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    const servicesCollection = collection(firestore, 'services');
    const q = query(servicesCollection);

    const unsubscribe = onSnapshot(q, 
        (snapshot) => {
            if (snapshot.empty) {
                // This case should ideally not happen if migration is forced on admin page
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
            setIsLoading(false);
        },
        (error) => {
            console.error("Error fetching services:", error);
            toast({
                variant: 'destructive',
                title: 'Error Loading Services',
                description: 'Could not fetch the list of services. Please try again later.',
            });
            setIsLoading(false);
        }
    );

    return () => unsubscribe();
  }, [firestore, toast]);

  if (isLoading || services === null) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return <BookingFlow serviceCategories={services} addons={localAddons} />;
}
