package handlers

import (
	"encoding/json"
	"net/http"
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
	var articles []models.Article

	filter := r.URL.Query().Get("filter")
	categoryID := r.URL.Query().Get("category")

	// Base query to get articles for this user
	query := DB.Joins("JOIN feeds ON feeds.id = articles.feed_id").
		Joins("JOIN categories ON categories.id = feeds.category_id").
		Where("categories.user_id = ?", userID)

	// Apply category filter if specified
	if categoryID != "" {
		if catID, err := strconv.Atoi(categoryID); err == nil {
			query = query.Where("categories.id = ?", catID)
		}
	}

	// Apply read/starred filters
	switch filter {
	case "fresh":
		query = query.Where("articles.read = ?", false)
	case "starred":
		query = query.Where("articles.starred = ?", true)
	}

	// Get articles with feed information
	query.Select("articles.*, feeds.title as feed_title, feeds.url as feed_url").
		Order("articles.published desc").
		Limit(100).
		Find(&articles)

	json.NewEncoder(w).Encode(articles)
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

	// Create the feed
	feed := models.Feed{
		URL:        url,
		Title:      feedData.Title,
		CategoryID: category.ID,
	}
	
	if err := DB.Create(&feed).Error; err != nil {
		http.Error(w, "Failed to create feed", http.StatusInternalServerError)
		return
	}

	// Immediately fetch initial articles
	go func() {
		for _, item := range feedData.Items {
			if item.PublishedParsed != nil {
				var count int64
				DB.Model(&models.Article{}).Where("feed_id = ? AND link = ?", feed.ID, item.Link).Count(&count)
				if count == 0 {
					// Get content from Description or Content field
					content := ""
					if item.Description != "" {
						content = item.Description
					} else if item.Content != "" {
						content = item.Content
					}
					
					DB.Create(&models.Article{
						FeedID:    feed.ID,
						Title:     item.Title,
						Link:      item.Link,
						Content:   content,
						Published: *item.PublishedParsed,
						Read:      false,
						Starred:   false,
					})
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
	
	var categories []models.Category
	DB.Where("user_id = ?", userID).Preload("Feeds").Find(&categories)
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
}

// DeleteFeedHandler removes a feed
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
	
	// Verify feed ownership through category
	var feed models.Feed
	err = DB.Joins("JOIN categories ON categories.id = feeds.category_id").
		Where("feeds.id = ? AND categories.user_id = ?", feedID, userID).
		First(&feed).Error
	if err != nil {
		http.Error(w, "Feed not found", http.StatusNotFound)
		return
	}
	
	// Delete associated articles first
	DB.Where("feed_id = ?", feedID).Delete(&models.Article{})
	
	// Delete the feed
	DB.Delete(&feed)
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Feed deleted successfully"})
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
