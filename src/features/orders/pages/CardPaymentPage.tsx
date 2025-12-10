// src/features/orders/pages/CardPaymentPage.tsx
import { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe, PaymentIntent } from '@stripe/stripe-js';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/features/cart/store/useCartStore';
import { apiClient } from '@/lib/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PaymentPageState {
  clientSecret: string;
  orderId: string;
  amount: number;
}

interface BackendPaymentResponse {
  success: boolean;
  message?: string;
}

function CardForm({
  clientSecret,
  orderId,
  amount,
}: {
  clientSecret: string;
  orderId: string;
  amount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clearCart } = useCartStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Automatically confirm payment after 3D Secure redirect
  useEffect(() => {
    if (!stripe || !clientSecret) return;

    const checkPaymentStatus = async () => {
      setIsProcessing(true);
      try {
        const { paymentIntent, error } = await stripe.retrievePaymentIntent(clientSecret);

        if (error) {
          setErrorMessage(error.message || 'Payment verification failed.');
          toast.error(error.message || 'Payment verification failed.');
          return;
        }

        if (paymentIntent?.status === 'succeeded') {
          await confirmPaymentOnBackend(paymentIntent);
        }
      } catch (err) {
        console.error(err);
        setErrorMessage('Failed to verify payment. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    };

    checkPaymentStatus();
  }, [stripe, clientSecret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order/${orderId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        toast.error(error.message || 'Payment failed');
        return;
      }

      if (!paymentIntent) {
        setErrorMessage('Payment could not be initialized. Try again.');
        return;
      }

      switch (paymentIntent.status) {
        case 'succeeded':
          await confirmPaymentOnBackend(paymentIntent);
          break;
        case 'requires_action':
        case 'requires_confirmation':
          toast('Please complete additional authentication if prompted by your bank.');
          break;
        case 'processing':
          toast('Payment is processing. Please wait...');
          break;
        case 'requires_payment_method':
          setErrorMessage('Payment failed. Please try another card or payment method.');
          break;
        default:
          setErrorMessage('Unexpected payment status. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Payment failed. Please try again.');
      toast.error('Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmPaymentOnBackend = async (paymentIntent: PaymentIntent) => {
    try {
      // apiClient.post already returns the response data directly
      const data: BackendPaymentResponse = await apiClient.post(
        `/orders/success/${orderId}`,
        {
          paymentIntentId: paymentIntent.id,
          method: 'card',
        }
      );

      if (data.success) {
        clearCart();
        toast.success('Payment successful! Your order is confirmed.');
        navigate(`/order/${orderId}`, { replace: true });
      } else {
        setErrorMessage(data.message || 'Payment confirmation failed.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Failed to confirm payment. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs',
          wallets: { applePay: 'auto', googlePay: 'auto' },
        }}
      />
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={!stripe || isProcessing}>
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-5 w-5" />
            Pay Rs. {amount.toLocaleString()}
          </>
        )}
      </Button>
    </form>
  );
}

export default function CardPaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PaymentPageState | null;

  if (!state?.clientSecret || !state?.orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-10">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Payment Session Expired</h2>
          <Button onClick={() => navigate('/cart')}>Back to Cart</Button>
        </Card>
      </div>
    );
  }

  const options = {
    clientSecret: state.clientSecret,
    appearance: {
      theme: 'flat',
      variables: { colorPrimary: '#e11d48' },
    } as any,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/50 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
            <CreditCard className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Complete Payment</h1>
          <p className="text-muted-foreground">Order #{state.orderId.slice(-6).toUpperCase()}</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <p className="text-sm text-muted-foreground">Amount Due</p>
            <p className="text-4xl font-bold text-primary">Rs. {state.amount.toLocaleString()}</p>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={options}>
              <CardForm
                clientSecret={state.clientSecret}
                orderId={state.orderId}
                amount={state.amount}
              />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
