import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/contexts/toast-context';
import { AuthStackParamList } from '@/navigation';
import { COLORS, TYPOGRAPHY, ERROR_MESSAGES } from '@/constants';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';

type SignupScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Signup'>;

interface SignupForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const { signup, isLoading, error, clearError } = useAuth();
  const { showToast } = useToast();
  
  const [form, setForm] = useState<SignupForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  
  const [formErrors, setFormErrors] = useState<Partial<SignupForm>>({});

  const validateForm = (): boolean => {
    const errors: Partial<SignupForm> = {};
    
    if (!form.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!form.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!form.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^(\+234|234|0)?[789][01]\d{8}$/.test(form.phone)) {
      errors.phone = 'Must be a valid Nigerian number (+234XXXXXXXXX)';
    }
    
    if (!form.password) {
      errors.password = 'Password is required';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(form.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    
    if (!form.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async (): Promise<void> => {
    clearError();
    
    if (!validateForm()) {
      return;
    }

    try {
      await signup({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phoneNumber: form.phone.trim(),
        password: form.password,
        state: 'Lagos', // Default state - should be collected in form
        city: 'Ikeja', // Default city - should be collected in form
        displayName: `${form.firstName.trim()} ${form.lastName.trim()}`,
      });
      
      showToast({
        type: 'success',
        title: 'Account Created!',
        message: 'Welcome to TradeByBarter! Your account has been created successfully.',
        duration: 4000,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          ERROR_MESSAGES.SERVER;
      
      // Clean up error message to remove redundant prefixes
      let cleanErrorMessage = errorMessage.replace(/^(Validation [Ee]rror:?\s*)/i, '')
                                          .replace(/^(Authentication [Ee]rror:?\s*)/i, '')
                                          .replace(/^([Ee]rror:?\s*)/i, '');
      
      showToast({
        type: 'error',
        title: 'Account Creation Failed',
        message: cleanErrorMessage,
        duration: 4000,
      });
    }
  };

  const handleInputChange = (field: keyof SignupForm, value: string): void => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear general error
    if (error) {
      clearError();
    }
  };

  const navigateToLogin = (): void => {
    navigation.navigate('Login');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading />
        <Text style={styles.loadingText}>Creating your account...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logo}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoX}>×</Text>
              </View>
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join TradeByBarter and start trading</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={[styles.input, styles.halfInput]}>
                <Input
                  label="First Name"
                  value={form.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  placeholder="Enter first name"
                  autoCapitalize="words"
                  error={formErrors.firstName}
                />
              </View>
              
              <View style={[styles.input, styles.halfInput]}>
                <Input
                  label="Last Name"
                  value={form.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  placeholder="Enter last name"
                  autoCapitalize="words"
                  error={formErrors.lastName}
                />
              </View>
            </View>

            <View style={styles.input}>
              <Input
                label="Email Address"
                value={form.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={formErrors.email}
              />
            </View>

            <View style={styles.input}>
              <Input
                label="Phone Number"
                value={form.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder="08123456789"
                keyboardType="phone-pad"
                error={formErrors.phone}
              />
              {!formErrors.phone && form.phone && (
                <Text style={styles.helpText}>
                  Must be a valid Nigerian number (+234XXXXXXXXX)
                </Text>
              )}
            </View>

            <View style={styles.input}>
              <Input
                label="Password"
                value={form.password}
                onChangeText={(value) => handleInputChange('password', value)}
                placeholder="Enter your password"
                secureTextEntry
                error={formErrors.password}
              />
              {!formErrors.password && form.password && (
                <Text style={styles.helpText}>
                  Must be at least 8 characters with uppercase, lowercase, number, and special character
                </Text>
              )}
            </View>

            <View style={styles.input}>
              <Input
                label="Confirm Password"
                value={form.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                placeholder="Confirm your password"
                secureTextEntry
                error={formErrors.confirmPassword}
              />
            </View>

            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>

            <Button
              title="Create Account"
              onPress={handleSignup}
              variant="primary"
              size="lg"
              disabled={isLoading}
              style={styles.signupButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.secondary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoX: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: TYPOGRAPHY.fontFamily.poppins,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.poppins,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    marginBottom: 20,
  },
  halfInput: {
    width: '48%',
  },
  termsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.primary.DEFAULT,
    fontWeight: '500',
  },
  signupButton: {
    marginBottom: 32,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  loginLink: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.primary.DEFAULT,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 16,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  helpText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    marginTop: 4,
    paddingHorizontal: 4,
  },
});

export default SignupScreen;