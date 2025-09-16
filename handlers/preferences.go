package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"
	"rss-reader/models"
)

// PreferencesHandler serves the preferences page
func PreferencesHandler(w http.ResponseWriter, r *http.Request, username string) {
	data := struct {
		Username string
	}{
		Username: username,
	}
	Templates.ExecuteTemplate(w, "preferences.html", data)
}

// AddCategoryHandler creates a new category
func AddCategoryHandler(w http.ResponseWriter, r *http.Request, username string) {
	userID := GetUserID(username)
	name := r.FormValue("name")
	
	if name == "" {
		http.Error(w, "Category name is required", http.StatusBadRequest)
		return
	}
	
	category := models.Category{
		Name:   name,
		UserID: userID,
	}
	
	if err := DB.Create(&category).Error; err != nil {
		http.Error(w, "Failed to create category", http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Category created successfully",
		"category": category,
	})
}

// SystemInfoHandler returns system information
func SystemInfoHandler(w http.ResponseWriter, r *http.Request, username string) {
	userID := GetUserID(username)
	
	var articlesCount int64
	var feedsCount int64
	var categoriesCount int64
	
	// Count user's articles through UserArticle relationship
	DB.Model(&models.UserArticle{}).Where("user_id = ?", userID).Count(&articlesCount)
	
	// Count user's feeds through UserFeed relationship
	DB.Model(&models.UserFeed{}).Where("user_id = ?", userID).Count(&feedsCount)
	
	// Count user's categories
	DB.Model(&models.Category{}).Where("user_id = ?", userID).Count(&categoriesCount)
	
	// Calculate uptime (simplified - this would be better tracked globally)
	startTime := time.Now().Add(-time.Hour) // Placeholder
	uptime := time.Since(startTime).Round(time.Second).String()
	
	data := map[string]interface{}{
		"articles":   articlesCount,
		"feeds":      feedsCount,
		"categories": categoriesCount,
		"uptime":     uptime,
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

// DeleteFeedHandler removes a feed subscription for the user
func DeleteFeedHandler(w http.ResponseWriter, r *http.Request, username string) {
	userID := GetUserID(username)
	feedIDStr := r.FormValue("id")
	
	if feedIDStr == "" {
		http.Error(w, "Feed ID is required", http.StatusBadRequest)
		return
	}
	
	feedID, err := strconv.ParseUint(feedIDStr, 10, 32)
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
	
	// Delete user's article relationships for this feed
	DB.Where("user_id = ? AND article_id IN (SELECT id FROM articles WHERE feed_id = ?)", userID, feedID).Delete(&models.UserArticle{})
	
	// Check if any other users are subscribed to this feed
	var count int64
	DB.Model(&models.UserFeed{}).Where("feed_id = ?", feedID).Count(&count)
	
	if count == 0 {
		// No other users subscribed, we can safely delete the feed and its articles
		DB.Where("feed_id = ?", feedID).Delete(&models.Article{})
		DB.Delete(&models.Feed{}, feedID)
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Feed subscription removed successfully",
	})
}