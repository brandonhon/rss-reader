import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { AppState, Feed, FeedItem, Category, PanelSizes } from '../types';
import { useFeeds } from '../hooks/useFeeds';

interface AppContextType {
  state: AppState;
  // Data from useFeeds hook
  feeds: Feed[];
  categories: Category[];
  feedItems: FeedItem[];
  loading: boolean;
  error: string | null;
  // Actions
  selectFeed: (feed: Feed | null) => void;
  selectItem: (item: FeedItem | null) => void;
  selectCategory: (category: Category | null) => void;
  setPanelSizes: (sizes: PanelSizes) => void;
  setSearchQuery: (query: string) => void;
  setSortOrder: (order: 'newest' | 'oldest') => void;
  toggleShowUnreadOnly: () => void;
  markItemAsRead: (itemId: string) => void;
  markItemAsUnread: (itemId: string) => void;
  // Feed management
  addFeed: (url: string, category?: string) => Promise<any>;
  removeFeed: (feedId: string) => Promise<void>;
  refreshFeeds: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

type AppAction =
  | { type: 'SELECT_FEED'; payload: Feed | null }
  | { type: 'SELECT_ITEM'; payload: FeedItem | null }
  | { type: 'SELECT_CATEGORY'; payload: Category | null }
  | { type: 'SET_PANEL_SIZES'; payload: PanelSizes }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SORT_ORDER'; payload: 'newest' | 'oldest' }
  | { type: 'TOGGLE_SHOW_UNREAD_ONLY' }
  | { type: 'MARK_ITEM_READ'; payload: string }
  | { type: 'MARK_ITEM_UNREAD'; payload: string };

const initialState: AppState = {
  selectedFeed: null,
  selectedItem: null,
  selectedCategory: null,
  panelSizes: { left: 300, middle: 400, right: 600 },
  searchQuery: '',
  sortOrder: 'newest',
  showUnreadOnly: false,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SELECT_FEED':
      return {
        ...state,
        selectedFeed: action.payload,
        selectedItem: null, // Clear selected item when changing feeds
        selectedCategory: null,
      };
    case 'SELECT_ITEM':
      return {
        ...state,
        selectedItem: action.payload,
      };
    case 'SELECT_CATEGORY':
      return {
        ...state,
        selectedCategory: action.payload,
        selectedFeed: null,
        selectedItem: null,
      };
    case 'SET_PANEL_SIZES':
      return {
        ...state,
        panelSizes: action.payload,
      };
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      };
    case 'SET_SORT_ORDER':
      return {
        ...state,
        sortOrder: action.payload,
      };
    case 'TOGGLE_SHOW_UNREAD_ONLY':
      return {
        ...state,
        showUnreadOnly: !state.showUnreadOnly,
      };
    case 'MARK_ITEM_READ':
      // In a real app, this would update the backend
      return state;
    case 'MARK_ITEM_UNREAD':
      // In a real app, this would update the backend
      return state;
    default:
      return state;
  }
};

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const feedsData = useFeeds();

  const selectFeed = useCallback((feed: Feed | null) => {
    dispatch({ type: 'SELECT_FEED', payload: feed });
  }, []);

  const selectItem = useCallback((item: FeedItem | null) => {
    dispatch({ type: 'SELECT_ITEM', payload: item });
  }, []);

  const selectCategory = useCallback((category: Category | null) => {
    dispatch({ type: 'SELECT_CATEGORY', payload: category });
  }, []);

  const setPanelSizes = useCallback((sizes: PanelSizes) => {
    dispatch({ type: 'SET_PANEL_SIZES', payload: sizes });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const setSortOrder = useCallback((order: 'newest' | 'oldest') => {
    dispatch({ type: 'SET_SORT_ORDER', payload: order });
  }, []);

  const toggleShowUnreadOnly = useCallback(() => {
    dispatch({ type: 'TOGGLE_SHOW_UNREAD_ONLY' });
  }, []);

  const markItemAsRead = useCallback((itemId: string) => {
    dispatch({ type: 'MARK_ITEM_READ', payload: itemId });
  }, []);

  const markItemAsUnread = useCallback((itemId: string) => {
    dispatch({ type: 'MARK_ITEM_UNREAD', payload: itemId });
  }, []);

  const value = {
    state,
    // Expose feeds data
    feeds: feedsData.feeds,
    categories: feedsData.categories,
    feedItems: feedsData.feedItems,
    loading: feedsData.loading,
    error: feedsData.error,
    // Actions
    selectFeed,
    selectItem,
    selectCategory,
    setPanelSizes,
    setSearchQuery,
    setSortOrder,
    toggleShowUnreadOnly,
    markItemAsRead,
    markItemAsUnread,
    // Feed management
    addFeed: feedsData.addFeed,
    removeFeed: feedsData.removeFeed,
    refreshFeeds: feedsData.refreshFeeds,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};