'use client';

import * as React from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export interface LoginFormProps {
  className?: string;
  onSuccess?: () => void;
}

export function LoginForm({ className, onSuccess }: LoginFormProps): React.ReactElement {
  const { login, isLoading, clearError } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Clear auth error when component mounts
  React.useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    try {
      await login(data);
      
      toast.success(
        "Welcome back!",
        "You've been signed in successfully."
      );
      
      onSuccess?.();
    } catch (error: any) {
      let errorMessage = error.response?.data?.message ||
                        error.response?.data?.error ||
                        'Invalid email or password. Please try again.';
      
      // Clean up error message to remove redundant prefixes
      errorMessage = errorMessage.replace(/^(Validation [Ee]rror:?\s*)/i, '')
                                 .replace(/^(Authentication [Ee]rror:?\s*)/i, '')
                                 .replace(/^([Ee]rror:?\s*)/i, '');
      
      toast.error(
        "Sign In Failed",
        errorMessage
      );
    }
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <div className="text-center mb-8">
        <h1 className="heading-1 mb-2">Welcome Back</h1>
        <p className="subtext">Sign in to your TradeByBarter account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            {...(errors.email?.message && { error: errors.email.message })}
            {...register('email')}
          />
        </div>

        <div>
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              {...(errors.password?.message && { error: errors.password.message })}
              {...register('password')}
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-neutral-gray hover:text-neutral-dark"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <Link
            href="/auth/forgot-password"
            className="text-primary hover:text-primary/80 font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
        >
          Sign In
        </Button>

        <div className="text-center text-sm">
          <span className="text-neutral-gray">Don't have an account? </span>
          <Link
            href="/auth/signup"
            className="text-primary hover:text-primary/80 font-medium"
          >
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;