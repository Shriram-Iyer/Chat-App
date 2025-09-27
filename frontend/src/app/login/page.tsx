'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { Button, TextField, Logo, ValidationTooltip } from '@/components/ui';
import type { ValidationRule } from '@/components/ui';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [focused, setFocused] = useState({ email: false, password: false });
  const { isLoggingIn, login } = useAuthStore();

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
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

  // Check if all validations pass
  const isFormValid = () => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    return !emailError && !passwordError;
  };

  const handleInputChange = (field: 'email' | 'password') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleInputBlur = (field: 'email' | 'password') => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setFocused(prev => ({ ...prev, [field]: false }));
  };

  const handleInputFocus = (field: 'email' | 'password') => () => {
    setFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched to show validation errors
    setTouched({ email: true, password: true });

    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (!emailError && !passwordError) {
      try {
        await login(formData);
      } catch (error) {
        console.error('Login failed:', error);
      }
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-base-200 via-base-100 to-base-100 flex h-screen overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-secondary/15 to-accent/15 rounded-full blur-2xl animate-bounce"></div>
      </div>
      {/* Left Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10 h-full min-h-0"
        style={{ background: 'linear-gradient(135deg, hsl(var(--b3)/0.05), transparent 60%)' }}>
        <div className="w-full max-w-md">
          {/* App Logo and Title */}
          <div className="text-center mb-8 flex flex-col items-center">
            <Logo size="lg" variant="minimal" />
            <div className="mt-4">
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent tracking-tight">
                Welcome Back
              </h1>
              <p className="text-base-content/70 text-sm font-medium mt-1 leading-tight">Sign into your account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email Field */}
            <div className="relative">
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
            <div className="relative">
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

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoggingIn}
              loadingText="Signing in..."
              disabled={!isFormValid()}
            >
              Sign In
            </Button>
          </form>

          {/* Additional Options */}
          <div className="text-center mt-6">
            <Link href="#" className="link link-primary text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:opacity-80">
              Forgot your password?
            </Link>
          </div>

          <div className="text-center mt-4 pt-4 border-t border-base-300/50">
            <p className="text-base-content font-medium">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:opacity-80">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/20 relative items-center justify-center p-4 overflow-hidden h-full min-h-0">
        {/* Additional background effects */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
        <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-r from-accent/30 to-primary/30 rounded-full blur-2xl animate-pulse"></div>

        <div className="text-center relative z-10 max-w-sm">
          <div className="mb-6">
            <svg
              className="w-64 h-64 mx-auto text-primary/70"
              fill="currentColor"
              viewBox="0 0 400 400"
            >
              {/* Video Chat Illustration */}
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className="stop-color-primary/20" />
                  <stop offset="100%" className="stop-color-secondary/20" />
                </linearGradient>
              </defs>

              {/* Main video screen */}
              <rect x="50" y="80" width="300" height="200" rx="20" fill="url(#grad1)" stroke="currentColor" strokeWidth="3" />

              {/* Person 1 video feed */}
              <rect x="70" y="100" width="120" height="80" rx="10" fill="currentColor" opacity="0.3" />
              <circle cx="130" cy="130" r="15" fill="currentColor" opacity="0.6" />
              <path d="M115 145 Q130 155 145 145" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6" />

              {/* Person 2 video feed */}
              <rect x="210" y="100" width="120" height="80" rx="10" fill="currentColor" opacity="0.3" />
              <circle cx="270" cy="130" r="15" fill="currentColor" opacity="0.6" />
              <path d="M255 145 Q270 155 285 145" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6" />

              {/* Control buttons */}
              <circle cx="150" cy="250" r="20" fill="currentColor" opacity="0.4" />
              <path d="M145 245 L155 250 L145 255 Z" fill="white" />

              <circle cx="200" cy="250" r="20" fill="currentColor" opacity="0.6" />
              <rect x="195" y="245" width="10" height="10" fill="white" rx="2" />

              <circle cx="250" cy="250" r="20" fill="currentColor" opacity="0.4" />
              <path d="M240 245 Q250 240 260 245 Q250 250 240 255 Q250 260 260 255" stroke="white" strokeWidth="2" fill="none" />

              {/* Connection lines */}
              <path d="M100 50 Q200 30 300 50" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4" strokeDasharray="5,5" />
              <circle cx="100" cy="50" r="5" fill="currentColor" opacity="0.6" />
              <circle cx="200" cy="35" r="5" fill="currentColor" opacity="0.6" />
              <circle cx="300" cy="50" r="5" fill="currentColor" opacity="0.6" />

              {/* Chat bubbles */}
              <ellipse cx="80" cy="320" rx="40" ry="20" fill="currentColor" opacity="0.3" />
              <text x="80" y="325" textAnchor="middle" className="text-xs fill-current" opacity="0.8">Hello!</text>

              <ellipse cx="320" cy="340" rx="50" ry="25" fill="currentColor" opacity="0.3" />
              <text x="320" y="345" textAnchor="middle" className="text-xs fill-current" opacity="0.8">Nice to see you!</text>
            </svg>
          </div>

          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-3">Connect Beyond Boundaries</h2>
          <p className="text-base text-base-content/70 mb-6 leading-relaxed">
            Experience seamless video calls, instant messaging, and meaningful connections with ConnectVibe - where conversations come alive.
          </p>

          <div className="flex justify-center space-x-4">
            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full flex items-center justify-center mb-1 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
                </svg>
              </div>
              <p className="text-xs text-base-content/60">HD Video</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-r from-secondary/30 to-accent/30 rounded-full flex items-center justify-center mb-1 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                </svg>
              </div>
              <p className="text-xs text-base-content/60">Instant Chat</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-r from-accent/30 to-primary/30 rounded-full flex items-center justify-center mb-1 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                </svg>
              </div>
              <p className="text-xs text-base-content/60">Secure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}