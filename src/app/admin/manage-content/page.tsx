'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { serviceCategories } from '@/lib/data';
import { addons } from '@/lib/addons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import Link from 'next/link';

export default function ManageContentPage() {
  const { toast } = useToast();

  const [servicesData, setServicesData] = useState(
    JSON.stringify(serviceCategories, null, 2)
  );
  const [addonsData, setAddonsData] = useState(JSON.stringify(addons, null, 2));

  const handleGenerateUpdate = () => {
    try {
      // Validate the JSON before creating the message
      const parsedServices = JSON.parse(servicesData);
      const parsedAddons = JSON.parse(addonsData);

      // Create the XML structure for the AI
      const changesXml = `
<changes>
  <description>Updates the services and add-ons data based on admin edits.</description>
  <change>
    <file>src/lib/data.ts</file>
    <content><![CDATA[
import type { ServiceCategory } from './types';

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
];
