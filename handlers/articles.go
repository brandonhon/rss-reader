package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"rss-reader/models"
)

func IndexHandler(w http.ResponseWriter, r *http.Request, username string) {
	categories := []models.Category{}
	DB.Where("user_id = ?", GetUserID(username)).Find(&categories)

	data := struct {
		Username   string
		Categories []models.Category
	}{
		Username:   username,
		Categories: categories,
	}
	Templates.ExecuteTemplate(w, "layout.html", data)
}

func MarkArticleReadHandler(w http.ResponseWriter, r *http.Request, username string) {
	userID := GetUserID(username)
	idStr := r.FormValue("id")
	articleID, _ := strconv.Atoi(idStr)
	
	// Create or update user article record
	var userArticle models.UserArticle
	result := DB.Where("user_id = ? AND article_id = ?", userID, articleID).First(&userArticle)
	
	if result.Error != nil {
		// Create new record
		userArticle = models.UserArticle{
			UserID:    userID,
			ArticleID: uint(articleID),
			Read:      true,
			Starred:   false,
		}
		DB.Create(&userArticle)
	} else {
		// Update existing record
		DB.Model(&userArticle).Update("read", true)
	}
	
	w.WriteHeader(http.StatusOK)
}

func MarkAllReadHandler(w http.ResponseWriter, r *http.Request, username string) {
	userID := GetUserID(username)
	catStr := r.FormValue("category")
	filterStr := r.FormValue("filter")
	
	if catStr != "" {
		// Mark all read in specific category
		catID, _ := strconv.Atoi(catStr)
		var feeds []models.Feed
		DB.Where("category_id = ?", catID).Find(&feeds)
		for _, f := range feeds {
			DB.Model(&models.Article{}).Where("feed_id=? AND read = ?", f.ID, false).Update("read", true)
		}
	} else if filterStr == "fresh" {
		// Mark all unread articles as read (for user's feeds only)
		DB.Model(&models.Article{}).
			Joins("JOIN feeds ON feeds.id = articles.feed_id").
			Joins("JOIN categories ON categories.id = feeds.category_id").
			Where("categories.user_id = ? AND articles.read = ?", userID, false).
			Update("read", true)
	} else {
		// Mark all articles as read (for user's feeds only)
		DB.Model(&models.Article{}).
			Joins("JOIN feeds ON feeds.id = articles.feed_id").
			Joins("JOIN categories ON categories.id = feeds.category_id").
			Where("categories.user_id = ? AND articles.read = ?", userID, false).
			Update("read", true)
	}
	w.WriteHeader(http.StatusOK)
}

func GetArticleContentHandler(w http.ResponseWriter, r *http.Request, username string) {
	idStr := r.URL.Query().Get("id")
	id, _ := strconv.Atoi(idStr)
	var article models.Article
	if err := DB.First(&article, id).Error; err != nil {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(article)
}

func StarArticleHandler(w http.ResponseWriter, r *http.Request, username string) {
	userID := GetUserID(username)
	r.ParseForm()
	idStr := r.FormValue("id")
	starredStr := r.FormValue("starred")
	
	articleID, _ := strconv.Atoi(idStr)
	starred := starredStr == "true"
	
	// Verify user has access to this article through their feed subscriptions
	var count int64
	DB.Table("articles").
		Joins("JOIN feeds ON feeds.id = articles.feed_id").
		Joins("JOIN user_feeds ON user_feeds.feed_id = feeds.id").
		Where("articles.id = ? AND user_feeds.user_id = ?", articleID, userID).
		Count(&count)
	
	if count == 0 {
		http.Error(w, "Article not found", http.StatusNotFound)
		return
	}
	
	// Create or update user article record
	var userArticle models.UserArticle
	result := DB.Where("user_id = ? AND article_id = ?", userID, articleID).First(&userArticle)
	
	if result.Error != nil {
		// Create new record
		userArticle = models.UserArticle{
			UserID:    userID,
			ArticleID: uint(articleID),
			Read:      false,
			Starred:   starred,
		}
		DB.Create(&userArticle)
	} else {
		// Update existing record
		DB.Model(&userArticle).Update("starred", starred)
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"starred": starred,
	})
}
