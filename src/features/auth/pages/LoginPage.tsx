import { AuthLayout } from '../components/AuthLayout';
import { LoginForm } from '../components/LoginForm';
import { AuthGuard } from '../components/AuthGuard';

const LoginPage = () => {
  return (
    <AuthGuard requireAuth={false}>
      <AuthLayout
        title="Welcome Back"
        subtitle="Sign in to continue ordering delicious food"
      >
        <LoginForm />
      </AuthLayout>
    </AuthGuard>
  );
};

export default LoginPage;
