# RSS Reader Makefile
# Manages both frontend (React) and backend (PocketBase + Python) services

.PHONY: help install dev prod stop clean frontend-dev backend-dev frontend-build frontend-prod backend-setup logs check-deps debug-frontend status test lint setup docker-build docker-up docker-down docker-dev docker-logs docker-clean

# Default target
help:
	@echo "RSS Reader - Available commands:"
	@echo ""
	@echo "🚀 Main Commands:"
	@echo "  make install         - Install all dependencies (frontend + backend)"
	@echo "  make setup           - Complete setup for new users (install + backend setup)"
	@echo "  make dev             - Start development environment (frontend + backend)"
	@echo "  make prod            - Start production environment"
	@echo "  make stop            - Stop all running services"
	@echo "  make clean           - Clean build artifacts and dependencies"
	@echo ""
	@echo "🎯 Component Commands:"
	@echo "  make frontend-dev    - Start only frontend development server"
	@echo "  make frontend-build  - Build frontend for production"
	@echo "  make frontend-prod   - Start frontend production server"
	@echo "  make backend-dev     - Start only backend services"
	@echo "  make backend-setup   - Set up PocketBase and database schema"
	@echo ""
	@echo "🔧 Utility Commands:"
	@echo "  make check-deps      - Check if required dependencies are installed"
	@echo "  make debug-frontend  - Debug frontend setup and show configuration"
	@echo "  make status          - Show status of all services"
	@echo "  make logs            - Show logs from running services"
	@echo "  make test            - Run tests (when available)"
	@echo "  make lint            - Run code linters"
	@echo ""
	@echo "🐳 Docker Commands:"
	@echo "  make docker-build    - Build Docker images for frontend and backend"
	@echo "  make docker-up       - Start all services with Docker Compose (production)"
	@echo "  make docker-dev      - Start development environment with Docker"
	@echo "  make docker-down     - Stop and remove Docker containers"
	@echo "  make docker-logs     - Show Docker container logs"
	@echo "  make docker-clean    - Remove Docker images and volumes"
	@echo ""
	@echo "💡 Quick Start:"
	@echo "  1. make setup        - First-time setup"
	@echo "  2. make dev          - Start development"
	@echo "  3. Open http://localhost:3000 (frontend) and http://127.0.0.1:8090/_/ (admin)"
	@echo "  4. Register a new user account or use admin@example.com / password123"
	@echo ""
	@echo "🐛 Troubleshooting:"
	@echo "  make debug-frontend  - If frontend won't start"
	@echo "  make check-deps      - If dependencies missing"
	@echo "  make status          - Check what's running"
	@echo ""

# Install all dependencies
install: backend-deps frontend-deps
	@echo "✅ All dependencies installed successfully"

backend-deps:
	@echo "📦 Installing Python dependencies..."
	@pip3 install requests feedparser || (echo "❌ Failed to install Python dependencies. Make sure pip3 is installed." && exit 1)

frontend-deps:
	@echo "📦 Installing Node.js dependencies..."
	@if [ ! -d "frontend/node_modules" ]; then \
		cd frontend && npm install || (echo "❌ Failed to install Node.js dependencies. Make sure Node.js and npm are installed." && exit 1); \
	else \
		echo "Dependencies already installed"; \
	fi
	@echo "✅ Frontend dependencies ready (React, Tailwind CSS, PocketBase SDK)"

# Development environment
dev: install backend-setup
	@echo "🚀 Starting development environment..."
	@make -j2 frontend-dev backend-dev

frontend-dev: frontend-deps
	@echo "🌐 Starting frontend development server on http://localhost:3000"
	@cd frontend && npm run dev

backend-dev:
	@echo "🔧 Starting backend services..."
	@echo "📊 PocketBase admin UI available at http://127.0.0.1:8090/_/"
	@python3 feed-fetch.py

# Production environment
prod: install frontend-build backend-setup
	@echo "🚀 Starting production environment..."
	@make -j2 frontend-prod backend-prod

frontend-build:
	@echo "🏗️  Building frontend for production..."
	@cd frontend && npm run build

frontend-prod:
	@echo "🌐 Starting frontend production server on http://localhost:4173"
	@cd frontend && npm run preview

backend-prod:
	@echo "🔧 Starting backend in production mode..."
	@python3 feed-fetch.py

# Backend setup
backend-setup:
	@echo "🗄️  Setting up PocketBase and database schema..."
	@python3 pocketbase-setup.py || (echo "❌ Backend setup failed. Check Python installation and permissions." && exit 1)
	@echo "✅ Backend setup complete"

# Stop all services
stop:
	@echo "🛑 Stopping all RSS Reader services..."
	@-pkill -f "pocketbase serve" 2>/dev/null || true
	@-pkill -f "feed-fetch.py" 2>/dev/null || true
	@-pkill -f "vite" 2>/dev/null || true
	@-lsof -ti:3000 | xargs kill -9 2>/dev/null || true
	@-lsof -ti:4173 | xargs kill -9 2>/dev/null || true
	@-lsof -ti:8090 | xargs kill -9 2>/dev/null || true
	@echo "✅ All services stopped"

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf frontend/dist
	@rm -rf frontend/node_modules
	@rm -rf pocketbase_rss
	@echo "✅ Clean complete"

# Show logs (requires services to be running with logging)
logs:
	@echo "📋 Recent logs from RSS Reader services:"
	@echo ""
	@echo "=== PocketBase Logs ==="
	@-tail -n 20 pocketbase_rss/data/logs/*.log 2>/dev/null || echo "No PocketBase logs found"
	@echo ""
	@echo "=== Feed Fetcher Status ==="
	@-ps aux | grep "feed-fetch.py" | grep -v grep || echo "Feed fetcher not running"
	@echo ""
	@echo "=== Frontend Status ==="
	@-ps aux | grep "vite" | grep -v grep || echo "Frontend dev server not running"

# Development helpers
check-deps:
	@echo "🔍 Checking dependencies..."
	@python3 --version || (echo "❌ Python 3 not found" && exit 1)
	@pip3 --version || (echo "❌ pip3 not found" && exit 1)
	@node --version || (echo "❌ Node.js not found" && exit 1)
	@npm --version || (echo "❌ npm not found" && exit 1)
	@echo "✅ All required dependencies are available"

# Quick start for new users
setup: check-deps install backend-setup
	@echo ""
	@echo "🎉 RSS Reader setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Run 'make dev' to start development environment"
	@echo "  2. Open http://localhost:3000 for the frontend"
	@echo "  3. Open http://127.0.0.1:8090/_/ for PocketBase admin"
	@echo "  4. Use admin@example.com / password123 to log in"
	@echo ""

# Testing (placeholder for future test commands)
test:
	@echo "🧪 Running tests..."
	@cd frontend && npm run test 2>/dev/null || echo "No frontend tests configured yet"
	@echo "Backend tests not yet implemented"

# Linting
lint:
	@echo "🔍 Running linters..."
	@cd frontend && npm run lint 2>/dev/null || echo "No frontend linting configured yet"

# Show status of services
status:
	@echo "📊 RSS Reader Service Status:"
	@echo ""
	@echo -n "PocketBase: "
	@curl -s http://127.0.0.1:8090/api/health >/dev/null 2>&1 && echo "✅ Running" || echo "❌ Not running"
	@echo -n "Frontend Dev Server: "
	@curl -s http://localhost:3000 >/dev/null 2>&1 && echo "✅ Running" || echo "❌ Not running"
	@echo -n "Feed Fetcher: "
	@pgrep -f "feed-fetch.py" >/dev/null 2>&1 && echo "✅ Running" || echo "❌ Not running"

# Debug frontend setup
debug-frontend:
	@echo "🔍 Frontend Debug Information:"
	@echo ""
	@echo "Working directory: $(shell pwd)"
	@echo "Frontend directory exists: $(shell [ -d frontend ] && echo "✅ Yes" || echo "❌ No")"
	@echo "package.json exists: $(shell [ -f frontend/package.json ] && echo "✅ Yes" || echo "❌ No")"
	@echo "node_modules exists: $(shell [ -d frontend/node_modules ] && echo "✅ Yes" || echo "❌ No")"
	@echo "vite installed: $(shell cd frontend && npm list vite 2>/dev/null | grep vite >/dev/null && echo "✅ Yes" || echo "❌ No")"
	@echo ""
	@echo "Node.js version: $(shell node --version 2>/dev/null || echo "Not found")"
	@echo "npm version: $(shell npm --version 2>/dev/null || echo "Not found")"
	@echo ""
	@echo "Attempting to run vite directly:"
	@cd frontend && npx vite --version 2>/dev/null || echo "❌ Vite not working"

# Docker Commands
docker-build:
	@echo "🐳 Building Docker images..."
	@docker-compose build
	@echo "✅ Docker images built successfully"

docker-up:
	@echo "🐳 Starting RSS Reader with Docker (production mode)..."
	@docker-compose up -d
	@echo "✅ RSS Reader started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend Admin: http://localhost:8090/_/"
	@echo "Use 'make docker-logs' to see container logs"

docker-dev:
	@echo "🐳 Starting RSS Reader with Docker (development mode)..."
	@docker-compose -f docker-compose.dev.yml up -d
	@echo "✅ RSS Reader development environment started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend Admin: http://localhost:8090/_/"

docker-down:
	@echo "🐳 Stopping Docker containers..."
	@docker-compose down
	@docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
	@echo "✅ All containers stopped"

docker-logs:
	@echo "🐳 Docker container logs:"
	@docker-compose logs -f --tail=100

docker-clean:
	@echo "🐳 Cleaning Docker resources..."
	@docker-compose down -v --remove-orphans
	@docker-compose -f docker-compose.dev.yml down -v --remove-orphans 2>/dev/null || true
	@docker system prune -f
	@echo "✅ Docker cleanup complete"

# Check Docker dependencies
check-docker:
	@echo "🔍 Checking Docker dependencies..."
	@docker --version || (echo "❌ Docker not found. Please install Docker Desktop" && exit 1)
	@docker-compose --version || (echo "❌ Docker Compose not found" && exit 1)
	@echo "✅ Docker is ready"