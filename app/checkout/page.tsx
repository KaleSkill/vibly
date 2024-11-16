import { CheckoutProvider } from '@/providers/CheckoutProvider';
import { CheckoutWizard } from '@/components/checkout/CheckoutWizard';

export default function CheckoutPage() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <CheckoutProvider>
          <CheckoutWizard />
        </CheckoutProvider>
      </div>
    </div>
  );
} 