// src/pages/checkout/CardPaymentPage.tsx
import { useState } from 'react'; // ✅ Import useState
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CardForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + '/order/success' },
    });

    if (error) {
      console.error(error);
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6">
      <PaymentElement />
      <Button className="w-full mt-6" disabled={isProcessing || !stripe}>
        {isProcessing ? <Loader2 className="animate-spin" /> : 'Pay Now'}
      </Button>
    </form>
  );
}

export default function CardPaymentPage() {
  const { state } = useLocation();
  const clientSecret = state?.clientSecret;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CardForm /> {/* ✅ Render CardForm, not CardPaymentPage */}
    </Elements>
  );
}
