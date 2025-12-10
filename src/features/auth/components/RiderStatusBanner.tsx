import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const RiderStatusBanner = () => {
  const { user, isRider } = useAuth();

  if (!isRider || !user) return null;

  const statusConfig = {
    pending: {
      icon: Clock,
      title: 'Application Under Review',
      description: 'Your rider application is being reviewed. We\'ll notify you once approved.',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      iconColor: 'text-yellow-500',
    },
    approved: {
      icon: CheckCircle,
      title: 'Rider Approved',
      description: 'You\'re approved to start delivering!',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      iconColor: 'text-green-500',
    },
    rejected: {
      icon: XCircle,
      title: 'Application Rejected',
      description: 'Unfortunately, your application was not approved. Please contact support.',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/20',
      iconColor: 'text-destructive',
    },
  };

  const status = user.riderStatus || 'pending';
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 mb-6`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5`} />
        <div>
          <h4 className="font-medium text-foreground">{config.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
        </div>
      </div>
    </div>
  );
};
