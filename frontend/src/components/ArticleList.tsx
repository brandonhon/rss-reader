import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  EllipsisHorizontalCircleIcon, 
  CheckCircleIcon, 
  ArrowTopRightOnSquareIcon, 
  UserIcon, 
  CalendarIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../contexts/AppContext';
import { FeedItem } from '../types';
import { 
  mockFeedItems, 
  getItemsByFeed, 
  getAllItems, 
  searchItems,
  mockFeeds 
} from '../data/mockData';

interface ArticleItemProps {
  item: FeedItem;
  isSelected: boolean;
  onClick: () => void;
  onToggleRead: (e: React.MouseEvent) => void;
}

const ArticleItem: React.FC<ArticleItemProps> = ({ 
  item, 
  isSelected, 
  onClick, 
  onToggleRead 
}) => {
  const feed = mockFeeds.find(f => f.id === item.feed_id);
  const publishedDate = item.published ? new Date(item.published) : new Date(item.created_at);
  const isRead = item.is_read;

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
        isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : ''
      } ${
        !isRead ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-transparent'
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Read/Unread Toggle */}
        <button
          onClick={onToggleRead}
          className="mt-1 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          title={isRead ? 'Mark as unread' : 'Mark as read'}
        >
          {isRead ? (
            <CheckCircleIcon className="w-4 h-4 text-gray-400" />
          ) : (
            <EllipsisHorizontalCircleIcon className="w-4 h-4 text-red-500" />
          )}
        </button>

        {/* Article Content */}
        <div className="flex-1 min-w-0">
          {/* Article Title */}
          <h3 className={`text-sm font-medium mb-2 line-clamp-2 leading-relaxed ${
            isRead 
              ? 'text-gray-600 dark:text-gray-400' 
              : 'text-gray-900 dark:text-gray-100'
          }`}>
            {item.title}
          </h3>

          {/* Article Summary */}
          {item.summary && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-3 leading-relaxed">
              {item.summary}
            </p>
          )}

          {/* Article Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              {/* Feed Info */}
              <div className="flex items-center space-x-1">
                {feed?.favicon ? (
                  <img 
                    src={feed.favicon} 
                    alt="" 
                    className="w-3 h-3 rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded" />
                )}
                <span className="truncate max-w-24">
                  {feed?.title || 'Unknown Feed'}
                </span>
              </div>

              {/* Author */}
              {item.author && (
                <div className="flex items-center space-x-1">
                  <UserIcon className="w-3 h-3" />
                  <span className="truncate max-w-20">{item.author}</span>
                </div>
              )}

              {/* Has Image Indicator */}
              {item.image_url && (
                <PhotoIcon className="w-3 h-3 text-blue-500" title="Has image" />
              )}
            </div>

            {/* Published Date */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              <CalendarIcon className="w-3 h-3" />
              <span title={publishedDate.toLocaleString()}>
                {formatDistanceToNow(publishedDate, { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        {/* External Link */}
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-1 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          title="Open in new tab"
        >
          <ArrowTopRightOnSquareIcon className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export const ArticleList: React.FC = () => {
  const { state, selectItem, markItemAsRead, markItemAsUnread } = useApp();

  // Get articles based on current selection and filters
  const getFilteredArticles = (): FeedItem[] => {
    let articles: FeedItem[] = [];

    // Get base articles
    if (state.selectedFeed) {
      articles = getItemsByFeed(state.selectedFeed.id);
    } else if (state.selectedCategory) {
      // Get all articles from feeds in the selected category
      const categoryFeeds = mockFeeds.filter(feed => feed.category === state.selectedCategory?.name);
      articles = mockFeedItems.filter(item => 
        categoryFeeds.some(feed => feed.id === item.feed_id)
      );
    } else {
      articles = getAllItems();
    }

    // Apply search filter
    if (state.searchQuery) {
      const searchLower = state.searchQuery.toLowerCase();
      articles = articles.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        (item.summary && item.summary.toLowerCase().includes(searchLower)) ||
        (item.author && item.author.toLowerCase().includes(searchLower))
      );
    }

    // Apply unread filter
    if (state.showUnreadOnly) {
      articles = articles.filter(item => !item.is_read);
    }

    // Apply sort order
    articles.sort((a, b) => {
      const aDate = new Date(a.published || a.created_at).getTime();
      const bDate = new Date(b.published || b.created_at).getTime();
      return state.sortOrder === 'newest' ? bDate - aDate : aDate - bDate;
    });

    return articles;
  };

  const filteredArticles = getFilteredArticles();

  const handleItemClick = (item: FeedItem) => {
    selectItem(item);
    // Auto-mark as read when selected (optional behavior)
    if (!item.is_read) {
      markItemAsRead(item.id);
    }
  };

  const handleToggleRead = (e: React.MouseEvent, item: FeedItem) => {
    e.stopPropagation();
    if (item.is_read) {
      markItemAsUnread(item.id);
    } else {
      markItemAsRead(item.id);
    }
  };

  const getHeaderTitle = (): string => {
    if (state.selectedFeed) {
      return state.selectedFeed.title || state.selectedFeed.url;
    } else if (state.selectedCategory) {
      return state.selectedCategory.name;
    } else {
      return 'All Articles';
    }
  };

  const unreadCount = filteredArticles.filter(item => !item.is_read).length;

  return (
    <div className="h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-theme">
      {/* Panel Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            {getHeaderTitle()}
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300">
                {unreadCount} unread
              </span>
            )}
            <span>
              {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Search/Filter Info */}
        {state.searchQuery && (
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Searching for: "<span className="font-medium">{state.searchQuery}</span>"
          </div>
        )}
      </div>

      {/* Articles List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredArticles.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <EllipsisHorizontalCircleIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No articles found</p>
              <p className="text-sm">
                {state.searchQuery 
                  ? 'Try adjusting your search query'
                  : state.showUnreadOnly 
                    ? 'No unread articles in this feed'
                    : 'This feed appears to be empty'
                }
              </p>
            </div>
          </div>
        ) : (
          <div>
            {filteredArticles.map((item) => (
              <ArticleItem
                key={item.id}
                item={item}
                isSelected={state.selectedItem?.id === item.id}
                onClick={() => handleItemClick(item)}
                onToggleRead={(e) => handleToggleRead(e, item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Panel Footer */}
      {filteredArticles.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {state.sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
            {state.showUnreadOnly && ' • Unread only'}
          </div>
        </div>
      )}
    </div>
  );
};