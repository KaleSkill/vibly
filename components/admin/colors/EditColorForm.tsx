'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const colorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  value: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color code'),
  active: z.boolean().default(true),
});

type ColorFormValues = z.infer<typeof colorSchema>;

interface Color {
  _id: string;
  name: string;
  value: string;
  active: boolean;
}

interface EditColorFormProps {
  color: Color;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function EditColorForm({ color, trigger, onSuccess }: EditColorFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<ColorFormValues>({
    resolver: zodResolver(colorSchema),
    defaultValues: {
      name: color.name,
      value: color.value,
      active: color.active,
    },
  });

  async function onSubmit(data: ColorFormValues) {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/colors/${color._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update color');

      setOpen(false);
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error('Error updating color:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Color</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Color name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color Value</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input type="color" {...field} className="w-20 p-1 h-10" />
                    </FormControl>
                    <FormControl>
                      <Input 
                        placeholder="#000000" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          form.setValue('value', e.target.value.toUpperCase());
                        }}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Color will be available for products when active
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Color
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 