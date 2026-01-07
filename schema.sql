-- Mock Schema for Social Media App (Appwrite)
-- Note: Appwrite is a NoSQL document store. This SQL schema is a conceptual representation 
-- of the data structure found in `src/types/index.ts` and `src/lib/appwrite/api.ts`.

-- ============================================================
-- 1. Users Collection
-- ============================================================
-- Corresponds to `userCollectionId`
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY, -- Appwrite Document ID ($id)
    account_id VARCHAR(255) NOT NULL, -- Links to internal Appwrite Auth Account ($id)
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT,
    image_url TEXT, -- URL to the avatar image
    image_id VARCHAR(255), -- ID of the file in Appwrite Storage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- $createdAt
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- $updatedAt
);

-- ============================================================
-- 2. Posts Collection
-- ============================================================
-- Corresponds to `postCollectionId`
CREATE TABLE posts (
    id VARCHAR(255) PRIMARY KEY, -- Appwrite Document ID ($id)
    creator_id VARCHAR(255) NOT NULL, -- Relationship: Many-to-One (Post -> User)
    caption TEXT,
    image_url TEXT, -- URL to the post image
    image_id VARCHAR(255), -- ID of the file in Appwrite Storage
    location VARCHAR(255),
    tags TEXT[], -- Array of strings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- $createdAt
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- $updatedAt
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 3. Saves Collection
-- ============================================================
-- Corresponds to `savesCollectionId`
-- Represents a bookmark/save action by a user on a post.
CREATE TABLE saves (
    id VARCHAR(255) PRIMARY KEY, -- Appwrite Document ID ($id)
    user_id VARCHAR(255) NOT NULL, -- Relationship: Many-to-One (Save -> User)
    post_id VARCHAR(255) NOT NULL, -- Relationship: Many-to-One (Save -> Post)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- $createdAt
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- $updatedAt
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE(user_id, post_id) -- Prevent duplicate saves
);

-- ============================================================
-- 4. Post Likes (Conceptual Junction Table)
-- ============================================================
-- In Appwrite, this is handled via a 'likes' attribute on the 'posts' document 
-- which contains an array of User Documents (or IDs).
-- In SQL, this is represented as a Many-to-Many junction table.
CREATE TABLE post_likes (
    post_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    PRIMARY KEY (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
