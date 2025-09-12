package handlers

import (
	"html/template"
	"rss-reader/models"

	"github.com/gorilla/sessions"
	"gorm.io/gorm"
	"golang.org/x/crypto/bcrypt"
)

// Shared database instance
var DB *gorm.DB

// Shared templates
var Templates *template.Template

// Shared session store
var Store *sessions.CookieStore

// GetUserID returns the database ID for a given username
func GetUserID(username string) uint {
	var user models.User
	if err := DB.Where("username = ?", username).First(&user).Error; err != nil {
		return 0
	}
	return user.ID
}

// HashPassword returns a bcrypt hash of the password
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPasswordHash compares a password with its bcrypt hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
