package scraper

import (
	"fmt"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/microcosm-cc/bluemonday"
)

// ArticleContent represents the extracted article content
type ArticleContent struct {
	Title       string
	Content     string
	Description string
	Author      string
	FaviconURL  string
	PublishedAt time.Time
}

// Scraper handles article content extraction
type Scraper struct {
	client    *http.Client
	sanitizer *bluemonday.Policy
}

// New creates a new scraper instance
func New() *Scraper {
	// Create HTTP client with timeout
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	// Create sanitization policy - allow most HTML but remove scripts, etc.
	policy := bluemonday.UGCPolicy()
	policy.AllowElements("article", "section", "header", "main", "aside", "nav", "footer")
	policy.AllowElements("h1", "h2", "h3", "h4", "h5", "h6")
	policy.AllowElements("p", "div", "span", "br", "hr")
	policy.AllowElements("strong", "em", "b", "i", "u", "s", "mark", "small", "del", "ins", "sub", "sup")
	policy.AllowElements("ul", "ol", "li", "dl", "dt", "dd")
	policy.AllowElements("blockquote", "pre", "code")
	policy.AllowElements("table", "thead", "tbody", "tr", "th", "td", "caption", "colgroup", "col")
	policy.AllowElements("img").AllowAttrs("src", "alt", "title", "width", "height").OnElements("img")
	policy.AllowElements("a").AllowAttrs("href", "title", "target").OnElements("a")
	policy.AllowElements("figure", "figcaption")
	
	// Allow common attributes
	policy.AllowAttrs("class", "id").Globally()

	return &Scraper{
		client:    client,
		sanitizer: policy,
	}
}

// ExtractContent fetches and extracts content from a URL
func (s *Scraper) ExtractContent(articleURL string) (*ArticleContent, error) {
	// Parse URL to get base URL for relative links
	parsedURL, err := url.Parse(articleURL)
	if err != nil {
		return nil, fmt.Errorf("invalid URL: %w", err)
	}

	// Fetch the article page
	req, err := http.NewRequest("GET", articleURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set user agent to appear like a regular browser
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; RSS-Reader/1.0)")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch URL: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, resp.Status)
	}

	// Parse HTML
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to parse HTML: %w", err)
	}

	// Extract content using multiple strategies
	content := s.extractArticleContent(doc)
	title := s.extractTitle(doc)
	description := s.extractDescription(doc)
	author := s.extractAuthor(doc)
	faviconURL := s.extractFaviconFromDoc(doc, parsedURL)

	// Rewrite URLs in content
	content = s.rewriteURLs(content, parsedURL)

	// Sanitize HTML
	content = s.sanitizer.Sanitize(content)

	return &ArticleContent{
		Title:       title,
		Content:     content,
		Description: description,
		Author:      author,
		FaviconURL:  faviconURL,
	}, nil
}

// extractArticleContent tries multiple strategies to find the main article content
func (s *Scraper) extractArticleContent(doc *goquery.Document) string {
	var content string

	// Strategy 1: Look for article tag
	if article := doc.Find("article").First(); article.Length() > 0 {
		if html, err := article.Html(); err == nil && len(strings.TrimSpace(html)) > 100 {
			content = html
		}
	}

	// Strategy 2: Look for content by common class names
	if content == "" {
		contentSelectors := []string{
			".article-content", ".post-content", ".entry-content", ".content",
			".article-body", ".post-body", ".entry-body", ".body",
			".main-content", ".primary-content", ".story-content",
			"[class*='content']", "[class*='article']", "[class*='post']",
		}

		for _, selector := range contentSelectors {
			if elem := doc.Find(selector).First(); elem.Length() > 0 {
				if html, err := elem.Html(); err == nil && len(strings.TrimSpace(html)) > 100 {
					content = html
					break
				}
			}
		}
	}

	// Strategy 3: Look for main tag
	if content == "" {
		if main := doc.Find("main").First(); main.Length() > 0 {
			if html, err := main.Html(); err == nil && len(strings.TrimSpace(html)) > 100 {
				content = html
			}
		}
	}

	// Strategy 4: Find largest text block
	if content == "" {
		var largestContent string
		var largestLength int

		doc.Find("div, section").Each(func(i int, s *goquery.Selection) {
			if html, err := s.Html(); err == nil {
				textContent := s.Text()
				if len(textContent) > largestLength && len(textContent) > 200 {
					largestLength = len(textContent)
					largestContent = html
				}
			}
		})

		content = largestContent
	}

	return content
}

// extractTitle extracts the article title
func (s *Scraper) extractTitle(doc *goquery.Document) string {
	// Try different title selectors
	selectors := []string{
		"h1.title", "h1.post-title", "h1.article-title", "h1.entry-title",
		".title h1", ".post-title h1", ".article-title h1", ".entry-title h1",
		"article h1", "main h1", "h1",
	}

	for _, selector := range selectors {
		if elem := doc.Find(selector).First(); elem.Length() > 0 {
			if title := strings.TrimSpace(elem.Text()); title != "" {
				return title
			}
		}
	}

	// Fallback to page title
	if title := doc.Find("title").Text(); title != "" {
		return strings.TrimSpace(title)
	}

	return ""
}

// extractDescription extracts meta description
func (s *Scraper) extractDescription(doc *goquery.Document) string {
	// Try meta description
	if desc, exists := doc.Find("meta[name='description']").Attr("content"); exists {
		return strings.TrimSpace(desc)
	}

	// Try og:description
	if desc, exists := doc.Find("meta[property='og:description']").Attr("content"); exists {
		return strings.TrimSpace(desc)
	}

	return ""
}

// extractAuthor extracts author information
func (s *Scraper) extractAuthor(doc *goquery.Document) string {
	// Try different author selectors
	selectors := []string{
		"meta[name='author']",
		"meta[property='article:author']",
		".author", ".byline", ".post-author", ".article-author",
	}

	for _, selector := range selectors {
		if elem := doc.Find(selector).First(); elem.Length() > 0 {
			var author string
			if content, exists := elem.Attr("content"); exists {
				author = content
			} else {
				author = elem.Text()
			}
			if author = strings.TrimSpace(author); author != "" {
				return author
			}
		}
	}

	return ""
}

// rewriteURLs converts relative URLs to absolute URLs
func (s *Scraper) rewriteURLs(content string, baseURL *url.URL) string {
	// Rewrite image src attributes
	imgRegex := regexp.MustCompile(`(<img[^>]+src=["'])([^"']+)(["'][^>]*>)`)
	content = imgRegex.ReplaceAllStringFunc(content, func(match string) string {
		parts := imgRegex.FindStringSubmatch(match)
		if len(parts) == 4 {
			absoluteURL := s.makeAbsoluteURL(parts[2], baseURL)
			return parts[1] + absoluteURL + parts[3]
		}
		return match
	})

	// Rewrite link href attributes
	linkRegex := regexp.MustCompile(`(<a[^>]+href=["'])([^"']+)(["'][^>]*>)`)
	content = linkRegex.ReplaceAllStringFunc(content, func(match string) string {
		parts := linkRegex.FindStringSubmatch(match)
		if len(parts) == 4 {
			absoluteURL := s.makeAbsoluteURL(parts[2], baseURL)
			return parts[1] + absoluteURL + parts[3]
		}
		return match
	})

	return content
}

// makeAbsoluteURL converts a relative URL to absolute
func (s *Scraper) makeAbsoluteURL(href string, baseURL *url.URL) string {
	parsedHref, err := url.Parse(href)
	if err != nil {
		return href
	}

	// If already absolute, return as is
	if parsedHref.IsAbs() {
		return href
	}

	// Resolve relative URL
	absoluteURL := baseURL.ResolveReference(parsedHref)
	return absoluteURL.String()
}

// extractFaviconFromDoc extracts favicon from an already parsed HTML document
func (s *Scraper) extractFaviconFromDoc(doc *goquery.Document, baseURL *url.URL) string {
	// For articles, we want the site's favicon, not article-specific icons
	// So we'll check the root domain instead
	rootURL := &url.URL{
		Scheme: baseURL.Scheme,
		Host:   baseURL.Host,
	}
	
	return s.ExtractFavicon(rootURL.String())
}

// ExtractFavicon fetches and finds favicon URL for a website
func (s *Scraper) ExtractFavicon(siteURL string) string {
	parsedURL, err := url.Parse(siteURL)
	if err != nil {
		return ""
	}

	// Try to fetch the homepage
	req, err := http.NewRequest("GET", fmt.Sprintf("%s://%s", parsedURL.Scheme, parsedURL.Host), nil)
	if err != nil {
		return ""
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; RSS-Reader/1.0)")

	resp, err := s.client.Do(req)
	if err != nil {
		return s.getDefaultFavicon(parsedURL)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return s.getDefaultFavicon(parsedURL)
	}

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return s.getDefaultFavicon(parsedURL)
	}

	// Try different favicon selectors in order of preference
	faviconSelectors := []string{
		"link[rel='apple-touch-icon']",
		"link[rel='icon']",
		"link[rel='shortcut icon']",
		"link[rel='favicon']",
	}

	for _, selector := range faviconSelectors {
		if elem := doc.Find(selector).First(); elem.Length() > 0 {
			if href, exists := elem.Attr("href"); exists {
				faviconURL := s.makeAbsoluteURL(href, parsedURL)
				// Validate it's a reasonable favicon URL
				if s.isValidFaviconURL(faviconURL) {
					return faviconURL
				}
			}
		}
	}

	// Fallback to default favicon.ico
	return s.getDefaultFavicon(parsedURL)
}

// getDefaultFavicon returns the standard /favicon.ico URL
func (s *Scraper) getDefaultFavicon(parsedURL *url.URL) string {
	return fmt.Sprintf("%s://%s/favicon.ico", parsedURL.Scheme, parsedURL.Host)
}

// isValidFaviconURL checks if a URL looks like a valid favicon
func (s *Scraper) isValidFaviconURL(faviconURL string) bool {
	if faviconURL == "" {
		return false
	}
	
	// Check if it's a reasonable image extension
	lowerURL := strings.ToLower(faviconURL)
	validExtensions := []string{".ico", ".png", ".jpg", ".jpeg", ".gif", ".svg"}
	
	for _, ext := range validExtensions {
		if strings.Contains(lowerURL, ext) {
			return true
		}
	}
	
	// Also accept if it contains common favicon paths
	faviconPaths := []string{"favicon", "apple-touch-icon", "icon"}
	for _, path := range faviconPaths {
		if strings.Contains(lowerURL, path) {
			return true
		}
	}
	
	return false
}