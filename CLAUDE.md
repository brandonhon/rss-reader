# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a Python-based RSS reader application using PocketBase as the backend database. The system consists of two main components:

1. **PocketBase Backend Setup** (`pocketbase-setup.py`) - Automates PocketBase installation, configuration, and database schema creation
2. **RSS Feed Fetcher** (`feed-fetch.py`) - Background worker that periodically fetches RSS feeds and populates the database

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

### Setup and Installation
```bash
# Install PocketBase and create database schema
python3 pocketbase-setup.py

# Install Python dependencies (if requirements.txt exists)
pip3 install requests feedparser

# Or install individual packages
pip3 install requests feedparser
```

### Running the Application
```bash
# Start PocketBase backend (if not already running)
./pocketbase_rss/pocketbase serve --dir ./pocketbase_rss/data

# Run RSS feed fetcher
python3 feed-fetch.py
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

## Potential Improvements (from feed-fetch.py comments)

The codebase includes extensive comments about future enhancements:
- Retry logic with exponential backoff
- ETag/Last-Modified incremental fetching
- Content deduplication using hashes
- Async/threaded fetching for performance
- Rate limiting and timeout handling
- Monitoring and metrics collection