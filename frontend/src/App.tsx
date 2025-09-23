import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { Toolbar } from './components/Toolbar';
import { FeedPanel } from './components/FeedPanel';
import { ArticleList } from './components/ArticleList';
import { ArticleContent } from './components/ArticleContent';
import { ResizablePanels } from './components/ResizablePanels';
import { UserProfile } from './components/UserProfile';

// Keyboard navigation hook
const useKeyboardNavigation = () => {
  const { state, selectFeed, selectItem } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard shortcuts when not focused on input elements
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          e.preventDefault();
          // Navigate to next article
          console.log('Navigate to next article');
          break;
        case 'k':
        case 'ArrowUp':
          e.preventDefault();
          // Navigate to previous article
          console.log('Navigate to previous article');
          break;
        case 'o':
        case 'Enter':
          e.preventDefault();
          // Open selected article in new tab
          if (state.selectedItem) {
            window.open(state.selectedItem.link, '_blank');
          }
          break;
        case 'r':
          e.preventDefault();
          // Refresh feeds
          console.log('Refresh feeds');
          break;
        case 'a':
          e.preventDefault();
          // Add new feed
          console.log('Add new feed');
          break;
        case 'f':
          e.preventDefault();
          // Focus search
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
          searchInput?.focus();
          break;
        case 'Escape':
          e.preventDefault();
          // Clear selection or close modal
          if (state.selectedItem) {
            selectItem(null);
          } else if (state.selectedFeed) {
            selectFeed(null);
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state, selectFeed, selectItem]);
};

const AppContent: React.FC = () => {
  useKeyboardNavigation();
  const [showUserProfile, setShowUserProfile] = useState(false);

  const handleAddFeed = () => {
    // In a real app, this would open a modal or navigate to add feed page
    const feedUrl = prompt('Enter RSS feed URL:');
    if (feedUrl) {
      console.log('Adding feed:', feedUrl);
      // Would make API call to backend here
    }
  };

  const handleRefresh = () => {
    console.log('Refreshing all feeds...');
    // In a real app, this would trigger feed refresh
    // Could show loading state, update last_fetched timestamps, etc.
  };

  const handleSettings = () => {
    setShowUserProfile(true);
  };

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-800 transition-theme">
        {/* Top Toolbar */}
        <Toolbar 
          onAddFeed={handleAddFeed}
          onRefresh={handleRefresh}
          onSettings={handleSettings}
        />

        {/* Main Content Area with Resizable Panels */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanels
            leftPanel={<FeedPanel />}
            middlePanel={<ArticleList />}
            rightPanel={<ArticleContent />}
            minPanelWidth={250}
          />
        </div>

        {/* User Profile Modal */}
        <UserProfile 
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
        />

        {/* Hidden keyboard shortcuts help (could be toggled with ?) */}
        <div className="hidden">
          <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm">
            <h4 className="font-semibold mb-2">Keyboard Shortcuts</h4>
            <div className="space-y-1 text-xs">
              <div><kbd className="bg-gray-700 px-1 rounded">j/↓</kbd> Next article</div>
              <div><kbd className="bg-gray-700 px-1 rounded">k/↑</kbd> Previous article</div>
              <div><kbd className="bg-gray-700 px-1 rounded">o/Enter</kbd> Open article</div>
              <div><kbd className="bg-gray-700 px-1 rounded">r</kbd> Refresh feeds</div>
              <div><kbd className="bg-gray-700 px-1 rounded">a</kbd> Add feed</div>
              <div><kbd className="bg-gray-700 px-1 rounded">f</kbd> Focus search</div>
              <div><kbd className="bg-gray-700 px-1 rounded">Esc</kbd> Clear selection</div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;