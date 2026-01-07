import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env.local');
const env = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*["']?([^"']*)["']?\s*$/);
    if (match) {
      env[match[1]] = match[2];
    }
  });
}

const ENDPOINT = env.VITE_APPWRITE_URL || 'https://sgp.cloud.appwrite.io/v1';
const PROJECT_ID = env.VITE_APPWRITE_PROJECT_ID;
const API_KEY = env.APPWRITE_API_KEY;
const DATABASE_ID = env.VITE_APPWRITE_DATABASE_ID || 'social-media-db';
const USER_COLLECTION_ID = env.VITE_APPWRITE_USER_COLLECTION_ID || 'users';
const POST_COLLECTION_ID = env.VITE_APPWRITE_POST_COLLECTION_ID || 'posts';
const LIKES_COLLECTION_ID = env.VITE_APPWRITE_LIKES_COLLECTION_ID || 'likes';
const SAVES_COLLECTION_ID = env.VITE_APPWRITE_SAVES_COLLECTION_ID || 'saves';
const COMMENTS_COLLECTION_ID = env.VITE_APPWRITE_COMMENTS_COLLECTION_ID || 'comments';

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
  return await response.json();
}

async function fix() {
  try {
    console.log("Setting collection permissions to 'any' and disabling document security...");
    
    const collections = [
      { id: POST_COLLECTION_ID, name: 'Posts' },
      { id: USER_COLLECTION_ID, name: 'Users' },
      { id: LIKES_COLLECTION_ID, name: 'Likes' },
      { id: SAVES_COLLECTION_ID, name: 'Saves' },
      { id: COMMENTS_COLLECTION_ID, name: 'Comments' }
    ];

    for (const col of collections) {
      await api('PUT', `/databases/${DATABASE_ID}/collections/${col.id}`, {
        name: col.name,
        permissions: ['read("any")', 'create("any")', 'update("any")', 'delete("any")'],
        documentSecurity: false
      });
      console.log(`✓ ${col.name} collection permissions updated`);
    }

    console.log("\nUpdating individual post permissions to 'any'...");
    const posts = await api('GET', `/databases/${DATABASE_ID}/collections/${POST_COLLECTION_ID}/documents`);
    for (const post of posts.documents) {
        await api('PATCH', `/databases/${DATABASE_ID}/collections/${POST_COLLECTION_ID}/documents/${post.$id}`, {
            permissions: ['read("any")', 'update("any")', 'delete("any")']
        });
    }

    console.log("Updating individual user permissions to 'any'...");
    const users = await api('GET', `/databases/${DATABASE_ID}/collections/${USER_COLLECTION_ID}/documents`);
    for (const user of users.documents) {
        await api('PATCH', `/databases/${DATABASE_ID}/collections/${USER_COLLECTION_ID}/documents/${user.$id}`, {
            permissions: ['read("any")', 'update("any")', 'delete("any")']
        });
    }

    console.log("Updating like documents permissions to 'any'...");
    const likes = await api('GET', `/databases/${DATABASE_ID}/collections/${LIKES_COLLECTION_ID}/documents?limit=100`);
    for (const like of likes.documents) {
        await api('PATCH', `/databases/${DATABASE_ID}/collections/${LIKES_COLLECTION_ID}/documents/${like.$id}`, {
            permissions: ['read("any")', 'update("any")', 'delete("any")']
        });
    }
    console.log(`✓ Updated ${likes.documents.length} like documents`);

    console.log("✅ Permissions fixed!");
  } catch (error) {
    console.error(error);
  }
}

fix();
