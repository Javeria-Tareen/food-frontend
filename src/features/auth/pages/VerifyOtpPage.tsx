import { AuthLayout } from '../components/AuthLayout';
import { VerifyOtpForm } from '../components/VerifyOtpForm';

const VerifyOtpPage = () => {
  return (
    <AuthLayout
      title="Enter Verification Code"
      subtitle="Enter the 6-digit code we sent you"
    >
      <VerifyOtpForm />
    </AuthLayout>
  );
};

export default VerifyOtpPage;
