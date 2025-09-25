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

def update_collection_permissions(session, collection_id, updates):
    """Update a collection's permissions"""
    try:
        resp = session.patch(f"{PB_URL}/api/collections/{collection_id}", json=updates)
        if resp.status_code in [200, 201]:
            return True
        else:
            print(f"❌ Failed to update collection {collection_id}: {resp.text}")
    except Exception as e:
        print(f"❌ Error updating collection {collection_id}: {e}")
    return False

def get_collections(session):
    """Get all collections"""
    try:
        resp = session.get(f"{PB_URL}/api/collections")
        if resp.status_code == 200:
            return resp.json().get("items", [])
    except Exception as e:
        print(f"Error getting collections: {e}")
    return []

def main():
    print("🔧 Updating PocketBase collection permissions...")
    
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
        print("❌ Failed to authenticate")
        sys.exit(1)
    
    session = requests.Session()
    session.headers.update({"Authorization": f"Bearer {token}"})
    
    # Get all collections
    collections = get_collections(session)
    collections_by_name = {col['name']: col for col in collections}
    
    # Update permissions for each collection
    updates = {
        'feeds': {
            "listRule": "@request.auth.id != ''",
            "viewRule": "@request.auth.id != ''", 
            "createRule": "@request.auth.id != ''",
            "updateRule": "@request.auth.id != ''",
            "deleteRule": "@request.auth.id != ''"
        },
        'feed_items': {
            "listRule": "@request.auth.id != ''",
            "viewRule": "@request.auth.id != ''",
            "createRule": "@request.auth.id != ''",
            "updateRule": "@request.auth.id != ''",
            "deleteRule": "@request.auth.id != ''"
        },
        'subscriptions': {
            "listRule": "@request.auth.id != ''",
            "viewRule": "@request.auth.id != ''",
            "createRule": "@request.auth.id != ''",
            "updateRule": "@request.auth.id != ''",
            "deleteRule": "@request.auth.id != ''"
        },
        'categories': {
            "listRule": "@request.auth.id != ''",
            "viewRule": "@request.auth.id != ''",
            "createRule": "@request.auth.id != ''",
            "updateRule": "@request.auth.id != ''",
            "deleteRule": "@request.auth.id != ''"
        }
    }
    
    for collection_name, permission_updates in updates.items():
        if collection_name in collections_by_name:
            collection = collections_by_name[collection_name]
            print(f"Updating {collection_name} permissions...")
            
            if update_collection_permissions(session, collection['id'], permission_updates):
                print(f"✅ Updated {collection_name} permissions")
            else:
                print(f"❌ Failed to update {collection_name} permissions")
        else:
            print(f"⚠️  Collection {collection_name} not found")
    
    print("✅ Permission updates complete!")

if __name__ == "__main__":
    main()