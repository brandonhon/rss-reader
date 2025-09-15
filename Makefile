# RSS Reader Makefile
# Provides convenient commands for building, running, and managing the RSS reader application

# Variables
APP_NAME := rss-reader
BINARY_NAME := rss-reader
GO_FILES := $(shell find . -name "*.go" -type f)
STATIC_FILES := $(shell find static templates -type f)
VERSION := $(shell grep "Current Version" CLAUDE.md | sed 's/.*v\([0-9.]*\).*/\1/')
BUILD_TIME := $(shell date -u '+%Y-%m-%d %H:%M:%S UTC')
GIT_COMMIT := $(shell git rev-parse --short HEAD)

# Build flags
LDFLAGS := -X 'main.Version=$(VERSION)' -X 'main.BuildTime=$(BUILD_TIME)' -X 'main.GitCommit=$(GIT_COMMIT)'

# Default target
.DEFAULT_GOAL := help

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
PURPLE := \033[0;35m
CYAN := \033[0;36m
NC := \033[0m # No Color

.PHONY: help
help: ## Show this help message
	@echo "$(CYAN)RSS Reader Development Commands$(NC)"
	@echo ""
	@echo "$(YELLOW)Usage:$(NC)"
	@echo "  make <target>"
	@echo ""
	@echo "$(YELLOW)Available targets:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: run
run: ## Run the application in development mode
	@echo "$(BLUE)Starting RSS Reader on http://localhost:8080$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to stop$(NC)"
	@go run main.go

.PHONY: dev
dev: deps ## Run with auto-reload (requires air: go install github.com/cosmtrek/air@latest)
	@if command -v air >/dev/null 2>&1; then \
		echo "$(BLUE)Starting RSS Reader with auto-reload$(NC)"; \
		air; \
	else \
		echo "$(RED)Air not found. Installing...$(NC)"; \
		go install github.com/cosmtrek/air@latest; \
		echo "$(BLUE)Starting RSS Reader with auto-reload$(NC)"; \
		air; \
	fi

.PHONY: build
build: ## Build the application binary
	@echo "$(BLUE)Building $(APP_NAME) v$(VERSION)$(NC)"
	@go build -ldflags "$(LDFLAGS)" -o bin/$(BINARY_NAME) main.go
	@echo "$(GREEN)Binary built: bin/$(BINARY_NAME)$(NC)"

.PHONY: build-all
build-all: ## Build binaries for multiple platforms
	@echo "$(BLUE)Building $(APP_NAME) for multiple platforms$(NC)"
	@mkdir -p bin
	@echo "$(YELLOW)Building for Linux (amd64)$(NC)"
	@GOOS=linux GOARCH=amd64 go build -ldflags "$(LDFLAGS)" -o bin/$(BINARY_NAME)-linux-amd64 main.go
	@echo "$(YELLOW)Building for macOS (amd64)$(NC)"
	@GOOS=darwin GOARCH=amd64 go build -ldflags "$(LDFLAGS)" -o bin/$(BINARY_NAME)-darwin-amd64 main.go
	@echo "$(YELLOW)Building for macOS (arm64)$(NC)"
	@GOOS=darwin GOARCH=arm64 go build -ldflags "$(LDFLAGS)" -o bin/$(BINARY_NAME)-darwin-arm64 main.go
	@echo "$(YELLOW)Building for Windows (amd64)$(NC)"
	@GOOS=windows GOARCH=amd64 go build -ldflags "$(LDFLAGS)" -o bin/$(BINARY_NAME)-windows-amd64.exe main.go
	@echo "$(GREEN)All binaries built in bin/ directory$(NC)"

.PHONY: install
install: build ## Install the binary to system PATH
	@echo "$(BLUE)Installing $(BINARY_NAME) to /usr/local/bin$(NC)"
	@sudo cp bin/$(BINARY_NAME) /usr/local/bin/
	@echo "$(GREEN)$(BINARY_NAME) installed successfully$(NC)"

.PHONY: deps
deps: ## Download and tidy dependencies
	@echo "$(BLUE)Downloading dependencies$(NC)"
	@go mod download
	@go mod tidy
	@echo "$(GREEN)Dependencies updated$(NC)"

.PHONY: clean
clean: ## Clean build artifacts and cache
	@echo "$(BLUE)Cleaning build artifacts$(NC)"
	@rm -rf bin/
	@go clean -cache
	@go clean -modcache
	@echo "$(GREEN)Clean completed$(NC)"

.PHONY: test
test: ## Run tests
	@echo "$(BLUE)Running tests$(NC)"
	@go test -v ./...

.PHONY: lint
lint: ## Run linter (requires golangci-lint)
	@if command -v golangci-lint >/dev/null 2>&1; then \
		echo "$(BLUE)Running linter$(NC)"; \
		golangci-lint run; \
	else \
		echo "$(YELLOW)golangci-lint not found. Install with:$(NC)"; \
		echo "$(CYAN)curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b \$$(go env GOPATH)/bin v1.54.2$(NC)"; \
	fi

.PHONY: format
format: ## Format Go code
	@echo "$(BLUE)Formatting Go code$(NC)"
	@go fmt ./...
	@echo "$(GREEN)Code formatted$(NC)"

.PHONY: stop
stop: ## Stop any running RSS reader processes
	@echo "$(BLUE)Stopping RSS Reader processes$(NC)"
	@pkill -f "go run main.go" || true
	@pkill -f "rss-reader" || true
	@pkill -f "air" || true
	@echo "$(GREEN)Processes stopped$(NC)"

.PHONY: restart
restart: stop run ## Stop and restart the application

.PHONY: status
status: ## Show running processes
	@echo "$(BLUE)RSS Reader process status:$(NC)"
	@ps aux | grep -E "(go run main.go|rss-reader|air)" | grep -v grep || echo "$(YELLOW)No RSS Reader processes running$(NC)"

.PHONY: logs
logs: ## Show application logs (if running as service)
	@echo "$(BLUE)Application logs:$(NC)"
	@if [ -f rss-reader.log ]; then tail -f rss-reader.log; else echo "$(YELLOW)No log file found$(NC)"; fi

.PHONY: db-backup
db-backup: ## Backup the SQLite database
	@echo "$(BLUE)Backing up database$(NC)"
	@if [ -f rss_reader.db ]; then \
		cp rss_reader.db rss_reader_backup_$(shell date +%Y%m%d_%H%M%S).db; \
		echo "$(GREEN)Database backed up$(NC)"; \
	else \
		echo "$(YELLOW)No database file found$(NC)"; \
	fi

.PHONY: db-restore
db-restore: ## Restore database from backup (use: make db-restore BACKUP=filename)
	@if [ -z "$(BACKUP)" ]; then \
		echo "$(RED)Usage: make db-restore BACKUP=filename$(NC)"; \
		echo "$(YELLOW)Available backups:$(NC)"; \
		ls -la rss_reader_backup_*.db 2>/dev/null || echo "$(YELLOW)No backup files found$(NC)"; \
	elif [ -f "$(BACKUP)" ]; then \
		echo "$(BLUE)Restoring database from $(BACKUP)$(NC)"; \
		cp $(BACKUP) rss_reader.db; \
		echo "$(GREEN)Database restored$(NC)"; \
	else \
		echo "$(RED)Backup file $(BACKUP) not found$(NC)"; \
	fi

.PHONY: db-reset
db-reset: ## Reset database (WARNING: This will delete all data)
	@echo "$(RED)WARNING: This will delete all RSS data!$(NC)"
	@read -p "Are you sure? (y/N) " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		rm -f rss_reader.db; \
		echo "$(GREEN)Database reset$(NC)"; \
	else \
		echo "$(YELLOW)Operation cancelled$(NC)"; \
	fi

.PHONY: version
version: ## Show application version information
	@echo "$(CYAN)RSS Reader Version Information$(NC)"
	@echo "Version: $(GREEN)v$(VERSION)$(NC)"
	@echo "Build Time: $(YELLOW)$(BUILD_TIME)$(NC)"
	@echo "Git Commit: $(PURPLE)$(GIT_COMMIT)$(NC)"

.PHONY: docker-build
docker-build: ## Build Docker image
	@echo "$(BLUE)Building Docker image$(NC)"
	@docker build -t $(APP_NAME):$(VERSION) -t $(APP_NAME):latest .
	@echo "$(GREEN)Docker image built: $(APP_NAME):$(VERSION)$(NC)"

.PHONY: docker-run
docker-run: ## Run application in Docker container
	@echo "$(BLUE)Running $(APP_NAME) in Docker$(NC)"
	@docker run -d --name $(APP_NAME) -p 8080:8080 -v $(PWD)/data:/app/data $(APP_NAME):latest
	@echo "$(GREEN)Container started: http://localhost:8080$(NC)"

.PHONY: docker-stop
docker-stop: ## Stop Docker container
	@echo "$(BLUE)Stopping Docker container$(NC)"
	@docker stop $(APP_NAME) || true
	@docker rm $(APP_NAME) || true
	@echo "$(GREEN)Container stopped$(NC)"

.PHONY: release
release: clean deps test build-all ## Prepare a release (clean, test, build all platforms)
	@echo "$(GREEN)Release preparation completed for v$(VERSION)$(NC)"
	@echo "$(YELLOW)Binaries available in bin/ directory$(NC)"

.PHONY: serve
serve: build ## Build and serve the application
	@echo "$(BLUE)Starting built binary$(NC)"
	@./bin/$(BINARY_NAME)

.PHONY: quick
quick: ## Quick start (alias for run)
	@make run

.PHONY: all
all: clean deps format lint test build ## Run complete build pipeline

# File targets
bin/$(BINARY_NAME): $(GO_FILES)
	@make build

# Create bin directory if it doesn't exist
bin:
	@mkdir -p bin

# Help target should be first for default
.DEFAULT: help