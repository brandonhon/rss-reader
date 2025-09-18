## Visual Wireframe Layout Description
### Desktop View
|Pane|Contents & Layout|
|--|--|
|Left Pane (Navigation / Filters)|• Fixed width (~240px).|
||• Vertical stack of sections:|
||  – “Categories” header, under that a scrollable list of category items, each with label + badge showing fresh count.|
||  – “Starred Feeds” with an icon + count badge.|
||  – “Unread Feeds” with icon + count.|
||  – “Fresh Feeds” (last 24h) with icon + count.|
||  – Search input (text box with search icon).|
||  – Spacer / flex growth to push user info to bottom.|
||  – User info: avatar (circle image), username. Clicking this opens preferences. Possibly a small down arrow → shows a menu (logout, preferences).|
|Middle Pane (Feed List)|• Occupies flexible width (desktop: middle of three-panels).|
||• List view: articles sorted by some default (e.g. unread first, then date).|
||• Each article item row contains:|
||  — Title (bold if unread).|
||  — Source name + small favicon.|
||  — Timestamp.|
||  — Action icons: star/unstar; mark read/unread.|
||  — Perhaps a share icon or via hover.|
||• Scrolling: the pane scrolls independently. As user scrolls past thresholds, items get marked read (if that mode is active).|
||• Infinite scroll or “load more”.|
|Right Pane (Article Content)|• On selecting an article, shows full content here: title, author/source, timestamp, content (text + images).|
||• Top or bottom sticky action toolbar: star/unstar, mark read/unread, share.|
||• If content has images, they are displayed inline or maybe lightboxed.|

### Additional components:
- At top bar (above all panes) optional global search or filter bar, if needed. But since search is in left pane, maybe top only in mobile.
- Breadcrumbs or path indicator if nested categories.

### Mobile View

- Single column layout: only one pane visible at a time.
    1. Navigation: accessed via hamburger menu (left) or slide-out drawer. That drawer shows categories, starred, unread, fresh, search, user info.
    2. Feed List: main screen after selecting filter/category. Full width. Article rows similar to desktop (title, source, timestamp, actions via icons or swipe gestures).
    3. Article Content: full-screen view when selecting an article. Back-button to return to feed list.
- Search: maybe a magnifying glass icon in top bar; tapping opens search input full width.
- User Info / Preferences: accessible via avatar icon in top/bottom nav bar or inside the navigation drawer.
- Action icons: should be large enough for fingers (min ~44x44px or local guideline), spaced out.

### Component Hierarchy (for wireframe)
1. App Root
    1. Left Pane (Nav)
        - Categories List
            - Category Item (Name + Fresh Badge)
        - Starred Feeds Link + Badge
        - Unread Feeds Link + Badge
        - Fresh Feeds Link + Badge
        - Search Input
        - User Info / Avatar / Username / Preferences link

2. Middle Pane (Feed List)
    - Article Item
        - Title
        - Source / Favicon
        - Timestamp
        - Action Buttons: Star / Read-Unread / Share

3. Right Pane (Article Content)
    - Title
    - Source / Author / Timestamp
    - Content Body (images, text)
    - Action Toolbar (Star / Read-Unread / Share)

### Content Prioritization

- Unread & Fresh articles are visually emphasized (bold titles, highlighted background).
- Categories with nonzero fresh counts should be more prominent (bold count badges, maybe color).
- Action buttons (star, mark read/unread, share) should be available directly on article items to minimize clicks.
- Search should be very visible (especially on mobile).
- User info is functionally secondary but needs to be always available; so bottom of nav or via icon.

### Responsive Behavior
|Breakpoint / Device|Behavior|
|--|--|
|Large desktop / wide screens|Three pane view visible simultaneously. Left pane always open. Middle / right panes side by side.|
|Medium width (e.g. tablets landscape)|Possibly three panes if enough horizontal space; else collapse right pane; Left pane may become collapsible.|
|Small width (mobile portrait)|Single‐pane view. Drawer / overlay for navigation. Feed list main. Article view full screen. Back arrow for navigation.|
|Touch / mobile input|Action buttons large, swipe gestures enabled (e.g. swipe article item left/right to mark read/unread or star).|

### Accessibility Requirements (especially mobile view)
- All interactive elements (buttons, icons, nav links) must have touch target size of at least 44x44px.
- Use semantic HTML / ARIA roles: navigation landmarks, buttons, headings.
- Ensure color contrast for text, icons, badges against background meets WCAG AA (or AAA) levels.
- Provide alt text / accessible labels for images. For example, feed source favicon → provide alt="Feed source name icon" or hidden but readable.
- Keyboard navigability (even on web mobile): ability to focus search, links, actions via keyboard.
- For scroll marking read: ensure screen reader users are not confused — maybe provide an explicit “mark as read” button; avoid invisibly marking huge scrolls without feedback.