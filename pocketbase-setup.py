#!/usr/bin/env python3

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
PB_VERSION = "0.30.0"
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
    print(f"✅ Directories created under {INSTALL_DIR}")

def download_pocketbase():
    system = platform.system().lower()
    arch = platform.machine().lower()
    
    # Map architecture names to PocketBase naming convention
    if arch in ['x86_64', 'amd64']:
        arch = 'amd64'
    elif arch in ['arm64', 'aarch64']:
        arch = 'arm64'
    
    if system == "windows":
        pb_filename = f"pocketbase_{PB_VERSION}_{system}_{arch}.zip"
    elif system in ["linux", "darwin"]:
        pb_filename = f"pocketbase_{PB_VERSION}_{system}_{arch}.zip"
    else:
        raise RuntimeError(f"Unsupported OS: {system}")

    download_url = f"https://github.com/pocketbase/pocketbase/releases/download/v{PB_VERSION}/{pb_filename}"
    zip_path = INSTALL_DIR / pb_filename

    if PB_BINARY.exists():
        print("✅ PocketBase binary already exists. Skipping download.")
        return

    print(f"📦 Downloading PocketBase {PB_VERSION}...")
    r = requests.get(download_url, stream=True)
    if r.status_code != 200:
        raise RuntimeError(f"Failed to download PocketBase: {r.status_code}")
    
    with open(zip_path, "wb") as f:
        for chunk in r.iter_content(1024):
            f.write(chunk)
    
    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(INSTALL_DIR)
    zip_path.unlink()
    
    # Make binary executable
    PB_BINARY.chmod(0o755)
    print(f"✅ PocketBase downloaded and extracted to {INSTALL_DIR}")

def start_pocketbase():
    print("🚀 Starting PocketBase...")
    env = os.environ.copy()
    proc = subprocess.Popen([str(PB_BINARY), "serve", "--dir", str(INSTALL_DIR / "data")], 
                           cwd=INSTALL_DIR, env=env)
    print("⏳ PocketBase is starting, waiting 3 seconds...")
    time.sleep(3)
    return proc

def create_admin_user():
    print("👤 Creating admin user...")
    result = subprocess.run([
        str(PB_BINARY), 
        "superuser", 
        "upsert", 
        ADMIN_EMAIL, 
        ADMIN_PASSWORD
    ], cwd=INSTALL_DIR, capture_output=True, text=True)
    
    if result.returncode == 0:
        print("✅ Admin user created successfully.")
        return True
    else:
        print(f"❌ Admin user creation failed: {result.stderr}")
        return False

def print_success_message():
    print("\n" + "="*60)
    print("🎉 POCKETBASE SETUP COMPLETE!")
    print("="*60)
    print(f"🌐 PocketBase is running at: {PB_URL}")
    print(f"⚙️  Admin Dashboard: {PB_URL}/_/")
    print(f"📊 REST API: {PB_URL}/api/")
    print()
    print("👤 Admin Credentials:")
    print(f"   Email: {ADMIN_EMAIL}")
    print(f"   Password: {ADMIN_PASSWORD}")
    print()
    print("📋 Next Steps:")
    print("1. Open the Admin Dashboard in your browser")
    print("2. Login with the admin credentials above")
    print("3. Create the necessary collections for the RSS reader:")
    print("   - users (auth collection)")
    print("   - feeds")
    print("   - feed_items")
    print("   - subscriptions")
    print("   - categories")
    print()
    print("🛠️  To stop PocketBase later, press Ctrl+C or run:")
    print(f"   pkill -f pocketbase")
    print("="*60)

def main():
    try:
        print("🔧 Setting up PocketBase for RSS Reader...")
        print()
        
        ensure_directories()
        download_pocketbase()
        
        # Start PocketBase in background
        proc = start_pocketbase()
        
        # Create admin user
        if create_admin_user():
            print_success_message()
            
            # Keep PocketBase running
            print("\n⏳ PocketBase is now running. Press Ctrl+C to stop...")
            try:
                proc.wait()
            except KeyboardInterrupt:
                print("\n🛑 Stopping PocketBase...")
                proc.terminate()
                proc.wait()
                print("✅ PocketBase stopped.")
        else:
            print("❌ Failed to create admin user. Stopping PocketBase...")
            proc.terminate()
            proc.wait()
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()