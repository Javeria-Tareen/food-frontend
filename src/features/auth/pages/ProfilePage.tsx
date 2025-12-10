import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, Lock, Bike } from 'lucide-react';
import { ProfileForm } from '../components/ProfileForm';
import { ChangePasswordForm } from '../components/ChangePasswordForm';
import { RiderStatusBanner } from '../components/RiderStatusBanner';
import { AuthGuard } from '../components/AuthGuard';
import { useAuth } from '../hooks/useAuth';
import { useLogout } from '../hooks/useLogout';

const ProfilePage = () => {
  const { user, isRider } = useAuth();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{user?.name}</h1>
                <p className="text-muted-foreground">{user?.email}</p>
                {isRider && (
                  <div className="flex items-center gap-1 text-sm text-primary mt-1">
                    <Bike className="w-4 h-4" />
                    <span>Rider</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => logout()}
              disabled={isLoggingOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Rider Status Banner */}
          <RiderStatusBanner />

          <div className="grid gap-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <CardTitle>Profile Information</CardTitle>
                </div>
                <CardDescription>
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileForm />
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  <CardTitle>Change Password</CardTitle>
                </div>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChangePasswordForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default ProfilePage;
