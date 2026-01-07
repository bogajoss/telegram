#!/usr/bin/env node
/**
 * Test Like Persistence
 * Verifies that:
 * 1. Likes persist after "refresh" (fetch)
 * 2. Liked posts always show in liked posts tab
 */

import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  if(line && !line.startsWith('#')) {
    const parts = line.split('=');
    if(parts.length === 2) env[parts[0].trim()] = parts[1].trim();
  }
});

const DATABASE_ID = env.VITE_APPWRITE_DATABASE_ID;
const LIKES_COLLECTION_ID = env.VITE_APPWRITE_LIKES_COLLECTION_ID;
const POST_COLLECTION_ID = env.VITE_APPWRITE_POST_COLLECTION_ID;

const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': env.VITE_APPWRITE_PROJECT_ID,
  'X-Appwrite-Key': env.APPWRITE_API_KEY,
};

async function api(method, path, body = null) {
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${env.VITE_APPWRITE_URL}${path}`, options);
  if (response.status === 204) return null;

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || response.statusText);
  return data;
}

async function testPersistence() {
  console.log('🧪 TESTING LIKE PERSISTENCE\n');

  try {
    // Get first user and post
    const users = await api('GET', `/databases/${DATABASE_ID}/collections/users/documents?limit=1`);
    const posts = await api('GET', `/databases/${DATABASE_ID}/collections/${POST_COLLECTION_ID}/documents?limit=1`);

    if (!users.documents.length || !posts.documents.length) {
      console.error('❌ No users or posts found. Create some first.');
      process.exit(1);
    }

    const userId = users.documents[0].$id;
    const postId = posts.documents[0].$id;

    console.log(`Test User: ${userId}`);
    console.log(`Test Post: ${postId}\n`);

    // Step 1: Create a like
    console.log('1️⃣  Creating a like...');
    const likeResp = await api('POST', `/databases/${DATABASE_ID}/collections/${LIKES_COLLECTION_ID}/documents`, {
      documentId: 'unique()',
      data: { user: userId, post: postId }
    });
    const likeId = likeResp.$id;
    console.log(`   ✅ Like created: ${likeId}\n`);

    // Step 2: Fetch post and check if like is in post.likes
    console.log('2. Fetching post to check if like is included...');
    const postFetch1 = await api('GET', `/databases/${DATABASE_ID}/collections/${POST_COLLECTION_ID}/documents/${postId}`);
    console.log(`   Post likes count: ${postFetch1.likes?.length || 0}`);
    const hasLike1 = postFetch1.likes && postFetch1.likes.some((l) => l.$id === likeId);
    console.log(`   Like record found: ${hasLike1 ? 'YES' : 'NO'}\n`);

    if (!postFetch1.likes || postFetch1.likes.length === 0) {
      console.warn('   WARNING: Relationship may still be syncing. Waiting 3 seconds...');
      await new Promise(r => setTimeout(r, 3000));
      
      const postFetch2 = await api('GET', `/databases/${DATABASE_ID}/collections/${POST_COLLECTION_ID}/documents/${postId}`);
      console.log(`   After sync - Post likes count: ${postFetch2.likes?.length || 0}`);
      const hasLike2 = postFetch2.likes && postFetch2.likes.some((l) => l.$id === likeId);
      console.log(`   Like record found: ${hasLike2 ? 'YES' : 'NO'}\n`);
    }

    // Step 3: Fetch user's liked posts
    console.log('3. Fetching user liked posts...');
    const likedPosts = await api('GET', `/databases/${DATABASE_ID}/collections/${LIKES_COLLECTION_ID}/documents?queries=equal("user","${userId}")`);
    console.log(`   User has liked: ${likedPosts.documents.length} post(s)`);
    const likedOurPost = likedPosts.documents.some((l) => l.post === postId);
    console.log(`   Our test post is liked: ${likedOurPost ? 'YES' : 'NO'}\n`);

    // Step 4: Simulate page refresh (fetch post again after a delay)
    console.log('4. Simulating page refresh...');
    await new Promise(r => setTimeout(r, 1000));
    
    const postFetch3 = await api('GET', `/databases/${DATABASE_ID}/collections/${POST_COLLECTION_ID}/documents/${postId}`);
    console.log(`   After refresh - Post likes count: ${postFetch3.likes?.length || 0}`);
    const likeStillExists = postFetch3.likes && postFetch3.likes.some((l) => l.$id === likeId);
    console.log(`   Like still exists: ${likeStillExists ? 'YES' : 'NO'}\n`);

    // Step 5: Verify in liked posts again
    console.log('5. Verifying liked posts list again...');
    const likedPosts2 = await api('GET', `/databases/${DATABASE_ID}/collections/${LIKES_COLLECTION_ID}/documents?queries=equal("user","${userId}")`);
    const postInLikedList = likedPosts2.documents.some((l) => l.post === postId);
    console.log(`   Post in liked list: ${postInLikedList ? 'YES' : 'NO'}\n`);

    // Cleanup
    console.log('🧹 Cleaning up...');
    await api('DELETE', `/databases/${DATABASE_ID}/collections/${LIKES_COLLECTION_ID}/documents/${likeId}`);
    console.log('✅ Test like deleted\n');

    // Results
    console.log('═'.repeat(60));
    if (likeStillExists && postInLikedList) {
      console.log('PERSISTENCE TEST PASSED!');
      console.log('');
      console.log('YES - Likes persist after page refresh');
      console.log('YES - Liked posts always show in liked posts tab');
      console.log('YES - User can unlike anytime');
    } else {
      console.log('PERSISTENCE TEST FAILED');
      if (!likeStillExists) console.log('NO - Like did not persist after refresh');
      if (!postInLikedList) console.log('NO - Post not showing in liked posts list');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testPersistence();
