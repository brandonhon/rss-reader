package main

import (
	"fmt"
	"log"
	"net/http"
	"html/template"
	"os"

	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"rss-reader/models"
	"rss-reader/handlers"
)

var (
	db        *gorm.DB
	store     = sessions.NewCookieStore([]byte("super-secret-key"))
	templates *template.Template
)



func createInitialUser() {
	var count int64
	db.Model(&models.User{}).Count(&count)
	if count == 0 {
		password := "admin123"
		hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		db.Create(&models.User{
			Username:     "admin",
			PasswordHash: string(hash),
		})
		fmt.Println("Created default admin user: admin / admin123")
	}
}

func main() {
	// Get database file from environment variable or use default
	dbFile := os.Getenv("DB_FILE")
	if dbFile == "" {
		dbFile = "rss_reader.db"
	}
	
	var err error
	db, err = gorm.Open(sqlite.Open(dbFile), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}
	
	fmt.Printf("Using database: %s\n", dbFile)

	if err := models.Migrate(db); err != nil {
		log.Fatal(err)
	}

	if err := models.Migrate(db); err != nil {
		log.Fatal(err)
	}

	// Create default admin user if DB empty
	createInitialUser()

	templates = template.Must(template.ParseGlob("templates/*.html"))

	// Share DB, store, and templates with handlers
	handlers.DB = db
	handlers.Store = store
	handlers.Templates = templates

	r := mux.NewRouter()
	r.HandleFunc("/", handlers.AuthMiddleware(handlers.IndexHandler)).Methods("GET")
	r.HandleFunc("/preferences", handlers.AuthMiddleware(handlers.PreferencesHandler)).Methods("GET")
	r.HandleFunc("/login", handlers.LoginHandler).Methods("GET", "POST")
	r.HandleFunc("/logout", handlers.LogoutHandler).Methods("GET")
	r.HandleFunc("/mark-read", handlers.AuthMiddleware(handlers.MarkArticleReadHandler)).Methods("POST")
	r.HandleFunc("/mark-all-read", handlers.AuthMiddleware(handlers.MarkAllReadHandler)).Methods("POST")
	r.HandleFunc("/star-article", handlers.AuthMiddleware(handlers.StarArticleHandler)).Methods("POST")
	r.HandleFunc("/article", handlers.AuthMiddleware(handlers.GetArticleContentHandler)).Methods("GET")
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	r.HandleFunc("/categories", handlers.AuthMiddleware(handlers.CategoriesHandler)).Methods("GET")
	r.HandleFunc("/user-feeds", handlers.AuthMiddleware(handlers.UserFeedsHandler)).Methods("GET")
	r.HandleFunc("/add-feed", handlers.AuthMiddleware(handlers.AddFeedHandler)).Methods("POST")
	r.HandleFunc("/list-feeds", handlers.AuthMiddleware(handlers.ListFeedsHandler)).Methods("GET")
	r.HandleFunc("/delete-feed", handlers.AuthMiddleware(handlers.DeleteFeedHandler)).Methods("POST")
	r.HandleFunc("/create-category", handlers.AuthMiddleware(handlers.CreateCategoryHandler)).Methods("POST")
	r.HandleFunc("/add-category", handlers.AuthMiddleware(handlers.AddCategoryHandler)).Methods("POST")
	r.HandleFunc("/system-info", handlers.AuthMiddleware(handlers.SystemInfoHandler)).Methods("GET")
	r.HandleFunc("/import-opml", handlers.AuthMiddleware(handlers.ImportOPMLHandler)).Methods("POST")
	r.HandleFunc("/export-opml", handlers.AuthMiddleware(handlers.ExportOPMLHandler)).Methods("GET")



	go handlers.RSSUpdater()

	fmt.Println("Server running at http://localhost:8080")
	http.ListenAndServe(":8080", r)
}
