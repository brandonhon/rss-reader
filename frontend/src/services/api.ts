import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090';

interface ApiResponse<T> {
  items?: T[];
  data?: T;
  totalItems?: number;
  page?: number;
  perPage?: number;
}

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('pocketbase_auth');
    if (token) {
      try {
        const auth = JSON.parse(token);
        return {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        };
      } catch (e) {
        console.error('Failed to parse auth token:', e);
      }
    }
    return {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}/api${endpoint}`;
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Categories API
  async getCategories() {
    return this.request<ApiResponse<any>>('/collections/categories/records');
  }

  async createCategory(data: { name: string; user_id: string; color?: string }) {
    return this.request<any>('/collections/categories/records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Feeds API  
  async getFeeds() {
    return this.request<ApiResponse<any>>('/collections/feeds/records');
  }

  async createFeed(data: { url: string; title?: string; category?: string; user_id: string }) {
    return this.request<any>('/collections/feeds/records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFeed(id: string, data: any) {
    return this.request<any>(`/collections/feeds/records/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteFeed(id: string) {
    return this.request<any>(`/collections/feeds/records/${id}`, {
      method: 'DELETE',
    });
  }

  // Subscriptions API
  async getUserSubscriptions(userId: string) {
    return this.request<ApiResponse<any>>(`/collections/subscriptions/records?filter=user_id="${userId}"`);
  }

  async createSubscription(data: { user_id: string; feed_id: string }) {
    return this.request<any>('/collections/subscriptions/records', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        subscribed_at: new Date().toISOString(),
      }),
    });
  }

  async deleteSubscription(id: string) {
    return this.request<any>(`/collections/subscriptions/records/${id}`, {
      method: 'DELETE',
    });
  }

  // Feed Items API
  async getFeedItems(feedId?: string, limit: number = 50, page: number = 1) {
    let endpoint = `/collections/feed_items/records?sort=-published_date&perPage=${limit}&page=${page}`;
    if (feedId) {
      endpoint += `&filter=feed_id="${feedId}"`;
    }
    return this.request<ApiResponse<any>>(endpoint);
  }

  async markItemAsRead(itemId: string, userId: string) {
    // This might need to be implemented based on your data model
    // For now, we'll just log it
    console.log('Marking item as read:', itemId, 'for user:', userId);
  }

  async markItemAsUnread(itemId: string, userId: string) {
    // This might need to be implemented based on your data model
    // For now, we'll just log it
    console.log('Marking item as unread:', itemId, 'for user:', userId);
  }

  // Search API
  async searchFeedItems(query: string, limit: number = 50) {
    const searchFilter = `title~"${query}" || description~"${query}" || content~"${query}"`;
    return this.request<ApiResponse<any>>(`/collections/feed_items/records?filter=${encodeURIComponent(searchFilter)}&sort=-published_date&perPage=${limit}`);
  }
}

export const apiService = new ApiService();
export default apiService;