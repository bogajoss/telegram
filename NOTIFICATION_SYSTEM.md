# Notification System Documentation

## Overview

The notification system allows users to receive real-time notifications when:

- Someone likes their post
- Someone comments on their post
- Someone follows them (extensible)

## Architecture

### 1. Database Schema (Appwrite)

**Collection: `notifications`**

Fields:

- `userId` (String) - The recipient of the notification
- `type` (String) - Type of notification: `like`, `comment`, or `follow`
- `actorId` (String) - The user who performed the action
- `postId` (String, optional) - Related post ID
- `commentId` (String, optional) - Related comment ID
- `message` (String) - Human-readable notification message
- `read` (Boolean) - Whether the notification has been read
- `$createdAt` (DateTime) - Timestamp

### 2. API Layer (`src/lib/appwrite/api.ts`)

#### Core Functions

**`createNotification()`**

- Creates a new notification record
- Prevents self-notifications (user cannot be notified of their own actions)
- Error resilient - won't break core functionality if notification fails

**`getUserNotifications(userId, limit)`**

- Fetches paginated notifications for a user
- Orders by most recent first
- Returns max 20 notifications by default

**`getUnreadNotificationCount(userId)`**

- Returns the count of unread notifications
- Used for badge display

**`markNotificationAsRead(notificationId)`**

- Marks a single notification as read

**`markAllNotificationsAsRead(userId)`**

- Bulk update to mark all notifications as read

**`deleteNotification(notificationId)`**

- Removes a notification

#### Triggering Notifications

**In `likePost()`**

```typescript
// After successful like creation:
const post = await databases.getDocument(databaseId, postsCollectionId, postId);
if (post.userId !== currentUserId) {
  await createNotification(
    post.userId,
    "like",
    currentUserId,
    postId,
    undefined,
    `${currentUserName} liked your post`
  );
}
```

**In `createComment()`**

```typescript
// After successful comment creation:
const post = await databases.getDocument(databaseId, postsCollectionId, postId);
if (post.userId !== currentUserId) {
  await createNotification(
    post.userId,
    "comment",
    currentUserId,
    postId,
    commentId,
    `${currentUserName} commented on your post`
  );
}
```

### 3. React Query Integration (`src/lib/react-query/queries.ts`)

#### Hooks

**`useGetNotifications(userId)`**

- Auto-refetch every 10 seconds
- Returns paginated notifications
- Only enabled if userId exists

**`useGetUnreadCount(userId)`**

- Auto-refetch every 5 seconds
- Returns count of unread notifications
- Only enabled if userId exists

**`useMarkNotificationAsRead()`**

- Mutation to mark single notification as read
- Invalidates both notifications and count cache

**`useMarkAllNotificationsAsRead()`**

- Mutation for bulk marking as read
- Invalidates both notifications and count cache

**`useDeleteNotification()`**

- Mutation to delete a notification
- Invalidates both notifications and count cache

### 4. UI Components

#### NotificationBell (`src/components/shared/NotificationBell.tsx`)

**Features:**

- Bell icon with unread badge (shows count 1-9+)
- Click to open/close dropdown
- Click outside to close
- Scrollable notification list (max 420px height)
- Each notification displays:
  - Type emoji (❤️ for like, 💬 for comment, 👤 for follow)
  - Message text
  - Relative time (now, Xm ago, Xh ago, Xd ago)
- Hover actions:
  - Checkmark: Mark as read (only if unread)
  - Trash: Delete notification
- Header with "Mark all as read" button
- Click notification to navigate to related post
- Empty state when no notifications

**State Management:**

```typescript
const [isOpen, setIsOpen] = useState(false); // Dropdown open/close
```

**Hooks Used:**

- `useGetNotifications()` - Fetch notifications
- `useGetUnreadCount()` - Fetch unread count
- `useMarkNotificationAsRead()` - Mark single as read
- `useMarkAllNotificationsAsRead()` - Mark all as read
- `useDeleteNotification()` - Delete notification
- `useNavigate()` - Navigate to related post

#### Integration in Topbar

The NotificationBell is positioned in the top navigation bar between the search bar and logout button, providing easy access to notifications.

## Real-Time Updates

Currently uses **polling** via React Query:

- Notifications list: Refetch every 10 seconds
- Unread count badge: Refetch every 5 seconds

**Future Enhancement:**
Can be upgraded to WebSocket for true real-time updates by:

1. Setting up Appwrite Realtime subscriptions
2. Using `useEffect` to subscribe/unsubscribe
3. Updating local state on new notifications

## Setup Instructions

### 1. Environment Configuration

Add to `.env.local`:

```
VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID=notifications
```

(Optional: If not provided, defaults to "notifications")

### 2. Database Setup

Create the `notifications` collection in Appwrite with the schema above.

Set permissions:

- Default (public read/write for user's own notifications)
- Can be restricted per your security requirements

### 3. Verify Installation

1. Start dev server: `pnpm dev`
2. Check browser console for any errors
3. Like a post from a different user account
4. Check the notification bell - should see new notification appear within 5-10 seconds

## Error Handling

### Notification Creation Failures

If notification creation fails:

- Like/comment operations continue normally (wrapped in try-catch)
- Error is logged to console
- User is not aware of the failure

This ensures notifications are a "nice-to-have" feature that doesn't break core functionality.

### Self-Notifications Prevention

Automatically prevents creating notifications when:

- User likes their own post
- User comments on their own post

This is handled by comparing `post.userId` with `currentUserId` before notification creation.

## Performance Considerations

1. **Polling Interval:** 5-10 seconds provides good balance between real-time feel and server load
2. **Cache Invalidation:** Only invalidates on mutations, not on every refetch
3. **Pagination:** Returns only 20 notifications at a time
4. **Badge Count:** Cached and refetched every 5 seconds
5. **Lazy Loading:** Components only fetch if userId exists

## Scalability Path

1. **Phase 1 (Current):** Polling-based with React Query
2. **Phase 2:** Appwrite Realtime subscriptions for true real-time
3. **Phase 3:** Web Workers for background fetching
4. **Phase 4:** Service Workers + Push Notifications

## Testing Checklist

- [ ] User A likes User B's post → User B gets notification within 10s
- [ ] User A comments on User B's post → User B gets notification within 10s
- [ ] Self-like doesn't create notification
- [ ] Self-comment doesn't create notification
- [ ] Click notification navigates to post
- [ ] Mark as read removes highlight
- [ ] Mark all as read updates all notifications
- [ ] Delete notification removes it from list
- [ ] Badge count updates correctly
- [ ] Dropdown closes on click outside
- [ ] Multiple rapid actions create appropriate notifications
- [ ] Notifications persist after refresh

## Troubleshooting

### Notifications not appearing

1. Check browser console for errors
2. Verify Notifications collection exists in Appwrite
3. Verify collection ID is correct in config
4. Check network tab for API calls
5. Wait 5-10 seconds for refetch interval

### Badge not updating

1. Check if `useGetUnreadCount` hook is active
2. Verify userId is being passed correctly
3. Check React Query DevTools for cache state
4. Clear browser cache

### Old notifications not fetching

1. Increase the limit in `useGetNotifications` hook
2. Implement pagination/load more feature
3. Check Appwrite collection size limits

## Code References

- Configuration: [src/lib/appwrite/config.ts](src/lib/appwrite/config.ts)
- API Functions: [src/lib/appwrite/api.ts](src/lib/appwrite/api.ts)
- Query Hooks: [src/lib/react-query/queries.ts](src/lib/react-query/queries.ts)
- Query Keys: [src/lib/react-query/queryKeys.ts](src/lib/react-query/queryKeys.ts)
- Component: [src/components/shared/NotificationBell.tsx](src/components/shared/NotificationBell.tsx)
- Integration: [src/components/shared/Topbar.tsx](src/components/shared/Topbar.tsx)
