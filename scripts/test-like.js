#!/usr/bin/env node
/**
 * Test Like Functionality
 * Simulates what happens when a user clicks the like button
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
const USER_ID = 'test-user-' + Math.random().toString(36).substring(7);
const POST_ID = '695e0ebb002a8b6cc3ec'; // First post in system

const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': env.VITE_APPWRITE_PROJECT_ID,
  'X-Appwrite-Key': env.APPWRITE_API_KEY,
};

async function testLike() {
  console.log('📝 Testing Like Functionality\n');
  console.log(`User ID: ${USER_ID}`);
  console.log(`Post ID: ${POST_ID}\n`);

  try {
    // Step 1: Create a like
    console.log('1️⃣  Creating a like document...');
    const createResp = await fetch(
      `${env.VITE_APPWRITE_URL}/databases/${DATABASE_ID}/collections/${LIKES_COLLECTION_ID}/documents`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          documentId: 'unique()',
          data: {
            user: USER_ID,
            post: POST_ID
          }
        })
      }
    );

    if (!createResp.ok) {
      const error = await createResp.json();
      console.error(`❌ Failed to create like: ${error.message}`);
      console.error(`Status: ${createResp.status}`);
      console.error(`Error: ${JSON.stringify(error, null, 2)}`);
      process.exit(1);
    }

    const likeDoc = await createResp.json();
    console.log(`✅ Like created successfully!`);
    console.log(`   Document ID: ${likeDoc.$id}`);
    console.log(`   Permissions: ${likeDoc.$permissions.join(', ')}\n`);

    // Step 2: Fetch the like to verify it's readable
    console.log('2️⃣  Fetching the like document...');
    const fetchResp = await fetch(
      `${env.VITE_APPWRITE_URL}/databases/${DATABASE_ID}/collections/${LIKES_COLLECTION_ID}/documents/${likeDoc.$id}`,
      { method: 'GET', headers }
    );

    if (!fetchResp.ok) {
      const error = await fetchResp.json();
      console.error(`❌ Failed to fetch like: ${error.message}`);
      process.exit(1);
    }

    const fetchedLike = await fetchResp.json();
    console.log(`✅ Like fetched successfully!`);
    console.log(`   User: ${fetchedLike.user}`);
    console.log(`   Post: ${fetchedLike.post}\n`);

    // Step 3: Delete the like
    console.log('3️⃣  Deleting the like document...');
    const deleteResp = await fetch(
      `${env.VITE_APPWRITE_URL}/databases/${DATABASE_ID}/collections/${LIKES_COLLECTION_ID}/documents/${likeDoc.$id}`,
      { method: 'DELETE', headers }
    );

    if (!deleteResp.ok) {
      const error = await deleteResp.json();
      console.error(`❌ Failed to delete like: ${error.message}`);
      process.exit(1);
    }

    console.log(`✅ Like deleted successfully!\n`);

    console.log('✅✅✅ ALL LIKE TESTS PASSED! ✅✅✅');
    console.log('\nThe like button should now work correctly in the app.');

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

testLike();
