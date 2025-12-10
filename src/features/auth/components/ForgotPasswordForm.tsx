import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Phone, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForgotPassword } from '../hooks/useForgotPassword';

const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, 'Email or phone is required'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordForm = () => {
  const [inputType, setInputType] = useState<'email' | 'phone'>('email');
  const { mutate: forgotPassword, isPending } = useForgotPassword();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword({ identifier: data.identifier }, {
      onSuccess: () => {
        navigate('/verify-otp', { state: { identifier: data.identifier } });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Link
        to="/login"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </Link>

      {/* Input Type Toggle */}
      <div className="flex rounded-lg border border-border p-1 bg-muted/50">
        <button
          type="button"
          onClick={() => setInputType('email')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
            inputType === 'email'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Mail className="w-4 h-4" />
          Email
        </button>
        <button
          type="button"
          onClick={() => setInputType('phone')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
            inputType === 'phone'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Phone className="w-4 h-4" />
          Phone
        </button>
      </div>

      {/* Identifier Input */}
      <div className="space-y-2">
        <Label htmlFor="identifier">
          {inputType === 'email' ? 'Email Address' : 'Phone Number'}
        </Label>
        <div className="relative">
          {inputType === 'phone' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground">
              <span className="text-lg">🇵🇰</span>
              <span className="text-sm">+92</span>
            </div>
          )}
          <Input
            id="identifier"
            type={inputType === 'email' ? 'email' : 'tel'}
            placeholder={inputType === 'email' ? 'your@email.com' : '3XX XXXXXXX'}
            className={inputType === 'phone' ? 'pl-20' : ''}
            {...register('identifier')}
          />
        </div>
        {errors.identifier && (
          <p className="text-sm text-destructive">{errors.identifier.message}</p>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        We'll send you a 6-digit code to verify your identity.
      </p>

      {/* Submit Button */}
      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending OTP...
          </>
        ) : (
          'Send Reset Code'
        )}
      </Button>
    </form>
  );
};
