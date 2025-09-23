// Types matching PocketBase schema from pocketbase-setup.py

export interface User {
  id: string;
  email: string;
  display_name?: string;
  theme?: 'light' | 'dark';
  created_at: string;
  updated_at: string;
}

export interface Feed {
  id: string;
  url: string;
  title?: string;
  favicon?: string;
  category?: string;
  last_fetched?: string;
  fetch_status?: 'success' | 'failed';
  error_message?: string;
  etag?: string;
  last_modified?: string;
  created_at: string;
  updated_at: string;
  unread_count?: number; // computed field
}

export interface Subscription {
  id: string;
  user_id: string;
  feed_id: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  feed?: Feed; // populated relation
}

export interface FeedItem {
  id: string;
  feed_id: string;
  title: string;
  link: string;
  published?: string;
  summary?: string;
  image_url?: string;
  author?: string;
  read_by: string[]; // array of user_ids
  created_at: string;
  updated_at: string;
  feed?: Feed; // populated relation
  is_read?: boolean; // computed based on current user
}

export interface Category {
  id: string;
  name: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  feeds?: Feed[]; // computed field
  unread_count?: number; // computed field
}

export interface Favorite {
  id: string;
  user_id: string;
  feed_item_id: string;
  created_at: string;
  feed_item?: FeedItem; // populated relation
}

export interface UserSettings {
  id: string;
  user_id: string;
  fetch_interval: number;
  default_sort_order: 'newest' | 'oldest';
  notification_preferences?: any;
  created_at: string;
  updated_at: string;
}

// UI State types
export interface PanelSizes {
  left: number;
  middle: number;
  right: number;
}

export interface AppState {
  selectedFeed: Feed | null;
  selectedItem: FeedItem | null;
  selectedCategory: Category | null;
  panelSizes: PanelSizes;
  searchQuery: string;
  sortOrder: 'newest' | 'oldest';
  showUnreadOnly: boolean;
}