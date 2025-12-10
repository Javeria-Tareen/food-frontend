import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useVerifyOtp } from '../hooks/useVerifyOtp';
import { useForgotPassword } from '../hooks/useForgotPassword';

export const VerifyOtpForm = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { mutate: verifyOtp, isPending } = useVerifyOtp();
  const { mutate: resendOtp, isPending: isResending } = useForgotPassword();
  const navigate = useNavigate();
  const location = useLocation();
  const identifier = location.state?.identifier || '';

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) newOtp[index + i] = digit;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value.replace(/\D/g, '');
      setOtp(newOtp);
      
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) return;

    verifyOtp(
      { identifier, otp: otpString },
      {
        onSuccess: (data) => {
          navigate('/reset-password', { state: { resetToken: data.resetToken } });
        },
      }
    );
  };

  const handleResend = () => {
    resendOtp({ identifier }, {
      onSuccess: () => setResendTimer(60),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Link
        to="/forgot-password"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          We sent a code to <span className="font-medium text-foreground">{identifier}</span>
        </p>
      </div>

      {/* OTP Input */}
      <div className="flex justify-center gap-2">
        {otp.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-14 text-center text-xl font-semibold"
          />
        ))}
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full" 
        size="lg" 
        disabled={isPending || otp.join('').length !== 6}
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Verifying...
          </>
        ) : (
          'Verify Code'
        )}
      </Button>

      {/* Resend */}
      <div className="text-center">
        {resendTimer > 0 ? (
          <p className="text-sm text-muted-foreground">
            Resend code in <span className="font-medium">{resendTimer}s</span>
          </p>
        ) : (
          <Button
            type="button"
            variant="ghost"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? 'Sending...' : "Didn't receive code? Resend"}
          </Button>
        )}
      </div>
    </form>
  );
};
