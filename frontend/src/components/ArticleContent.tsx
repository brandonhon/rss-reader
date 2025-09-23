import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  ExternalLink, 
  User, 
  Calendar, 
  Rss,
  Star,
  Share,
  Bookmark,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { mockFeeds } from '../data/mockData';

export const ArticleContent: React.FC = () => {
  const { state, markItemAsRead, markItemAsUnread } = useApp();
  const { selectedItem } = state;

  if (!selectedItem) {
    return (
      <div className="h-full bg-white dark:bg-gray-900 flex items-center justify-center transition-theme">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Rss className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No article selected</h3>
          <p className="text-sm">
            Select an article from the list to read it here
          </p>
        </div>
      </div>
    );
  }

  const feed = mockFeeds.find(f => f.id === selectedItem.feed_id);
  const publishedDate = selectedItem.published ? new Date(selectedItem.published) : new Date(selectedItem.created_at);
  const isRead = selectedItem.is_read;

  const handleToggleRead = () => {
    if (isRead) {
      markItemAsUnread(selectedItem.id);
    } else {
      markItemAsRead(selectedItem.id);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedItem.title,
        url: selectedItem.link,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(selectedItem.link);
      // In a real app, you'd show a toast notification here
      console.log('Link copied to clipboard');
    }
  };

  const handleBookmark = () => {
    // In a real app, this would add to favorites
    console.log('Article bookmarked');
  };

  // Generate sample article content since we don't have full content in our mock data
  const generateArticleContent = () => {
    const paragraphs = [
      selectedItem.summary || "This is the main content of the article. In a real RSS reader application, this would contain the full article content fetched from the RSS feed or scraped from the original website.",
      
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo."
    ];

    return paragraphs;
  };

  const articleParagraphs = generateArticleContent();

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col transition-theme">
      {/* Article Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            {/* Feed Info */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              {feed?.favicon ? (
                <img 
                  src={feed.favicon} 
                  alt="" 
                  className="w-4 h-4 rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <Rss className="w-4 h-4" />
              )}
              <span className="font-medium">
                {feed?.title || 'Unknown Feed'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleToggleRead}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isRead
                  ? 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  : 'text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
              title={isRead ? 'Mark as unread' : 'Mark as read'}
            >
              {isRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            <button
              onClick={handleBookmark}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200"
              title="Bookmark article"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200"
              title="Share article"
            >
              <Share className="w-4 h-4" />
            </button>

            <a
              href={selectedItem.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200"
              title="Open original article"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Article Meta */}
        <div className="p-6 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
            {selectedItem.title}
          </h1>

          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center space-x-4">
              {selectedItem.author && (
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{selectedItem.author}</span>
                </div>
              )}

              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span title={publishedDate.toLocaleString()}>
                  {format(publishedDate, 'MMM d, yyyy')} • {formatDistanceToNow(publishedDate, { addSuffix: true })}
                </span>
              </div>
            </div>

            {!isRead && (
              <div className="flex items-center space-x-1 text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs font-medium">UNREAD</span>
              </div>
            )}
          </div>

          {/* Featured Image */}
          {selectedItem.image_url && (
            <div className="mb-6">
              <img
                src={selectedItem.image_url}
                alt=""
                className="w-full max-h-96 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Article Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-6 pt-2">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            {articleParagraphs.map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                {paragraph}
              </p>
            ))}

            {/* Sample list content */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
              Key Points
            </h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Modern RSS readers provide excellent user experiences</li>
              <li>Three-panel layouts optimize content consumption</li>
              <li>Dark mode support is essential for user comfort</li>
              <li>Keyboard navigation improves efficiency</li>
              <li>Responsive design ensures cross-device compatibility</li>
            </ul>

            {/* Sample blockquote */}
            <blockquote className="border-l-4 border-indigo-500 pl-4 py-2 my-6 bg-gray-50 dark:bg-gray-800 italic text-gray-700 dark:text-gray-300">
              "The best RSS reader is one that gets out of your way and lets you focus on the content that matters most to you."
            </blockquote>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              In conclusion, a well-designed RSS reader combines functionality with aesthetics to create an optimal reading experience. The integration with backend services like PocketBase ensures reliable data management and synchronization across devices.
            </p>
          </div>

          {/* Article Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <a
                  href={selectedItem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                >
                  Read original article ↗
                </a>
              </div>

              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm text-gray-600 dark:text-gray-400 transition-all duration-200">
                  <Star className="w-3 h-3" />
                  <span>Add to favorites</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};