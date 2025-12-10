// src/features/orders/pages/OrderTrackingPage.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle,
  Clock,
  Truck,
  ChefHat,
  Package,
  XCircle,
  Phone,
  User,
  Timer,
  Copy,
  Check,
} from 'lucide-react';
import { format } from 'date-fns';
import { useOrder } from '@/features/orders/hooks/useOrders';
import { useOrderSocket } from '@/features/orders/hooks/useOrderSocket';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/order.types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'sonner';
import axios from 'axios';

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STEPS = [
  { status: 'pending' as const, icon: Clock, label: 'Order Received' },
  { status: 'confirmed' as const, icon: CheckCircle, label: 'Confirmed' },
  { status: 'preparing' as const, icon: ChefHat, label: 'Preparing' },
  { status: 'out_for_delivery' as const, icon: Truck, label: 'On the Way' },
  { status: 'delivered' as const, icon: Package, label: 'Delivered' },
];

const PAYMENT_TIMEOUT_MINUTES = 15;

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading, refetch } = useOrder(orderId!);
  const [riderLocation, setRiderLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [loadingReject, setLoadingReject] = useState(false);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  useOrderSocket(orderId);

  useEffect(() => {
    const handler = (e: Event) => {
      const payload = (e as CustomEvent).detail;
      if (payload.riderLocation) setRiderLocation(payload.riderLocation);
    };
    window.addEventListener('riderLocationUpdate', handler);
    return () => window.removeEventListener('riderLocationUpdate', handler);
  }, []);

  useEffect(() => {
    if (!order?.placedAt || order?.status !== 'pending_payment') {
      setSecondsLeft(null);
      return;
    }

    const deadline = new Date(order.placedAt);
    deadline.setMinutes(deadline.getMinutes() + PAYMENT_TIMEOUT_MINUTES);

    const tick = () => {
      const diff = Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [order?.placedAt, order?.status]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleReject = async () => {
    if (!order) return;
    if (!confirm('Are you sure you want to reject this order?')) return;

    try {
      setLoadingReject(true);
      await axios.patch(`/api/orders/${order._id}/reject`, { reason: 'Changed mind' });
      toast.success('Order rejected successfully');
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to reject order');
    } finally {
      setLoadingReject(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!order) return;
    try {
      setLoadingReceipt(true);
      const response = await axios.get<Blob>(`/api/orders/${order._id}/receipt`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Receipt-${order._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error('Failed to download receipt');
    } finally {
      setLoadingReceipt(false);
    }
  };

  if (isLoading)
    return <Skeleton className="h-96 w-full max-w-4xl mx-auto mt-8 rounded-xl" />;

  if (!order) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-10">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Order Not Found</h2>
          <Button asChild>
            <Link to="/orders">View Orders</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const currentStep = STEPS.findIndex((s) => s.status === order.status);
  const isCancelled = ['cancelled', 'rejected'].includes(order.status);
  const isPendingPayment = order.status === 'pending_payment';
  const showMap = order.status === 'out_for_delivery' && riderLocation;

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl space-y-6">

        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-4xl font-bold mb-2">Order Tracking</h1>
          <p className="text-2xl font-mono text-primary">
            #{order._id.slice(-6).toUpperCase()}
          </p>
          <Badge
            className={`mt-4 text-lg px-6 py-2 ${ORDER_STATUS_COLORS[order.status]}`}
          >
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
          {order.placedAt && (
            <p className="text-sm text-muted-foreground mt-3">
              {format(new Date(order.placedAt), 'dd MMM yyyy • h:mm a')}
            </p>
          )}
        </div>

        {/* Reject + Download Receipt Buttons */}
        {!isPendingPayment && (
          <div className="flex flex-col sm:flex-row gap-4 pb-6">
            {!isCancelled && ['pending', 'confirmed'].includes(order.status) && (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleReject}
                disabled={loadingReject}
              >
                {loadingReject ? 'Rejecting...' : 'Reject Order'}
              </Button>
            )}
            {['confirmed', 'preparing', 'out_for_delivery', 'delivered'].includes(
              order.status
            ) && (
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleDownloadReceipt}
                disabled={loadingReceipt}
              >
                {loadingReceipt ? 'Downloading...' : 'Download Receipt'}
              </Button>
            )}
          </div>
        )}

        {/* PENDING PAYMENT */}
        {isPendingPayment && (
          <Card className="border-2 border-orange-400 bg-orange-50">
            <CardContent className="p-8 text-center space-y-6">
              <Timer className="h-20 w-20 text-orange-600 mx-auto" />
              <div>
                <h3 className="text-2xl font-bold text-orange-800">
                  Payment Required
                </h3>
                <p className="text-lg mt-2">Complete payment to start preparation</p>
              </div>
              {secondsLeft !== null && (
                <div className="text-5xl font-bold text-orange-600 font-mono">
                  {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:
                  {String(secondsLeft % 60).padStart(2, '0')}
                </div>
              )}
              {order.paymentMethod === 'bank' ? (
                <div className="max-w-md mx-auto bg-white rounded-xl p-6 shadow">
                  <p className="text-lg mb-4">
                    Transfer <strong>Rs. {order.finalAmount.toLocaleString()}</strong>
                  </p>
                  <div className="space-y-4 text-left">
                    {[
                      { label: 'Bank', value: 'Meezan Bank' },
                      { label: 'Account Title', value: 'FoodExpress Pvt Ltd' },
                      { label: 'IBAN', value: 'PK36MEZN0002110105678901' },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex justify-between items-center py-2 border-b last:border-0"
                      >
                        <div>
                          <p className="text-sm text-muted-foreground">{item.label}</p>
                          <p className="font-mono">{item.value}</p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => copyToClipboard(item.value, item.label)}
                        >
                          {copiedField === item.label ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mt-6">
                      <p className="text-sm font-medium mb-1">
                        Reference Code (Required)
                      </p>
                      <div className="flex items-center justify-between">
                        <code className="text-2xl font-bold text-green-700">
                          {order.bankTransferReference}
                        </code>
                        <Button
                          size="sm"
                          onClick={() =>
                            copyToClipboard(order.bankTransferReference!, 'Reference')
                          }
                        >
                          {copiedField === 'Reference' ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Button asChild size="lg">
                  <Link to="/checkout/card">Complete Card Payment</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Progress Timeline */}
        {!isCancelled && !isPendingPayment && (
          <Card>
            <CardContent className="p-8">
              <div className="relative">
                <div className="flex justify-between">
                  {STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const isActive = i <= currentStep;
                    return (
                      <div key={step.status} className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold transition-all ${
                            isActive
                              ? 'bg-primary ring-4 ring-primary/20 scale-110'
                              : 'bg-muted'
                          }`}
                        >
                          <Icon className="h-8 w-8" />
                        </div>
                        <p
                          className={`mt-3 text-sm font-medium ${
                            isActive ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="absolute top-8 left-0 right-0 h-1 bg-muted -z-10">
                  <div
                    className="h-full bg-primary transition-all duration-700"
                    style={{
                      width: `${
                        currentStep >= 0 ? (currentStep / (STEPS.length - 1)) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
              {order.estimatedDelivery && currentStep < 4 && (
                <p className="text-center mt-8 text-xl">
                  Estimated delivery:{' '}
                  <strong className="text-primary">{order.estimatedDelivery}</strong>
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Live Map */}
        {showMap && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-6 w-6" />
                Rider is on the way
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-96 rounded-b-xl overflow-hidden">
                <MapContainer
                  center={riderLocation!}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={riderLocation!}>
                    <Popup>
                      <div className="text-center">
                        <Truck className="h-8 w-8 text-primary mx-auto mb-1" />
                        <p className="font-bold">{order.rider?.name || 'Your Rider'}</p>
                        <p className="text-xs">Delivering your delicious food!</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rider Info */}
        {order.rider && order.status === 'out_for_delivery' && (
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-9 w-9 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold">{order.rider.name}</p>
                  <p className="text-sm text-muted-foreground">Delivery Partner</p>
                </div>
              </div>
              <Button size="lg" asChild>
                <a href={`tel:${order.rider.phone}`}>
                  <Phone className="h-5 w-5 mr-2" />
                  Call Rider
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Order Items + Summary */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <h3 className="font-bold text-lg">Order Items</h3>
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between py-2">
                <span>
                  {item.quantity} × {item.menuItem.name}
                </span>
                <span className="font-medium">Rs. {item.priceAtOrder * item.quantity}</span>
              </div>
            ))}
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {order.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>Rs. {order.deliveryFee}</span>
              </div>
              {order.discountApplied > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount</span>
                  <span>-Rs. {order.discountApplied}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xl pt-4 border-t">
                <span>Total Paid</span>
                <span className="text-primary">Rs. {order.finalAmount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pb-8">
          <Button asChild variant="outline" className="flex-1">
            <Link to="/orders">All Orders</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link to="/menu">Order Again</Link>
          </Button>
        </div>

      </div>
    </div>
  );
}
