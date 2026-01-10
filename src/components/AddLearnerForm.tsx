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
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  username: z.string().min(2, { message: 'Username must be at least 2 characters.' }),
  pin: z.string().min(4, { message: 'PIN must be at least 4 characters.' }).max(4, { message: 'PIN must be 4 characters.' }).regex(/^\d+$/, { message: 'PIN must be numeric.' }),
  dob: z.date({ required_error: 'Date of birth is required.' }),
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
      dob: undefined,
      grade: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // IMPORTANT: In a real application, PINs should be securely hashed server-side.
      // For this example, we are storing it as plain text.
      const { data, error } = await supabase.from('learners').insert({
        org_id: orgId,
        name: values.name,
        username: values.username,
        pin_hash: values.pin, // Storing as plain text for now, needs server-side hashing
        dob: values.dob.toISOString().split('T')[0], // Format date to YYYY-MM-DD
        grade: values.grade,
      });

      if (error) {
        throw error;
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
          name="dob"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of Birth</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal flex justify-between items-center", // Added flex and justify-between
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Add Learner</Button>
      </form>
    </Form>
  );
};

export default AddLearnerForm;