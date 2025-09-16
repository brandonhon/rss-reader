// Preferences Page JavaScript

// Tab Management
function initTabs() {
    const navButtons = document.querySelectorAll('.nav-button');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            
            // Update nav buttons
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update tab contents
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// Theme Management
function initThemeControls() {
    const themeOptions = document.querySelectorAll('.theme-option');
    const currentTheme = localStorage.getItem('theme') || 'auto';
    
    // Set initial active theme
    themeOptions.forEach(option => {
        if (option.dataset.theme === currentTheme) {
            option.classList.add('active');
        }
        
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            
            // Update active state
            themeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Apply theme
            setTheme(theme);
        });
    });
}

function setTheme(theme) {
    localStorage.setItem('theme', theme);
    
    if (theme === 'auto') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', systemDark ? 'dark' : 'light');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
}

// Feed Management
class FeedManager {
    constructor() {
        this.feeds = [];
        this.categories = [];
    }

    async loadFeeds() {
        try {
            const response = await fetch('/user-feeds', { credentials: 'include' });
            if (response.ok) {
                this.feeds = await response.json();
                this.renderFeedsByCategory();
            }
        } catch (error) {
            console.error('Failed to load feeds:', error);
        }
    }

    async loadCategories() {
        try {
            const response = await fetch('/categories', { credentials: 'include' });
            if (response.ok) {
                this.categories = await response.json();
                this.populateCategorySelects();
                this.renderCategories();
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }

    renderFeedsByCategory() {
        const container = document.getElementById('feeds-by-category');
        if (!container) return;

        // Group feeds by category
        const feedsByCategory = {};
        this.feeds.forEach(feed => {
            const categoryName = feed.category_name || 'Uncategorized';
            if (!feedsByCategory[categoryName]) {
                feedsByCategory[categoryName] = [];
            }
            feedsByCategory[categoryName].push(feed);
        });

        container.innerHTML = Object.entries(feedsByCategory).map(([categoryName, feeds]) => `
            <div class="category-section" data-category="${categoryName}">
                <div class="category-header" onclick="toggleCategory(this)">
                    <div class="category-info">
                        <span class="category-name">${this.escapeHtml(categoryName)}</span>
                        <span class="category-count">${feeds.length} feeds</span>
                    </div>
                    <span class="category-toggle">▼</span>
                </div>
                <div class="category-feeds">
                    ${feeds.map(feed => `
                        <div class="feed-item" data-feed-id="${feed.ID}">
                            <div class="feed-info">
                                <h4 class="feed-title">${this.escapeHtml(feed.feed_title)}</h4>
                                <p class="feed-url">${this.escapeHtml(feed.feed_url)}</p>
                            </div>
                            <div class="feed-actions">
                                <button class="feed-action" onclick="editFeed(${feed.ID})" title="Edit">✏️</button>
                                <button class="feed-action" onclick="deleteFeed(${feed.ID})" title="Delete">🗑️</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    renderCategories() {
        const container = document.getElementById('categories-list');
        if (!container) return;

        container.innerHTML = this.categories.map(category => `
            <div class="category-item" data-category-id="${category.ID}">
                <div class="category-info">
                    <span class="category-name">${this.escapeHtml(category.Name)}</span>
                    <span class="category-count">${category.unread_count || 0} unread</span>
                </div>
                <div class="category-actions">
                    <button class="feed-action" onclick="editCategory(${category.ID})" title="Edit">✏️</button>
                    <button class="feed-action" onclick="deleteCategory(${category.ID})" title="Delete">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    populateCategorySelects() {
        const selects = document.querySelectorAll('#feed-category');
        selects.forEach(select => {
            // Clear existing options except the first one
            while (select.children.length > 1) {
                select.removeChild(select.lastChild);
            }
            
            this.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.Name;
                option.textContent = category.Name;
                select.appendChild(option);
            });
        });
    }

    async addFeed(feedData) {
        try {
            const response = await fetch('/add-feed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(feedData),
                credentials: 'include'
            });

            if (response.ok) {
                await this.loadFeeds();
                await this.loadCategories();
                this.showSuccess('Feed added successfully!');
                return true;
            } else {
                const error = await response.text();
                this.showError(`Failed to add feed: ${error}`);
                return false;
            }
        } catch (error) {
            this.showError(`Failed to add feed: ${error.message}`);
            return false;
        }
    }

    async deleteFeed(feedId) {
        if (!confirm('Are you sure you want to unsubscribe from this feed?')) {
            return;
        }

        try {
            const response = await fetch('/delete-feed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ id: feedId }),
                credentials: 'include'
            });

            if (response.ok) {
                await this.loadFeeds();
                await this.loadCategories();
                this.showSuccess('Feed removed successfully!');
            } else {
                const error = await response.text();
                this.showError(`Failed to remove feed: ${error}`);
            }
        } catch (error) {
            this.showError(`Failed to remove feed: ${error.message}`);
        }
    }

    showSuccess(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'toast toast-success';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    showError(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'toast toast-error';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const feedManager = new FeedManager();

// Modal Management
function openAddFeedModal() {
    const modal = document.getElementById('add-feed-modal');
    modal.classList.add('active');
    
    // Reset form
    document.getElementById('add-feed-form').reset();
    document.getElementById('auth-fields').style.display = 'none';
    document.getElementById('feed-auth-enabled').checked = false;
}

function closeAddFeedModal() {
    const modal = document.getElementById('add-feed-modal');
    modal.classList.remove('active');
}

function openUnsubscribeModal() {
    const modal = document.getElementById('unsubscribe-modal');
    modal.classList.add('active');
    renderUnsubscribeFeeds();
}

function closeUnsubscribeModal() {
    const modal = document.getElementById('unsubscribe-modal');
    modal.classList.remove('active');
}

function renderUnsubscribeFeeds() {
    const container = document.getElementById('unsubscribe-feeds');
    if (!container) return;

    // Group feeds by category for unsubscribe modal
    const feedsByCategory = {};
    feedManager.feeds.forEach(feed => {
        const categoryName = feed.category_name || 'Uncategorized';
        if (!feedsByCategory[categoryName]) {
            feedsByCategory[categoryName] = [];
        }
        feedsByCategory[categoryName].push(feed);
    });

    container.innerHTML = Object.entries(feedsByCategory).map(([categoryName, feeds]) => `
        <div class="unsubscribe-category">
            <div class="category-header" onclick="toggleCategory(this)">
                <div class="category-info">
                    <span class="category-name">${feedManager.escapeHtml(categoryName)}</span>
                    <span class="category-count">${feeds.length} feeds</span>
                </div>
                <span class="category-toggle">▼</span>
            </div>
            <div class="category-feeds">
                ${feeds.map(feed => `
                    <div class="unsubscribe-feed">
                        <input type="checkbox" class="feed-checkbox" value="${feed.ID}" onchange="updateUnsubscribeButton()">
                        <div class="feed-details">
                            <h4 class="feed-name">${feedManager.escapeHtml(feed.feed_title)}</h4>
                            <p class="feed-meta">${feedManager.escapeHtml(feed.feed_url)}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function updateUnsubscribeButton() {
    const checkboxes = document.querySelectorAll('.feed-checkbox:checked');
    const button = document.getElementById('unsubscribe-btn');
    button.disabled = checkboxes.length === 0;
}

async function unsubscribeSelected() {
    const checkboxes = document.querySelectorAll('.feed-checkbox:checked');
    const feedIds = Array.from(checkboxes).map(cb => cb.value);
    
    if (feedIds.length === 0) return;
    
    const confirmMessage = `Are you sure you want to unsubscribe from ${feedIds.length} feed(s)?`;
    if (!confirm(confirmMessage)) return;

    try {
        const promises = feedIds.map(feedId => 
            fetch('/delete-feed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ id: feedId }),
                credentials: 'include'
            })
        );

        await Promise.all(promises);
        
        await feedManager.loadFeeds();
        await feedManager.loadCategories();
        closeUnsubscribeModal();
        feedManager.showSuccess(`Unsubscribed from ${feedIds.length} feed(s) successfully!`);
    } catch (error) {
        feedManager.showError(`Failed to unsubscribe: ${error.message}`);
    }
}

// Category toggle functionality
function toggleCategory(header) {
    const section = header.parentElement;
    section.classList.toggle('collapsed');
}

// System Information
async function loadSystemInfo() {
    try {
        const response = await fetch('/system-info', { credentials: 'include' });
        if (response.ok) {
            const data = await response.json();
            
            document.getElementById('articles-count').textContent = data.articles || '--';
            document.getElementById('feeds-count').textContent = data.feeds || '--';
            document.getElementById('categories-count').textContent = data.categories || '--';
            document.getElementById('system-uptime').textContent = data.uptime || '--';
        }
    } catch (error) {
        console.error('Failed to load system info:', error);
    }
}

// OPML Functions
function exportOPML() {
    window.location.href = '/export-opml';
}

// Form Handlers
function initFormHandlers() {
    // Add Feed Form
    document.getElementById('add-feed-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const feedData = Object.fromEntries(formData.entries());
        
        const success = await feedManager.addFeed(feedData);
        if (success) {
            closeAddFeedModal();
        }
    });

    // Auth toggle
    document.getElementById('feed-auth-enabled').addEventListener('change', (e) => {
        const authFields = document.getElementById('auth-fields');
        authFields.style.display = e.target.checked ? 'block' : 'none';
    });

    // OPML Import
    document.getElementById('opml-import-input').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('opml', file);

        try {
            const response = await fetch('/import-opml', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (response.ok) {
                await feedManager.loadFeeds();
                await feedManager.loadCategories();
                feedManager.showSuccess('OPML imported successfully!');
            } else {
                const error = await response.text();
                feedManager.showError(`Failed to import OPML: ${error}`);
            }
        } catch (error) {
            feedManager.showError(`Failed to import OPML: ${error.message}`);
        }
        
        // Reset file input
        e.target.value = '';
    });
}

// Global functions for onclick handlers
function editFeed(feedId) {
    // TODO: Implement feed editing
    console.log('Edit feed:', feedId);
}

function deleteFeed(feedId) {
    feedManager.deleteFeed(feedId);
}

function editCategory(categoryId) {
    // TODO: Implement category editing
    console.log('Edit category:', categoryId);
}

function deleteCategory(categoryId) {
    // TODO: Implement category deletion
    console.log('Delete category:', categoryId);
}

function openAddCategoryModal() {
    // TODO: Implement add category modal
    const name = prompt('Enter category name:');
    if (name && name.trim()) {
        addCategory(name.trim());
    }
}

async function addCategory(name) {
    try {
        const response = await fetch('/add-category', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ name }),
            credentials: 'include'
        });

        if (response.ok) {
            await feedManager.loadCategories();
            feedManager.showSuccess('Category added successfully!');
        } else {
            const error = await response.text();
            feedManager.showError(`Failed to add category: ${error}`);
        }
    } catch (error) {
        feedManager.showError(`Failed to add category: ${error.message}`);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    initTabs();
    initThemeControls();
    initFormHandlers();
    
    await feedManager.loadCategories();
    await feedManager.loadFeeds();
    await loadSystemInfo();
    
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
});

// Add CSS for toast notifications
const toastStyles = `
.toast {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 24px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
}

.toast.show {
    transform: translateX(0);
}

.toast-success {
    background-color: #10b981;
}

.toast-error {
    background-color: #ef4444;
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = toastStyles;
document.head.appendChild(styleSheet);