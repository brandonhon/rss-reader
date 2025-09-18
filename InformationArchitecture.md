# RSS Feed Reader - Information Architecture (IA)

## 1. High-Level Architecture

**Three-Panel Layout:**
- **Panel 1: Navigation / Filters**
  - Categories
  - Starred Feeds
  - Unread Feeds
  - Fresh Feeds (last 24 hours starting at 00:00)
- **Panel 2: Feed List**
  - List of articles in selected category/feed
  - Actions: mark star/unstar
  - Metadata: read/unread, starred, date, source
- **Panel 3: Article View**
  - Full article content (text, images, media)
  - Actions: mark read/unread, share

**User Roles:**
- **Admin**
  - Manage users
  - Manage system settings
  - Manage fetch intervals
  - View system info
- **Normal User**
  - Read/manage feeds
  - Manage user categories
  - Customize preferences (theme, font, fetch interval)
  - Star, mark read/unread, search
  - Cannot manage other users or system settings

---

## 2. Main Navigation Structure

### Global Navigation (Left Panel)
| Section            | Description                                        | Permissions       |
|-------------------|----------------------------------------------------|-----------------|
| Dashboard / Home   | Overview of unread, starred, fresh feeds          | All users        |
| Categories         | User-defined; filter feeds                         | All users        |
| Starred Feeds      | Articles marked as starred                         | All users        |
| Unread Feeds       | All unread articles                                | All users        |
| Fresh Feeds        | Articles from last 24 hours (00:00–23:59)         | All users        |
| Search             | Keyword search across feeds, categories, titles  | All users        |
| Preferences        | User-specific settings (theme, font, fetch)       | All users        |
| Admin Panel        | User management, feed management, system settings | Admin only       |

---

## 3. Secondary Navigation / Feed List Panel

**Feed List Panel (Panel 2)**
- Shows list of feeds/articles in selected category/filter
- Features:
  - Feed/Article List: title, source, timestamp, unread/starred icon, ability to mark star/unstar
  - Feed Filters: by category, starred, unread, fresh, custom
  - Pagination / Infinite Scroll: scroll marks feed as read
  - Batch Actions: mark multiple as read/unread, star/unstar

---

## 4. Content Panel (Panel 3)

- Displays full article content
- Supports:
  - Inline images and media
  - Links
  - Actions: mark read/unread, share
- Optional text-only mode for faster load

---

## 5. Preferences Page Structure

| Section        | Settings                                  |
|----------------|------------------------------------------|
| User           | Name, email, password                     |
| Feeds          | Add, remove, refresh, import/export      |
| Theme          | Light/dark mode, custom color palettes   |
| System Info    | App version, last fetch, storage usage   |
| Categories     | Add, edit, remove categories             |
| Fetch Interval | User-specific or system default          |
| Font Size      | Small / Medium / Large                    |

---

## 6. Taxonomy & Metadata Structure

**Feeds / Articles**
- Feed:
  - ID, URL, Title, Description, Category, Last Updated
- Article:
  - ID, Feed ID, Title, URL, Author, Published Date, Content, Excerpt, Read Status (per user), Starred (per user), Images, Tags, Metadata
- User Article Metadata:
  - Read/unread status
  - Starred status
  - Scroll position (optional)

**Categories**
- Hierarchical: e.g., Tech → AI, Tech → Hardware
- Fields: ID, Name, Description, Parent ID

---

## 7. Search Functionality

- Search Scope:
  - Title
  - Content / Summary
  - Feed source
  - Tags / Categories
- Features:
  - Full-text search
  - Filters: category, unread/starred/fresh
  - Boolean operators (AND, OR, NOT)
  - Sort by relevance/date
- Metadata indexing:
  - Store per-user read/unread and starred statuses

---

## 8. Multi-User Scalability

- **Feed Storage:** single fetch for all users, articles stored once
- **User Metadata Table:**
  - `user_id`, `article_id`, `read_status`, `starred`, `scroll_position`
- **Caching:** articles and images cached for performance
- **Concurrency:** allow multiple users to update read/unread and starred statuses simultaneously
- **Scroll Behavior:** scrolling marks article as read (configurable), mark as unread available

---

## 9. Images & Media Handling

- Cache images separately from articles
- Lazy load images for performance
- Store original image URL and local cache path
- Optional placeholders in feed list

---

## 10. Content Hierarchy / IA Diagram (Textual)

Root
 ├─ Dashboard / Home
 ├─ Categories
 │   ├─ Category 1
 │   │   ├─ Feed 1
 │   │   ├─ Feed 2
 │   └─ Category 2
 │       ├─ Feed 3
 ├─ Starred Feeds
 ├─ Unread Feeds
 ├─ Fresh Feeds
 ├─ Search
 ├─ Preferences
 │   ├─ User Settings
 │   ├─ Feeds
 │   ├─ Theme
 │   ├─ System Info
 │   ├─ Categories
 │   ├─ Fetch Interval
 │   └─ Font Size
 └─ Admin Panel (admin only)
     ├─ User Management
     ├─ Feed Management
     └─ System Settings

---

## 11. Additional Recommendations

- **Batch Feed Operations:** OPML import/export, bulk add feeds to categories
- **Notifications:** Optional push notifications for fresh/starred articles
- **Theming:** Store per-user theme and font preferences
- **Offline Mode:** Cache articles for offline reading
- **Audit Logs (Admin):** Track user activity and feed changes
