'use client';

import { useState } from 'react';
import { useCheckout } from '@/providers/CheckoutProvider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { CreditCard, Wallet, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useCart } from '@/providers/CartProvider';

const paymentMethods = [
  {
    id: 'cod',
    title: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    icon: Wallet,
  },
  {
    id: 'online',
    title: 'Online Payment',
    description: 'Pay securely with your credit/debit card',
    icon: CreditCard,
  },
] as const;


export function PaymentStep() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { setStep, paymentMethod, setPaymentMethod, selectedAddress } = useCheckout();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaceOrder = async () => {
    if (!paymentMethod || !selectedAddress) {
      toast({
        title: "Error",
        description: !paymentMethod 
          ? "Please select a payment method" 
          : "Please select a shipping address",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          
          shippingAddressId: selectedAddress,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }

      await clearCart();
      router.push('/checkout/confirmation');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = paymentMethod === method.id;

          return (
            <motion.div
              key={method.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setPaymentMethod(method.id)}
              className={cn(
                "relative cursor-pointer rounded-xl border-2 p-6 transition-colors",
                isSelected 
                  ? "border-black bg-black/5" 
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "rounded-lg p-2.5",
                  isSelected ? "bg-black text-white" : "bg-gray-100 text-gray-500"
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{method.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {method.description}
                  </p>
                </div>
                <div className={cn(
                  "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                  isSelected ? "border-black" : "border-gray-300"
                )}>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="h-2.5 w-2.5 rounded-full bg-black"
                    />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          variant="outline"
          onClick={() => setStep('address')}
          disabled={isProcessing}
        >
          Back
        </Button>
        <Button 
          className="flex-1 bg-black hover:bg-black/90 h-11"
          onClick={handlePlaceOrder}
          disabled={!paymentMethod || isProcessing}
        >
          {isProcessing ? (
            <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {paymentMethod === 'online' ? 'Proceed to Payment' : 'Place Order'}
              <Check className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 