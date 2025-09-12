package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/mmcdole/gofeed"
	"rss-reader/internal/opml"
	"rss-reader/internal/scraper"
	"rss-reader/models"
)

// ImportOPMLHandler handles OPML file uploads and imports feeds
func ImportOPMLHandler(w http.ResponseWriter, r *http.Request, username string) {
	userID := GetUserID(username)

	// Parse multipart form
	err := r.ParseMultipartForm(10 << 20) // 10 MB max
	if err != nil {
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}

	// Get uploaded file
	file, _, err := r.FormFile("opml")
	if err != nil {
		http.Error(w, "Unable to get uploaded file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Parse OPML
	opmlData, err := opml.ParseOPML(file)
	if err != nil {
		http.Error(w, "Unable to parse OPML file: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Extract feeds
	feeds := opmlData.ExtractFeeds()
	
	var imported int
	var failed []string
	
	parser := gofeed.NewParser()
	parser.Client = &http.Client{Timeout: 10 * time.Second}
	articleScraper := scraper.New()

	for _, feedInfo := range feeds {
		if feedInfo.URL == "" {
			continue
		}

		log.Printf("Importing feed: %s (%s)", feedInfo.Title, feedInfo.URL)

		// Validate RSS feed by parsing it
		feedData, err := parser.ParseURL(feedInfo.URL)
		if err != nil {
			log.Printf("Failed to validate feed %s: %v", feedInfo.URL, err)
			failed = append(failed, fmt.Sprintf("%s (%s): %v", feedInfo.Title, feedInfo.URL, err))
			continue
		}

		// Use feed title from RSS if available, otherwise use OPML title
		feedTitle := feedData.Title
		if feedTitle == "" {
			feedTitle = feedInfo.Title
		}

		// Find or create category
		categoryName := strings.TrimSpace(feedInfo.Category)
		if categoryName == "" {
			categoryName = "Imported"
		}

		var category models.Category
		err = DB.Where("name = ? AND user_id = ?", categoryName, userID).First(&category).Error
		if err != nil {
			// Create new category
			category = models.Category{
				Name:   categoryName,
				UserID: userID,
			}
			if err := DB.Create(&category).Error; err != nil {
				log.Printf("Failed to create category %s: %v", categoryName, err)
				failed = append(failed, fmt.Sprintf("%s: failed to create category", feedInfo.Title))
				continue
			}
		}

		// Check if feed already exists globally
		var feed models.Feed
		err = DB.Where("url = ?", feedInfo.URL).First(&feed).Error
		if err != nil {
			// Create new global feed
			feed = models.Feed{
				URL:       feedInfo.URL,
				Title:     feedTitle,
				LastFetch: time.Now(),
			}

			if err := DB.Create(&feed).Error; err != nil {
				log.Printf("Failed to create feed %s: %v", feedInfo.URL, err)
				failed = append(failed, fmt.Sprintf("%s: failed to create feed", feedInfo.Title))
				continue
			}
		}

		// Check if user already has this feed
		var existingUserFeed models.UserFeed
		err = DB.Where("user_id = ? AND feed_id = ?", userID, feed.ID).First(&existingUserFeed).Error
		if err == nil {
			// User already has this feed, skip
			log.Printf("User already subscribed to feed: %s", feedInfo.URL)
			continue
		}

		// Create user's subscription to this feed
		userFeed := models.UserFeed{
			UserID:     userID,
			FeedID:     feed.ID,
			CategoryID: category.ID,
		}

		if err := DB.Create(&userFeed).Error; err != nil {
			log.Printf("Failed to create user feed subscription: %v", err)
			failed = append(failed, fmt.Sprintf("%s: failed to create subscription", feedInfo.Title))
			continue
		}

		// Import initial articles in background
		go func(feedData *gofeed.Feed, feed models.Feed) {
			for _, item := range feedData.Items {
				if item.PublishedParsed == nil {
					continue
				}

				var existingArticle models.Article
				err := DB.Where("link = ?", item.Link).First(&existingArticle).Error
				if err != nil {
					// Article doesn't exist, create it
					rssContent := ""
					if item.Description != "" {
						rssContent = item.Description
					} else if item.Content != "" {
						rssContent = item.Content
					}

					fullContent := rssContent
					faviconURL := ""
					if item.Link != "" {
						if articleContent, err := articleScraper.ExtractContent(item.Link); err == nil && articleContent.Content != "" {
							fullContent = articleContent.Content
							faviconURL = articleContent.FaviconURL
						} else {
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
					}
				}
			}
		}(feedData, feed)

		imported++
	}

	// Return results
	result := map[string]interface{}{
		"imported": imported,
		"total":    len(feeds),
		"failed":   failed,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// ExportOPMLHandler exports user's feeds as OPML
func ExportOPMLHandler(w http.ResponseWriter, r *http.Request, username string) {
	userID := GetUserID(username)

	// Get all categories for this user
	var categories []models.Category
	DB.Where("user_id = ?", userID).Find(&categories)

	// Build feed data structure
	feedsByCategory := make(map[string][]opml.Feed)

	for _, category := range categories {
		// Get feeds for this category
		var userFeeds []models.UserFeed
		DB.Where("user_id = ? AND category_id = ?", userID, category.ID).
			Preload("Feed").Find(&userFeeds)

		var feeds []opml.Feed
		for _, userFeed := range userFeeds {
			feeds = append(feeds, opml.Feed{
				Title:   userFeed.Feed.Title,
				URL:     userFeed.Feed.URL,
				HTMLURL: "", // We don't store HTML URLs currently
			})
		}

		if len(feeds) > 0 {
			feedsByCategory[category.Name] = feeds
		}
	}

	// Generate OPML
	opmlData := opml.GenerateOPML(
		fmt.Sprintf("%s's RSS Feeds", username),
		username,
		"", // We don't have email stored
		feedsByCategory,
	)

	// Convert to XML
	xmlData, err := opmlData.ToXML()
	if err != nil {
		http.Error(w, "Failed to generate OPML", http.StatusInternalServerError)
		return
	}

	// Set headers for file download
	w.Header().Set("Content-Type", "text/xml")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s-feeds.opml\"", username))
	w.Header().Set("Content-Length", strconv.Itoa(len(xmlData)))

	// Write OPML data
	w.Write(xmlData)
}