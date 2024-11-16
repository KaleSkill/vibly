'use client';

import { useCheckout } from '@/providers/CheckoutProvider';
import { CartStep } from './steps/CartStep';
import { AddressStep } from './steps/AddressStep';
import { PaymentStep } from './steps/PaymentStep';
import { motion } from 'framer-motion';
import { CheckCircle, CircleDot } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { id: 'cart', name: 'Cart Review', icon: '1' },
  { id: 'address', name: 'Shipping', icon: '2' },
  { id: 'payment', name: 'Payment', icon: '3' },
];

export function CheckoutWizard() {
  const { step } = useCheckout();

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="relative">
        <nav className="relative z-10">
          <ol className="flex items-center justify-center gap-2 md:gap-4">
            {steps.map((s, stepIdx) => {
              const status = getStepStatus(s.id as any, step);
              return (
                <li key={s.id} className="flex items-center">
                  <div className="relative flex items-center justify-center">
                    <motion.div
                      initial={false}
                      animate={{
                        backgroundColor: status === 'complete' ? 'rgb(0, 0, 0)' : 'transparent',
                        borderColor: status === 'upcoming' ? 'rgb(229, 231, 235)' : 'rgb(0, 0, 0)',
                      }}
                      className={cn(
                        "w-10 h-10 rounded-full border-2 flex items-center justify-center",
                        status === 'complete' && "text-white",
                        status === 'current' && "border-black",
                        status === 'upcoming' && "border-gray-200 text-gray-400"
                      )}
                    >
                      {status === 'complete' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{s.icon}</span>
                      )}
                    </motion.div>
                    <motion.div
                      initial={false}
                      animate={{
                        scale: status === 'current' ? 1 : 0,
                        opacity: status === 'current' ? 1 : 0,
                      }}
                      className="absolute -inset-1 rounded-full border-2 border-black"
                    />
                  </div>
                  {stepIdx !== steps.length - 1 && (
                    <>
                      <div className="hidden md:block w-20 h-[2px] mx-2 bg-gray-200">
                        <motion.div
                          initial={false}
                          animate={{
                            width: status === 'complete' ? '100%' : '0%',
                          }}
                          className="h-full bg-black"
                        />
                      </div>
                      <div className="block md:hidden w-8 h-[2px] mx-1 bg-gray-200">
                        <motion.div
                          initial={false}
                          animate={{
                            width: status === 'complete' ? '100%' : '0%',
                          }}
                          className="h-full bg-black"
                        />
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
        <div className="mt-4 hidden md:flex justify-center">
          <ol className="flex items-center gap-[88px]">
            {steps.map((step) => (
              <li key={step.id}>
                <span className="text-sm font-medium">{step.name}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Step Content */}
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="mt-8"
      >
        {step === 'cart' && <CartStep />}
        {step === 'address' && <AddressStep />}
        {step === 'payment' && <PaymentStep />}
      </motion.div>
    </div>
  );
}

function getStepStatus(stepId: 'cart' | 'address' | 'payment', currentStep: string) {
  const stepOrder = ['cart', 'address', 'payment'];
  const currentIdx = stepOrder.indexOf(currentStep);
  const stepIdx = stepOrder.indexOf(stepId);

  if (stepIdx < currentIdx) return 'complete';
  if (stepIdx === currentIdx) return 'current';
  return 'upcoming';
} 