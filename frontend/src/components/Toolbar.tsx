import React, { useState, useRef, useEffect } from 'react';
import { 
  RefreshCw, 
  Plus, 
  Settings, 
  Sun, 
  Moon, 
  Search,
  Filter,
  Eye,
  EyeOff,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

interface ToolbarProps {
  onAddFeed?: () => void;
  onRefresh?: () => void;
  onSettings?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddFeed,
  onRefresh,
  onSettings,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { state, setSearchQuery, setSortOrder, toggleShowUnreadOnly } = useApp();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  const handleRefresh = () => {
    console.log('Refreshing feeds...');
    onRefresh?.();
  };

  const handleAddFeed = () => {
    console.log('Adding new feed...');
    onAddFeed?.();
  };

  const handleSettings = () => {
    console.log('Opening settings...');
    onSettings?.();
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <div className="h-14 border-b flex items-center justify-between px-4 transition-theme" style={{
      backgroundColor: 'var(--color-panel)',
      borderColor: 'var(--color-panel-border)'
    }}>
      {/* Left section - App title and main actions */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
            background: `linear-gradient(to bottom right, var(--color-primary), var(--color-primary-hover))`
          }}>
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <h1 className="text-lg font-semibold" style={{color: 'var(--color-text-main)'}}>
            RSS Reader
          </h1>
        </div>

        <div className="h-6 w-px" style={{backgroundColor: 'var(--color-divider)'}} />

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg transition-all duration-200 group"
            style={{color: 'var(--color-text-secondary)'}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-hover)';
              e.currentTarget.style.color = 'var(--color-text-main)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
            title="Refresh feeds"
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          </button>

          <button
            onClick={handleAddFeed}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200"
            title="Add feed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center section - Search and filters */}
      <div className="flex items-center space-x-4 flex-1 max-w-md mx-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={state.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
          />
        </div>

        <div className="flex items-center space-x-1">
          <select
            value={state.sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>

          <button
            onClick={toggleShowUnreadOnly}
            className={`p-2 rounded-lg transition-all duration-200 ${
              state.showUnreadOnly
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            title={state.showUnreadOnly ? 'Show all articles' : 'Show unread only'}
          >
            {state.showUnreadOnly ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Right section - Theme toggle, settings, and user menu */}
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200 group"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
          ) : (
            <Sun className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
          )}
        </button>

        <button
          onClick={handleSettings}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200 group"
          title="Settings"
        >
          <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform duration-200" />
        </button>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200"
            title="User menu"
          >
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {user?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-sm font-medium hidden sm:block">
                {user?.display_name || user?.email?.split('@')[0] || 'User'}
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 animate-fade-in">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {user?.display_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-1">
                <button
                  onClick={() => {
                    handleSettings();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                >
                  <User className="w-4 h-4" />
                  <span>Profile & Settings</span>
                </button>

                <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};