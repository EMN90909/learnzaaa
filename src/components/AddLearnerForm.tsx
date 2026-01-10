"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  username: z.string().min(2, { message: 'Username must be at least 2 characters.' }),
  pin: z.string().min(4, { message: 'PIN must be at least 4 characters.' }).max(4, { message: 'PIN must be 4 characters.' }).regex(/^\d+$/, { message: 'PIN must be numeric.' }),
  age: z.number().min(5, { message: 'Age must be at least 5.' }).max(18, { message: 'Age must be 18 or less.' }),
  grade: z.string().min(1, { message: 'Class is required.' }),
});

interface AddLearnerFormProps {
  orgId: string;
  onLearnerAdded: () => void;
  onClose: () => void;
}

const AddLearnerForm: React.FC<AddLearnerFormProps> = ({ orgId, onLearnerAdded, onClose }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      username: '',
      pin: '',
      age: 10,
      grade: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Check if username already exists
      const { data: existingLearner, error: checkError } = await supabase
        .from('learners')
        .select('*')
        .eq('username', values.username)
        .eq('org_id', orgId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingLearner) {
        showError('Username already exists. Please choose a different one.');
        return;
      }

      // Calculate approximate date of birth from age
      const currentYear = new Date().getFullYear();
      const dob = new Date(currentYear - values.age, 0, 1).toISOString().split('T')[0];

      // IMPORTANT: In a real application, PINs should be securely hashed server-side.
      // For this example, we are storing it as plain text.
      const { data, error } = await supabase.from('learners').insert({
        org_id: orgId,
        name: values.name,
        username: values.username,
        pin_hash: values.pin, // Storing as plain text for now, needs server-side hashing
        dob: dob,
        grade: values.grade,
      });

      if (error) {
        if (error.code === '42501') {
          showError('You do not have permission to add learners. Please contact support.');
        } else if (error.code === '23505') {
          showError('Username already exists. Please choose a different one.');
        } else {
          throw error;
        }
        return;
      }

      showSuccess('Learner added successfully!');
      form.reset();
      onLearnerAdded();
      onClose();
    } catch (error: any) {
      showError('Failed to add learner: ' + error.message);
      console.error('Error adding learner:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Learner's Full Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Unique Username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PIN</FormLabel>
              <FormControl>
                <Input type="password" placeholder="4-digit PIN" {...field} maxLength={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Age"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  min="5"
                  max="18"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="grade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class/Grade</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Grade 5, Class 7" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          Add Learner
        </Button>
      </form>
    </Form>
  );
};

export default AddLearnerForm;