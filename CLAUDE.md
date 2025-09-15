# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Go-based RSS reader web application that allows users to organize RSS feeds into categories, read articles, and mark them as read/starred. The application uses GORM with SQLite for persistence, Gorilla Mux for routing, and HTML templates for the frontend.

### Release and Distribution
- Releases are triggered by semantic version tags (v1.0.0, v1.2.3, etc.)
- Multi-platform binaries are built via GitHub Actions
- Docker images are published to GitHub Container Registry
- Binary artifacts are packaged as `platform-arch.tar.gz` (e.g., `linux-amd64.tar.gz`)

#### Version Management
**IMPORTANT**: This project uses semantic versioning. ALWAYS follow this process for releases:

**Current Version**: v0.3.0 (Visual Enhancement Update)

1. **Update version in CLAUDE.md**:
   ```bash
   # Edit CLAUDE.md and update the Current Version line
   **Current Version**: v1.x.x (Description)
   ```

2. **Commit version change**:
   ```bash
   git add CLAUDE.md
   git commit -m "chore: bump version to v1.x.x for [feature/fix] release"
   git push origin main
   ```

3. **Create and push semantic version tag**:
   ```bash
   git tag -a v1.x.x -m "Release v1.x.x: [Description]"
   git push origin v1.x.x
   ```

**Version Bump Guidelines**:
- **Patch** (1.0.0 → 1.0.1): Bug fixes, documentation updates
- **Minor** (1.0.0 → 1.1.0): New features, enhancements (backward compatible)  
- **Major** (1.0.0 → 2.0.0): Breaking changes, major rewrites

**❌ NEVER use date-based tags** like `v2025.09.14-abc123` - only semantic versions!

## Development Commands

### Build and Run
```bash
go run main.go
```
Server runs at http://localhost:8080

### Build Binary
```bash
go build -o rss-reader main.go
```

### Install Dependencies
```bash
go mod tidy
go mod download
```

### Database
- SQLite database file: `rss_reader.db` (auto-created)
- Default admin user: username `admin`, password `admin123`

## Architecture

### Project Structure
```
├── main.go              # Application entry point and routing
├── models/              # GORM data models
│   └── models.go        # User, Category, Feed, Article models
├── handlers/            # HTTP request handlers
│   ├── common.go        # Shared utilities and database helpers
│   ├── auth.go          # Authentication middleware and login/logout
│   ├── articles.go      # Article management handlers
│   ├── feeds.go         # Feed management handlers
│   └── updater.go       # RSS feed update handlers
├── templates/           # HTML templates
│   ├── layout.html      # Main application layout
│   ├── login.html       # Login page
│   └── articles.html    # Article display template
├── static/              # Static assets
│   ├── style.css        # Application styles
│   └── app.js           # Frontend JavaScript
├── internal/db/         # Database utilities
└── rss/                 # RSS parsing utilities
```

### Key Components

**Main Application (main.go)**
- Sets up database connection and migrations
- Configures routing with Gorilla Mux
- Runs background RSS updater goroutine every 15 minutes
- Serves static files and handles template rendering

**Models (models/models.go)**
- User: authentication and session management
- Category: organizing feeds by user
- Feed: RSS feed URLs and metadata
- Article: individual RSS items with read/starred status
- GORM auto-migration handles schema updates

**Handlers Package**
- All handlers use shared DB and session store instances
- AuthMiddleware wraps protected routes
- Session management with Gorilla Sessions
- Password hashing with bcrypt

**Templates System**
- Uses Go's html/template package
- Templates loaded via `template.ParseGlob("templates/*.html")`
- Main layout with dynamic content injection

### Database Schema
- Users have many Categories
- Categories have many Feeds
- Feeds have many Articles
- SQLite with GORM ORM for all database operations

### Background Processes
- RSS updater goroutine polls all feeds every 15 minutes
- Uses mmcdole/gofeed parser
- Prevents duplicate articles by checking feed_id + link combination

### Authentication
- Session-based authentication with Gorilla Sessions
- Cookie store with configurable secret key
- Bcrypt password hashing
- AuthMiddleware protects all routes except login

### Frontend
- HTML templates with Go template syntax
- CSS and JavaScript served from /static/
- AJAX requests for article operations
- Responsive design for feed and article management