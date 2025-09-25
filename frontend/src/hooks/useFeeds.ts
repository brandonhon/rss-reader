import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Feed, Category, FeedItem } from '../types';

interface FeedsData {
  feeds: Feed[];
  categories: Category[];
  feedItems: FeedItem[];
  loading: boolean;
  error: string | null;
}

export const useFeeds = () => {
  const { user } = useAuth();
  const [data, setData] = useState<FeedsData>({
    feeds: [],
    categories: [],
    feedItems: [],
    loading: true,
    error: null,
  });

  const transformFeed = (record: any): Feed => ({
    id: record.id,
    url: record.url,
    title: record.title || record.url,
    favicon: record.favicon,
    category: record.category,
    last_fetched: record.last_fetched,
    fetch_status: record.fetch_status || 'pending',
    error_message: record.error_message,
    created_at: record.created,
    updated_at: record.updated,
    unread_count: 0, // Will be calculated based on feed items
  });

  const transformCategory = (record: any): Category => ({
    id: record.id,
    name: record.name,
    user_id: record.user_id,
    color: record.color,
    created_at: record.created,
    updated_at: record.updated,
    unread_count: 0, // Will be calculated
  });

  const transformFeedItem = (record: any): FeedItem => ({
    id: record.id,
    feed_id: record.feed_id,
    title: record.title,
    link: record.link,
    published: record.published_date,
    summary: record.description,
    content: record.content,
    image_url: record.image_url,
    author: record.author,
    guid: record.guid,
    read_by: [], // This would need to be implemented based on your read tracking system
    created_at: record.created,
    updated_at: record.updated,
    is_read: false, // This would need to be calculated based on user read status
  });

  const loadFeeds = useCallback(async () => {
    if (!user?.id) return;

    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Get user's subscribed feeds first
      const subscriptionsResponse = await apiService.getUserSubscriptions(user.id);
      const userFeedIds = subscriptionsResponse.items?.map(sub => sub.expand?.feed_id?.id || sub.feed_id) || [];
      
      if (userFeedIds.length === 0) {
        // No subscriptions, show empty state
        setData({
          feeds: [],
          categories: [],
          feedItems: [],
          loading: false,
          error: null,
        });
        return;
      }

      // Load user's feeds, categories, and recent feed items
      const feedsResponse = await apiService.getFeeds();
      const userFeeds = (feedsResponse.items || []).filter(feed => userFeedIds.includes(feed.id));
      
      const [categoriesResponse, itemsResponse] = await Promise.all([
        apiService.getCategories(),
        apiService.getFeedItems(undefined, 100, 1), // Get recent 100 items
      ]);

      const feeds = userFeeds.map(transformFeed);
      const categories = (categoriesResponse.items || []).map(transformCategory);
      const feedItems = (itemsResponse.items || []).map(transformFeedItem);

      // Calculate unread counts (for now, just use all items as unread)
      const feedUnreadCounts: Record<string, number> = {};
      feedItems.forEach(item => {
        if (!item.is_read) {
          feedUnreadCounts[item.feed_id] = (feedUnreadCounts[item.feed_id] || 0) + 1;
        }
      });

      // Update feeds with unread counts
      const feedsWithCounts = feeds.map(feed => ({
        ...feed,
        unread_count: feedUnreadCounts[feed.id] || 0,
      }));

      // Calculate category unread counts
      const categoryUnreadCounts: Record<string, number> = {};
      feedsWithCounts.forEach(feed => {
        if (feed.category) {
          categoryUnreadCounts[feed.category] = (categoryUnreadCounts[feed.category] || 0) + (feed.unread_count || 0);
        }
      });

      const categoriesWithCounts = categories.map(category => ({
        ...category,
        unread_count: categoryUnreadCounts[category.name] || 0,
      }));

      setData({
        feeds: feedsWithCounts,
        categories: categoriesWithCounts,
        feedItems,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to load feeds:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load feeds',
      }));
    }
  }, [user?.id]);

  const addFeed = useCallback(async (url: string, category?: string) => {
    if (!user?.id) return;

    try {
      // Create category if it doesn't exist and user provided one
      if (category && category.trim()) {
        const existingCategory = data.categories.find(cat => cat.name.toLowerCase() === category.toLowerCase());
        if (!existingCategory) {
          try {
            await apiService.createCategory({
              name: category.trim(),
              user_id: user.id,
              color: '#6366F1' // Default indigo color
            });
          } catch (categoryError) {
            console.warn('Failed to create category, but continuing with feed creation:', categoryError);
          }
        }
      }

      const feedData = {
        url,
        title: '', // Will be populated by the RSS fetcher
        category: category || '',
      };

      const newFeed = await apiService.createFeed(feedData);
      
      // Create subscription for the user
      await apiService.createSubscription({
        user_id: user.id,
        feed_id: newFeed.id,
      });

      // Reload feeds to get updated data
      await loadFeeds();
      
      return newFeed;
    } catch (error) {
      console.error('Failed to add feed:', error);
      throw error;
    }
  }, [user?.id, loadFeeds, data.categories]);

  const removeFeed = useCallback(async (feedId: string) => {
    if (!user?.id) return;

    try {
      // First remove subscription
      const subscriptions = await apiService.getUserSubscriptions(user.id);
      const subscription = subscriptions.items?.find(sub => sub.feed_id === feedId);
      if (subscription) {
        await apiService.deleteSubscription(subscription.id);
      }

      // Then remove feed if no other users are subscribed
      // For now, we'll just remove the subscription
      await loadFeeds();
    } catch (error) {
      console.error('Failed to remove feed:', error);
      throw error;
    }
  }, [user?.id, loadFeeds]);

  const refreshFeeds = useCallback(async () => {
    await loadFeeds();
  }, [loadFeeds]);

  // Load feeds when user changes or component mounts
  useEffect(() => {
    if (user) {
      loadFeeds();
    }
  }, [user, loadFeeds]);

  return {
    ...data,
    addFeed,
    removeFeed,
    refreshFeeds,
    reload: loadFeeds,
  };
};

export default useFeeds;