# RSS Reader

A modern, three-panel RSS reader application with a React + Tailwind CSS frontend and PocketBase backend. Inspired by Tiny Tiny RSS (TTRSS) but with a minimalist, visually stunning design optimized for desktop and Electron.

## Features

### Frontend (React + Tailwind CSS)
- **Authentication**: Secure login/register with PocketBase integration
- **Three-panel layout**: Feed categories/feeds list (left), article list (middle), article content (right)
- **Resizable panels**: Drag dividers to adjust panel sizes
- **Dark/Light mode**: Toggle between themes with automatic system preference detection
- **User management**: Profile settings, theme preferences, logout functionality
- **Keyboard navigation**: Navigate efficiently with keyboard shortcuts
- **Search and filtering**: Search articles and filter by read/unread status
- **Responsive design**: Optimized for desktop with mobile-ready architecture

### Backend (PocketBase + Python)
- **PocketBase database**: Modern backend with built-in admin UI
- **RSS feed fetching**: Automated feed polling and content extraction
- **User management**: Authentication and user-specific feed subscriptions
- **Feed management**: Categories, favorites, read/unread tracking

## Quick Start

### Prerequisites
- Python 3.7+ (for backend)
- Node.js 16+ (for frontend)
- Git

### Using Make Commands

```bash
# Start development environment (both frontend and backend)
make dev

# Start production environment
make prod

# Stop all services
make stop

# Install dependencies
make install

# Clean build artifacts
make clean
```

## Manual Setup

### Backend Setup

1. **Install Python dependencies**:
   ```bash
   pip3 install requests feedparser
   ```

2. **Set up PocketBase and create database schema**:
   ```bash
   cd /path/to/rss-reader
   python3 pocketbase-setup.py
   ```
   This will:
   - Download and install PocketBase
   - Start PocketBase server on `http://127.0.0.1:8090`
   - Create admin user (admin@example.com / password123)
   - Set up all database collections

3. **Start RSS feed fetcher** (in a separate terminal):
   ```bash
   python3 feed-fetch.py
   ```

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   Opens on `http://localhost:3000`

3. **Build for production**:
   ```bash
   npm run build
   ```

### First-Time User Setup

After starting the application:

1. **Create your account**: Click "Sign up" to register a new user
2. **Login**: Use your credentials to access the RSS reader
3. **Add feeds**: Use the "+" button in the toolbar to add RSS feeds
4. **Configure preferences**: Click your avatar → "Profile & Settings" to customize theme and display name

## Architecture

### Database Schema (PocketBase Collections)

The application uses PocketBase with the following collections:

- **users** - User accounts and preferences
- **feeds** - RSS feed URLs and metadata
- **subscriptions** - User-to-feed relationships
- **feed_items** - Individual RSS articles/posts
- **categories** - Feed organization
- **favorites** - User-starred items
- **user_settings** - Per-user preferences
- **feed_tags** - Article tagging system
- **notifications** - User notifications
- **feed_blacklist** - Blocked feeds/domains
- **feed_item_views** - Analytics tracking

### Component Structure

```
frontend/src/
├── components/
│   ├── Auth/
│   │   ├── AuthPage.tsx      # Login/register page container
│   │   ├── LoginForm.tsx     # Login form with validation
│   │   ├── RegisterForm.tsx  # Registration form with validation
│   │   └── ProtectedRoute.tsx # Route protection wrapper
│   ├── Toolbar.tsx           # Top toolbar with controls & user menu
│   ├── FeedPanel.tsx         # Left panel - feeds and categories
│   ├── ArticleList.tsx       # Middle panel - article list
│   ├── ArticleContent.tsx    # Right panel - article content
│   ├── ResizablePanels.tsx   # Panel resize logic
│   └── UserProfile.tsx       # User profile/settings modal
├── contexts/
│   ├── ThemeContext.tsx      # Dark/light mode management
│   ├── AppContext.tsx        # Global app state
│   └── AuthContext.tsx       # Authentication & PocketBase integration
├── data/
│   └── mockData.ts           # Placeholder data
├── types/
│   └── index.ts              # TypeScript type definitions
└── App.tsx                   # Main application component
```

## Configuration

### Backend Configuration
- **PocketBase URL**: `http://127.0.0.1:8090` (default)
- **Admin credentials**: admin@example.com / password123
- **Fetch interval**: 300 seconds (5 minutes)
- **Installation directory**: `~/pocketbase_rss/`

### Frontend Configuration
- **Development server**: `http://localhost:3000`
- **API endpoint**: Points to PocketBase URL (`http://127.0.0.1:8090`)
- **Authentication**: Integrated with PocketBase user collection
- **Theme**: Auto-detects system preference, saves to localStorage and user profile
- **Environment variables**: See `frontend/.env.example` for configuration options

## Keyboard Shortcuts

- `j` / `↓` - Next article
- `k` / `↑` - Previous article
- `o` / `Enter` - Open article in new tab
- `r` - Refresh feeds
- `a` - Add new feed
- `f` - Focus search
- `Esc` - Clear selection

## Development

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development
```bash
# View PocketBase admin UI
open http://127.0.0.1:8090/_/

# Monitor feed fetcher logs
python3 feed-fetch.py

# Add test feeds via admin UI or API
```

### Adding New Feeds
1. Use the "+" button in the toolbar
2. Or via PocketBase admin UI at `http://127.0.0.1:8090/_/`
3. Or directly via API calls

## Production Deployment

### Frontend
Build the React app and serve with any static file server:
```bash
cd frontend
npm run build
# Serve the 'dist' directory
```

### Backend
1. Configure production PocketBase settings
2. Set up proper admin credentials
3. Configure feed fetcher as a service/daemon
4. Set up reverse proxy (nginx) if needed

## Electron Integration

The frontend is designed to be Electron-ready:

1. **Install Electron**:
   ```bash
   cd frontend
   npm install --save-dev electron
   ```

2. **Add Electron main process** (example):
   ```javascript
   // main.js
   const { app, BrowserWindow } = require('electron');
   
   function createWindow() {
     const win = new BrowserWindow({
       width: 1400,
       height: 900,
       webPreferences: {
         nodeIntegration: true
       }
     });
     
     win.loadFile('dist/index.html');
   }
   
   app.whenReady().then(createWindow);
   ```

3. **Package for distribution** using electron-builder or similar.

## Troubleshooting

### Common Issues

1. **PocketBase fails to start**:
   - Check if port 8090 is available
   - Verify Python has network permissions
   - Check firewall settings

2. **Feed fetcher fails**:
   - Verify PocketBase is running
   - Check admin credentials
   - Ensure network connectivity

3. **Frontend build fails**:
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Performance Optimization

- **Feed fetching**: Adjust `FETCH_INTERVAL` in feed-fetch.py
- **Frontend**: Enable React production build optimizations
- **Database**: Monitor PocketBase query performance
- **Memory**: Consider pagination for large article lists

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the existing code style
4. Test your changes
5. Submit a pull request

## License

This project is open source. See individual components for specific licenses.

## Support

For issues and questions:
- Check the troubleshooting section above
- Review PocketBase documentation
- Check React + Tailwind CSS documentation
- Open an issue on the project repository