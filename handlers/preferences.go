package handlers

import (
	"encoding/json"
	"net/http"
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

