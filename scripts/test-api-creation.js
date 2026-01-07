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

const ENDPOINT = env.VITE_APP_URL || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = env.VITE_APPWRITE_PROJECT_ID;
const API_KEY = env.APPWRITE_API_KEY;
const DATABASE_ID = env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = env.VITE_APPWRITE_USER_COLLECTION_ID;

async function createTestUser() {
  const email = `test_${Date.now()}@example.com`;
  const password = 'password123';
  const name = 'Test User';
  const username = `testuser_${Date.now()}`;

  console.log(`Attempting to create user: ${email}...`);
  
  try {
    // 1. Create Auth Account
    const authRes = await fetch(`${ENDPOINT}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
      },
      body: JSON.stringify({
        userId: 'unique()',
        email,
        password,
        name,
      }),
    });

    const authData = await authRes.json();
    if (!authRes.ok) throw new Error(`Auth Error: ${authData.message}`);

    const accountId = authData.$id;
    console.log(`✅ Auth account created: ${accountId}`);

    // 2. Create DB Document
    console.log('Attempting to create database document...');
    const dbRes = await fetch(`${ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
      },
      body: JSON.stringify({
        documentId: 'unique()',
        data: {
          accountId: accountId,
          name: name,
          email: email,
          username: username,
          imageUrl: 'https://example.com/avatar.png'
        }
      }),
    });

    const dbData = await dbRes.json();
    if (!dbRes.ok) throw new Error(`DB Error: ${dbData.message}`);

    console.log(`✅ DB document created: ${dbData.$id}`);
    console.log('Test successful!');

  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

createTestUser();
