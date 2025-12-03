'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { serviceCategories } from '@/lib/data';
import { addons } from '@/lib/addons';
import { Terminal } from 'lucide-react';

export default function ManageContentPage() {
  const { toast } = useToast();

  const [servicesData, setServicesData] = useState(
    JSON.stringify(serviceCategories, null, 2)
  );
  const [addonsData, setAddonsData] = useState(
    JSON.stringify(addons, null, 2)
  );

  const handleGenerateUpdate = () => {
    try {
      // Validate that the user input is valid JSON
      const parsedServices = JSON.parse(servicesData);
      const parsedAddons = JSON.parse(addonsData);

      // If validation passes, construct the XML string
      const changesXml = `<changes>
  <description>Update services and add-ons data from the admin content management page.</description>
  <change>
    <file>src/lib/data.ts</file>
    <content><![CDATA[import type { ServiceCategory } from './types';

export const serviceCategories: ServiceCategory[] = ${JSON.stringify(
      parsedServices,
      null,
      2
    )};

export const availableTimes: string[] = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
  '06:30 PM',
  '07:00 PM',
];
