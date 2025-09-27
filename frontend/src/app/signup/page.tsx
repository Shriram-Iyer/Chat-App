'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { Button, TextField, Logo, ValidationTooltip } from '@/components/ui';
import { useToast } from '@/hooks/useToast';

import type { ValidationRule } from '@/components/ui';



interface SignupFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpPage() {

  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });



  const [touched, setTouched] = useState({
    email: false,
    username: false,
    password: false,
    confirmPassword: false
  });
  const [focused, setFocused] = useState({
    email: false,
    username: false,
    password: false,
    confirmPassword: false
  });

  const { signUp, isSigningUp } = useAuthStore();
  const toast = useToast();

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validateUsername = (username: string): string => {
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    if (!/(?=.*[!@#$%^&*])/.test(password)) return 'Password must contain at least one special character';
    return '';
  };

  const validateConfirmPassword = (confirmPassword: string): string => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== formData.password) return 'Passwords do not match';
    return '';
  };





  // Get validation rules for tooltips
  const getEmailValidationRules = (): ValidationRule[] => [
    {
      condition: !!formData.email,
      message: 'Email is required'
    },
    {
      condition: formData.email ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) : false,
      message: 'Valid email format'
    }
  ];

  const getUsernameValidationRules = (): ValidationRule[] => [
    {
      condition: !!formData.username,
      message: 'Username is required'
    },
    {
      condition: formData.username ? formData.username.length >= 3 : false,
      message: 'At least 3 characters'
    },
    {
      condition: formData.username ? formData.username.length <= 20 : false,
      message: 'Less than 20 characters'
    },
    {
      condition: formData.username ? /^[a-zA-Z0-9_]+$/.test(formData.username) : false,
      message: 'Only letters, numbers, and underscores'
    }
  ];

  const getPasswordValidationRules = (): ValidationRule[] => [
    {
      condition: !!formData.password,
      message: 'Password is required'
    },
    {
      condition: formData.password ? formData.password.length >= 8 : false,
      message: 'At least 8 characters'
    },
    {
      condition: formData.password ? /(?=.*[a-z])/.test(formData.password) : false,
      message: 'One lowercase letter'
    },
    {
      condition: formData.password ? /(?=.*[A-Z])/.test(formData.password) : false,
      message: 'One uppercase letter'
    },
    {
      condition: formData.password ? /(?=.*\d)/.test(formData.password) : false,
      message: 'One number'
    },
    {
      condition: formData.password ? /(?=.*[!@#$%^&*])/.test(formData.password) : false,
      message: 'One special character'
    }
  ];

  const getConfirmPasswordValidationRules = (): ValidationRule[] => [
    {
      condition: !!formData.confirmPassword,
      message: 'Confirm password is required'
    },
    {
      condition: formData.confirmPassword ? formData.confirmPassword === formData.password : false,
      message: 'Passwords match'
    }
  ];

  // Check if all validations pass
  const isFormValid = () => {
    const emailError = validateEmail(formData.email);
    const usernameError = validateUsername(formData.username);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword);

    return !emailError && !usernameError && !passwordError && !confirmPasswordError;
  };

  const handleInputChange = (field: keyof SignupFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleInputBlur = (field: keyof SignupFormData) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setFocused(prev => ({ ...prev, [field]: false }));
  };

  const handleInputFocus = (field: keyof SignupFormData) => () => {
    setFocused(prev => ({ ...prev, [field]: true }));
  };




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched to show validation errors
    setTouched({
      email: true,
      username: true,
      password: true,
      confirmPassword: true
    });

    if (!isFormValid()) {
      toast.error('Please fix the errors in the form before submitting.');
      return;
    }
    const registerData = {
      email: formData.email,
      username: formData.username,
      password: formData.password
    };

    try {
      await signUp(registerData);
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div className="relative h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 flex">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-secondary/15 to-accent/15 rounded-full blur-2xl animate-bounce"></div>
      </div>

      {/* Left Panel - Signup Form */}
  <div className="flex-1 flex p-2 relative z-10 max-h-screen overflow-hidden items-center justify-center">
        <div className="w-full max-w-md">
          {/* App Logo and Title */}
          <div className="text-center mb-6 flex flex-col items-center">
            <Logo size="lg" variant="minimal" />
            <div className="mt-4">
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent tracking-tight">
                Create Account
              </h1>
              <p className="text-base-content/70 text-sm font-medium mt-1 leading-tight">Get started with your free account</p>
            </div>
          </div>



          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="relative z-[9999]">
              <TextField
                type="text"
                label="Username"
                value={formData.username}
                onChange={handleInputChange('username')}
                onBlur={handleInputBlur('username')}
                onFocus={handleInputFocus('username')}
                error={touched.username ? validateUsername(formData.username) : undefined}
                success={touched.username && !validateUsername(formData.username)}
                size="md"
                variant="filled"
              />

              <ValidationTooltip
                rules={getUsernameValidationRules()}
                show={focused.username}
                position="right"
                variant="detailed"
              />
            </div>

            {/* Email Field */}
            <div className="relative z-[9999]">
              <TextField
                type="email"
                label="Email Address"
                value={formData.email}
                onChange={handleInputChange('email')}
                onBlur={handleInputBlur('email')}
                onFocus={handleInputFocus('email')}
                error={touched.email ? validateEmail(formData.email) : undefined}
                success={touched.email && !validateEmail(formData.email)}
                size="md"
                variant="filled"
              />

              <ValidationTooltip
                rules={getEmailValidationRules()}
                show={focused.email}
                position="right"
                variant="detailed"
              />
            </div>

            {/* Password Field */}
            <div className="relative z-[9999]">
              <TextField
                label="Password"
                value={formData.password}
                onChange={handleInputChange('password')}
                onBlur={handleInputBlur('password')}
                onFocus={handleInputFocus('password')}
                error={touched.password ? validatePassword(formData.password) : undefined}
                success={touched.password && !validatePassword(formData.password)}
                isPassword={true}
                showPasswordToggle={true}
                size="md"
                variant="filled"
              />

              <ValidationTooltip
                rules={getPasswordValidationRules()}
                show={focused.password}
                position="right"
                variant="detailed"
              />
            </div>

            {/* Confirm Password Field */}
            <div className="relative z-[9999]">
              <TextField
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                onBlur={handleInputBlur('confirmPassword')}
                onFocus={handleInputFocus('confirmPassword')}
                error={touched.confirmPassword ? validateConfirmPassword(formData.confirmPassword) : undefined}
                success={touched.confirmPassword && !validateConfirmPassword(formData.confirmPassword)}
                isPassword={true}
                showPasswordToggle={true}
                size="md"
                variant="filled"
              />

              <ValidationTooltip
                rules={getConfirmPasswordValidationRules()}
                show={focused.confirmPassword}
                position="right"
                variant="compact"
              />
            </div>



            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSigningUp}
              loadingText="Creating account..."
              disabled={!isFormValid()}
            >
              Create Account
            </Button>
          </form>

          {/* Additional Options */}
          <div className="text-center mt-2 pt-1">
            <p className="text-base-content font-medium text-sm">
              Already have an account?{' '}
              <Link href="/login" className="font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:opacity-80">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/20 relative items-center justify-center p-8 overflow-hidden">
        {/* Additional background effects */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
        <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-r from-accent/30 to-primary/30 rounded-full blur-2xl animate-pulse"></div>

        <div className="text-center relative z-10">
          <div className="mb-8">
            <svg
              className="w-96 h-96 mx-auto text-primary/70"
              fill="currentColor"
              viewBox="0 0 400 400"
            >
              {/* Community Illustration */}
              <defs>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className="stop-color-primary/20" />
                  <stop offset="100%" className="stop-color-secondary/20" />
                </linearGradient>
              </defs>

              {/* Background circle */}
              <circle cx="200" cy="200" r="180" fill="url(#grad2)" opacity="0.3" />

              {/* People icons arranged in a circle */}
              <g opacity="0.8">
                {/* Person 1 - Top */}
                <circle cx="200" cy="80" r="25" fill="currentColor" opacity="0.6" />
                <circle cx="200" cy="75" r="8" fill="currentColor" opacity="0.8" />
                <path d="M185 95 Q200 105 215 95" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.8" />

                {/* Person 2 - Top Right */}
                <circle cx="280" cy="120" r="25" fill="currentColor" opacity="0.6" />
                <circle cx="280" cy="115" r="8" fill="currentColor" opacity="0.8" />
                <path d="M265 135 Q280 145 295 135" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.8" />

                {/* Person 3 - Right */}
                <circle cx="320" cy="200" r="25" fill="currentColor" opacity="0.6" />
                <circle cx="320" cy="195" r="8" fill="currentColor" opacity="0.8" />
                <path d="M305 215 Q320 225 335 215" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.8" />

                {/* Person 4 - Bottom Right */}
                <circle cx="280" cy="280" r="25" fill="currentColor" opacity="0.6" />
                <circle cx="280" cy="275" r="8" fill="currentColor" opacity="0.8" />
                <path d="M265 295 Q280 305 295 295" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.8" />

                {/* Person 5 - Bottom */}
                <circle cx="200" cy="320" r="25" fill="currentColor" opacity="0.6" />
                <circle cx="200" cy="315" r="8" fill="currentColor" opacity="0.8" />
                <path d="M185 335 Q200 345 215 335" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.8" />

                {/* Person 6 - Bottom Left */}
                <circle cx="120" cy="280" r="25" fill="currentColor" opacity="0.6" />
                <circle cx="120" cy="275" r="8" fill="currentColor" opacity="0.8" />
                <path d="M105 295 Q120 305 135 295" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.8" />

                {/* Person 7 - Left */}
                <circle cx="80" cy="200" r="25" fill="currentColor" opacity="0.6" />
                <circle cx="80" cy="195" r="8" fill="currentColor" opacity="0.8" />
                <path d="M65 215 Q80 225 95 215" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.8" />

                {/* Person 8 - Top Left */}
                <circle cx="120" cy="120" r="25" fill="currentColor" opacity="0.6" />
                <circle cx="120" cy="115" r="8" fill="currentColor" opacity="0.8" />
                <path d="M105 135 Q120 145 135 135" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.8" />
              </g>

              {/* Connection lines */}
              <g opacity="0.4" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="3,3">
                <path d="M200 105 L280 145" />
                <path d="M280 145 L295 175" />
                <path d="M295 175 L280 255" />
                <path d="M280 255 L200 295" />
                <path d="M200 295 L120 255" />
                <path d="M120 255 L105 175" />
                <path d="M105 175 L120 145" />
                <path d="M120 145 L200 105" />
              </g>

              {/* Center hub */}
              <circle cx="200" cy="200" r="15" fill="currentColor" opacity="0.9" />
              <circle cx="200" cy="200" r="8" fill="white" opacity="0.9" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">Join Our Community</h2>
          <p className="text-lg text-base-content/70 max-w-md mx-auto">
            Connect with friends, family, and colleagues. Start meaningful conversations and build lasting relationships with ConnectVibe.
          </p>

          <div className="flex justify-center space-x-6 mt-8">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full flex items-center justify-center mb-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                <svg className="w-7 h-7 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
              </div>
              <p className="text-sm text-base-content/60 font-medium text-center">Free Forever</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-gradient-to-r from-secondary/30 to-accent/30 rounded-full flex items-center justify-center mb-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                <svg className="w-7 h-7 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <p className="text-sm text-base-content/60 font-medium text-center">Easy Setup</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-gradient-to-r from-accent/30 to-primary/30 rounded-full flex items-center justify-center mb-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                <svg className="w-7 h-7 text-accent" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
              </div>
              <p className="text-sm text-base-content/60 font-medium text-center">Secure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}