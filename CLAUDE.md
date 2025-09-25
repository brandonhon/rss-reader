# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a modern, full-stack RSS reader application with a React frontend and PocketBase backend. The system consists of three main components:

### Frontend (React + Tailwind CSS)
- **Location**: `frontend/` directory
- **Technology Stack**: React 18, TypeScript, Tailwind CSS, Vite, Heroicons
- **Features**: Three-panel layout, authentication, themes, resizable panels, keyboard navigation
- **Build System**: Vite with hot module replacement for development

### Backend Components
1. **PocketBase Backend Setup** (`backend/setup-collections.py`) - Automates database schema creation
2. **RSS Feed Fetcher** (`backend/feed-fetch.py`) - Background worker that fetches RSS feeds
3. **PocketBase Server** - Provides REST API and admin interface

### Database Schema

The application uses PocketBase with the following core collections (see `PocketBase-Collections.md` for complete schema):

- **feeds** - RSS feed URLs and metadata (title, favicon, fetch status, etag, last_modified)
- **subscriptions** - User-to-feed relationships  
- **feed_items** - Individual RSS articles/posts
- **users** - User accounts (PocketBase auth)
- **categories** - Feed organization
- **favorites** - User-starred items
- Additional collections for tags, notifications, blacklists, analytics

### Data Flow

1. Admin sets up PocketBase using `pocketbase-setup.py`
2. RSS feeds are added to the `feeds` collection
3. `feed-fetch.py` runs continuously, fetching feeds every 5 minutes
4. New feed items are stored in `feed_items` collection
5. Users can subscribe to feeds, mark items as read/favorites

## Development Commands

### 🐳 Docker Setup (Recommended)

```bash
# Build Docker images
make docker-build

# Start development environment with hot reload
make docker-dev

# Start production environment  
make docker-up

# View logs
make docker-logs

# Stop and clean up
make docker-down
```

### 🔧 Local Development Setup

```bash
# Complete setup for new users
make setup

# Start development environment (frontend + backend)
make dev

# Start only frontend development server
make frontend-dev

# Start only backend services  
make backend-dev

# Install dependencies
make install

# Stop all services
make stop
```

### Manual Setup
```bash
# Install PocketBase and create database schema
python3 pocketbase-setup.py

# Install Python dependencies
pip3 install requests feedparser

# Install frontend dependencies
cd frontend && npm install
```

### Configuration

- **PocketBase URL**: `http://127.0.0.1:8090` (default)
- **Admin credentials**: admin@example.com / password123 (change in production)
- **Fetch interval**: 300 seconds (5 minutes)
- **Installation directory**: `~/pocketbase_rss/`

## Key Implementation Details

### Feed Fetching Strategy
- Uses `feedparser` library for RSS/Atom parsing
- Deduplication based on feed_id + link combination
- Tracks fetch status and error messages per feed
- Updates `last_fetched` timestamp on each attempt

### PocketBase Integration
- Admin API authentication with Bearer token
- RESTful API calls for CRUD operations
- Automatic schema creation with proper relations
- Cascading deletes for data integrity

### Error Handling
- Feed fetch failures are logged to `feeds.error_message`
- Failed feeds are marked with `fetch_status: "failed"`
- Graceful handling of malformed RSS feeds

## Docker Configuration

### Container Structure
- **Frontend Container**: React app served with nginx on port 3000
- **Backend Container**: PocketBase + RSS fetcher on port 8090  
- **Volumes**: `pb_data` for database persistence

### Docker Files
- `frontend/Dockerfile` - Production build with nginx
- `frontend/Dockerfile.dev` - Development with hot reload
- `backend/Dockerfile` - PocketBase + Python environment
- `docker-compose.yml` - Production setup
- `docker-compose.dev.yml` - Development setup

## Frontend Architecture

### Component Structure
```
frontend/src/
├── components/
│   ├── Auth/           # Authentication forms
│   ├── Toolbar.tsx     # Top navigation bar
│   ├── FeedPanel.tsx   # Left sidebar with feeds
│   ├── ArticleList.tsx # Middle panel with articles
│   ├── ArticleContent.tsx # Right panel with content
│   └── ResizablePanels.tsx # Panel resize logic
├── contexts/           # React contexts for state
├── utils/             # Icon mappings and utilities
└── types/             # TypeScript type definitions
```

### Key Technologies
- **Icons**: Heroicons (replaced Lucide React)
- **Styling**: Tailwind CSS with custom color system
- **State**: React Context API
- **Authentication**: PocketBase SDK integration
- **Build**: Vite with TypeScript

## Potential Improvements (from feed-fetch.py comments)

The codebase includes extensive comments about future enhancements:
- Retry logic with exponential backoff
- ETag/Last-Modified incremental fetching
- Content deduplication using hashes
- Async/threaded fetching for performance
- Rate limiting and timeout handling
- Monitoring and metrics collection