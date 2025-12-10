import { AuthLayout } from '../components/AuthLayout';
import { RegisterForm } from '../components/RegisterForm';
import { AuthGuard } from '../components/AuthGuard';

const RegisterPage = () => {
  return (
    <AuthGuard requireAuth={false}>
      <AuthLayout
        title="Create Account"
        subtitle="Join us to start ordering your favorite meals"
      >
        <RegisterForm />
      </AuthLayout>
    </AuthGuard>
  );
};

export default RegisterPage;
