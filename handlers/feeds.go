package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"rss-reader/internal/scraper"
	"rss-reader/models"
	"strconv"
	"strings"
	"time"

	"github.com/mmcdole/gofeed"
)

func CategoriesHandler(w http.ResponseWriter, r *http.Request, username string) {
	userID := GetUserID(username)
	
	type CategoryWithCount struct {
		models.Category
		UnreadCount int `json:"unread_count"`
	}
	
	var categories []models.Category
	DB.Where("user_id = ?", userID).Find(&categories)
	
	var result []CategoryWithCount
	for _, cat := range categories {
		// Count unread articles in this category
		var unreadCount int64
		DB.Model(&models.Article{}).
			Joins("JOIN feeds ON feeds.id = articles.feed_id").
			Where("feeds.category_id = ? AND articles.read = ?", cat.ID, false).
			Count(&unreadCount)
		
		result = append(result, CategoryWithCount{
			Category:    cat,
			UnreadCount: int(unreadCount),
		})
	}
	
	json.NewEncoder(w).Encode(result)
}

func UserFeedsHandler(w http.ResponseWriter, r *http.Request, username string) {
	userID := GetUserID(username)
	filter := r.URL.Query().Get("filter")
	categoryID := r.URL.Query().Get("category")

	// Type for response with user-specific read/starred status
	type ArticleWithUserData struct {
		models.Article
		FeedTitle string `json:"feed_title"`
		FeedURL   string `json:"feed_url"`
		Read      bool   `json:"Read"`
		Starred   bool   `json:"Starred"`
	}

	var result []ArticleWithUserData

	// Base query to get articles from feeds the user subscribes to
	query := DB.Table("articles").
		Select(`
			articles.*,
			feeds.title as feed_title,
			feeds.url as feed_url,
			COALESCE(user_articles.read, false) as read,
			COALESCE(user_articles.starred, false) as starred
		`).
		Joins("JOIN feeds ON feeds.id = articles.feed_id").
		Joins("JOIN user_feeds ON user_feeds.feed_id = feeds.id").
		Joins("LEFT JOIN user_articles ON user_articles.article_id = articles.id AND user_articles.user_id = ?", userID).
		Where("user_feeds.user_id = ?", userID)

	// Apply category filter if specified
	if categoryID != "" {
		if catID, err := strconv.Atoi(categoryID); err == nil {
			query = query.Where("user_feeds.category_id = ?", catID)
		}
	}

	// Apply read/starred filters
	switch filter {
	case "fresh":
		query = query.Where("COALESCE(user_articles.read, false) = ?", false)
	case "starred":
		query = query.Where("COALESCE(user_articles.starred, false) = ?", true)
	}

	// Get articles
	query.Order("articles.published desc").
		Limit(100).
		Scan(&result)

	json.NewEncoder(w).Encode(result)
}

func AddFeedHandler(w http.ResponseWriter, r *http.Request, username string) {
	r.ParseForm()
	userID := GetUserID(username)

	url := strings.TrimSpace(r.FormValue("url"))
	categoryName := strings.TrimSpace(r.FormValue("category"))

	if url == "" || categoryName == "" {
		http.Error(w, "URL and category are required", http.StatusBadRequest)
		return
	}

	// Validate RSS feed by parsing it
	parser := gofeed.NewParser()
	parser.Client = &http.Client{Timeout: 10 * time.Second}
	
	feedData, err := parser.ParseURL(url)
	if err != nil {
		http.Error(w, "Invalid RSS feed URL: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Check if feed already exists for this user
	var existingFeed models.Feed
	err = DB.Joins("JOIN categories ON categories.id = feeds.category_id").
		Where("feeds.url = ? AND categories.user_id = ?", url, userID).
		First(&existingFeed).Error
	if err == nil {
		http.Error(w, "Feed already exists", http.StatusConflict)
		return
	}

	// Find or create category
	var category models.Category
	err = DB.Where("name = ? AND user_id = ?", categoryName, userID).First(&category).Error
	if err != nil {
		// Create new category
		category = models.Category{
			Name:   categoryName,
			UserID: userID,
		}
		if err := DB.Create(&category).Error; err != nil {
			http.Error(w, "Failed to create category", http.StatusInternalServerError)
			return
		}
	}

	// Check if feed already exists globally
	var feed models.Feed
	err = DB.Where("url = ?", url).First(&feed).Error
	if err != nil {
		// Create new global feed
		feed = models.Feed{
			URL:       url,
			Title:     feedData.Title,
			LastFetch: time.Now(),
		}
		
		if err := DB.Create(&feed).Error; err != nil {
			http.Error(w, "Failed to create feed", http.StatusInternalServerError)
			return
		}
	}

	// Create user's subscription to this feed
	userFeed := models.UserFeed{
		UserID:     userID,
		FeedID:     feed.ID,
		CategoryID: category.ID,
	}
	
	if err := DB.Create(&userFeed).Error; err != nil {
		http.Error(w, "Failed to create user feed subscription", http.StatusInternalServerError)
		return
	}

	// Immediately fetch initial articles
	go func() {
		articleScraper := scraper.New()
		for _, item := range feedData.Items {
			if item.PublishedParsed != nil {
				var existingArticle models.Article
				err := DB.Where("link = ?", item.Link).First(&existingArticle).Error
				if err != nil {
					// First get content from RSS feed as fallback
					rssContent := ""
					if item.Description != "" {
						rssContent = item.Description
					} else if item.Content != "" {
						rssContent = item.Content
					}

					// Try to fetch full article content
					fullContent := rssContent
					faviconURL := ""
					if item.Link != "" {
						log.Printf("Fetching full content for new article: %s", item.Title)
						if articleContent, err := articleScraper.ExtractContent(item.Link); err == nil && articleContent.Content != "" {
							fullContent = articleContent.Content
							faviconURL = articleContent.FaviconURL
							log.Printf("Successfully extracted content and favicon for new article: %s", item.Title)
						} else {
							log.Printf("Failed to extract content for new article %s: %v", item.Title, err)
							// Fall back to RSS content, but still try to get favicon
							faviconURL = articleScraper.ExtractFavicon(item.Link)
						}
					}
					
					article := &models.Article{
						FeedID:     feed.ID,
						Title:      item.Title,
						Link:       item.Link,
						Content:    fullContent,
						FaviconURL: faviconURL,
						Published:  *item.PublishedParsed,
					}
					
					if err := DB.Create(article).Error; err != nil {
						log.Printf("Error creating article %s: %v", item.Title, err)
					} else {
						log.Printf("Added article: %s", item.Title)
					}
				}
			}
		}
	}()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"feed":    feed,
		"message": "Feed added successfully",
	})
}

// ListFeedsHandler returns all feeds for a user organized by category
func ListFeedsHandler(w http.ResponseWriter, r *http.Request, username string) {
	userID := GetUserID(username)
	
	type FeedInfo struct {
		ID    uint   `json:"ID"`
		Title string `json:"Title"`
		URL   string `json:"URL"`
	}
	
	type CategoryWithFeeds struct {
		ID    uint       `json:"ID"`
		Name  string     `json:"Name"`
		Feeds []FeedInfo `json:"Feeds"`
	}
	
	var categories []models.Category
	DB.Where("user_id = ?", userID).Find(&categories)
	
	var result []CategoryWithFeeds
	for _, category := range categories {
		// Get feeds for this category and user
		var userFeeds []models.UserFeed
		DB.Where("user_id = ? AND category_id = ?", userID, category.ID).
			Preload("Feed").Find(&userFeeds)
		
		var feeds []FeedInfo
		for _, userFeed := range userFeeds {
			feeds = append(feeds, FeedInfo{
				ID:    userFeed.Feed.ID,
				Title: userFeed.Feed.Title,
				URL:   userFeed.Feed.URL,
			})
		}
		
		result = append(result, CategoryWithFeeds{
			ID:    category.ID,
			Name:  category.Name,
			Feeds: feeds,
		})
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// DeleteFeedHandler removes a user's subscription to a feed
func DeleteFeedHandler(w http.ResponseWriter, r *http.Request, username string) {
	userID := GetUserID(username)
	feedIDStr := r.URL.Query().Get("id")
	
	if feedIDStr == "" {
		http.Error(w, "Feed ID is required", http.StatusBadRequest)
		return
	}
	
	feedID, err := strconv.Atoi(feedIDStr)
	if err != nil {
		http.Error(w, "Invalid feed ID", http.StatusBadRequest)
		return
	}
	
	// Find user's subscription to this feed
	var userFeed models.UserFeed
	err = DB.Where("user_id = ? AND feed_id = ?", userID, feedID).First(&userFeed).Error
	if err != nil {
		http.Error(w, "Feed subscription not found", http.StatusNotFound)
		return
	}
	
	// Delete the user's subscription
	DB.Delete(&userFeed)
	
	// Check if any other users are subscribed to this feed
	var count int64
	DB.Model(&models.UserFeed{}).Where("feed_id = ?", feedID).Count(&count)
	
	if count == 0 {
		// No other users subscribed, we can safely delete the feed and its articles
		log.Printf("Deleting unused feed %d and its articles", feedID)
		DB.Where("feed_id = ?", feedID).Delete(&models.Article{})
		DB.Delete(&models.Feed{}, feedID)
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Feed subscription removed successfully"})
}

// CreateCategoryHandler creates a new category
func CreateCategoryHandler(w http.ResponseWriter, r *http.Request, username string) {
	userID := GetUserID(username)
	r.ParseForm()
	
	categoryName := strings.TrimSpace(r.FormValue("name"))
	if categoryName == "" {
		http.Error(w, "Category name is required", http.StatusBadRequest)
		return
	}
	
	// Check if category already exists
	var existingCategory models.Category
	err := DB.Where("name = ? AND user_id = ?", categoryName, userID).First(&existingCategory).Error
	if err == nil {
		http.Error(w, "Category already exists", http.StatusConflict)
		return
	}
	
	category := models.Category{
		Name:   categoryName,
		UserID: userID,
	}
	
	if err := DB.Create(&category).Error; err != nil {
		http.Error(w, "Failed to create category", http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(category)
}
