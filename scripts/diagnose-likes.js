#!/usr/bin/env node
/**
 * Comprehensive Diagnostics for Likes System
 * Checks collection structure, relationships, permissions, and data integrity
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env.local');

const env = {};
fs.readFileSync(envPath, 'utf8')
  .split('\n')
  .forEach((line) => {
    if (line && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) env[key.trim()] = value.trim();
    }
  });

const ENDPOINT = env.VITE_APPWRITE_URL;
const PROJECT_ID = env.VITE_APPWRITE_PROJECT_ID;
const API_KEY = env.APPWRITE_API_KEY;
const DATABASE_ID = env.VITE_APPWRITE_DATABASE_ID;
const LIKES_COLLECTION_ID = env.VITE_APPWRITE_LIKES_COLLECTION_ID;
const POST_COLLECTION_ID = env.VITE_APPWRITE_POST_COLLECTION_ID;
const USER_COLLECTION_ID = env.VITE_APPWRITE_USER_COLLECTION_ID;

const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': PROJECT_ID,
  'X-Appwrite-Key': API_KEY,
};

async function api(method, path, body = null) {
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${ENDPOINT}${path}`, options);
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const error = new Error(data?.message || response.statusText);
    error.status = response.status;
    error.code = data?.code;
    throw error;
  }
  return data;
}

async function diagnose() {
  console.log('🔍 LIKES SYSTEM DIAGNOSTICS\n');
  console.log(`Database: ${DATABASE_ID}`);
  console.log(`Likes Collection: ${LIKES_COLLECTION_ID}`);
  console.log(`Posts Collection: ${POST_COLLECTION_ID}`);
  console.log(`Users Collection: ${USER_COLLECTION_ID}\n`);

  try {
    // 1. Check Likes Collection Structure
    console.log('1️⃣  Checking Likes Collection Structure...');
    const likesCollection = await api('GET', `/databases/${DATABASE_ID}/collections/${LIKES_COLLECTION_ID}`);
    console.log(`   ✓ Collection exists: "${likesCollection.name}"`);
    console.log(`   Attributes: ${likesCollection.attributes.length}`);
    console.log(`   Document Security: ${likesCollection.documentSecurity}`);
    console.log();

    // 2. Check Relationships
    console.log('2️⃣  Checking Relationships...');
    const relationships = likesCollection.attributes.filter(attr => attr.type === 'relationship');
    for (const rel of relationships) {
      console.log(`   Relationship: "${rel.key}" → ${rel.relatedCollection}`);
      console.log(`      Status: ${rel.status}`);
      console.log(`      Type: ${rel.relationType} (${rel.side})`);
      console.log(`      Two-Way: ${rel.twoWay} ${rel.twoWayKey ? `(key: "${rel.twoWayKey}")` : ''}`);
    }
    console.log();

    // 3. Check Permissions
    console.log('3️⃣  Checking Permissions...');
    const perms = likesCollection.permissions || [];
    const readPerms = perms.filter(p => p.includes('read'));
    const createPerms = perms.filter(p => p.includes('create'));
    const updatePerms = perms.filter(p => p.includes('update'));
    const deletePerms = perms.filter(p => p.includes('delete'));
    
    console.log(`   Read: ${readPerms.length ? '✓' : '✗'} (${readPerms[0] || 'none'})`);
    console.log(`   Create: ${createPerms.length ? '✓' : '✗'} (${createPerms[0] || 'none'})`);
    console.log(`   Update: ${updatePerms.length ? '✓' : '✗'} (${updatePerms[0] || 'none'})`);
    console.log(`   Delete: ${deletePerms.length ? '✓' : '✗'} (${deletePerms[0] || 'none'})`);
    console.log();

    // 4. Check for Sample Data
    console.log('4️⃣  Checking Sample Likes...');
    const likesDocs = await api('GET', `/databases/${DATABASE_ID}/collections/${LIKES_COLLECTION_ID}/documents?limit=5`);
    console.log(`   Total likes in database: ${likesDocs.total}`);
    if (likesDocs.documents.length > 0) {
      console.log(`   Sample documents:`);
      likesDocs.documents.slice(0, 3).forEach(doc => {
        console.log(`     - ID: ${doc.$id}`);
        console.log(`       User: ${doc.user?.['$id'] || doc.user || 'N/A'}`);
        console.log(`       Post: ${doc.post?.['$id'] || doc.post || 'N/A'}`);
      });
    } else {
      console.log(`   ℹ️  No likes found (expected for new setup)`);
    }
    console.log();

    // 5. Check Posts Collection for Likes Relationship
    console.log('5️⃣  Checking Posts Collection...');
    const postsCollection = await api('GET', `/databases/${DATABASE_ID}/collections/${POST_COLLECTION_ID}`);
    const likesRel = postsCollection.attributes.find(attr => attr.key === 'likes');
    if (likesRel) {
      console.log(`   ✓ Likes relationship found on posts`);
      console.log(`     Type: ${likesRel.relationType} (${likesRel.side})`);
      console.log(`     Status: ${likesRel.status}`);
    } else {
      console.log(`   ✗ Likes relationship NOT found on posts`);
    }
    console.log();

    // Final Status
    console.log('✅ DIAGNOSTICS COMPLETE');
    console.log('\nRecommendations:');
    
    if (relationships.some(r => r.status !== 'available')) {
      console.log('⚠️  Some relationships are still processing. Wait a minute and try again.');
    }
    const finalPerms = likesCollection.permissions || [];
    if (!finalPerms.some(p => p.includes('create("any")'))) {
      console.log('❌ CRITICAL: Create permissions are missing! Run fix-permissions.js');
    }
    if (!likesRel) {
      console.log('⚠️  Re-run setup.js to recreate the relationships.');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.code) {
      console.error(`Code: ${error.code}`);
    }
    process.exit(1);
  }
}

diagnose();
