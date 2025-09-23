import { Feed, FeedItem, Category, User, UserSettings } from '../types';

// Mock user data
export const mockUser: User = {
  id: 'user_1',
  email: 'demo@rssreader.com',
  display_name: 'Demo User',
  theme: 'light',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockUserSettings: UserSettings = {
  id: 'settings_1',
  user_id: 'user_1',
  fetch_interval: 15,
  default_sort_order: 'newest',
  notification_preferences: {},
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Mock categories with feeds
export const mockCategories: Category[] = [
  {
    id: 'cat_1',
    name: 'Technology',
    user_id: 'user_1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    unread_count: 12,
  },
  {
    id: 'cat_2',
    name: 'Design',
    user_id: 'user_1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    unread_count: 8,
  },
  {
    id: 'cat_3',
    name: 'Business',
    user_id: 'user_1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    unread_count: 5,
  },
  {
    id: 'cat_4',
    name: 'Science',
    user_id: 'user_1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    unread_count: 3,
  },
];

// Mock feeds
export const mockFeeds: Feed[] = [
  {
    id: 'feed_1',
    url: 'https://techcrunch.com/feed/',
    title: 'TechCrunch',
    favicon: 'https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png',
    category: 'Technology',
    last_fetched: '2024-01-15T12:00:00Z',
    fetch_status: 'success',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T12:00:00Z',
    unread_count: 7,
  },
  {
    id: 'feed_2',
    url: 'https://www.theverge.com/rss/index.xml',
    title: 'The Verge',
    favicon: 'https://cdn.vox-cdn.com/uploads/chorus_asset/file/7395359/favicon-16x16.0.png',
    category: 'Technology',
    last_fetched: '2024-01-15T11:30:00Z',
    fetch_status: 'success',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T11:30:00Z',
    unread_count: 5,
  },
  {
    id: 'feed_3',
    url: 'https://dribbble.com/shots/popular.rss',
    title: 'Dribbble Popular',
    favicon: 'https://cdn.dribbble.com/assets/favicon-b38525134603b7044be00f37cb4d1a42.ico',
    category: 'Design',
    last_fetched: '2024-01-15T10:00:00Z',
    fetch_status: 'success',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    unread_count: 3,
  },
  {
    id: 'feed_4',
    url: 'https://feeds.feedburner.com/behance/vor',
    title: 'Behance',
    favicon: 'https://a5.behance.net/img/site/favicon.ico',
    category: 'Design',
    last_fetched: '2024-01-15T09:45:00Z',
    fetch_status: 'success',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-15T09:45:00Z',
    unread_count: 5,
  },
  {
    id: 'feed_5',
    url: 'https://hbr.org/feed',
    title: 'Harvard Business Review',
    favicon: 'https://hbr.org/favicon.ico',
    category: 'Business',
    last_fetched: '2024-01-15T08:00:00Z',
    fetch_status: 'success',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-15T08:00:00Z',
    unread_count: 2,
  },
  {
    id: 'feed_6',
    url: 'https://www.entrepreneur.com/latest',
    title: 'Entrepreneur',
    favicon: 'https://assets.entrepreneur.com/favicon.ico',
    category: 'Business',
    last_fetched: '2024-01-15T07:30:00Z',
    fetch_status: 'success',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-15T07:30:00Z',
    unread_count: 3,
  },
  {
    id: 'feed_7',
    url: 'https://feeds.nature.com/nature/rss/current',
    title: 'Nature',
    favicon: 'https://www.nature.com/static/images/favicons/nature/favicon.ico',
    category: 'Science',
    last_fetched: '2024-01-15T06:00:00Z',
    fetch_status: 'failed',
    error_message: 'Connection timeout',
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-15T06:00:00Z',
    unread_count: 0,
  },
  {
    id: 'feed_8',
    url: 'https://rss.cnn.com/rss/edition.rss',
    title: 'CNN',
    favicon: 'https://www.cnn.com/favicon.ico',
    category: 'Science',
    last_fetched: '2024-01-15T05:30:00Z',
    fetch_status: 'success',
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-15T05:30:00Z',
    unread_count: 3,
  },
];

// Mock feed items
export const mockFeedItems: FeedItem[] = [
  {
    id: 'item_1',
    feed_id: 'feed_1',
    title: 'OpenAI Announces GPT-5 with Revolutionary Capabilities',
    link: 'https://techcrunch.com/2024/01/15/openai-gpt5-announcement',
    published: '2024-01-15T12:00:00Z',
    summary: 'OpenAI today announced GPT-5, the latest iteration of their large language model that promises unprecedented capabilities in reasoning, coding, and creative tasks. The new model shows significant improvements across all benchmarks...',
    image_url: 'https://techcrunch.com/wp-content/uploads/2024/01/gpt5-hero.jpg',
    author: 'Sarah Mitchell',
    read_by: [],
    created_at: '2024-01-15T12:05:00Z',
    updated_at: '2024-01-15T12:05:00Z',
    is_read: false,
  },
  {
    id: 'item_2',
    feed_id: 'feed_1',
    title: 'Tesla Unveils New Autopilot Hardware for 2024 Models',
    link: 'https://techcrunch.com/2024/01/15/tesla-autopilot-hardware-2024',
    published: '2024-01-15T10:30:00Z',
    summary: 'Tesla has revealed its next-generation Autopilot hardware that will be standard in all 2024 model vehicles. The new system features enhanced cameras, improved radar technology, and a more powerful onboard computer...',
    image_url: 'https://techcrunch.com/wp-content/uploads/2024/01/tesla-autopilot.jpg',
    author: 'Mark Johnson',
    read_by: ['user_1'],
    created_at: '2024-01-15T10:35:00Z',
    updated_at: '2024-01-15T10:35:00Z',
    is_read: true,
  },
  {
    id: 'item_3',
    feed_id: 'feed_2',
    title: 'Apple Vision Pro Gets Massive Software Update',
    link: 'https://www.theverge.com/2024/1/15/apple-vision-pro-update',
    published: '2024-01-15T09:00:00Z',
    summary: 'Apple has released visionOS 2.1, bringing significant improvements to the Vision Pro experience. New features include enhanced hand tracking, improved virtual keyboard, and better app multitasking capabilities...',
    image_url: 'https://cdn.vox-cdn.com/uploads/chorus_asset/file/25208847/apple-vision-pro-update.jpg',
    author: 'Alex Rivera',
    read_by: [],
    created_at: '2024-01-15T09:05:00Z',
    updated_at: '2024-01-15T09:05:00Z',
    is_read: false,
  },
  {
    id: 'item_4',
    feed_id: 'feed_2',
    title: 'Microsoft Surface Laptop 6 Review: A Powerful Upgrade',
    link: 'https://www.theverge.com/2024/1/14/microsoft-surface-laptop-6-review',
    published: '2024-01-14T16:00:00Z',
    summary: 'Microsoft\'s latest Surface Laptop 6 brings significant performance improvements with the new Intel Core Ultra processors. Our review covers battery life, display quality, and overall user experience...',
    image_url: 'https://cdn.vox-cdn.com/uploads/chorus_asset/file/25208234/surface-laptop-6-hero.jpg',
    author: 'Jordan Chen',
    read_by: [],
    created_at: '2024-01-14T16:05:00Z',
    updated_at: '2024-01-14T16:05:00Z',
    is_read: false,
  },
  {
    id: 'item_5',
    feed_id: 'feed_3',
    title: 'Stunning Mobile App Design Trends for 2024',
    link: 'https://dribbble.com/shots/mobile-app-design-trends-2024',
    published: '2024-01-15T08:00:00Z',
    summary: 'Explore the latest mobile app design trends that are shaping 2024. From neumorphism to glassmorphism, discover the visual styles that are capturing users\' attention and improving user experience...',
    image_url: 'https://cdn.dribbble.com/users/1234567/screenshots/mobile-trends-2024.png',
    author: 'Emma Design',
    read_by: [],
    created_at: '2024-01-15T08:05:00Z',
    updated_at: '2024-01-15T08:05:00Z',
    is_read: false,
  },
  {
    id: 'item_6',
    feed_id: 'feed_4',
    title: 'Brand Identity Design for Sustainable Fashion',
    link: 'https://www.behance.net/gallery/sustainable-fashion-brand',
    published: '2024-01-14T14:00:00Z',
    summary: 'A comprehensive brand identity project for an eco-friendly fashion startup. The design approach emphasizes sustainability through earthy colors, organic shapes, and recycled materials...',
    image_url: 'https://mir-s3-cdn-cf.behance.net/project_modules/sustainable-fashion.jpg',
    author: 'Creative Studio',
    read_by: ['user_1'],
    created_at: '2024-01-14T14:05:00Z',
    updated_at: '2024-01-14T14:05:00Z',
    is_read: true,
  },
  {
    id: 'item_7',
    feed_id: 'feed_5',
    title: 'The Future of Remote Work: 5 Key Predictions',
    link: 'https://hbr.org/2024/01/future-remote-work-predictions',
    published: '2024-01-15T07:00:00Z',
    summary: 'As remote work continues to evolve, business leaders must adapt to new challenges and opportunities. This article explores five key predictions for the future of distributed teams...',
    author: 'Dr. Lisa Roberts',
    read_by: [],
    created_at: '2024-01-15T07:05:00Z',
    updated_at: '2024-01-15T07:05:00Z',
    is_read: false,
  },
  {
    id: 'item_8',
    feed_id: 'feed_6',
    title: 'Startup Funding Reaches Record High in Q1 2024',
    link: 'https://www.entrepreneur.com/startup-funding-q1-2024',
    published: '2024-01-14T12:00:00Z',
    summary: 'Venture capital funding for startups reached unprecedented levels in the first quarter of 2024, with particular strength in AI, biotech, and clean energy sectors...',
    author: 'Mike Thompson',
    read_by: [],
    created_at: '2024-01-14T12:05:00Z',
    updated_at: '2024-01-14T12:05:00Z',
    is_read: false,
  },
];

// Helper functions to work with mock data
export const getFeedsByCategory = (categoryName: string): Feed[] => {
  return mockFeeds.filter(feed => feed.category === categoryName);
};

export const getItemsByFeed = (feedId: string): FeedItem[] => {
  return mockFeedItems
    .filter(item => item.feed_id === feedId)
    .sort((a, b) => new Date(b.published || b.created_at).getTime() - new Date(a.published || a.created_at).getTime());
};

export const getUnreadItemsByFeed = (feedId: string): FeedItem[] => {
  return getItemsByFeed(feedId).filter(item => !item.is_read);
};

export const getAllItems = (): FeedItem[] => {
  return mockFeedItems
    .sort((a, b) => new Date(b.published || b.created_at).getTime() - new Date(a.published || a.created_at).getTime());
};

export const searchItems = (query: string): FeedItem[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockFeedItems.filter(item =>
    item.title.toLowerCase().includes(lowercaseQuery) ||
    (item.summary && item.summary.toLowerCase().includes(lowercaseQuery)) ||
    (item.author && item.author.toLowerCase().includes(lowercaseQuery))
  );
};