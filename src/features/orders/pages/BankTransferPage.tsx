// src/pages/checkout/BankTransferPage.tsx
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, Copy, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { OrderResponse } from '@/types/order.types';

export default function BankTransferPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);

  const { order, bankDetails } = location.state as { 
    order: OrderResponse['order']; 
    bankDetails: OrderResponse['bankDetails'] 
  };

  if (!bankDetails || !order) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <AlertCircle className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Payment Details Missing</h2>
          <p className="text-muted-foreground mb-6">
            Please complete checkout again.
          </p>
          <Button onClick={() => navigate('/cart')}>Back to Cart</Button>
        </Card>
      </div>
    );
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyButton = ({ text, label }: { text: string; label: string }) => (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => copyToClipboard(text, label)}
    >
      {copied === label ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  );

  return (
    <div className="min-h-screen bg-muted/30 pb-8">
      <div className="bg-gradient-to-b from-orange-500/10 to-background pt-8 pb-12 text-center">
        <div className="w-20 h-20 rounded-full bg-orange-500/10 mx-auto mb-4 flex items-center justify-center">
          <Building2 className="h-10 w-10 text-orange-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Complete Bank Transfer</h1>
        <p className="text-muted-foreground">Transfer money to confirm your order</p>
        <Badge className="mt-3 bg-orange-500">
          <Clock className="h-3 w-3 mr-1" />
          Payment Pending (15 mins)
        </Badge>
      </div>

      <div className="container mx-auto px-4 -mt-6 max-w-lg space-y-6">
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
            <p className="text-4xl font-bold text-primary">Rs. {bankDetails.amount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-2">Order #{order._id.slice(-6).toUpperCase()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Bank Name', value: bankDetails.bankName },
              { label: 'Account Title', value: bankDetails.accountTitle },
              { label: 'Account Number', value: bankDetails.accountNumber },
              { label: 'IBAN', value: bankDetails.iban },
              { label: 'Branch', value: bankDetails.branch },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="font-medium font-mono">{item.value}</p>
                </div>
                <CopyButton text={item.value} label={item.label} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-500/30 bg-orange-500/5">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Reference Code (Mandatory)</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold font-mono text-orange-600 tracking-wider">
                {bankDetails.reference}
              </p>
              <CopyButton text={bankDetails.reference} label="Reference" />
            </div>
            <p className="text-xs text-orange-600 mt-3 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Must include in transfer remarks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">How to Pay</h3>
            <ol className="space-y-3 text-sm">
              {[
                "Open your banking app or visit branch/ATM",
                `Transfer exactly Rs. ${bankDetails.amount.toLocaleString()}`,
                `Add reference: <strong>${bankDetails.reference}</strong>`,
                "Your order will be confirmed in 5–15 minutes",
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    {i + 1}
                  </span>
                  <span dangerouslySetInnerHTML={{ __html: step }} />
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <div className="p-4 bg-destructive/10 rounded-lg text-destructive text-sm text-center">
          <AlertCircle className="inline-block h-4 w-4 mr-1" />
          Order will auto-cancel if payment not received in 15 minutes
        </div>

        <Button
          size="lg"
          className="w-full h-12 text-lg"
          onClick={() => navigate(`/order/${orderId}`)}
        >
          I’ve Transferred the Money
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}