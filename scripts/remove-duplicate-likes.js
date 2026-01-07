#!/usr/bin/env node
/**
 * Remove Duplicate Likes
 * Identifies and removes duplicate likes (same user + post combination)
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

async function removeDuplicates() {
  console.log('🔍 REMOVING DUPLICATE LIKES\n');

  try {
    // Fetch all likes
    const allLikes = await api('GET', `/databases/${DATABASE_ID}/collections/${LIKES_COLLECTION_ID}/documents?limit=1000`);
    console.log(`Total likes in database: ${allLikes.total}\n`);

    // Group likes by user + post combination
    const likeMap = new Map();
    const duplicates = [];

    for (const like of allLikes.documents) {
      const key = `${like.user}-${like.post}`;
      
      if (likeMap.has(key)) {
        // This is a duplicate
        duplicates.push({
          key,
          documentId: like.$id,
          user: like.user,
          post: like.post,
          createdAt: like.$createdAt
        });
      } else {
        // First occurrence, keep it
        likeMap.set(key, like.$id);
      }
    }

    if (duplicates.length === 0) {
      console.log('✅ No duplicate likes found!\n');
      return;
    }

    console.log(`⚠️  Found ${duplicates.length} duplicate like(s):\n`);

    // Group by user-post pair to show summary
    const summary = new Map();
    for (const dup of duplicates) {
      if (!summary.has(dup.key)) {
        summary.set(dup.key, []);
      }
      summary.get(dup.key).push(dup.documentId);
    }

    for (const [key, docIds] of summary) {
      const [user, post] = key.split('-');
      console.log(`User ${user} → Post ${post}`);
      console.log(`  Duplicate IDs to remove: ${docIds.join(', ')}`);
    }

    console.log('\nDeleting duplicates...\n');

    // Delete duplicates (keep first occurrence)
    for (const dup of duplicates) {
      await api('DELETE', `/databases/${DATABASE_ID}/collections/${LIKES_COLLECTION_ID}/documents/${dup.documentId}`);
      console.log(`✓ Deleted: ${dup.documentId}`);
    }

    console.log(`\n✅ Removed ${duplicates.length} duplicate like(s)!`);
    console.log(`📊 Final like count: ${allLikes.total - duplicates.length}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

removeDuplicates();
