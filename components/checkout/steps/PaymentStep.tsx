'use client';

import { useCheckout } from '@/providers/CheckoutProvider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { CreditCard, Wallet, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PaymentStep() {
  const { setStep, paymentMethod, setPaymentMethod } = useCheckout();
  const { toast } = useToast();

  const paymentMethods = [
    {
      id: 'online',
      title: 'Online Payment',
      description: 'Pay securely with your credit/debit card',
      icon: CreditCard,
    },
    {
      id: 'cod',
      title: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      icon: Wallet,
    },
  ];

  const handlePlaceOrder = async () => {
    if (!paymentMethod) {
      toast({
        title: "Error",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    // Handle order placement
    try {
      // Add your order placement logic here
      toast({
        title: "Success",
        description: "Order placed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive",
      });
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
              onClick={() => setPaymentMethod(method.id as 'cod' | 'online')}
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
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-lg bg-black/5 p-4"
                >
                  {method.id === 'online' ? (
                    <p className="text-sm">
                      You will be redirected to our secure payment gateway to complete your purchase.
                    </p>
                  ) : (
                    <p className="text-sm">
                      Pay with cash when your order is delivered to your doorstep.
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          variant="outline"
          onClick={() => setStep('address')}
        >
          Back
        </Button>
        <Button 
          className="flex-1 bg-black hover:bg-black/90 h-11"
          onClick={handlePlaceOrder}
          disabled={!paymentMethod}
        >
          {paymentMethod === 'online' ? 'Proceed to Payment' : 'Place Order'}
          <Check className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 