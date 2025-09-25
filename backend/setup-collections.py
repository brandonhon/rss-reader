#!/usr/bin/env python3

import requests
import json
import time
import sys

# Configuration
PB_URL = "http://127.0.0.1:8090"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "password123"

def authenticate():
    """Authenticate with PocketBase using superuser credentials"""
    try:
        resp = requests.post(f"{PB_URL}/api/collections/_superusers/auth-with-password", json={
            "identity": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if resp.status_code == 200:
            data = resp.json()
            return data.get("token")
    except Exception as e:
        print(f"Authentication failed: {e}")
    return None

def create_collection(session, collection_data):
    """Create a collection in PocketBase"""
    try:
        resp = session.post(f"{PB_URL}/api/collections", json=collection_data)
        if resp.status_code in [200, 201]:
            print(f"✅ Created collection: {collection_data['name']}")
            return True
        else:
            print(f"❌ Failed to create collection {collection_data['name']}: {resp.text}")
    except Exception as e:
        print(f"❌ Error creating collection {collection_data['name']}: {e}")
    return False

def main():
    print("🗄️  Setting up PocketBase collections...")
    
    # Wait for PocketBase to be ready
    for i in range(10):
        try:
            resp = requests.get(f"{PB_URL}/api/health", timeout=2)
            if resp.status_code == 200:
                break
        except:
            time.sleep(1)
    else:
        print("❌ PocketBase is not responding")
        sys.exit(1)
    
    # Authenticate
    token = authenticate()
    if not token:
        print("❌ Failed to authenticate - collections may need to be created manually")
        print("🌐 Open http://localhost:8090/_ to create collections via web interface")
        return
    
    session = requests.Session()
    session.headers.update({"Authorization": f"Bearer {token}"})
    
    # Define collections
    collections = [
        {
            "name": "feeds",
            "type": "base",
            "schema": [
                {"name": "url", "type": "url", "required": True},
                {"name": "title", "type": "text"},
                {"name": "description", "type": "text"},
                {"name": "favicon", "type": "url"},
                {"name": "category", "type": "text"},
                {"name": "last_fetched", "type": "date"},
                {"name": "fetch_status", "type": "text"},
                {"name": "error_message", "type": "text"}
            ]
        },
        {
            "name": "feed_items",
            "type": "base",
            "schema": [
                {"name": "feed_id", "type": "relation", "options": {"collectionId": "feeds"}},
                {"name": "title", "type": "text", "required": True},
                {"name": "description", "type": "text"},
                {"name": "content", "type": "text"},
                {"name": "link", "type": "url"},
                {"name": "author", "type": "text"},
                {"name": "published_date", "type": "date"},
                {"name": "guid", "type": "text"}
            ]
        },
        {
            "name": "subscriptions",
            "type": "base",
            "schema": [
                {"name": "user_id", "type": "relation", "options": {"collectionId": "_pb_users_auth_"}},
                {"name": "feed_id", "type": "relation", "options": {"collectionId": "feeds"}},
                {"name": "subscribed_at", "type": "date"}
            ]
        },
        {
            "name": "categories",
            "type": "base",
            "schema": [
                {"name": "name", "type": "text", "required": True},
                {"name": "user_id", "type": "relation", "options": {"collectionId": "_pb_users_auth_"}},
                {"name": "color", "type": "text"}
            ]
        }
    ]
    
    # Create collections
    for collection in collections:
        create_collection(session, collection)
    
    print("✅ Collection setup complete!")

if __name__ == "__main__":
    main()