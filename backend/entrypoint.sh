#!/bin/sh

# PocketBase Docker entrypoint script

set -e

echo "🚀 Starting PocketBase RSS Reader Backend..."

# Create admin user if it doesn't exist
if [ ! -f "pb_data/data.db" ]; then
    echo "📦 First run detected - setting up database..."
    
    # Start PocketBase in background to create initial database
    ./pocketbase serve --dir=pb_data --http=127.0.0.1:8090 &
    PB_PID=$!
    
    # Wait for PocketBase to start
    sleep 5
    
    # Create admin user
    echo "👤 Creating admin user..."
    ./pocketbase superuser upsert admin@example.com password123 --dir=pb_data || true
    
    # Setup collections
    echo "🗄️  Setting up database collections..."
    python3 setup-collections.py || true
    
    # Stop background PocketBase
    kill $PB_PID 2>/dev/null || true
    wait $PB_PID 2>/dev/null || true
    
    echo "✅ Database setup complete!"
fi

# Start feed fetcher in background
echo "📡 Starting RSS feed fetcher..."
python3 feed-fetch.py &

# Start PocketBase server
echo "🌐 Starting PocketBase server on port 8090..."
exec ./pocketbase serve --dir=pb_data --http=0.0.0.0:8090