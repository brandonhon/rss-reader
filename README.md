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

**Option 1: Docker (Recommended)**
- Docker Desktop
- Docker Compose

**Option 2: Local Development**
- Python 3.7+ (for backend)
- Node.js 16+ (for frontend)
- Git

### 🐳 Docker Setup (Recommended)

```bash
# Build and start everything with Docker
make docker-build
make docker-up

# Or for development with hot reload
make docker-dev

# Stop containers
make docker-down

# View logs
make docker-logs
```

### 🔧 Local Development Setup

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

## Design System

### Enhanced Color Palette

The application uses a sophisticated color system with CSS custom properties for seamless theming:

**Light Mode:**
- Primary: #4F46E5 (indigo-600) / Hover: #4338CA (indigo-700)
- Secondary: #6366F1 (indigo-500) / Hover: #4F46E5 (indigo-600)
- Background: #F9FAFB (gray-50) / Alt: #F3F4F6 (gray-100)
- Panels: #FFFFFF (white) / Border: #E5E7EB (gray-200)
- Text: #111827 (gray-900) main / #6B7280 (gray-500) secondary / #9CA3AF (gray-400) muted
- Unread indicator: #EF4444 (red-500)
- Interactive hover: #E0E7FF (indigo-100)

**Dark Mode:**
- Primary: #818CF8 (indigo-400) / Hover: #6366F1 (indigo-500)
- Secondary: #A5B4FC (indigo-300) / Hover: #818CF8 (indigo-400)
- Background: #1F2937 (gray-800) / Alt: #111827 (gray-900)
- Panels: #111827 (gray-900) / Border: #374151 (gray-700)
- Text: #F9FAFB (gray-50) main / #9CA3AF (gray-400) secondary / #6B7280 (gray-500) muted
- Unread indicator: #F87171 (red-400)
- Interactive hover: #374151 (gray-700)

### Typography
- Primary font family: "Inter", sans-serif
- Consistent weight scale: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Optimized for readability across light and dark modes

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

### 🐳 Docker Production Deployment (Recommended)

```bash
# Build production images
make docker-build

# Start in production mode
make docker-up

# The application will be available at:
# - Frontend: http://localhost:3000
# - Backend Admin: http://localhost:8090/_/
```

**Using Docker Compose directly:**
```bash
docker-compose up -d --build
```

### Manual Production Deployment

#### Frontend
Build the React app and serve with any static file server:
```bash
cd frontend
npm run build
# Serve the 'dist' directory with nginx, apache, or any static server
```

#### Backend
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

#### Docker Issues

1. **Docker containers fail to start**:
   - Ensure Docker Desktop is running
   - Check if ports 3000 and 8090 are available
   - Try `make docker-clean` and rebuild

2. **Permission denied errors**:
   - On Linux, ensure your user is in the docker group
   - Try running with `sudo` if necessary

3. **Container logs show errors**:
   - Check logs with `make docker-logs`
   - Verify environment variables in docker-compose.yml

#### Local Development Issues

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