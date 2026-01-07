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

async function testClientAuth() {
  const email = `client_${Date.now()}@example.com`;
  const password = 'password123';
  const name = 'Client User';

  console.log(`Testing Client Auth (POST /account) on ${ENDPOINT}...`);
  
  try {
    const response = await fetch(`${ENDPOINT}/account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': PROJECT_ID,
      },
      body: JSON.stringify({
        userId: 'unique()',
        email,
        password,
        name,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create account');
    }

    console.log('✅ Account created successfully!');
    console.log('User ID:', data.$id);

  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

testClientAuth();
