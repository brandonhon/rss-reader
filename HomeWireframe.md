# RSS Feed Reader - Dashboard/Home Wireframe

## 1. Layout Overview

**Three-Panel Design**

+---------------------+----------------------+----------------------+
| Left Pane | Middle Pane | Right Pane |
| (Navigation / | (Feed List) | (Article Content) |
| Filters) | | |
+---------------------+----------------------+----------------------+

---

### Left Pane (Navigation / Filters)
- Width: **240px** on desktop, collapsible on mobile (expandable via hamburger menu)
- Sections (top to bottom):
  1. **Categories**
     - Display category name
     - Display count of **fresh articles** for each category
     - Hierarchical indicator for subcategories
  2. **Starred Feeds**
     - Count of starred articles
  3. **Unread Feeds**
     - Count of unread articles
  4. **Fresh Feeds**
     - Count of articles from last 24 hours
  5. **Search Box**
     - Input field with search icon
     - Placeholder: "Search articles..."
  6. **User Info (bottom)**
     - Username and avatar
     - Tap/click opens **preferences page**
     - Dropdown menu for quick actions: Logout, Preferences

**Responsive Behavior**
- **Desktop:** full vertical pane
- **Mobile:** collapsible left panel; search box becomes top-bar icon
- **Accessibility:** 
  - Keyboard focusable
  - Screen reader labels for counts and category names
  - High contrast mode support

---

### Middle Pane (Feed List)
- Grid: single column list on desktop, mobile-friendly
- Components per feed item:
  1. **Title**
     - Bold for unread
  2. **Feed Source**
     - Smaller text, muted color
  3. **Timestamp**
  4. **Icons for actions**
     - Star / Unstar
     - Mark Read / Unread
     - Share
- **Interaction**
  - Clicking title opens article in right pane (desktop) or full screen (mobile)
  - Swipe gestures (mobile) for mark read/unread, star/unstar
  - Infinite scroll / pagination
- **Prioritization**
  - Unread > Fresh > Starred > Read

---

### Right Pane (Article Content)
- Shows **full article**
- Components:
  1. Title
  2. Author / Source
  3. Timestamp
  4. Article content (text, images, media)
  5. Action toolbar (sticky top or bottom):
     - Star / Unstar
     - Mark Read / Unread
     - Share
- **Responsive Behavior**
  - Desktop: shows side-by-side
  - Mobile: article opens full-screen; back button returns to feed list
- **Accessibility**
  - Text resizing
  - Alt text for images
  - ARIA labels for action buttons

---

## 2. Component Hierarchy

Dashboard
├─ Left Pane
│ ├─ Categories List
│ │ └─ Category Item (Name + Fresh Count)
│ ├─ Starred Feeds (Count)
│ ├─ Unread Feeds (Count)
│ ├─ Fresh Feeds (Count)
│ ├─ Search Box
│ └─ User Info (Avatar + Username + Preferences Link)
├─ Middle Pane
│ └─ Feed List
│ └─ Feed Item
│ ├─ Title
│ ├─ Feed Source
│ ├─ Timestamp
│ └─ Actions (Star, Mark Read/Unread, Share)
└─ Right Pane
└─ Article View
├─ Title
├─ Author / Source
├─ Timestamp
├─ Content (text/images/media)
└─ Actions (Star, Mark Read/Unread, Share)


---

## 3. Layout Grid

**Desktop Browser**
- **Left Pane:** 240px
- **Middle Pane:** flexible width, min 400px
- **Right Pane:** flexible width, min 500px
- **Gutter:** 16px between panes
- **Scrolling:** 
  - Middle Pane scrolls independently
  - Right Pane scrolls independently

**Mobile Browser**
- **Left Pane:** collapsible, overlay full-screen
- **Middle Pane:** full width
- **Right Pane:** full width when article selected
- **Gutters:** 8px
- **Scrolling:** single column, native vertical scroll

---

## 4. Content Prioritization

- **Left Pane:** counts and categories prioritized for quick access
- **Middle Pane:** unread > fresh > starred > read
- **Right Pane:** action toolbar sticky for quick interactions
- Search prominently displayed in left pane or top bar (mobile)

---

## 5. Responsive Behavior

| Device      | Left Pane            | Middle Pane         | Right Pane         |
|------------|--------------------|------------------|------------------|
| Desktop    | Always visible      | List of feeds    | Article content  |
| Mobile     | Collapsible         | Full-width list  | Full-screen article |
| Tablet     | Optional collapsed  | Flexible width   | Article side-by-side if space |

- Hamburger menu on mobile for navigation
- Search icon on top bar
- Touch-friendly action buttons (min 44x44px)
- Swipe gestures for read/unread and star/unstar

---

## 6. Actions and Navigation

- **Feed Actions:** mark read/unread, star/unstar, share
- **Global Actions:** search, navigate to categories, starred, unread, fresh
- **Preferences:** click username/avatar → preferences page
- **Keyboard Shortcuts (Desktop):**
  - J/K: navigate feed list
  - R: mark read/unread
  - S: star/unstar
- **Accessibility:**
  - ARIA labels for buttons
  - Focus indicators for keyboard navigation
  - High contrast mode
  - Screen reader-friendly labels for counts

---

## 7. Accessibility Notes (Mobile)

- All tap targets ≥ 44x44px
- Ensure proper color contrast for text, icons, and counts
- Provide alt text for images
- Announce feed counts and actions via screen reader
- Enable pinch-to-zoom for text readability
- Support landscape and portrait orientations
