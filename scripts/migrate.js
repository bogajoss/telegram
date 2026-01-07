import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ==========================================
// 1. CONFIGURATION
// ==========================================

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

// Config variables
const ENDPOINT = env.VITE_APPWRITE_URL || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = env.VITE_APPWRITE_PROJECT_ID;
const API_KEY = env.APPWRITE_API_KEY;

// Fixed IDs for the migration (You should update your .env.local with these after running)
const DATABASE_ID = env.VITE_APPWRITE_DATABASE_ID || 'social-media-db';
const USER_COLLECTION_ID = env.VITE_APPWRITE_USER_COLLECTION_ID || 'users';
const POST_COLLECTION_ID = env.VITE_APPWRITE_POST_COLLECTION_ID || 'posts';
const SAVES_COLLECTION_ID = env.VITE_APPWRITE_SAVES_COLLECTION_ID || 'saves';
const STORAGE_ID = env.VITE_APPWRITE_STORAGE_ID || 'media';

if (!API_KEY || !PROJECT_ID) {
  console.error('Error: VITE_APPWRITE_PROJECT_ID and APPWRITE_API_KEY are required in .env.local');
  process.exit(1);
}

// ==========================================
// 2. API CLIENT (using fetch)
// ==========================================

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

// ==========================================
// 3. MIGRATION LOGIC
// ==========================================

async function setup() {
  console.log('Starting migration for Social Media App...');
  console.log(`Endpoint: ${ENDPOINT}`);
  console.log(`Project ID: ${PROJECT_ID}`);

  try {
    // --- 1. Create Database ---
    try {
      await api('POST', '/databases', {
        databaseId: DATABASE_ID,
        name: 'Social Media DB',
      });
      console.log(`✅ Database "${DATABASE_ID}" created.`);
    } catch (e) {
      if (e.status === 409) console.log(`ℹ️  Database "${DATABASE_ID}" already exists.`);
      else throw e;
    }

    // --- 2. Create Storage Bucket ---
    try {
      await api('POST', '/storage/buckets', {
        bucketId: STORAGE_ID,
        name: 'Media Storage',
        permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
        fileSecurity: false,
        maximumFileSize: 52428800, // 50MB
        allowedFileExtensions: ['jpg', 'png', 'gif', 'jpeg', 'svg', 'mp4', 'webp', 'heic', 'avif'],
      });
      console.log(`✅ Storage bucket "${STORAGE_ID}" created.`);
    } catch (e) {
      if (e.status === 409) console.log(`ℹ️  Storage bucket "${STORAGE_ID}" already exists.`);
      else throw e;
    }

    // --- 3. Define Schemas ---
    const collections = [
      {
        id: USER_COLLECTION_ID,
        name: 'Users',
        attributes: [
          { key: 'accountId', type: 'string', size: 255, required: true },
          { key: 'name', type: 'string', size: 255, required: true },
          { key: 'username', type: 'string', size: 255, required: true },
          { key: 'email', type: 'string', size: 255, required: true },
          { key: 'bio', type: 'string', size: 2200, required: false },
          { key: 'imageId', type: 'string', size: 255, required: false },
          { key: 'imageUrl', type: 'url', required: false },
        ]
      },
      {
        id: POST_COLLECTION_ID,
        name: 'Posts',
        attributes: [
          { key: 'caption', type: 'string', size: 2200, required: false },
          { key: 'location', type: 'string', size: 255, required: false },
          { key: 'tags', type: 'string', size: 255, required: false, array: true },
          { key: 'imageUrl', type: 'url', required: false },
          { key: 'imageId', type: 'string', size: 255, required: false },
        ]
      },
      {
        id: SAVES_COLLECTION_ID,
        name: 'Saves',
        attributes: [] // Only relationships
      }
    ];

    // --- 4. Create Collections & Simple Attributes ---
    for (const col of collections) {
      // Create Collection
      try {
        await api('POST', `/databases/${DATABASE_ID}/collections`, {
          collectionId: col.id,
          name: col.name,
          permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
          documentSecurity: false
        });
        console.log(`✅ Collection "${col.name}" created.`);
      } catch (e) {
        if (e.status === 409) console.log(`ℹ️  Collection "${col.name}" already exists.`);
        else throw e;
      }

      // Create Attributes
      for (const attr of col.attributes) {
        try {
          const payload = {
            key: attr.key,
            required: attr.required,
            array: attr.array || false,
          };
          
          let typeEndpoint = attr.type;
          if (attr.type === 'string') {
             payload.size = attr.size || 255;
          }
          
          // API endpoint: /databases/{databaseId}/collections/{collectionId}/attributes/{type}
          await api('POST', `/databases/${DATABASE_ID}/collections/${col.id}/attributes/${typeEndpoint}`, payload);
          
          console.log(`   + Attribute "${attr.key}" created.`);
          // Small delay to prevent rate limits/race conditions
          await new Promise(r => setTimeout(r, 500)); 
        } catch (e) {
          if (e.status === 409) {
             // Attribute exists
          } else {
            console.error(`   ❌ Error creating attribute "${attr.key}": ${e.message}`);
          }
        }
      }
    }

    // --- 5. Create Relationships ---
    console.log('--- Creating Relationships ---');

    // Helper for relationships
    const createRelationship = async (collectionId, relatedCollectionId, type, key, twoWay = false, twoWayKey = '', onDelete = 'setNull') => {
      try {
        const payload = {
          relatedCollectionId,
          type,
          twoWay,
          key,
          onDelete
        };
        if (twoWay && twoWayKey) {
            payload.twoWayKey = twoWayKey;
        }

        await api('POST', `/databases/${DATABASE_ID}/collections/${collectionId}/attributes/relationship`, payload);
        console.log(`   + Relationship "${key}" created in "${collectionId}".`);
        await new Promise(r => setTimeout(r, 1000));
      } catch (e) {
        if (e.status === 409) {
           console.log(`   ℹ️  Relationship "${key}" in "${collectionId}" already exists.`);
        } else {
           console.error(`   ❌ Error creating relationship "${key}" in "${collectionId}": ${e.message}`);
        }
      }
    };

    // 1. Posts -> Creator (Many to One)
    // "creator" in Posts -> "posts" in Users
    await createRelationship(POST_COLLECTION_ID, USER_COLLECTION_ID, 'manyToOne', 'creator', true, 'posts', 'cascade');

    // 2. Posts <-> Likes (Many to Many)
    // "likes" in Posts -> "liked" in Users
    await createRelationship(POST_COLLECTION_ID, USER_COLLECTION_ID, 'manyToMany', 'likes', true, 'liked', 'cascade');

    // 3. Saves -> User (Many to One)
    // "user" in Saves -> "save" in Users
    await createRelationship(SAVES_COLLECTION_ID, USER_COLLECTION_ID, 'manyToOne', 'user', true, 'save', 'cascade');

    // 4. Saves -> Post (Many to One)
    // "post" in Saves -> (No inverse in Post types usually, but let's check)
    // If I set twoWay: false, key 'post'.
    await createRelationship(SAVES_COLLECTION_ID, POST_COLLECTION_ID, 'manyToOne', 'post', false, undefined, 'cascade');


    console.log('\n✅ Migration completed successfully!');
    console.log('------------------------------------------------');
    console.log('Please update your .env.local with these IDs if they are empty:');
    console.log(`VITE_APPWRITE_DATABASE_ID=${DATABASE_ID}`);
    console.log(`VITE_APPWRITE_USER_COLLECTION_ID=${USER_COLLECTION_ID}`);
    console.log(`VITE_APPWRITE_POST_COLLECTION_ID=${POST_COLLECTION_ID}`);
    console.log(`VITE_APPWRITE_SAVES_COLLECTION_ID=${SAVES_COLLECTION_ID}`);
    console.log(`VITE_APPWRITE_STORAGE_ID=${STORAGE_ID}`);
    console.log('------------------------------------------------');

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

setup();
