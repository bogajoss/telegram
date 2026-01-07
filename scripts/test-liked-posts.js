#!/usr/bin/env node

import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  if(line && !line.startsWith('#')) {
    const parts = line.split('=');
    if(parts.length === 2) env[parts[0].trim()] = parts[1].trim();
  }
});

const BASE_URL = env.VITE_APPWRITE_URL;
const PROJECT_ID = env.VITE_APPWRITE_PROJECT_ID;
const API_KEY = env.APPWRITE_API_KEY;
const DATABASE_ID = env.VITE_APPWRITE_DATABASE_ID;
const LIKES_COLLECTION_ID = env.VITE_APPWRITE_LIKES_COLLECTION_ID;
const POSTS_COLLECTION_ID = env.VITE_APPWRITE_POST_COLLECTION_ID;

const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': PROJECT_ID,
  'X-Appwrite-Key': API_KEY,
};

async function query(method, endpoint, body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers,
  };
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(url, options);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
}

async function testGetUserLikedPosts() {
  try {
    console.log("🔍 Testing getUserLikedPosts logic...\n");

    // Get all likes (first few)
    const allLikes = await query(
      'GET',
      `/databases/${DATABASE_ID}/collections/${LIKES_COLLECTION_ID}/documents?limit=5`
    );

    console.log(`📊 Total likes in database: ${allLikes.total}`);
    console.log(`📋 Sample likes:\n`);

    allLikes.documents.slice(0, 2).forEach((like, i) => {
      console.log(`  Like ${i + 1}:`);
      console.log(`    - user: ${like.user}`);
      console.log(`    - post: ${like.post}`);
      console.log(`    - Type of post: ${typeof like.post}`);
    });

    if (allLikes.documents.length === 0) {
      console.log("⚠️  No likes found in database");
      return;
    }

    console.log("\n📝 Now testing post document fetch...\n");

    // Test fetching a single post
    const firstLike = allLikes.documents[0];
    const postId = firstLike.post;

    console.log(`  Fetching post: ${postId}`);
    console.log(`  Post ID type: ${typeof postId}`);

    const postDoc = await query(
      'GET',
      `/databases/${DATABASE_ID}/collections/${POSTS_COLLECTION_ID}/documents/${postId}`
    );

    console.log(`  ✅ Post fetched successfully`);
    console.log(`     - $id: ${postDoc.$id}`);
    console.log(`     - Caption: ${postDoc.caption?.substring(0, 50) || "(no caption)"}...`);
    console.log(`     - imageUrl exists: ${!!postDoc.imageUrl}`);
    console.log(`     - imageUrl value: ${postDoc.imageUrl || "NOT SET"}\n`);

    console.log("✅ Test completed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  }
}

testGetUserLikedPosts();
