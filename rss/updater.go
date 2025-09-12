package main

import (
    "time"
    "github.com/mmcdole/gofeed"
    "rss-reader/models"
)

func rssUpdater() {
    parser := gofeed.NewParser()
    for {
        var feeds []models.Feed
        db.Find(&feeds)
        for _, f := range feeds {
            feedData, err := parser.ParseURL(f.URL)
            if err != nil {
                continue
            }
            for _, item := range feedData.Items {
                var count int64
                db.Model(&models.Article{}).Where("feed_id=? AND link=?", f.ID, item.Link).Count(&count)
                if count == 0 {
                    db.Create(&models.Article{
                        FeedID: f.ID,
                        Title: item.Title,
                        Link: item.Link,
                        Published: *item.PublishedParsed,
                        Read: false,
                    })
                }
            }
        }
        time.Sleep(15 * time.Minute)
    }
}
