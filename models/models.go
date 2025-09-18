package models

import (
	"time"
	"gorm.io/gorm"
)

type User struct {
	ID           uint   `gorm:"primaryKey"`
	Username     string `gorm:"unique"`
	PasswordHash string
	Categories   []Category    `gorm:"foreignKey:UserID"`
	UserFeeds    []UserFeed    `gorm:"foreignKey:UserID"`
	UserArticles []UserArticle `gorm:"foreignKey:UserID"`
}

type Category struct {
	ID        uint   `gorm:"primaryKey"`
	Name      string
	UserID    uint
	UserFeeds []UserFeed `gorm:"foreignKey:CategoryID"`
}

// Global feed - stored once per unique URL
type Feed struct {
	ID         uint      `gorm:"primaryKey"`
	URL        string    `gorm:"unique"`
	Title      string
	LastFetch  time.Time
	Articles   []Article  `gorm:"foreignKey:FeedID"`
	UserFeeds  []UserFeed `gorm:"foreignKey:FeedID"`
}

// User's subscription to a feed
type UserFeed struct {
	ID         uint `gorm:"primaryKey"`
	UserID     uint
	FeedID     uint
	CategoryID uint
	User       User     `gorm:"constraint:OnDelete:CASCADE;"`
	Feed       Feed     `gorm:"constraint:OnDelete:CASCADE;"`
	Category   Category `gorm:"constraint:OnDelete:CASCADE;"`
}

// Global article - stored once per unique link
type Article struct {
	ID           uint      `gorm:"primaryKey"`
	FeedID       uint
	Title        string
	Link         string    `gorm:"uniqueIndex"`
	Content      string    `gorm:"type:text"`
	FaviconURL   string
	Published    time.Time
	Feed         Feed          `gorm:"constraint:OnDelete:CASCADE;"`
	UserArticles []UserArticle
}

// User's relationship to an article (read/starred status)
type UserArticle struct {
	ID        uint `gorm:"primaryKey"`
	UserID    uint `gorm:"uniqueIndex:idx_user_article"`
	ArticleID uint `gorm:"uniqueIndex:idx_user_article"`
	Read      bool
	Starred   bool
	User      User    `gorm:"constraint:OnDelete:CASCADE;"`
	Article   Article `gorm:"constraint:OnDelete:CASCADE;"`
}

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(&User{}, &Category{}, &Feed{}, &UserFeed{}, &Article{}, &UserArticle{})
}
