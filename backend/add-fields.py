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

def main():
    print("🔧 Adding missing fields to collections...")
    
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
    
    # Get feeds collection
    resp = session.get(f"{PB_URL}/api/collections")
    collections = {col['name']: col for col in resp.json().get("items", [])}
    
    if 'feeds' in collections:
        feeds_collection = collections['feeds']
        
        # Add is_default field to feeds schema
        schema = feeds_collection.get('schema', [])
        field_names = [field['name'] for field in schema]
        
        if 'is_default' not in field_names:
            print("Adding is_default field to feeds collection...")
            schema.append({
                "name": "is_default", 
                "type": "bool",
                "required": False
            })
            
            # Update the collection
            update_data = {"schema": schema}
            resp = session.patch(f"{PB_URL}/api/collections/{feeds_collection['id']}", json=update_data)
            
            if resp.status_code in [200, 201]:
                print("✅ Added is_default field to feeds collection")
            else:
                print(f"❌ Failed to add field: {resp.text}")
        else:
            print("✅ is_default field already exists in feeds collection")
    
    print("✅ Field updates complete!")

if __name__ == "__main__":
    main()