import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

const ENDPOINT = env.VITE_APPWRITE_URL || 'https://sgp.cloud.appwrite.io/v1';
const PROJECT_ID = env.VITE_APPWRITE_PROJECT_ID;
const API_KEY = env.APPWRITE_API_KEY;
const DATABASE_ID = env.VITE_APPWRITE_DATABASE_ID || 'social-media-db';
const USER_COLLECTION_ID = env.VITE_APPWRITE_USER_COLLECTION_ID || 'users';
const POST_COLLECTION_ID = env.VITE_APPWRITE_POST_COLLECTION_ID || 'posts';

const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': PROJECT_ID,
  'X-Appwrite-Key': API_KEY,
};

async function api(method, path) {
  const response = await fetch(`${ENDPOINT}${path}`, { method, headers });
  return await response.json();
}

async function inspect() {
  try {
    const userCol = await api('GET', `/databases/${DATABASE_ID}/collections/${USER_COLLECTION_ID}`);
    console.log("Users Collection Permissions:", userCol.permissions);

    const postCol = await api('GET', `/databases/${DATABASE_ID}/collections/${POST_COLLECTION_ID}`);
    console.log("Posts Collection Permissions:", postCol.permissions);
  } catch (error) {
    console.error(error);
  }
}

inspect();
