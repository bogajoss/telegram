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

const ENDPOINT = env.VITE_APPWRITE_URL || 'https://sgp.cloud.appwrite.io/v1';
const PROJECT_ID = env.VITE_APPWRITE_PROJECT_ID;
const API_KEY = env.APPWRITE_API_KEY;

// Collection IDs
const DATABASE_ID = env.VITE_APPWRITE_DATABASE_ID || 'social-media-db';
const USER_COLLECTION_ID = env.VITE_APPWRITE_USER_COLLECTION_ID || 'users';
const POST_COLLECTION_ID = env.VITE_APPWRITE_POST_COLLECTION_ID || 'posts';
const SAVES_COLLECTION_ID = env.VITE_APPWRITE_SAVES_COLLECTION_ID || 'saves';
const COMMENTS_COLLECTION_ID = env.VITE_APPWRITE_COMMENTS_COLLECTION_ID || 'comments';
const STORAGE_ID = env.VITE_APPWRITE_STORAGE_ID || 'media';

if (!API_KEY || !PROJECT_ID) {
  console.error('Error: VITE_APPWRITE_PROJECT_ID and APPWRITE_API_KEY are required in .env.local');
  process.exit(1);
}

// ==========================================
// 2. API CLIENT
// ==========================================

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

// ==========================================
// 3. SETUP LOGIC
// ==========================================

async function setup() {
  console.log('🚀 Starting Comprehensive Social Media App Setup...');
  console.log(`Endpoint: ${ENDPOINT}`);
  console.log(`Project ID: ${PROJECT_ID}`);

  try {
    // --- 1. Create Database ---
    try {
      await api('POST', '/databases', { databaseId: DATABASE_ID, name: 'Social Media DB' });
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

    // --- 3. Define Collections ---
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
          { key: 'is_verified', type: 'boolean', required: false, default: false },
          { key: 'followers', type: 'string', size: 255, required: false, array: true },
          { key: 'followingUsers', type: 'string', size: 255, required: false, array: true },
        ],
        indexes: [
          { key: 'idx_accountId', type: 'key', attributes: ['accountId'] },
          { key: 'idx_username', type: 'unique', attributes: ['username'] },
          { key: 'idx_email', type: 'unique', attributes: ['email'] },
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
        ],
        indexes: [
          { key: 'idx_createdAt', type: 'key', attributes: ['$createdAt'] }
        ]
      },
      {
        id: SAVES_COLLECTION_ID,
        name: 'Saves',
        attributes: [] // Only relationships
      },
      {
        id: COMMENTS_COLLECTION_ID,
        name: 'Comments',
        attributes: [
          { key: 'content', type: 'string', size: 2000, required: true },
        ]
      }
    ];

    // --- 4. Create Collections & Attributes ---
    for (const col of collections) {
      try {
        await api('POST', `/databases/${DATABASE_ID}/collections`, {
          collectionId: col.id,
          name: col.name,
          permissions: ['read("any")', 'create("any")', 'update("any")', 'delete("any")'],
          documentSecurity: false
        });
        console.log(`✅ Collection "${col.name}" created.`);
      } catch (e) {
        if (e.status === 409) console.log(`ℹ️  Collection "${col.name}" already exists.`);
        else throw e;
      }

      for (const attr of col.attributes || []) {
        try {
          const payload = { key: attr.key, required: attr.required, array: attr.array || false };
          if (attr.type === 'string') payload.size = attr.size || 255;
          if (attr.type === 'url') {
             // URL type in Appwrite is a string with URL format
             await api('POST', `/databases/${DATABASE_ID}/collections/${col.id}/attributes/string`, { ...payload, size: 2000, format: 'url' });
          } else {
            if (attr.default !== undefined) payload.default = attr.default;
            await api('POST', `/databases/${DATABASE_ID}/collections/${col.id}/attributes/${attr.type}`, payload);
          }
          console.log(`   + Attribute "${attr.key}" created.`);
          await new Promise(r => setTimeout(r, 600)); 
        } catch (e) {
          if (e.status !== 409) console.error(`   ❌ Error attribute "${attr.key}": ${e.message}`);
        }
      }

      for (const idx of col.indexes || []) {
        try {
          await api('POST', `/databases/${DATABASE_ID}/collections/${col.id}/indexes`, idx);
          console.log(`   + Index "${idx.key}" created.`);
        } catch (e) {
          if (e.status !== 409) console.error(`   ❌ Error index "${idx.key}": ${e.message}`);
        }
      }
    }

    // --- 5. Create Relationships ---
    console.log('\n--- Creating Relationships ---');

    const createRel = async (colId, relColId, type, key, twoWay = false, twoWayKey = '', onDelete = 'cascade') => {
      try {
        const payload = { relatedCollectionId: relColId, type, twoWay, key, onDelete };
        if (twoWay && twoWayKey) payload.twoWayKey = twoWayKey;
        await api('POST', `/databases/${DATABASE_ID}/collections/${colId}/attributes/relationship`, payload);
        console.log(`   + Relationship "${key}" created.`);
        await new Promise(r => setTimeout(r, 1000));
      } catch (e) {
        if (e.status !== 409) console.error(`   ❌ Error rel "${key}": ${e.message}`);
      }
    };

    // Relationships
    // 1. Post -> Creator (Many to One)
    await createRel(POST_COLLECTION_ID, USER_COLLECTION_ID, 'manyToOne', 'creator', true, 'posts', 'cascade');
    
    // 2. Post <-> Likes (Many to Many)
    await createRel(POST_COLLECTION_ID, USER_COLLECTION_ID, 'manyToMany', 'likes', true, 'liked', 'cascade');
    
    // 3. Save -> User (Many to One)
    await createRel(SAVES_COLLECTION_ID, USER_COLLECTION_ID, 'manyToOne', 'user', true, 'save', 'cascade');
    
    // 4. Save -> Post (Many to One)
    await createRel(SAVES_COLLECTION_ID, POST_COLLECTION_ID, 'manyToOne', 'post', false, '', 'cascade');
    
    // 5. Comment -> Creator (Many to One)
    await createRel(COMMENTS_COLLECTION_ID, USER_COLLECTION_ID, 'manyToOne', 'creator', false, '', 'cascade');
    
    // 6. Comment -> Post (Many to One)
    await createRel(COMMENTS_COLLECTION_ID, POST_COLLECTION_ID, 'manyToOne', 'post', true, 'comments', 'cascade');

    console.log('\n✅ All-in-one setup completed successfully!');
    console.log('------------------------------------------------');
    console.log('Please verify your .env.local matches these IDs:');
    console.log(`VITE_APPWRITE_DATABASE_ID=${DATABASE_ID}`);
    console.log(`VITE_APPWRITE_USER_COLLECTION_ID=${USER_COLLECTION_ID}`);
    console.log(`VITE_APPWRITE_POST_COLLECTION_ID=${POST_COLLECTION_ID}`);
    console.log(`VITE_APPWRITE_SAVES_COLLECTION_ID=${SAVES_COLLECTION_ID}`);
    console.log(`VITE_APPWRITE_COMMENTS_COLLECTION_ID=${COMMENTS_COLLECTION_ID}`);
    console.log(`VITE_APPWRITE_STORAGE_ID=${STORAGE_ID}`);
    console.log('------------------------------------------------');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
  }
}

setup();