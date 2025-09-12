package handlers

import (
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"

	"golang.org/x/net/html"
)

// ContentExtractor extracts full article content from web pages
type ContentExtractor struct {
	client *http.Client
}

// NewContentExtractor creates a new content extractor
func NewContentExtractor() *ContentExtractor {
	return &ContentExtractor{
		client: &http.Client{
			Timeout: 30 * time.Second,
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				if len(via) >= 10 {
					return fmt.Errorf("stopped after 10 redirects")
				}
				return nil
			},
		},
	}
}

// ExtractContent fetches and extracts the main content from a URL
func (ce *ContentExtractor) ExtractContent(url string) (string, error) {
	// Set a reasonable user agent
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; RSS-Reader/1.0)")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")

	resp, err := ce.client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	return ce.extractMainContent(string(body))
}

// extractMainContent extracts the main content from HTML
func (ce *ContentExtractor) extractMainContent(htmlContent string) (string, error) {
	doc, err := html.Parse(strings.NewReader(htmlContent))
	if err != nil {
		return "", err
	}

	// Try to find content using common article selectors
	content := ce.findContentNode(doc)
	if content == "" {
		// Fallback: extract all paragraph text
		content = ce.extractParagraphs(doc)
	}

	// Clean up the content
	content = ce.cleanContent(content)
	
	// Limit content length to prevent database bloat (100KB max)
	if len(content) > 100000 {
		content = content[:100000] + "... [Content truncated]"
	}

	return content, nil
}

// findContentNode attempts to find the main content using common selectors
func (ce *ContentExtractor) findContentNode(n *html.Node) string {
	// Look for common article content containers
	articleSelectors := []string{
		"article", "main", "[role=main]",
		".article-content", ".post-content", ".entry-content", 
		".content", ".article-body", ".story-body",
		"#article", "#content", "#main-content",
		".article", ".post", ".entry",
	}

	for _, selector := range articleSelectors {
		if content := ce.findBySelector(n, selector); content != "" {
			return content
		}
	}

	return ""
}

// findBySelector finds content by CSS-like selectors (simplified)
func (ce *ContentExtractor) findBySelector(n *html.Node, selector string) string {
	var result strings.Builder
	
	var traverse func(*html.Node)
	traverse = func(node *html.Node) {
		if node.Type == html.ElementNode {
			// Check for element matches
			if ce.matchesSelector(node, selector) {
				ce.extractTextFromNode(node, &result)
				return // Stop traversing once we find a match
			}
		}
		
		for child := node.FirstChild; child != nil; child = child.NextSibling {
			traverse(child)
		}
	}
	
	traverse(n)
	return strings.TrimSpace(result.String())
}

// matchesSelector checks if a node matches a simple selector
func (ce *ContentExtractor) matchesSelector(node *html.Node, selector string) bool {
	if strings.HasPrefix(selector, "#") {
		// ID selector
		id := strings.TrimPrefix(selector, "#")
		for _, attr := range node.Attr {
			if attr.Key == "id" && attr.Val == id {
				return true
			}
		}
	} else if strings.HasPrefix(selector, ".") {
		// Class selector
		class := strings.TrimPrefix(selector, ".")
		for _, attr := range node.Attr {
			if attr.Key == "class" && strings.Contains(attr.Val, class) {
				return true
			}
		}
	} else if strings.HasPrefix(selector, "[") && strings.HasSuffix(selector, "]") {
		// Attribute selector like [role=main]
		attrPart := strings.Trim(selector, "[]")
		parts := strings.Split(attrPart, "=")
		if len(parts) == 2 {
			attrName, attrValue := parts[0], parts[1]
			for _, attr := range node.Attr {
				if attr.Key == attrName && attr.Val == attrValue {
					return true
				}
			}
		}
	} else {
		// Element selector
		return node.Data == selector
	}
	
	return false
}

// extractParagraphs extracts all paragraph text as fallback
func (ce *ContentExtractor) extractParagraphs(n *html.Node) string {
	var result strings.Builder
	
	var traverse func(*html.Node)
	traverse = func(node *html.Node) {
		if node.Type == html.ElementNode && node.Data == "p" {
			text := ce.extractTextFromElement(node)
			if len(strings.TrimSpace(text)) > 20 { // Skip very short paragraphs
				result.WriteString(text)
				result.WriteString("\n\n")
			}
		}
		
		for child := node.FirstChild; child != nil; child = child.NextSibling {
			traverse(child)
		}
	}
	
	traverse(n)
	return strings.TrimSpace(result.String())
}

// extractTextFromNode extracts formatted text from a node
func (ce *ContentExtractor) extractTextFromNode(n *html.Node, result *strings.Builder) {
	var traverse func(*html.Node, int)
	traverse = func(node *html.Node, depth int) {
		if node.Type == html.TextNode {
			text := strings.TrimSpace(node.Data)
			if text != "" {
				result.WriteString(text)
				result.WriteString(" ")
			}
		} else if node.Type == html.ElementNode {
			switch node.Data {
			case "p", "div", "h1", "h2", "h3", "h4", "h5", "h6":
				if result.Len() > 0 && !strings.HasSuffix(result.String(), "\n") {
					result.WriteString("\n\n")
				}
			case "br":
				result.WriteString("\n")
			case "li":
				result.WriteString("• ")
			}
		}
		
		for child := node.FirstChild; child != nil; child = child.NextSibling {
			traverse(child, depth+1)
		}
		
		if node.Type == html.ElementNode {
			switch node.Data {
			case "p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li":
				if !strings.HasSuffix(result.String(), "\n") {
					result.WriteString("\n")
				}
			}
		}
	}
	
	traverse(n, 0)
}

// extractTextFromElement extracts plain text from an element
func (ce *ContentExtractor) extractTextFromElement(n *html.Node) string {
	var result strings.Builder
	
	var traverse func(*html.Node)
	traverse = func(node *html.Node) {
		if node.Type == html.TextNode {
			result.WriteString(node.Data)
		}
		
		for child := node.FirstChild; child != nil; child = child.NextSibling {
			traverse(child)
		}
	}
	
	traverse(n)
	return result.String()
}

// cleanContent cleans up extracted content
func (ce *ContentExtractor) cleanContent(content string) string {
	// Remove extra whitespace
	re := regexp.MustCompile(`\s+`)
	content = re.ReplaceAllString(content, " ")
	
	// Remove multiple line breaks
	re = regexp.MustCompile(`\n\s*\n\s*\n`)
	content = re.ReplaceAllString(content, "\n\n")
	
	// Trim whitespace
	content = strings.TrimSpace(content)
	
	return content
}