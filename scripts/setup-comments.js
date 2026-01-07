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
const POST_COLLECTION_ID = env.VITE_APPWRITE_POST_COLLECTION_ID;
const COMMENTS_COLLECTION_ID = 'comments';

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

async function setupComments() {
  console.log('Setting up Comments collection...');
  
  try {
    // 1. Create Collection
    try {
      await api('POST', `/databases/${DATABASE_ID}/collections`, {
        collectionId: COMMENTS_COLLECTION_ID,
        name: 'Comments',
        permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
        documentSecurity: false
      });
      console.log('✅ Collection "Comments" created.');
    } catch (e) {
      if (e.status === 409) console.log('ℹ️  Collection "Comments" already exists.');
      else throw e;
    }

    // 2. Add content attribute
    try {
      await api('POST', `/databases/${DATABASE_ID}/collections/${COMMENTS_COLLECTION_ID}/attributes/string`, {
        key: 'content',
        size: 2000,
        required: true
      });
      console.log('✅ Attribute "content" created.');
    } catch (e) {
      if (e.status === 409) console.log('ℹ️  Attribute "content" already exists.');
      else throw e;
    }

    // Wait a bit for attributes to propagate
    await new Promise(r => setTimeout(r, 1000));

    // 3. Add relationships
    // Relationship: creator (Many to One) -> Users
    try {
      await api('POST', `/databases/${DATABASE_ID}/collections/${COMMENTS_COLLECTION_ID}/attributes/relationship`, {
        relatedCollectionId: USER_COLLECTION_ID,
        type: 'manyToOne',
        twoWay: false,
        key: 'creator',
        onDelete: 'cascade'
      });
      console.log('✅ Relationship "creator" created.');
    } catch (e) {
      if (e.status === 409) console.log('ℹ️  Relationship "creator" already exists.');
      else throw e;
    }

    // Relationship: post (Many to One) -> Posts
    try {
      await api('POST', `/databases/${DATABASE_ID}/collections/${COMMENTS_COLLECTION_ID}/attributes/relationship`, {
        relatedCollectionId: POST_COLLECTION_ID,
        type: 'manyToOne',
        twoWay: true,
        key: 'post',
        twoWayKey: 'comments',
        onDelete: 'cascade'
      });
      console.log('✅ Relationship "post" created.');
    } catch (e) {
      if (e.status === 409) console.log('ℹ️  Relationship "post" already exists.');
      else throw e;
    }

    console.log('\n✅ Comments system database setup completed!');
    console.log(`Add this to your .env.local: VITE_APPWRITE_COMMENTS_COLLECTION_ID=${COMMENTS_COLLECTION_ID}`);

  } catch (error) {
    console.error('❌ Error during setup:', error.message);
  }
}

setupComments();
