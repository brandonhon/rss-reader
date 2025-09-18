# RSS Feed Reader – Preferences Page Wireframe Specification

## 1. Layout Grid
- **PC Browser (Desktop)**
  - **Grid System:** 12-column grid
  - **Main Structure:** Two-column layout
    - **Left Panel (Navigation Tabs):** 3 columns wide
    - **Right Panel (Content Area):** 9 columns wide
  - **Spacing:** 24px gutter, 16px padding inside panels

- **Mobile Browser**
  - **Grid System:** Single-column layout
  - **Main Structure:** 
    - Tabs collapse into a **dropdown menu** at the top
    - Content fills the rest of the screen
  - **Spacing:** 12px padding for smaller screens

---

## 2. Component Hierarchy
- **Header (Top Bar)**
  - Page Title: `Preferences`
  - Close / Back button (returns to Dashboard/Home)

- **Navigation Tabs (Left Panel on Desktop / Dropdown on Mobile)**
  - Users
  - Feeds
  - Theme
  - Categories
  - Fetch Interval
  - Font Size
  - System Info

- **Content Area (Right Panel on Desktop / Full-width on Mobile)**
  - **Users**
    - List of users with role indicators (Admin/User)
    - Actions: Add User, Edit, Remove
  - **Feeds**
    - Feed list (title, URL, category)
    - Actions: Add Feed, Edit Feed, Remove Feed
  - **Theme**
    - Radio options: Light, Dark, System Default
    - Color accent selector (optional)
  - **Categories**
    - Category list with counts of feeds
    - Actions: Add, Edit, Remove
  - **Fetch Interval**
    - Dropdown: [5m, 10m, 30m, 1h, 6h, 12h, 24h]
  - **Font Size**
    - Slider (Small → Large)
    - Live preview text below slider
  - **System Info**
    - Display app version, last sync, storage usage
    - Diagnostic export option

- **Action Buttons (Fixed Bottom Bar)**
  - **Save** (Primary action, highlighted)
  - **Import** (Secondary action)
  - **Export** (Secondary action)

---

## 3. Content Prioritization
1. **Critical** (Always visible/high priority):
   - Save button
   - Tabs (or dropdown on mobile)
   - Feed management
2. **Important** (Medium priority):
   - Theme and font size
   - Fetch interval
3. **Reference/Optional** (Low priority):
   - System info

---

## 4. Responsive Behavior
- **Desktop**
  - Left navigation panel always visible
  - Right panel content scrollable independently
- **Mobile**
  - Tabs become a dropdown selector at top
  - Content below is full width
  - Action buttons stack at bottom in a single row with icons + text

---

## 5. Accessibility Requirements
- **Keyboard Navigation**
  - All tabs and actions are focusable and operable with keyboard
- **Color Contrast**
  - Minimum WCAG AA compliance for text/background
- **Font Scaling**
  - Font size responds to OS-level accessibility settings
- **Mobile**
  - Large touch targets (at least 44x44px)
  - Clear, simple layout (single column, stacked elements)
