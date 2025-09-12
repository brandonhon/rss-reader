package models

import (
	"time"
	"gorm.io/gorm"
)

type User struct {
	ID           uint   `gorm:"primaryKey"`
	Username     string `gorm:"unique"`
	PasswordHash string
	Categories   []Category
}

type Category struct {
	ID     uint   `gorm:"primaryKey"`
	Name   string
	UserID uint
	Feeds  []Feed
}

type Feed struct {
	ID         uint   `gorm:"primaryKey"`
	URL        string
	Title      string
	CategoryID uint
	Articles   []Article
}

type Article struct {
	ID        uint      `gorm:"primaryKey"`
	FeedID    uint
	Title     string
	Link      string
	Content   string    `gorm:"type:text"`
	Published time.Time
	Read      bool
	Starred   bool
}

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(&User{}, &Category{}, &Feed{}, &Article{})
}
