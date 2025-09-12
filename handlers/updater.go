package handlers

import (
	"time"

	"github.com/mmcdole/gofeed"
	"rss-reader/models"
)

// RSSUpdater fetches all feeds periodically and adds new articles to the DB
func RSSUpdater() {
	parser := gofeed.NewParser()
	for {
		var feeds []models.Feed
		DB.Find(&feeds)

		for _, f := range feeds {
			feedData, err := parser.ParseURL(f.URL)
			if err != nil {
				continue
			}

			for _, item := range feedData.Items {
				var count int64
				DB.Model(&models.Article{}).Where("feed_id=? AND link=?", f.ID, item.Link).Count(&count)

				if count == 0 && item.PublishedParsed != nil {
					// Get content from Description or Content field
					content := ""
					if item.Description != "" {
						content = item.Description
					} else if item.Content != "" {
						content = item.Content
					}
					
					DB.Create(&models.Article{
						FeedID:    f.ID,
						Title:     item.Title,
						Link:      item.Link,
						Content:   content,
						Published: *item.PublishedParsed,
						Read:      false,
					})
				}
			}
		}

		// Wait 15 minutes before next update
		time.Sleep(15 * time.Minute)
	}
}
