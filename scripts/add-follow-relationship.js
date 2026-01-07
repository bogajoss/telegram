import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Helper to parse .env.local
const envPath = path.join(__dirname, '../.env.local');
const env = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*["']?([^"]*)["']?\s*$/);
    if (match) {
      env[match[1]] = match[2];
    }
  });
}

const ENDPOINT = env.VITE_APPWRITE_URL || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = env.VITE_APPWRITE_PROJECT_ID;
const API_KEY = env.APPWRITE_API_KEY;
const DATABASE_ID = env.VITE_APPWRITE_DATABASE_ID;
const USER_COLLECTION_ID = env.VITE_APPWRITE_USER_COLLECTION_ID;

const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': PROJECT_ID,
  'X-Appwrite-Key': API_KEY,
};

async function api(method, path, body = null) {
  const options = {
    method,
    headers,
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${ENDPOINT}${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data?.message || response.statusText);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function addFollowRelationship() {
  console.log('Adding follow relationship to Users collection...');
  try {
    const payload = {
      relatedCollectionId: USER_COLLECTION_ID,
      type: 'manyToMany',
      twoWay: true,
      key: 'followers',
      twoWayKey: 'following',
      onDelete: 'cascade'
    };

    await api('POST', `/databases/${DATABASE_ID}/collections/${USER_COLLECTION_ID}/attributes/relationship`, payload);
    console.log('✅ Relationship "followers" <-> "following" created successfully!');
  } catch (e) {
    if (e.status === 409) {
      console.log('ℹ️  Relationship already exists.');
    } else {
      console.error('❌ Error:', e.message);
    }
  }
}

addFollowRelationship();
