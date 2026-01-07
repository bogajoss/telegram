#!/bin/bash

# Notification System Setup Verification Script
# This script verifies that the notification system is properly configured

echo "================================"
echo "Notification System Verification"
echo "================================"
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✓ .env.local file exists"
else
    echo "✗ .env.local file not found"
    echo "  Please create it with the required Appwrite environment variables"
fi

echo ""
echo "Checking required files..."
echo ""

# Check NotificationBell component
if [ -f "src/components/shared/NotificationBell.tsx" ]; then
    echo "✓ NotificationBell component exists"
else
    echo "✗ NotificationBell component not found"
fi

# Check API functions
if grep -q "createNotification" src/lib/appwrite/api.ts; then
    echo "✓ createNotification function exists"
else
    echo "✗ createNotification function not found"
fi

if grep -q "getUserNotifications" src/lib/appwrite/api.ts; then
    echo "✓ getUserNotifications function exists"
else
    echo "✗ getUserNotifications function not found"
fi

if grep -q "getUnreadNotificationCount" src/lib/appwrite/api.ts; then
    echo "✓ getUnreadNotificationCount function exists"
else
    echo "✗ getUnreadNotificationCount function not found"
fi

# Check React Query hooks
if grep -q "useGetNotifications" src/lib/react-query/queries.ts; then
    echo "✓ useGetNotifications hook exists"
else
    echo "✗ useGetNotifications hook not found"
fi

if grep -q "useGetUnreadCount" src/lib/react-query/queries.ts; then
    echo "✓ useGetUnreadCount hook exists"
else
    echo "✗ useGetUnreadCount hook not found"
fi

# Check Topbar integration
if grep -q "NotificationBell" src/components/shared/Topbar.tsx; then
    echo "✓ NotificationBell integrated in Topbar"
else
    echo "✗ NotificationBell not found in Topbar"
fi

echo ""
echo "================================"
echo "Notification Triggers Verification"
echo "================================"
echo ""

# Check likePost modification
if grep -q "createNotification" src/lib/appwrite/api.ts && grep -B5 -A10 "export async function likePost" src/lib/appwrite/api.ts | grep -q "createNotification"; then
    echo "✓ likePost triggers notifications"
else
    echo "✗ likePost notification trigger not found"
fi

# Check createComment modification
if grep -q "createNotification" src/lib/appwrite/api.ts && grep -B5 -A10 "export async function createComment" src/lib/appwrite/api.ts | grep -q "createNotification"; then
    echo "✓ createComment triggers notifications"
else
    echo "✗ createComment notification trigger not found"
fi

echo ""
echo "================================"
echo "Setup Instructions"
echo "================================"
echo ""
echo "1. Ensure you have the following Appwrite environment variables in .env.local:"
echo "   - VITE_APPWRITE_ENDPOINT"
echo "   - VITE_APPWRITE_PROJECT_ID"
echo "   - VITE_APPWRITE_DATABASE_ID"
echo "   - VITE_APPWRITE_POSTS_COLLECTION_ID"
echo "   - VITE_APPWRITE_COMMENTS_COLLECTION_ID"
echo "   - VITE_APPWRITE_LIKES_COLLECTION_ID"
echo "   - VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID (optional, defaults to 'notifications')"
echo ""
echo "2. Create the 'notifications' collection in your Appwrite database with:"
echo "   Fields: userId, type, actorId, postId, commentId, message, read"
echo ""
echo "3. Start the development server:"
echo "   pnpm dev"
echo ""
echo "4. Test the notification system:"
echo "   - Create a post as User A"
echo "   - Log in as User B"
echo "   - Like the post → Check notification bell for User A"
echo "   - Comment on the post → Check notification bell for User A"
echo ""
echo "5. Notifications update every 5-10 seconds via polling"
echo ""
echo "For more information, see NOTIFICATION_SYSTEM.md"
echo ""
