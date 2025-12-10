import { AuthLayout } from '../components/AuthLayout';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';

const ForgotPasswordPage = () => {
  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="No worries, we'll send you reset instructions"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
