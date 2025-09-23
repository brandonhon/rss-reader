import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Settings, 
  Palette, 
  Save,
  AlertCircle,
  CheckCircle 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { user, pb } = useAuth();
  const { theme, setTheme } = useTheme();
  const [formData, setFormData] = useState({
    display_name: user?.display_name || '',
    email: user?.email || '',
    theme: user?.theme || theme,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setMessage(null);

    try {
      // Update user profile
      await pb.collection('users').update(user.id, {
        display_name: formData.display_name,
        theme: formData.theme,
      });

      // Update theme if it changed
      if (formData.theme !== theme) {
        setTheme(formData.theme as 'light' | 'dark');
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Profile update failed:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (message) setMessage(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md transition-theme">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Profile Settings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your account preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mx-6 mt-4 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}>
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="display_name"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleChange}
                  placeholder="Enter your display name"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Theme Preference */}
            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme Preference
              </label>
              <div className="relative">
                <Palette className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="theme"
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-gray-100 transition-all duration-200"
                  disabled={isLoading}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Choose your preferred color scheme
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};