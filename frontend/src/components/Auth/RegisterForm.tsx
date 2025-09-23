import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      return 'Please fill in all required fields';
    }

    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Please enter a valid email address';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await register(formData.email, formData.password, formData.displayName);
      setSuccess('Account created successfully! Redirecting...');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '' };
    if (password.length < 6) return { strength: 1, label: 'Weak' };
    if (password.length < 10) return { strength: 2, label: 'Fair' };
    if (password.length < 15 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { strength: 3, label: 'Good' };
    }
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      return { strength: 4, label: 'Strong' };
    }
    return { strength: 2, label: 'Fair' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 transition-theme">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">R</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Create account
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Join RSS Reader to start organizing your feeds
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-700 dark:text-green-300">{success}</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Display Name Field */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Display name (optional)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="How should we call you?"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.strength === 1 ? 'bg-red-500 w-1/4' :
                        passwordStrength.strength === 2 ? 'bg-yellow-500 w-2/4' :
                        passwordStrength.strength === 3 ? 'bg-blue-500 w-3/4' :
                        passwordStrength.strength === 4 ? 'bg-green-500 w-full' : 'w-0'
                      }`}
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[50px]">
                    {passwordStrength.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <UserPlus className="w-5 h-5" />
            )}
            <span>{isLoading ? 'Creating account...' : 'Create account'}</span>
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors duration-200"
              disabled={isLoading}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};