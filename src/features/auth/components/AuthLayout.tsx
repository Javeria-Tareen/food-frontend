import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-40 right-20 w-60 h-60 rounded-full bg-white/10 blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12">
          <Link to="/" className="flex items-center space-x-3 mb-8">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <UtensilsCrossed className="w-10 h-10 text-primary" />
            </div>
          </Link>
          <h1 className="text-4xl font-display font-bold text-white mb-4">
            Lahore's Finest Cuisine
          </h1>
          <p className="text-white/90 text-lg max-w-md">
            Experience authentic Pakistani flavors delivered fresh to your doorstep in under 40 minutes.
          </p>
          
          <div className="mt-12 flex gap-8 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-sm text-white/80">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">40 min</div>
              <div className="text-sm text-white/80">Avg. Delivery</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">4.9★</div>
              <div className="text-sm text-white/80">Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <UtensilsCrossed className="w-7 h-7 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-foreground">Zaika Express</span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            {subtitle && (
              <p className="text-muted-foreground mt-2">{subtitle}</p>
            )}
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
};
