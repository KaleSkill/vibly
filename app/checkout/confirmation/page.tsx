'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrderConfirmation() {
  const router = useRouter();

  useEffect(() => {
    // Clear cart after successful order
    // You can implement this through your cart provider
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <CheckCircle className="h-20 w-20 text-green-500" />
          </motion.div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. We've sent you an email with your order details.
          </p>
        </div>

        <Button 
          onClick={() => router.push('/')}
          className="w-full bg-black hover:bg-black/90"
        >
          Return to Home
        </Button>
      </motion.div>
    </div>
  );
} 