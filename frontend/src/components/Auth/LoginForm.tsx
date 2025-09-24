import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, ArrowRightOnRectangleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login(formData.email, formData.password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-xl shadow-lg border p-8 transition-theme" style={{
        backgroundColor: 'var(--color-panel)',
        borderColor: 'var(--color-panel-border)'
      }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{
            background: `linear-gradient(to bottom right, var(--color-primary), var(--color-primary-hover))`
          }}>
            <span className="text-white font-bold text-2xl">R</span>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{color: 'var(--color-text-main)'}}>
            Welcome back
          </h2>
          <p style={{color: 'var(--color-text-secondary)'}}>
            Sign in to your RSS Reader account
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <ExclamationCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2" style={{color: 'var(--color-text-main)'}}>
              Email address
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{color: 'var(--color-text-muted)'}} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                style={{
                  backgroundColor: 'var(--color-background-alt)',
                  borderColor: 'var(--color-panel-border)',
                  color: 'var(--color-text-main)',
                  '--tw-ring-color': 'var(--color-primary)'
                }}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{color: 'var(--color-text-main)'}}>
              Password
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{color: 'var(--color-text-muted)'}} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                style={{
                  backgroundColor: 'var(--color-background-alt)',
                  borderColor: 'var(--color-panel-border)',
                  color: 'var(--color-text-main)',
                  '--tw-ring-color': 'var(--color-primary)'
                }}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
                style={{
                  color: 'var(--color-text-muted)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                disabled={isLoading}
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: isLoading ? 'var(--color-text-muted)' : 'var(--color-primary)',
              '--tw-ring-color': 'var(--color-primary)',
              '--tw-ring-offset-color': 'var(--color-panel)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
              }
            }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            )}
            <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm" style={{color: 'var(--color-text-secondary)'}}>
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="font-medium transition-colors duration-200"
              style={{color: 'var(--color-primary)'}}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              disabled={isLoading}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};