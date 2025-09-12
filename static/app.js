// RSS Reader - Modern Fluent Design
// Global state
let currentFilter = 'all';
let selectedCategory = null;
let selectedArticle = null;
let articles = [];
let categories = [];

// Theme management
class ThemeManager {
    constructor() {
        this.init();
    }
    
    init() {
        // Get saved theme or use system preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? 'dark' : 'light');
        }
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
    
    setTheme(theme) {
        document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
        localStorage.setItem('theme', theme);
        this.updateToggleIcon(theme);
    }
    
    toggle() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
    
    updateToggleIcon(theme) {
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
            toggle.title = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
        }
    }
}

// Article management
class ArticleManager {
    constructor() {
        this.articles = [];
        this.filteredArticles = [];
    }
    
    async loadArticles(filter = 'all', categoryId = null) {
        try {
            let url = '/user-feeds';
            const params = new URLSearchParams();
            
            // Don't apply server-side filters, we'll do client-side filtering
            if (categoryId) params.append('category', categoryId);
            
            if (params.toString()) url += '?' + params.toString();
            
            const response = await fetch(url);
            this.articles = await response.json();
            
            // Store current filter for applyFilters
            currentFilter = filter;
            
            // Apply all filters (search, read status, starred, etc.)
            this.applyFilters();
        } catch (error) {
            console.error('Failed to load articles:', error);
            this.showError('Failed to load articles');
        }
    }
    
    render() {
        const container = document.getElementById('articles-list');
        
        if (this.filteredArticles.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No articles found</h3>
                    <p>Try adding some RSS feeds or adjusting your filters</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.filteredArticles.map(article => this.renderArticleItem(article)).join('');
        
        // Add click listeners
        container.querySelectorAll('.article-item').forEach(item => {
            item.addEventListener('click', () => {
                const articleId = item.dataset.id;
                this.selectArticle(articleId);
            });
        });
    }
    
    renderArticleItem(article) {
        const publishedDate = new Date(article.Published);
        const timeAgo = this.formatTimeAgo(publishedDate);
        const readClass = article.Read ? 'read' : '';
        const selectedClass = selectedArticle?.ID == article.ID ? 'selected' : '';
        
        // Get favicon URL, fallback to a default icon if not available
        const faviconURL = article.FaviconURL || '/static/default-favicon.svg';
        
        // Create a simple excerpt from the first part of the content
        let excerpt = '';
        if (article.Content) {
            const div = document.createElement('div');
            div.innerHTML = article.Content;
            const textContent = div.textContent || div.innerText || '';
            excerpt = textContent.substring(0, 140) + (textContent.length > 140 ? '...' : '');
        }
        
        return `
            <div class="article-item ${readClass} ${selectedClass}" data-id="${article.ID}">
                <div class="article-meta">
                    <img class="article-favicon" src="${faviconURL}" alt="Site icon" onerror="this.src='/static/default-favicon.svg'">
                    <span class="article-feed">${article.feed_title || 'RSS Feed'}</span>
                    <span class="article-date">${timeAgo}</span>
                </div>
                <h3 class="article-title">${this.escapeHtml(article.Title)}</h3>
                ${excerpt ? `<p class="article-summary">${this.escapeHtml(excerpt)}</p>` : ''}
                <div class="article-actions">
                    <button class="article-action ${article.Starred ? 'starred' : ''}" onclick="event.stopPropagation(); articleManager.toggleStar(${article.ID})" title="${article.Starred ? 'Unstar' : 'Star'} article">
                        ${article.Starred ? '★' : '☆'}
                    </button>
                </div>
            </div>
        `;
    }
    
    async selectArticle(articleId) {
        const article = this.articles.find(a => a.ID == articleId);
        if (!article) return;
        
        selectedArticle = article;
        
        // Update active state
        document.querySelectorAll('.article-item').forEach(item => {
            item.classList.toggle('active', item.dataset.id == articleId);
        });
        
        // Mark as read if not already
        if (!article.Read) {
            await this.markAsRead(articleId);
            article.Read = true;
            const item = document.querySelector(`[data-id="${articleId}"]`);
            if (item) item.classList.add('read');
        }
        
        // Show article content
        this.showArticleContent(article);
    }
    
    async showArticleContent(article) {
        const readingPanel = document.querySelector('.reading-panel .reading-content');
        
        // Show loading state with new CSS structure
        readingPanel.innerHTML = `
            <div class="article-header">
                <h1 class="article-title">${this.escapeHtml(article.Title)}</h1>
                <div class="article-meta">
                    <img class="article-favicon" src="${article.FaviconURL || '/static/default-favicon.svg'}" alt="Site icon" onerror="this.src='/static/default-favicon.svg'">
                    <span class="article-feed">${article.feed_title || 'RSS Feed'}</span>
                    <span class="article-date">${this.formatDate(new Date(article.Published))}</span>
                </div>
            </div>
            <div class="article-body">
                <div class="loading">Loading article content...</div>
            </div>
        `;
        
        try {
            // Fetch full article data including sanitized content
            const response = await fetch(`/article?id=${article.ID}`);
            if (response.ok) {
                const fullArticle = await response.json();
                
                // Display the sanitized article content
                const content = fullArticle.Content || 'No content available for this article.';
                readingPanel.innerHTML = `
                    <div class="reading-header">
                        <h1 class="reading-title">${this.escapeHtml(fullArticle.Title)}</h1>
                        <div class="reading-meta">
                            <span>Published ${this.formatDate(new Date(fullArticle.Published))}</span>
                            <a href="${fullArticle.Link}" target="_blank" style="color: var(--accent-primary)">View Original</a>
                        </div>
                    </div>
                    <div class="article-body">
                        ${content}
                    </div>
                `;
            } else {
                throw new Error('Failed to load article content');
            }
        } catch (error) {
            console.error('Error loading article content:', error);
            readingPanel.innerHTML = `
                <div class="reading-header">
                    <h1 class="reading-title">${this.escapeHtml(article.Title)}</h1>
                    <div class="reading-meta">
                        <span>Published ${this.formatDate(new Date(article.Published))}</span>
                        <a href="${article.Link}" target="_blank" style="color: var(--accent-primary)">View Original</a>
                    </div>
                </div>
                <div class="article-body">
                    <div class="error">Failed to load article content. <a href="${article.Link}" target="_blank">Read the original article</a></div>
                </div>
            `;
        }
    }
    
    async markAsRead(articleId) {
        try {
            await fetch('/mark-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `id=${articleId}`
            });
        } catch (error) {
            console.error('Failed to mark article as read:', error);
        }
    }
    
    async toggleStar(articleId) {
        const article = this.articles.find(a => a.ID == articleId);
        if (!article) return;
        
        const newStarredState = !article.Starred;
        
        try {
            const response = await fetch('/star-article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `id=${articleId}&starred=${newStarredState}`
            });
            
            if (response.ok) {
                // Update local state
                article.Starred = newStarredState;
                
                // Update the UI immediately
                const articleElement = document.querySelector(`[data-id="${articleId}"]`);
                if (articleElement) {
                    const starButton = articleElement.querySelector('.star-button');
                    const starredClass = newStarredState ? 'starred' : '';
                    
                    articleElement.className = articleElement.className.replace(/\bstarred\b/g, '').trim() + (newStarredState ? ' starred' : '');
                    starButton.innerHTML = newStarredState ? '⭐' : '☆';
                    starButton.title = newStarredState ? 'Unstar article' : 'Star article';
                }
            } else {
                console.error('Failed to star article');
            }
        } catch (error) {
            console.error('Failed to toggle star:', error);
        }
    }
    
    formatTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }
    
    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showError(message) {
        const container = document.getElementById('articles-list');
        container.innerHTML = `
            <div class="empty-state">
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }
}

// Category management
class CategoryManager {
    constructor() {
        this.categories = [];
    }
    
    async loadCategories() {
        try {
            const response = await fetch('/categories');
            this.categories = await response.json();
            this.render();
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }
    
    render() {
        const container = document.getElementById('category-list');
        
        if (this.categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No categories yet</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.categories.map(category => {
            const activeClass = selectedCategory?.ID === category.ID ? 'active' : '';
            const unreadCount = category.unread_count || 0;
            const countDisplay = unreadCount > 0 ? unreadCount : '';
            const countClass = unreadCount > 0 ? 'has-unread' : '';
            
            return `
                <div class="category-item ${activeClass}" data-id="${category.ID}">
                    <span class="category-name">${this.escapeHtml(category.Name)}</span>
                    <span class="unread-count ${countClass}">${countDisplay}</span>
                </div>
            `;
        }).join('');
        
        // Add click listeners
        container.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                const categoryId = parseInt(item.dataset.id);
                this.selectCategory(categoryId);
            });
        });
    }
    
    selectCategory(categoryId) {
        const category = this.categories.find(c => c.ID === categoryId);
        if (!category) return;
        
        selectedCategory = category;
        
        // Update active state
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.toggle('active', parseInt(item.dataset.id) === categoryId);
        });
        
        // Update articles title
        document.getElementById('articles-title').textContent = category.Name;
        document.getElementById('articles-subtitle').textContent = `Articles in ${category.Name}`;
        
        // Load articles for this category
        articleManager.loadArticles(currentFilter, categoryId);
    }
    
    clearSelection() {
        selectedCategory = null;
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        // Title is now set by the calling function, not here
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Feed management
class FeedManager {
    async showModal() {
        document.getElementById('manage-feeds-modal').classList.remove('hidden');
        await this.loadCurrentFeeds();
    }
    
    hideModal() {
        document.getElementById('manage-feeds-modal').classList.add('hidden');
    }
    
    async addFeed(url, category) {
        try {
            const response = await fetch('/add-feed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `url=${encodeURIComponent(url)}&category=${encodeURIComponent(category)}`
            });
            
            if (response.ok) {
                const result = await response.json();
                this.showSuccess('Feed added successfully!');
                await this.loadCurrentFeeds();
                await categoryManager.loadCategories();
                return true;
            } else {
                const error = await response.text();
                this.showError(error);
                return false;
            }
        } catch (error) {
            console.error('Failed to add feed:', error);
            this.showError('Failed to add feed');
            return false;
        }
    }
    
    async loadCurrentFeeds() {
        try {
            const response = await fetch('/list-feeds');
            const categories = await response.json();
            this.renderCurrentFeeds(categories);
        } catch (error) {
            console.error('Failed to load feeds:', error);
        }
    }
    
    renderCurrentFeeds(categories) {
        const container = document.getElementById('feeds-list');
        
        if (categories.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No feeds added yet</p></div>';
            return;
        }
        
        container.innerHTML = categories.map(category => {
            if (!category.Feeds || category.Feeds.length === 0) return '';
            
            return `
                <div class="category-section">
                    <h4 style="margin: var(--space-lg) 0; color: var(--text-secondary); font-weight: 600;">${category.Name}</h4>
                    ${category.Feeds.map(feed => `
                        <div class="feed-item-management">
                            <div class="feed-info">
                                <h5 class="feed-title">${this.escapeHtml(feed.Title)}</h5>
                                <p class="feed-url">${this.escapeHtml(feed.URL)}</p>
                            </div>
                            <div class="feed-actions">
                                <button class="icon-button danger" onclick="feedManager.deleteFeed(${feed.ID})" title="Delete feed">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }).join('');
    }
    
    async deleteFeed(feedId) {
        if (!confirm('Are you sure you want to delete this feed?')) return;
        
        try {
            const response = await fetch(`/delete-feed?id=${feedId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.showSuccess('Feed deleted successfully!');
                await this.loadCurrentFeeds();
                await categoryManager.loadCategories();
                await articleManager.loadArticles(currentFilter, selectedCategory?.ID);
            } else {
                const error = await response.text();
                this.showError(error);
            }
        } catch (error) {
            console.error('Failed to delete feed:', error);
            this.showError('Failed to delete feed');
        }
    }
    
    async importOPML(file) {
        const formData = new FormData();
        formData.append('opml', file);
        
        try {
            const response = await fetch('/import-opml', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                let message = `Successfully imported ${result.imported} out of ${result.total} feeds.`;
                
                if (result.failed && result.failed.length > 0) {
                    message += `\n\nFailed to import:\n${result.failed.join('\n')}`;
                }
                
                alert(message);
                
                // Refresh the feeds list and categories
                await this.loadCurrentFeeds();
                await categoryManager.loadCategories();
                await articleManager.loadArticles(currentFilter, selectedCategory?.ID);
                
                return true;
            } else {
                const error = await response.text();
                this.showError('Import failed: ' + error);
                return false;
            }
        } catch (error) {
            console.error('Failed to import OPML:', error);
            this.showError('Failed to import OPML: ' + error.message);
            return false;
        }
    }
    
    async exportOPML() {
        try {
            const response = await fetch('/export-opml');
            
            if (response.ok) {
                // Create download link
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'feeds.opml';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                this.showSuccess('OPML exported successfully');
            } else {
                const error = await response.text();
                this.showError('Export failed: ' + error);
            }
        } catch (error) {
            console.error('Failed to export OPML:', error);
            this.showError('Failed to export OPML: ' + error.message);
        }
    }
    
    showSuccess(message) {
        // Simple success feedback - could be improved with a toast system
        console.log('Success:', message);
    }
    
    showError(message) {
        // Simple error feedback - could be improved with a toast system
        console.error('Error:', message);
        alert(message); // Temporary simple error display
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global instances
const themeManager = new ThemeManager();
const articleManager = new ArticleManager();
const categoryManager = new CategoryManager();
const feedManager = new FeedManager();

// Global functions for HTML onclick handlers
function filterAll() {
    currentFilter = 'all';
    updateFilterButtons('all');
    categoryManager.clearSelection();
    updatePanelTitle('All Articles', 'Latest articles from your feeds');
    articleManager.loadArticles('all');
}

function filterFresh() {
    currentFilter = 'fresh';
    updateFilterButtons('fresh');
    categoryManager.clearSelection();
    updatePanelTitle('Fresh Articles', 'Unread articles from your feeds');
    articleManager.loadArticles('fresh');
}

function filterStarred() {
    currentFilter = 'starred';
    updateFilterButtons('starred');
    categoryManager.clearSelection();
    updatePanelTitle('Starred Articles', 'Your starred articles');
    articleManager.loadArticles('starred');
}

function updatePanelTitle(title, subtitle) {
    document.getElementById('articles-title').textContent = title;
    document.getElementById('articles-subtitle').textContent = subtitle;
}

function updateFilterButtons(activeFilter) {
    document.querySelectorAll('.nav-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.getElementById(`${activeFilter}-articles`) || 
                     document.querySelector('.nav-button[onclick*="' + activeFilter + '"]');
    if (activeBtn) activeBtn.classList.add('active');
    
    // Update toolbar buttons
    document.querySelectorAll('.toolbar-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === activeFilter);
    });
}

function openManageFeeds() {
    feedManager.showModal();
    toggleUserMenu(); // Close user menu if open
}

function closeManageFeeds() {
    feedManager.hideModal();
}

function toggleUserMenu() {
    const menu = document.getElementById('user-menu');
    menu.classList.toggle('hidden');
}

async function markAllRead() {
    try {
        let requestBody = '';
        
        if (selectedCategory) {
            // Mark all read in selected category
            requestBody = `category=${selectedCategory.ID}`;
        } else {
            // Mark all read based on current filter
            if (currentFilter === 'fresh') {
                // For fresh filter, mark all unread articles as read
                requestBody = 'filter=fresh';
            } else if (currentFilter === 'starred') {
                // For starred filter, we don't want to mark starred as read
                // Instead, just refresh to update counts
                await articleManager.loadArticles(currentFilter, selectedCategory?.ID);
                await categoryManager.loadCategories();
                return;
            } else {
                // For 'all' filter, mark everything as read
                requestBody = '';
            }
        }
        
        await fetch('/mark-all-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: requestBody
        });
        
        // Refresh articles and categories to update counts
        await articleManager.loadArticles(currentFilter, selectedCategory?.ID);
        await categoryManager.loadCategories();
    } catch (error) {
        console.error('Failed to mark all as read:', error);
    }
}

function logout() {
    window.location.href = '/logout';
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    // Theme toggle handler
    document.getElementById('theme-toggle').addEventListener('click', () => {
        themeManager.toggle();
    });
    
    // Toolbar filter handlers
    document.querySelectorAll('.toolbar-button').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            if (filter === 'all') filterAll();
            else if (filter === 'unread') filterFresh();
            else if (filter === 'starred') filterStarred();
        });
    });
    
    // Add feed form handler
    document.getElementById('add-feed-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = document.getElementById('feed-url').value.trim();
        const category = document.getElementById('category').value.trim();
        
        if (!url || !category) {
            alert('Please fill in both URL and category');
            return;
        }
        
        const success = await feedManager.addFeed(url, category);
        if (success) {
            document.getElementById('feed-url').value = '';
            document.getElementById('category').value = '';
        }
    });
    
    // OPML import handler
    document.getElementById('import-opml-btn').addEventListener('click', async () => {
        const fileInput = document.getElementById('opml-file');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('Please select an OPML file to import');
            return;
        }
        
        if (!file.name.toLowerCase().endsWith('.opml') && !file.name.toLowerCase().endsWith('.xml')) {
            alert('Please select a valid OPML file (.opml or .xml)');
            return;
        }
        
        const success = await feedManager.importOPML(file);
        if (success) {
            fileInput.value = ''; // Clear file input
        }
    });
    
    // OPML export handler  
    document.getElementById('export-opml-btn').addEventListener('click', () => {
        feedManager.exportOPML();
    });
    
    // Close modal when clicking outside
    document.getElementById('manage-feeds-modal').addEventListener('click', (e) => {
        if (e.target.id === 'manage-feeds-modal') {
            closeManageFeeds();
        }
    });
    
    // Close user menu when clicking outside
    document.addEventListener('click', (e) => {
        const userMenu = document.getElementById('user-menu');
        const userButton = document.querySelector('.user-button');
        
        if (!userButton.contains(e.target) && !userMenu.contains(e.target)) {
            userMenu.classList.add('hidden');
        }
    });
    
    // Initialize panel resizing
    initPanelResizing();
    
    // Load initial data
    await categoryManager.loadCategories();
    await articleManager.loadArticles();
});

// Panel resizing functionality
function initPanelResizing() {
    const sidebarHandle = document.getElementById('sidebar-resize-handle');
    const articlesHandle = document.getElementById('articles-resize-handle');
    const sidebar = document.querySelector('.sidebar');
    const articlesPanel = document.querySelector('.articles-panel');
    
    let isResizing = false;
    let currentHandle = null;
    let startX = 0;
    let startWidth = 0;
    
    function startResize(e, handle, panel) {
        isResizing = true;
        currentHandle = handle;
        startX = e.clientX;
        startWidth = panel.offsetWidth;
        
        document.body.classList.add('resizing');
        
        e.preventDefault();
    }
    
    function resize(e) {
        if (!isResizing || !currentHandle) return;
        
        const deltaX = e.clientX - startX;
        let newWidth;
        
        if (currentHandle === sidebarHandle) {
            newWidth = Math.max(200, Math.min(500, startWidth + deltaX));
            sidebar.style.width = newWidth + 'px';
        } else if (currentHandle === articlesHandle) {
            newWidth = Math.max(280, Math.min(600, startWidth + deltaX));
            articlesPanel.style.width = newWidth + 'px';
        }
        
        // Store the widths in localStorage for persistence
        localStorage.setItem('sidebar-width', sidebar.style.width);
        localStorage.setItem('articles-width', articlesPanel.style.width);
    }
    
    function stopResize() {
        if (!isResizing) return;
        
        isResizing = false;
        currentHandle = null;
        document.body.classList.remove('resizing');
    }
    
    // Load saved widths
    const savedSidebarWidth = localStorage.getItem('sidebar-width');
    const savedArticlesWidth = localStorage.getItem('articles-width');
    
    if (savedSidebarWidth) {
        sidebar.style.width = savedSidebarWidth;
    }
    if (savedArticlesWidth) {
        articlesPanel.style.width = savedArticlesWidth;
    }
    
    // Event listeners
    sidebarHandle.addEventListener('mousedown', (e) => startResize(e, sidebarHandle, sidebar));
    articlesHandle.addEventListener('mousedown', (e) => startResize(e, articlesHandle, articlesPanel));
    
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
    
    // Prevent text selection during resize
    document.addEventListener('selectstart', (e) => {
        if (isResizing) e.preventDefault();
    });
}

// Search functionality
let searchTerm = '';

function searchArticles(term) {
    searchTerm = term.toLowerCase();
    if (articleManager) {
        articleManager.applyFilters();
    }
}

// Update the ArticleManager to handle search
ArticleManager.prototype.applyFilters = function() {
    let filtered = this.articles;
    
    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(article => 
            article.Title.toLowerCase().includes(searchTerm) || 
            (article.Content && article.Content.toLowerCase().includes(searchTerm)) ||
            (article.feed_title && article.feed_title.toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply current filter (all/unread/starred)
    switch (currentFilter) {
        case 'fresh':
            filtered = filtered.filter(article => !article.Read);
            break;
        case 'starred':
            filtered = filtered.filter(article => article.Starred);
            break;
    }
    
    // Apply category filter
    if (selectedCategory) {
        // This would need category-based filtering logic
    }
    
    this.filteredArticles = filtered;
    this.render();
};

// Preferences modal functions
function openPreferences() {
    const modal = document.getElementById('preferences-modal');
    modal.classList.remove('hidden');
    updateThemeButtons();
    
    // Close user menu
    const userMenu = document.getElementById('user-menu');
    userMenu.classList.add('hidden');
}

function closePreferences() {
    const modal = document.getElementById('preferences-modal');
    modal.classList.add('hidden');
}

function updateThemeButtons() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const lightBtn = document.getElementById('theme-light');
    const darkBtn = document.getElementById('theme-dark');
    
    if (lightBtn && darkBtn) {
        // Reset button styles
        lightBtn.className = 'button button-secondary';
        darkBtn.className = 'button button-secondary';
        
        // Highlight current theme
        if (currentTheme === 'light') {
            lightBtn.className = 'button button-primary';
        } else {
            darkBtn.className = 'button button-primary';
        }
    }
}

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.add('hidden');
    }
});