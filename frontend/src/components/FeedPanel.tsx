import React, { useState } from 'react';
import { 
  ChevronDownIcon, 
  ChevronRightIcon, 
  RssIcon, 
  ExclamationCircleIcon,
  FolderIcon,
  FolderOpenIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../contexts/AppContext';
import { mockCategories, mockFeeds, getFeedsByCategory } from '../data/mockData';
import { Feed, Category } from '../types';

interface FeedItemProps {
  feed: Feed;
  isSelected: boolean;
  onClick: () => void;
}

const FeedItem: React.FC<FeedItemProps> = ({ feed, isSelected, onClick }) => {
  const isError = feed.fetch_status === 'failed';
  
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2 mx-1 rounded-lg cursor-pointer transition-all duration-200 group ${
        isSelected
          ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
      }`}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          {feed.favicon ? (
            <img
              src={feed.favicon}
              alt=""
              className="w-4 h-4 rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <RssIcon className="w-4 h-4 text-gray-400" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium truncate">
              {feed.title || feed.url}
            </span>
            {isError && (
              <ExclamationCircleIcon className="w-3 h-3 text-red-500 flex-shrink-0" title={feed.error_message} />
            )}
          </div>
        </div>
        
        {feed.unread_count && feed.unread_count > 0 && (
          <div className="flex-shrink-0">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300">
              {feed.unread_count}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

interface CategorySectionProps {
  category: Category;
  isExpanded: boolean;
  onToggle: () => void;
  selectedFeed: Feed | null;
  onFeedSelect: (feed: Feed) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  isExpanded,
  onToggle,
  selectedFeed,
  onFeedSelect,
}) => {
  const feeds = getFeedsByCategory(category.name);
  
  return (
    <div className="mb-2">
      <div
        onClick={onToggle}
        className="flex items-center justify-between px-3 py-2 mx-1 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
      >
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0">
            {isExpanded ? (
              <FolderOpenIcon className="w-4 h-4 text-gray-500" />
            ) : (
              <FolderIcon className="w-4 h-4 text-gray-500" />
            )}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {category.name}
          </span>
          {category.unread_count && category.unread_count > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300">
              {category.unread_count}
            </span>
          )}
        </div>
        
        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronDownIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200" />
          ) : (
            <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="ml-4 space-y-1 animate-fade-in">
          {feeds.map((feed) => (
            <FeedItem
              key={feed.id}
              feed={feed}
              isSelected={selectedFeed?.id === feed.id}
              onClick={() => onFeedSelect(feed)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FeedPanel: React.FC = () => {
  const { state, selectFeed } = useApp();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Technology', 'Design']) // Start with some categories expanded
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleFeedSelect = (feed: Feed) => {
    selectFeed(feed);
  };

  // All Feeds section
  const allFeedsUnreadCount = mockFeeds.reduce((total, feed) => total + (feed.unread_count || 0), 0);

  return (
    <div className="h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-theme">
      {/* Panel Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Feeds
        </h2>
      </div>
      
      {/* Feeds List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {/* All Feeds */}
        <div className="mb-4">
          <div
            onClick={() => selectFeed(null)}
            className={`flex items-center justify-between px-3 py-2 mx-1 rounded-lg cursor-pointer transition-all duration-200 ${
              !state.selectedFeed && !state.selectedCategory
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <RssIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">All Feeds</span>
            </div>
            {allFeedsUnreadCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300">
                {allFeedsUnreadCount}
              </span>
            )}
          </div>
        </div>

        <div className="h-px bg-gray-200 dark:bg-gray-700 mx-1 mb-4" />

        {/* Categories */}
        <div className="space-y-1">
          {mockCategories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              isExpanded={expandedCategories.has(category.name)}
              onToggle={() => toggleCategory(category.name)}
              selectedFeed={state.selectedFeed}
              onFeedSelect={handleFeedSelect}
            />
          ))}
        </div>

        {/* Uncategorized Feeds */}
        {mockFeeds.filter(feed => !feed.category).length > 0 && (
          <div className="mt-4">
            <div className="px-3 py-2 mx-1">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Uncategorized
              </span>
            </div>
            <div className="space-y-1">
              {mockFeeds
                .filter(feed => !feed.category)
                .map((feed) => (
                  <FeedItem
                    key={feed.id}
                    feed={feed}
                    isSelected={state.selectedFeed?.id === feed.id}
                    onClick={() => handleFeedSelect(feed)}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Panel Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {mockFeeds.length} feeds • {allFeedsUnreadCount} unread
        </div>
      </div>
    </div>
  );
};