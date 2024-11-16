'use client';

import { createContext, useContext, useState } from 'react';

type CheckoutStep = 'cart' | 'address' | 'payment';

interface CheckoutContextType {
  step: CheckoutStep;
  setStep: (step: CheckoutStep) => void;
  selectedAddress: string | null;
  setSelectedAddress: (addressId: string | null) => void;
  paymentMethod: 'cod' | 'online' | null;
  setPaymentMethod: (method: 'cod' | 'online' | null) => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online' | null>(null);

  return (
    <CheckoutContext.Provider value={{
      step,
      setStep,
      selectedAddress,
      setSelectedAddress,
      paymentMethod,
      setPaymentMethod,
    }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}; 