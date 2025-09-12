package opml

import (
	"encoding/xml"
	"io"
	"strings"
)

// OPML represents the structure of an OPML file
type OPML struct {
	XMLName xml.Name `xml:"opml"`
	Version string   `xml:"version,attr"`
	Head    Head     `xml:"head"`
	Body    Body     `xml:"body"`
}

// Head contains metadata about the OPML file
type Head struct {
	Title        string `xml:"title,omitempty"`
	DateCreated  string `xml:"dateCreated,omitempty"`
	DateModified string `xml:"dateModified,omitempty"`
	OwnerName    string `xml:"ownerName,omitempty"`
	OwnerEmail   string `xml:"ownerEmail,omitempty"`
}

// Body contains the outline structure
type Body struct {
	Outlines []Outline `xml:"outline"`
}

// Outline represents either a category or a feed
type Outline struct {
	Text     string    `xml:"text,attr,omitempty"`
	Title    string    `xml:"title,attr,omitempty"`
	Type     string    `xml:"type,attr,omitempty"`
	XMLURL   string    `xml:"xmlUrl,attr,omitempty"`
	HTMLURL  string    `xml:"htmlUrl,attr,omitempty"`
	Category string    `xml:"category,attr,omitempty"`
	Outlines []Outline `xml:"outline,omitempty"`
}

// ParseOPML parses an OPML file from a reader
func ParseOPML(r io.Reader) (*OPML, error) {
	var opml OPML
	decoder := xml.NewDecoder(r)
	err := decoder.Decode(&opml)
	if err != nil {
		return nil, err
	}
	return &opml, nil
}

// GenerateOPML creates an OPML structure from feed data
func GenerateOPML(title, ownerName, ownerEmail string, categories map[string][]Feed) *OPML {
	opml := &OPML{
		Version: "2.0",
		Head: Head{
			Title:     title,
			OwnerName: ownerName,
			OwnerEmail: ownerEmail,
		},
	}

	// Create outlines for each category
	for categoryName, feeds := range categories {
		categoryOutline := Outline{
			Text:  categoryName,
			Title: categoryName,
		}

		// Add feeds to this category
		for _, feed := range feeds {
			feedOutline := Outline{
				Text:    feed.Title,
				Title:   feed.Title,
				Type:    "rss",
				XMLURL:  feed.URL,
				HTMLURL: feed.HTMLURL,
			}
			categoryOutline.Outlines = append(categoryOutline.Outlines, feedOutline)
		}

		opml.Body.Outlines = append(opml.Body.Outlines, categoryOutline)
	}

	return opml
}

// Feed represents a feed for OPML generation
type Feed struct {
	Title   string
	URL     string
	HTMLURL string
}

// ExtractFeeds extracts all feeds from an OPML structure, flattening the hierarchy
func (opml *OPML) ExtractFeeds() []FeedWithCategory {
	var feeds []FeedWithCategory
	
	for _, outline := range opml.Body.Outlines {
		feeds = append(feeds, extractFeedsFromOutline(outline, outline.Text)...)
	}
	
	return feeds
}

// FeedWithCategory represents a feed with its category information
type FeedWithCategory struct {
	Title    string
	URL      string
	HTMLURL  string
	Category string
}

// extractFeedsFromOutline recursively extracts feeds from an outline
func extractFeedsFromOutline(outline Outline, categoryName string) []FeedWithCategory {
	var feeds []FeedWithCategory
	
	// If this outline has an xmlUrl, it's a feed
	if outline.XMLURL != "" {
		feeds = append(feeds, FeedWithCategory{
			Title:    getTitle(outline),
			URL:      outline.XMLURL,
			HTMLURL:  outline.HTMLURL,
			Category: categoryName,
		})
	}
	
	// Process child outlines
	for _, childOutline := range outline.Outlines {
		childCategoryName := categoryName
		// If child has no xmlUrl but has text/title, it might be a subcategory
		if childOutline.XMLURL == "" && (childOutline.Text != "" || childOutline.Title != "") {
			childCategoryName = getTitle(childOutline)
		}
		feeds = append(feeds, extractFeedsFromOutline(childOutline, childCategoryName)...)
	}
	
	return feeds
}

// getTitle gets the best title from an outline
func getTitle(outline Outline) string {
	if outline.Title != "" {
		return strings.TrimSpace(outline.Title)
	}
	if outline.Text != "" {
		return strings.TrimSpace(outline.Text)
	}
	return "Untitled"
}

// ToXML converts the OPML structure to XML bytes
func (opml *OPML) ToXML() ([]byte, error) {
	output, err := xml.MarshalIndent(opml, "", "  ")
	if err != nil {
		return nil, err
	}
	
	// Add XML declaration
	xmlDecl := []byte(xml.Header)
	return append(xmlDecl, output...), nil
}