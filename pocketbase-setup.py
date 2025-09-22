import os
import sys
import platform
import subprocess
import requests
import zipfile
import time
from pathlib import Path

# ---------------------------
# CONFIGURATION
# ---------------------------
PB_VERSION = "0.9.0"  # update as needed
INSTALL_DIR = Path.home() / "pocketbase_rss"
PB_BINARY = INSTALL_DIR / "pocketbase"

PB_URL = "http://127.0.0.1:8090"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "password123"

# ---------------------------
# HELPER FUNCTIONS
# ---------------------------

def ensure_directories():
    INSTALL_DIR.mkdir(exist_ok=True)
    (INSTALL_DIR / "data").mkdir(exist_ok=True)
    (INSTALL_DIR / "feeds").mkdir(exist_ok=True)
    print(f"Directories created under {INSTALL_DIR}")

def download_pocketbase():
    system = platform.system().lower()
    arch = platform.machine().lower()
    
    if system == "windows":
        pb_filename = f"pocketbase_{system}_{arch}.zip"
    elif system in ["linux", "darwin"]:
        pb_filename = f"pocketbase_{system}_{arch}.zip"
    else:
        raise RuntimeError(f"Unsupported OS: {system}")

    download_url = f"https://github.com/pocketbase/pocketbase/releases/download/v{PB_VERSION}/{pb_filename}"
    zip_path = INSTALL_DIR / pb_filename

    if PB_BINARY.exists():
        print("PocketBase binary already exists. Skipping download.")
        return

    print(f"Downloading PocketBase {PB_VERSION}...")
    r = requests.get(download_url, stream=True)
    if r.status_code != 200:
        raise RuntimeError(f"Failed to download PocketBase: {r.status_code}")
    
    with open(zip_path, "wb") as f:
        for chunk in r.iter_content(1024):
            f.write(chunk)
    
    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(INSTALL_DIR)
    zip_path.unlink()
    PB_BINARY.chmod(0o755)
    print(f"PocketBase downloaded and extracted to {INSTALL_DIR}")

def start_pocketbase():
    print("Starting PocketBase...")
    proc = subprocess.Popen([str(PB_BINARY), "serve", "--dir", str(INSTALL_DIR / "data")])
    print("PocketBase is starting, waiting 3 seconds...")
    time.sleep(3)  # wait for PB to be ready
    return proc

# ---------------------------
# POCKETBASE API SETUP
# ---------------------------

def authenticate(session):
    resp = session.post(f"{PB_URL}/api/admins/auth-with-password", json={
        "identity": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    data = resp.json()
    if "token" not in data:
        print("Admin user does not exist yet.")
        return None
    print("Authenticated with PocketBase.")
    return data["token"]

def create_admin_user(session):
    print("Creating admin user...")
    resp = session.post(f"{PB_URL}/api/admins", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD,
        "passwordConfirm": ADMIN_PASSWORD,
        "name": "Admin"
    })
    if resp.status_code in [200, 201]:
        print("Admin user created successfully.")
    else:
        print("Admin user creation response:", resp.json())

# ---------------------------
# COLLECTIONS
# ---------------------------
COLLECTIONS = [
    # Core collections
    {"name": "feeds", "schema": [
        {"name": "url", "type": "text", "required": True, "unique": True},
        {"name": "title", "type": "text"},
        {"name": "favicon", "type": "text"},
        {"name": "category", "type": "text"},
        {"name": "last_fetched", "type": "datetime"},
        {"name": "fetch_status", "type": "text"},
        {"name": "error_message", "type": "text"},
        {"name": "etag", "type": "text"},
        {"name": "last_modified", "type": "text"},
    ]},
    {"name": "subscriptions", "schema": [
        {"name": "user_id", "type": "relation", "options":{"collectionId":"users","cascadeDelete":True,"maxSelect":1}, "required": True},
        {"name": "feed_id", "type": "relation", "options":{"collectionId":"feeds","cascadeDelete":True,"maxSelect":1}, "required": True},
        {"name": "enabled", "type": "bool", "default": True},
    ]},
    {"name": "feed_items", "schema": [
        {"name": "feed_id", "type": "relation", "options":{"collectionId":"feeds","cascadeDelete":True,"maxSelect":1}, "required": True},
        {"name": "title", "type": "text", "required": True},
        {"name": "link", "type": "text", "required": True},
        {"name": "published", "type": "datetime"},
        {"name": "summary", "type": "text"},
        {"name": "image_url", "type": "text"},
        {"name": "author", "type": "text"},
        {"name": "read_by", "type": "json"},
    ]},
    {"name": "categories", "schema": [
        {"name": "name", "type": "text", "required": True, "unique": True},
        {"name": "user_id", "type": "relation", "options":{"collectionId":"users","cascadeDelete":True,"maxSelect":1}},
    ]},
    {"name": "favorites", "schema": [
        {"name": "user_id", "type": "relation", "options":{"collectionId":"users","cascadeDelete":True,"maxSelect":1}, "required": True},
        {"name": "feed_item_id", "type": "relation", "options":{"collectionId":"feed_items","cascadeDelete":True,"maxSelect":1}, "required": True},
    ]},
    {"name": "user_settings", "schema": [
        {"name": "user_id", "type": "relation", "options":{"collectionId":"users","cascadeDelete":True,"maxSelect":1}, "required": True},
        {"name": "fetch_interval", "type": "number", "default": 15},
        {"name": "default_sort_order", "type": "text", "default": "newest"},
        {"name": "notification_preferences", "type": "json"},
    ]},
    {"name": "feed_tags", "schema": [
        {"name": "feed_item_id", "type": "relation", "options":{"collectionId":"feed_items","cascadeDelete":True,"maxSelect":1}, "required": True},
        {"name": "tag_name", "type": "text", "required": True},
        {"name": "user_id", "type": "relation", "options":{"collectionId":"users","cascadeDelete":True,"maxSelect":1}},
    ]},
    {"name": "notifications", "schema": [
        {"name": "user_id", "type": "relation", "options":{"collectionId":"users","cascadeDelete":True,"maxSelect":1}, "required": True},
        {"name": "feed_item_id", "type": "relation", "options":{"collectionId":"feed_items","cascadeDelete":True,"maxSelect":1}},
        {"name": "type", "type": "text", "required": True},
        {"name": "read", "type": "bool", "default": False},
    ]},
    {"name": "feed_blacklist", "schema": [
        {"name": "user_id", "type": "relation", "options":{"collectionId":"users","cascadeDelete":True,"maxSelect":1}, "required": True},
        {"name": "feed_url", "type": "text"},
        {"name": "domain", "type": "text"},
    ]},
    {"name": "feed_item_views", "schema": [
        {"name": "user_id", "type": "relation", "options":{"collectionId":"users","cascadeDelete":True,"maxSelect":1}, "required": True},
        {"name": "feed_item_id", "type": "relation", "options":{"collectionId":"feed_items","cascadeDelete":True,"maxSelect":1}, "required": True},
        {"name": "viewed_at", "type": "datetime"},
    ]},
]

# ---------------------------
# MAIN SCRIPT
# ---------------------------
def main():
    ensure_directories()
    download_pocketbase()
    pb_proc = start_pocketbase()
    
    session = requests.Session()
    token = authenticate(session)
    if not token:
        create_admin_user(session)
        token = authenticate(session)
        if not token:
            print("Failed to authenticate admin after creation. Exiting.")
            return
    session.headers.update({"Authorization": f"Bearer {token}"})

    # Create collections
    for col in COLLECTIONS:
        payload = {"name": col["name"], "type": "base", "schema": col["schema"]}
        resp = session.post(f"{PB_URL}/api/collections", json=payload)
        if resp.status_code in [200, 201]:
            print(f"Collection '{col['name']}' created successfully.")
        else:
            print(f"Failed to create collection '{col['name']}':", resp.json())

    print("\nSetup complete! PocketBase RSS backend is ready.")
    print(f"Admin UI: {PB_URL}/_/")

if __name__ == "__main__":
    main()
