=========================
POCKETBASE RSS READER SCHEMA
=========================

1️⃣ Collection: users
--------------------
Purpose: Store user accounts (PocketBase auth)
Fields:
- email (text, required, unique)
- password (text, required)
- display_name (text, optional)
- theme (text, optional, default "light")
- created_at (datetime, auto)
- updated_at (datetime, auto)

---

2️⃣ Collection: feeds
--------------------
Purpose: Store RSS feeds
Fields:
- url (text, required, unique)
- title (text, optional)
- favicon (text, optional)
- category (text, optional)
- last_fetched (datetime, optional)      # Fringe case: track last fetch
- fetch_status (text, optional)          # Fringe case: success/failed
- error_message (text, optional)
- etag (text, optional)
- last_modified (text, optional)
- created_at (datetime, auto)
- updated_at (datetime, auto)

---

3️⃣ Collection: subscriptions
----------------------------
Purpose: Track which users follow which feeds
Fields:
- user_id (relation to users, required)
- feed_id (relation to feeds, required)
- enabled (bool, default True)
- created_at (datetime, auto)
- updated_at (datetime, auto)

---

4️⃣ Collection: feed_items
-------------------------
Purpose: Store feed articles/items
Fields:
- feed_id (relation to feeds, required)
- title (text, required)
- link (text, required)
- published (datetime, optional)
- summary (text, optional)
- image_url (text, optional)
- author (text, optional)
- read_by (json, optional)               # Array of user_ids
- created_at (datetime, auto)
- updated_at (datetime, auto)

---

5️⃣ Collection: categories (optional)
------------------------------------
Purpose: Organize feeds into groups
Fields:
- name (text, required, unique)
- user_id (relation to users, optional)
- created_at (datetime, auto)
- updated_at (datetime, auto)

---

6️⃣ Collection: favorites / read_later (optional)
------------------------------------------------
Purpose: Track user-starred items
Fields:
- user_id (relation to users, required)
- feed_item_id (relation to feed_items, required)
- created_at (datetime, auto)

---

7️⃣ Collection: user_settings (fringe case)
------------------------------------------
Purpose: Store per-user preferences
Fields:
- user_id (relation to users, required)
- fetch_interval (int, optional, default 15)    # in minutes
- default_sort_order (text, optional, default "newest")
- notification_preferences (json, optional)
- created_at (datetime, auto)
- updated_at (datetime, auto)

---

8️⃣ Collection: feed_tags / item_tags (fringe case)
--------------------------------------------------
Purpose: Tag feed items
Fields:
- feed_item_id (relation to feed_items, required)
- tag_name (text, required)
- user_id (relation to users, optional)
- created_at (datetime, auto)
- updated_at (datetime, auto)

---

9️⃣ Collection: notifications (fringe case)
------------------------------------------
Purpose: Track user/system events
Fields:
- user_id (relation to users, required)
- feed_item_id (relation to feed_items, optional)
- type (text, required)        # e.g., "new_item", "system_message"
- read (bool, default False)
- created_at (datetime, auto)

---

🔟 Collection: feed_blacklist (fringe case)
------------------------------------------
Purpose: Allow users to block feeds/domains
Fields:
- user_id (relation to users, required)
- feed_url (text, optional)
- domain (text, optional)
- created_at (datetime, auto)

---

1️⃣1️⃣ Collection: feed_item_views / analytics (fringe case)
-----------------------------------------------------------
Purpose: Track engagement for analytics
Fields:
- user_id (relation to users, required)
- feed_item_id (relation to feed_items, required)
- viewed_at (datetime, auto)
