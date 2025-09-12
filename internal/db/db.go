package db

import (
    "database/sql"
    "fmt"
    _ "modernc.org/sqlite"
    "os"
)

var DB *sql.DB

func InitDB() error {
    var err error
    DB, err = sql.Open("sqlite", "./rss_reader.db")
    if err != nil {
        return fmt.Errorf("failed to open database: %v", err)
    }

    schema, err := os.ReadFile("internal/db/schema.sql")
    if err != nil {
        return fmt.Errorf("failed to read schema: %v", err)
    }

    _, err = DB.Exec(string(schema))
    if err != nil {
        return fmt.Errorf("failed to initialize schema: %v", err)
    }

    return nil
}
