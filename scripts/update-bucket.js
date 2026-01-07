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
const STORAGE_ID = env.VITE_APPWRITE_STORAGE_ID;

async function updateBucket() {
  console.log(`Updating Storage bucket "${STORAGE_ID}" to allow more extensions...`);
  
  try {
    const response = await fetch(`${ENDPOINT}/storage/buckets/${STORAGE_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
      },
      body: JSON.stringify({
        name: 'Media Storage',
        permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
        fileSecurity: false,
        maximumFileSize: 52428800, // 50MB
        allowedFileExtensions: ['jpg', 'png', 'gif', 'jpeg', 'svg', 'mp4', 'webp', 'heic', 'avif'],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update bucket');
    }

    console.log('✅ Bucket extensions updated successfully!');
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

updateBucket();
