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
import { useNotification } from '@/contexts/notification-context';
import { cn } from '@/lib/utils';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'
];

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must not exceed 50 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must not exceed 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z
    .string()
    .regex(/^\+234[789][01]\d{8}$/, 'Phone number must be a valid Nigerian number (+234XXXXXXXXX)'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: z.string(),
  state: z.string().min(1, 'Please select a state').refine(state => NIGERIAN_STATES.includes(state), 'Please select a valid Nigerian state'),
  city: z.string().min(2, 'City must be at least 2 characters long').max(100, 'City must not exceed 100 characters'),
  displayName: z.string().max(30, 'Display name must not exceed 30 characters').optional(),
  address: z.string().max(255, 'Address must not exceed 255 characters').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export interface SignupFormProps {
  className?: string;
  onSuccess?: () => void;
}

export function SignupForm({ className, onSuccess }: SignupFormProps): React.ReactElement {
  const { signup, isLoading, clearError } = useAuth();
  const { addNotification } = useNotification();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [passwordValue, setPasswordValue] = React.useState('');
  const [phoneValue, setPhoneValue] = React.useState('');
  const [confirmPasswordValue, setConfirmPasswordValue] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  // Watch password, confirmPassword and phone for real-time validation
  const watchedPassword = watch('password', '');
  const watchedConfirmPassword = watch('confirmPassword', '');
  const watchedPhone = watch('phoneNumber', '');

  React.useEffect(() => {
    setPasswordValue(watchedPassword || '');
  }, [watchedPassword]);

  React.useEffect(() => {
    setConfirmPasswordValue(watchedConfirmPassword || '');
  }, [watchedConfirmPassword]);

  React.useEffect(() => {
    setPhoneValue(watchedPhone || '');
  }, [watchedPhone]);

  // Password validation helpers
  const getPasswordValidation = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
    };
  };

  // Phone validation helper
  const getPhoneValidation = (phone: string) => {
    const cleanPhone = phone.replace(/\s+/g, '');
    return {
      format: /^\+234[789][01]\d{8}$/.test(cleanPhone),
      hasPrefix: cleanPhone.startsWith('+234'),
      validLength: cleanPhone.length === 14,
    };
  };

  const passwordValidation = getPasswordValidation(passwordValue);
  const phoneValidation = getPhoneValidation(phoneValue);
  
  // Confirm password validation
  const confirmPasswordValidation = {
    matches: confirmPasswordValue.length > 0 && passwordValue === confirmPasswordValue,
    hasValue: confirmPasswordValue.length > 0,
  };

  // Clear auth error when component mounts
  React.useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data: SignupFormData): Promise<void> => {
    try {
      const { confirmPassword, displayName, address, ...restData } = data;
      const signupData = {
        ...restData,
        ...(displayName && displayName.trim() && { displayName: displayName.trim() }),
        ...(address && address.trim() && { address: address.trim() }),
      };
      await signup(signupData);
      
      addNotification({
        type: 'success',
        title: 'Account Created!',
        message: 'Welcome to TradeByBarter! Your account has been created successfully.',
        duration: 4000,
      });
      
      onSuccess?.();
    } catch (error: any) {
      let errorMessage = error.response?.data?.message ||
                        error.response?.data?.error ||
                        'Failed to create account. Please try again.';
      
      // Clean up error message to remove redundant prefixes
      errorMessage = errorMessage.replace(/^(Validation [Ee]rror:?\s*)/i, '')
                                 .replace(/^(Authentication [Ee]rror:?\s*)/i, '')
                                 .replace(/^([Ee]rror:?\s*)/i, '');
      
      if (error.response?.status === 409) {
        // Check if it's an email or phone number conflict
        if (errorMessage.toLowerCase().includes('email')) {
          setError('email', {
            message: 'An account with this email already exists',
          });
          addNotification({
            type: 'error',
            title: 'Email Already Exists',
            message: 'An account with this email already exists. Please use a different email or sign in.',
            duration: 4000,
          });
        } else if (errorMessage.toLowerCase().includes('phone')) {
          setError('phoneNumber', {
            message: 'An account with this phone number already exists',
          });
          addNotification({
            type: 'error',
            title: 'Phone Number Already Exists',
            message: 'An account with this phone number already exists. Please use a different phone number or sign in.',
            duration: 4000,
          });
        } else {
          addNotification({
            type: 'error',
            title: 'Account Already Exists',
            message: errorMessage,
            duration: 4000,
          });
        }
      } else {
        addNotification({
          type: 'error',
          title: 'Account Creation Failed',
          message: errorMessage,
          duration: 4000,
        });
      }
    }
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = (): void => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <div className="text-center mb-8">
        <h1 className="heading-1 mb-2">Create Account</h1>
        <p className="subtext">Join TradeByBarter and start trading today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="First Name"
              type="text"
              placeholder="First name"
              {...(errors.firstName?.message && { error: errors.firstName.message })}
              {...register('firstName')}
            />
          </div>
          <div>
            <Input
              label="Last Name"
              type="text"
              placeholder="Last name"
              {...(errors.lastName?.message && { error: errors.lastName.message })}
              {...register('lastName')}
            />
          </div>
        </div>

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
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+234 801 234 5678"
            {...(errors.phoneNumber?.message && { error: errors.phoneNumber.message })}
            {...register('phoneNumber')}
          />
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                phoneValidation.hasPrefix ? "bg-green-500" : "bg-gray-300"
              )} />
              <span className={cn(
                "text-xs",
                phoneValidation.hasPrefix ? "text-green-600" : "text-gray-500"
              )}>
                Starts with +234
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                phoneValidation.validLength ? "bg-green-500" : "bg-gray-300"
              )} />
              <span className={cn(
                "text-xs",
                phoneValidation.validLength ? "text-green-600" : "text-gray-500"
              )}>
                Correct length (14 digits total)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                phoneValidation.format ? "bg-green-500" : "bg-gray-300"
              )} />
              <span className={cn(
                "text-xs",
                phoneValidation.format ? "text-green-600" : "text-gray-500"
              )}>
                Valid Nigerian mobile number
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-dark mb-1">
            State <span className="text-red-500">*</span>
          </label>
          <select
            className={cn(
              "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              errors.state && "border-red-500"
            )}
            {...register('state')}
          >
            <option value="">Select your state</option>
            {NIGERIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>
          )}
        </div>

        <div>
          <Input
            label="City"
            type="text"
            placeholder="Enter your city"
            {...(errors.city?.message && { error: errors.city.message })}
            {...register('city')}
          />
        </div>

        <div>
          <Input
            label="Display Name (Optional)"
            type="text"
            placeholder="How you want to be shown to others"
            {...(errors.displayName?.message && { error: errors.displayName.message })}
            {...register('displayName')}
          />
        </div>

        <div>
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
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
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                passwordValidation.length ? "bg-green-500" : "bg-gray-300"
              )} />
              <span className={cn(
                "text-xs",
                passwordValidation.length ? "text-green-600" : "text-gray-500"
              )}>
                At least 8 characters
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                passwordValidation.uppercase ? "bg-green-500" : "bg-gray-300"
              )} />
              <span className={cn(
                "text-xs",
                passwordValidation.uppercase ? "text-green-600" : "text-gray-500"
              )}>
                One uppercase letter
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                passwordValidation.lowercase ? "bg-green-500" : "bg-gray-300"
              )} />
              <span className={cn(
                "text-xs",
                passwordValidation.lowercase ? "text-green-600" : "text-gray-500"
              )}>
                One lowercase letter
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                passwordValidation.number ? "bg-green-500" : "bg-gray-300"
              )} />
              <span className={cn(
                "text-xs",
                passwordValidation.number ? "text-green-600" : "text-gray-500"
              )}>
                One number
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                passwordValidation.special ? "bg-green-500" : "bg-gray-300"
              )} />
              <span className={cn(
                "text-xs",
                passwordValidation.special ? "text-green-600" : "text-gray-500"
              )}>
                One special character (@$!%*?&)
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="relative">
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              {...(errors.confirmPassword?.message && { error: errors.confirmPassword.message })}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-neutral-gray hover:text-neutral-dark"
              onClick={toggleConfirmPasswordVisibility}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {confirmPasswordValue.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  confirmPasswordValidation.matches ? "bg-green-500" : "bg-red-500"
                )} />
                <span className={cn(
                  "text-xs",
                  confirmPasswordValidation.matches ? "text-green-600" : "text-red-600"
                )}>
                  {confirmPasswordValidation.matches ? "Passwords match" : "Passwords do not match"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div>
          <Input
            label="Address (Optional)"
            type="text"
            placeholder="Enter your address"
            {...(errors.address?.message && { error: errors.address.message })}
            {...register('address')}
          />
        </div>

        <div className="text-xs text-neutral-gray">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:text-primary/80">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:text-primary/80">
            Privacy Policy
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
        >
          Create Account
        </Button>

        <div className="text-center text-sm">
          <span className="text-neutral-gray">Already have an account? </span>
          <Link
            href="/auth/login"
            className="text-primary hover:text-primary/80 font-medium"
          >
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}

export default SignupForm;