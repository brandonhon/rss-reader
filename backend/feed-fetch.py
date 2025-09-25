import requests
import feedparser
import time
from datetime import datetime

# ---------------------------
# CONFIGURATION
# ---------------------------
PB_URL = "http://127.0.0.1:8090"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "password123"
FETCH_INTERVAL = 300  # seconds between fetches (5 min)

# ---------------------------
# AUTHENTICATION
# ---------------------------
session = requests.Session()
auth_resp = session.post(f"{PB_URL}/api/admins/auth-with-password", json={
    "identity": ADMIN_EMAIL,
    "password": ADMIN_PASSWORD
})
auth_data = auth_resp.json()
if "token" not in auth_data:
    raise RuntimeError("Failed to authenticate admin user.")
token = auth_data["token"]
session.headers.update({"Authorization": f"Bearer {token}"})

# ---------------------------
# HELPER FUNCTIONS
# ---------------------------

def get_feeds():
    resp = session.get(f"{PB_URL}/api/collections/feeds/records")
    resp.raise_for_status()
    return resp.json()["items"]

def feed_item_exists(feed_id, link):
    resp = session.get(f"{PB_URL}/api/collections/feed_items/records", params={
        "filter": f'feed_id="{feed_id}" && link="{link}"'
    })
    resp.raise_for_status()
    return len(resp.json().get("items", [])) > 0

def insert_feed_item(feed_id, item):
    data = {
        "feed_id": feed_id,
        "title": item.get("title"),
        "link": item.get("link"),
        "published": item.get("published") or item.get("updated"),
        "summary": item.get("summary"),
        "author": item.get("author"),
        "image_url": item.get("media_thumbnail", [{}])[0].get("url") if "media_thumbnail" in item else None,
        "read_by": []
    }
    resp = session.post(f"{PB_URL}/api/collections/feed_items/records", json=data)
    resp.raise_for_status()

def update_feed_timestamp(feed_id, status="success", error_msg=None):
    data = {
        "last_fetched": datetime.utcnow().isoformat(),
        "fetch_status": status,
        "error_message": error_msg
    }
    resp = session.patch(f"{PB_URL}/api/collections/feeds/records/{feed_id}", json=data)
    resp.raise_for_status()

# ---------------------------
# MAIN WORKER LOOP
# ---------------------------

def fetch_all_feeds():
    feeds = get_feeds()
    print(f"Found {len(feeds)} feeds.")
    for feed in feeds:
        feed_id = feed["id"]
        url = feed["url"]
        print(f"Fetching feed: {url}")
        try:
            parsed = feedparser.parse(url)
            for entry in parsed.entries:
                if not feed_item_exists(feed_id, entry.get("link")):
                    insert_feed_item(feed_id, entry)
            update_feed_timestamp(feed_id, status="success")
            print(f"Feed {url} updated successfully.")
        except Exception as e:
            print(f"Error fetching feed {url}: {e}")
            update_feed_timestamp(feed_id, status="failed", error_msg=str(e))

if __name__ == "__main__":
    while True:
        fetch_all_feeds()
        print(f"Waiting {FETCH_INTERVAL} seconds before next fetch...")
        time.sleep(FETCH_INTERVAL)


# 1️⃣ Retry Logic for Failures

# Some feeds may fail due to network issues, timeouts, or temporary server problems.

# Implement exponential backoff when a feed fails instead of immediately retrying or marking it failed.

# Example enhancement:

# import time, random

# def fetch_with_retry(url, max_attempts=3):
#     for attempt in range(max_attempts):
#         try:
#             return feedparser.parse(url)
#         except Exception as e:
#             wait = (2 ** attempt) + random.random()
#             print(f"Retrying {url} in {wait:.2f}s due to error: {e}")
#             time.sleep(wait)
#     raise RuntimeError(f"Failed to fetch {url} after {max_attempts} attempts")

# 2️⃣ Timeouts & Connection Handling

# Use requests or feedparser with timeouts to avoid hanging on slow feeds.

# Example for feedparser:

# parsed = feedparser.parse(url, request_headers={'User-Agent': 'RSSReader/1.0'}, handlers=[], timeout=10)

# 3️⃣ Rate Limiting

# Avoid hammering feed servers.

# Add a sleep delay between requests or batch feeds for large numbers.

# Optionally track last fetch per feed to respect RSS update frequency.

# 4️⃣ Content Deduplication Beyond Link

# Some feeds may reuse the same link with updated content.

# Store a hash of the title + summary to avoid duplicates even if the link is the same.

# Example:

# import hashlib
# hash_key = hashlib.md5((entry.get('title','') + entry.get('summary','')).encode()).hexdigest()


# Save hash_key in the database and skip if already exists.

# 5️⃣ Handling Various RSS / Atom Formats

# Use feedparser’s full capabilities: published_parsed, updated, media_* tags.

# Normalize dates to UTC to avoid timezone issues.

# Handle missing fields gracefully (title, link, published).

# 6️⃣ Error Logging & Notifications

# Store fetch errors in feeds.error_message.

# Optionally, send notifications (email, Slack, Discord) if a feed consistently fails.

# This allows admins to quickly resolve broken feeds.

# 7️⃣ Incremental Fetching

# Use ETag and Last-Modified headers to avoid fetching the full feed when nothing changed.

# PocketBase already stores etag and last_modified in feeds; use them in requests:

# headers = {}
# if feed.get("etag"):
#     headers["If-None-Match"] = feed["etag"]
# if feed.get("last_modified"):
#     headers["If-Modified-Since"] = feed["last_modified"]

# 8️⃣ Parallel / Async Fetching

# For hundreds or thousands of feeds, sequential fetching is slow.

# Use asyncio + aiohttp or threading/pool to fetch multiple feeds concurrently.

# Keep concurrency moderate to avoid overloading feed servers.

# 9️⃣ Graceful Shutdown

# Capture signals (SIGINT/SIGTERM) to save state before exiting.

# Ensures no partial updates leave your feeds or feed_items inconsistent.

# 1️⃣0️⃣ Metrics / Monitoring

# Track:

# Number of feeds fetched successfully/failed.

# Number of new items inserted per run.

# Last fetch timestamp per feed.

# Expose Prometheus metrics or log to a file for monitoring.

# 💡 Summary of most impactful improvements:

# Retry logic + exponential backoff.

# ETag / Last-Modified incremental fetching.

# Deduplication using content hashes.

# Async or threaded fetching for speed.

# Proper logging and notifications for errors.