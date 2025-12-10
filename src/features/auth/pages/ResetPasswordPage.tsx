import { AuthLayout } from '../components/AuthLayout';
import { ResetPasswordForm } from '../components/ResetPasswordForm';

const ResetPasswordPage = () => {
  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Create a new secure password"
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
};

export default ResetPasswordPage;
