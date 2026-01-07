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
const COLLECTION_ID = env.VITE_APPWRITE_USER_COLLECTION_ID;

async function checkDocs() {
  console.log(`Checking documents in database: ${DATABASE_ID}, collection: ${COLLECTION_ID}...`);
  
  try {
    const response = await fetch(`${ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch documents');
    }

    console.log(`Total documents found: ${data.total}`);
    if (data.documents.length > 0) {
      data.documents.forEach(doc => {
        console.log(`- Document ID: ${doc.$id}, Name: ${doc.name}, Email: ${doc.email}, Username: ${doc.username}`);
      });
    } else {
      console.log('No documents found in this collection.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkDocs();
