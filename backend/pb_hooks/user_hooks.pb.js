// User registration hook - creates default feed and subscription for new users
onRecordAfterCreateRequest((e) => {
    // Only run for users collection
    if (e.collection.name !== "users") {
        return
    }

    const userId = e.record.id
    console.log(`Creating default feed subscription for user: ${userId}`)

    try {
        // Find the default Fox News feed
        const feeds = $app.dao().findRecordsByExpr("feeds", $dbx.exp("is_default = true"))
        
        if (feeds.length === 0) {
            console.log("No default feed found, creating one...")
            
            // Create default feed if it doesn't exist
            const feedsCollection = $app.dao().findCollectionByNameOrId("feeds")
            const defaultFeed = new Record(feedsCollection, {
                "url": "https://feeds.foxnews.com/foxnews/latest",
                "title": "Fox News - Latest",
                "category": "News",
                "is_default": true,
                "fetch_status": "pending"
            })
            
            $app.dao().saveRecord(defaultFeed)
            
            // Create subscription for this user
            const subscriptionsCollection = $app.dao().findCollectionByNameOrId("subscriptions")
            const subscription = new Record(subscriptionsCollection, {
                "user_id": userId,
                "feed_id": defaultFeed.id,
                "subscribed_at": new Date().toISOString()
            })
            
            $app.dao().saveRecord(subscription)
            console.log(`Created default feed and subscription for user: ${userId}`)
        } else {
            // Use existing default feed
            const defaultFeed = feeds[0]
            
            // Create subscription for this user
            const subscriptionsCollection = $app.dao().findCollectionByNameOrId("subscriptions")
            const subscription = new Record(subscriptionsCollection, {
                "user_id": userId,
                "feed_id": defaultFeed.id,
                "subscribed_at": new Date().toISOString()
            })
            
            $app.dao().saveRecord(subscription)
            console.log(`Created subscription to existing default feed for user: ${userId}`)
        }
    } catch (error) {
        console.error(`Error creating default subscription for user ${userId}:`, error)
    }
}, "users")