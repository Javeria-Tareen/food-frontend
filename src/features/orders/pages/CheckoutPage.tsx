// src/features/orders/pages/CheckoutPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

import { CreditCard, Wallet, Building2, Truck, MapPin, User, Phone, Loader2, AlertCircle } from 'lucide-react';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useCartStore } from '@/features/cart/store/useCartStore';
import { useAddresses } from '@/features/address/hooks/useAddresses';
import { useCreateOrder, useCreateGuestOrder } from '@/features/orders/hooks/useOrders';
import { useAreas } from '@/hooks/useCheckArea';
import type { CreateOrderPayload } from '@/types/order.types';

// Stripe setup (publishable key from env)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const checkoutSchema = z.object({
  paymentMethod: z.enum(['cod', 'card', 'easypaisa', 'jazzcash', 'bank']),
  addressId: z.string().optional(),
  guestAddress: z.object({
    fullAddress: z.string().min(10, 'Enter complete address'),
    areaId: z.string({ required_error: 'Select delivery area' }),
    label: z.string().optional(),
    floor: z.string().optional(),
    instructions: z.string().max(150).optional(),
  }).optional(),
  name: z.string().min(2).optional(),
  phone: z.string().regex(/^03\d{9}$/, 'Enter valid phone (03XXXXXXXXX)').optional(),
  promoCode: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const { items, subtotal, clearCart } = useCartStore();
  const { data: addresses } = useAddresses();
  const { data: areas } = useAreas();
  const createOrder = useCreateOrder();
  const createGuestOrder = useCreateGuestOrder();

  const [selectedArea, setSelectedArea] = useState<string>('');
  const [deliveryFee, setDeliveryFee] = useState(149);
  const [minOrder, setMinOrder] = useState(0);
  const [promoDiscount, setPromoDiscount] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: 'cod' },
  });

  const paymentMethod = watch('paymentMethod');
  const watchedAddressId = watch('addressId');
  const watchedAreaId = watch('guestAddress.areaId');

  // Auto-select first saved address
  useEffect(() => {
    if (isAuthenticated && addresses?.length && !watchedAddressId) {
      setValue('addressId', addresses[0]._id);
    }
  }, [addresses, isAuthenticated, watchedAddressId, setValue]);

  // Fetch delivery fee when area changes
  useEffect(() => {
    if (watchedAreaId) {
      const area = areas?.find(a => a._id === watchedAreaId);
      if (area?.deliveryZone) {
        setDeliveryFee(area.deliveryZone.deliveryFee);
        setMinOrder(area.deliveryZone.minOrderAmount);
      }
    }
  }, [watchedAreaId, areas]);

  const finalAmount = subtotal + deliveryFee - promoDiscount;

  const onSubmit = async (data: CheckoutForm) => {
    if (subtotal < minOrder) {
      toast({
        title: 'Minimum Order Not Met',
        description: `This area requires minimum Rs. ${minOrder}`,
        variant: 'destructive',
      });
      return;
    }

    const payload = isAuthenticated
      ? {
          items: items.map(i => ({ menuItem: i.menuItem._id, quantity: i.quantity })),
          addressId: data.addressId!,
          paymentMethod: data.paymentMethod,
          promoCode: data.promoCode?.trim() || undefined,
        }
      : {
          items: items.map(i => ({ menuItem: i.menuItem._id, quantity: i.quantity })),
          guestAddress: {
            fullAddress: data.guestAddress!.fullAddress,
            areaId: data.guestAddress!.areaId,
            label: data.guestAddress!.label || 'Home',
            floor: data.guestAddress!.floor,
            instructions: data.guestAddress!.instructions,
          },
          name: data.name!,
          phone: data.phone!,
          paymentMethod: data.paymentMethod,
          promoCode: data.promoCode?.trim() || undefined,
        };

    try {
      const response = isAuthenticated
        ? await createOrder.mutateAsync(payload as CreateOrderPayload)
        : await createGuestOrder.mutateAsync(payload as any);

      clearCart();

      if (response.clientSecret) {
        navigate('/checkout/card', { state: { clientSecret: response.clientSecret, orderId: response.order._id } });
      } else if (response.bankDetails) {
        navigate(`/checkout/bank/${response.order._id}`, {
          state: { order: response.order, bankDetails: response.bankDetails },
        });
      } else {
        navigate(`/order/${response.order._id}`);
        toast({ title: 'Order Placed!', description: 'We’re preparing your food' });
      }
    } catch (err: any) {
      toast({
        title: 'Order Failed',
        description: err.response?.data?.message || 'Please try again',
        variant: 'destructive',
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Button onClick={() => navigate('/menu')}>Browse Menu</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* ...rest of the form code unchanged */}
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.menuItem._id} className="flex justify-between text-sm">
                      <span>{item.quantity} × {item.menuItem.name}</span>
                      <span>Rs. {item.menuItem.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rs. {subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>Rs. {deliveryFee}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Discount</span>
                      <span>-Rs. {promoDiscount}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">Rs. {finalAmount}</span>
                </div>

                {subtotal < minOrder && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Minimum order for this area is Rs. {minOrder}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting || subtotal < minOrder}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    `Pay Rs. ${finalAmount} & Place Order`
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By placing order, you agree to our Terms & Conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
