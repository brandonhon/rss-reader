package handlers

import (
	"log"
	"time"

	"github.com/mmcdole/gofeed"
	"rss-reader/internal/scraper"
	"rss-reader/models"
)

// RSSUpdater fetches all feeds periodically and adds new articles to the DB
func RSSUpdater() {
	parser := gofeed.NewParser()
	articleScraper := scraper.New()
	
	for {
		var feeds []models.Feed
		DB.Find(&feeds)

		for _, f := range feeds {
			log.Printf("Updating feed: %s", f.URL)
			feedData, err := parser.ParseURL(f.URL)
			if err != nil {
				log.Printf("Error parsing feed %s: %v", f.URL, err)
				continue
			}

			for _, item := range feedData.Items {
				var existingArticle models.Article
				err := DB.Where("link = ?", item.Link).First(&existingArticle).Error

				if err != nil && item.PublishedParsed != nil {
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
						log.Printf("Fetching full content for: %s", item.Title)
						if articleContent, err := articleScraper.ExtractContent(item.Link); err == nil && articleContent.Content != "" {
							fullContent = articleContent.Content
							faviconURL = articleContent.FaviconURL
							log.Printf("Successfully extracted content and favicon for: %s", item.Title)
						} else {
							log.Printf("Failed to extract content for %s: %v", item.Title, err)
							// Fall back to RSS content, but still try to get favicon
							faviconURL = articleScraper.ExtractFavicon(item.Link)
						}
					}
					
					article := &models.Article{
						FeedID:     f.ID,
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

		log.Printf("Feed update complete, sleeping for 15 minutes...")
		// Wait 15 minutes before next update
		time.Sleep(15 * time.Minute)
	}
}
