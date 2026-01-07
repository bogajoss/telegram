#!/usr/bin/env node

/**
 * 🚀 All-In-One Database Setup Script
 *
 * This script sets up a completely fresh database with:
 * - Database creation
 * - All collections (Users, Posts, Comments, Likes, Saves, Notifications)
 * - All attributes and indexes
 * - All relationships
 * - Proper permissions
 *
 * Usage: node scripts/db.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ===================================================
// 1. LOAD ENVIRONMENT VARIABLES
// ===================================================

const envPath = path.join(__dirname, "../.env.local");
if (!fs.existsSync(envPath)) {
  console.error("\n❌ ERROR: .env.local not found!");
  console.error("   Create .env.local with your Appwrite credentials first.\n");
  process.exit(1);
}

const env = {};
fs.readFileSync(envPath, "utf8")
  .split("\n")
  .forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.+?)\s*$/);
    if (match && !line.startsWith("#")) {
      env[match[1]] = match[2];
    }
  });

const ENDPOINT = env.VITE_APPWRITE_URL || "https://sgp.cloud.appwrite.io/v1";
const PROJECT_ID = env.VITE_APPWRITE_PROJECT_ID;
const API_KEY = env.APPWRITE_API_KEY;

if (!PROJECT_ID || !API_KEY) {
  console.error("\n❌ ERROR: Missing credentials in .env.local");
  console.error("   Required: VITE_APPWRITE_PROJECT_ID, APPWRITE_API_KEY\n");
  process.exit(1);
}

// Collection IDs
const DATABASE_ID = env.VITE_APPWRITE_DATABASE_ID || "social-media-db";
const USER_COLLECTION_ID = env.VITE_APPWRITE_USER_COLLECTION_ID || "users";
const POST_COLLECTION_ID = env.VITE_APPWRITE_POST_COLLECTION_ID || "posts";
const COMMENTS_COLLECTION_ID =
  env.VITE_APPWRITE_COMMENTS_COLLECTION_ID || "comments";
const LIKES_COLLECTION_ID = env.VITE_APPWRITE_LIKES_COLLECTION_ID || "likes";
const SAVES_COLLECTION_ID = env.VITE_APPWRITE_SAVES_COLLECTION_ID || "saves";
const NOTIFICATIONS_COLLECTION_ID =
  env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID || "notifications";
const STORAGE_ID = env.VITE_APPWRITE_STORAGE_ID || "media";

// ===================================================
// 2. API CLIENT
// ===================================================

const headers = {
  "Content-Type": "application/json",
  "X-Appwrite-Project": PROJECT_ID,
  "X-Appwrite-Key": API_KEY,
};

async function api(method, path, body = null) {
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(`${ENDPOINT}${path}`, options);
    if (response.status === 204) return null;

    const contentType = response.headers.get("content-type");
    let data = null;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    }

    if (!response.ok) {
      const error = new Error(data?.message || response.statusText);
      error.status = response.status;
      error.code = data?.code;
      throw error;
    }
    return data;
  } catch (error) {
    throw error;
  }
}

// ===================================================
// 3. HELPER FUNCTIONS
// ===================================================

let stepCount = 0;
let successCount = 0;
let skipCount = 0;

function logStep(title) {
  console.log(`\n📌 ${++stepCount}. ${title}`);
  console.log("─".repeat(60));
}

function logSuccess(msg) {
  console.log(`   ✅ ${msg}`);
  successCount++;
}

function logSkip(msg) {
  console.log(`   ℹ️  ${msg}`);
  skipCount++;
}

function logError(msg) {
  console.log(`   ❌ ${msg}`);
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ===================================================
// 4. SETUP FUNCTIONS
// ===================================================

async function createDatabase() {
  logStep("Create Database");
  try {
    await api("POST", "/databases", {
      databaseId: DATABASE_ID,
      name: "Social Media DB",
    });
    logSuccess(`Database "${DATABASE_ID}" created`);
  } catch (e) {
    if (e.status === 409) {
      logSkip(`Database already exists`);
    } else {
      logError(`Failed to create database: ${e.message}`);
      throw e;
    }
  }
}

async function createStorageBucket() {
  logStep("Create Storage Bucket");
  try {
    await api("POST", "/storage/buckets", {
      bucketId: STORAGE_ID,
      name: "Media Storage",
      permissions: [
        'read("any")',
        'create("users")',
        'update("users")',
        'delete("users")',
      ],
      fileSecurity: false,
      maximumFileSize: 52428800,
      allowedFileExtensions: [
        "jpg",
        "png",
        "gif",
        "jpeg",
        "svg",
        "mp4",
        "webp",
        "heic",
        "avif",
      ],
    });
    logSuccess(`Storage bucket "${STORAGE_ID}" created`);
  } catch (e) {
    if (e.status === 409) {
      logSkip(`Storage bucket already exists`);
    } else {
      logError(`Failed to create storage: ${e.message}`);
      throw e;
    }
  }
}

async function createCollections() {
  logStep("Create Collections");

  const collections = [
    {
      id: USER_COLLECTION_ID,
      name: "Users",
      attributes: [
        { key: "accountId", type: "string", size: 255, required: true },
        { key: "name", type: "string", size: 255, required: true },
        { key: "username", type: "string", size: 255, required: true },
        { key: "email", type: "string", size: 255, required: true },
        { key: "bio", type: "string", size: 2200, required: false },
        { key: "imageId", type: "string", size: 255, required: false },
        { key: "imageUrl", type: "string", size: 2200, required: false },
        {
          key: "is_verified",
          type: "boolean",
          required: false,
          default: false,
        },
        {
          key: "followers",
          type: "string",
          size: 255,
          required: false,
          array: true,
        },
        {
          key: "followingUsers",
          type: "string",
          size: 255,
          required: false,
          array: true,
        },
      ],
      indexes: [
        { key: "idx_accountId", type: "key", attributes: ["accountId"] },
        { key: "idx_username", type: "unique", attributes: ["username"] },
        { key: "idx_email", type: "unique", attributes: ["email"] },
      ],
    },
    {
      id: POST_COLLECTION_ID,
      name: "Posts",
      attributes: [
        { key: "caption", type: "string", size: 2200, required: false },
        {
          key: "tags",
          type: "string",
          size: 255,
          required: false,
          array: true,
        },
        { key: "imageUrl", type: "string", size: 2200, required: false },
        { key: "imageId", type: "string", size: 255, required: false },
      ],
      indexes: [
        { key: "idx_createdAt", type: "key", attributes: ["$createdAt"] },
      ],
    },
    {
      id: COMMENTS_COLLECTION_ID,
      name: "Comments",
      attributes: [
        { key: "content", type: "string", size: 2000, required: true },
      ],
      indexes: [],
    },
    {
      id: LIKES_COLLECTION_ID,
      name: "Likes",
      attributes: [],
      indexes: [],
    },
    {
      id: SAVES_COLLECTION_ID,
      name: "Saves",
      attributes: [],
      indexes: [],
    },
    {
      id: NOTIFICATIONS_COLLECTION_ID,
      name: "Notifications",
      attributes: [
        { key: "userId", type: "string", size: 36, required: false },
        { key: "recipient", type: "string", size: 36, required: false },
        {
          key: "type",
          type: "enum",
          elements: ["like", "comment", "follow"],
          required: true,
        },
        { key: "actorId", type: "string", size: 36, required: false },
        { key: "actor", type: "string", size: 36, required: false },
        { key: "postId", type: "string", size: 36, required: false },
        { key: "commentId", type: "string", size: 36, required: false },
        { key: "message", type: "string", size: 256, required: true },
        { key: "read", type: "boolean", required: true },
      ],
      indexes: [
        { key: "idx_userId", type: "key", attributes: ["userId"] },
        { key: "idx_recipient", type: "key", attributes: ["recipient"] },
        { key: "idx_read", type: "key", attributes: ["read"] },
        { key: "idx_createdAt", type: "key", attributes: ["$createdAt"] },
        {
          key: "idx_recipient_read",
          type: "key",
          attributes: ["recipient", "read"],
        },
        {
          key: "idx_userId_read",
          type: "key",
          attributes: ["userId", "read"],
        },
      ],
    },
  ];

  for (const col of collections) {
    try {
      await api("POST", `/databases/${DATABASE_ID}/collections`, {
        collectionId: col.id,
        name: col.name,
        permissions: [
          'read("any")',
          'create("any")',
          'update("any")',
          'delete("any")',
        ],
        documentSecurity: false,
      });
      logSuccess(`Collection "${col.name}" created`);
    } catch (e) {
      if (e.status === 409) {
        logSkip(`Collection "${col.name}" already exists`);
      } else {
        logError(`Failed to create collection "${col.name}": ${e.message}`);
        throw e;
      }
    }

    // Create attributes
    for (const attr of col.attributes || []) {
      try {
        const payload = {
          key: attr.key,
          required: attr.required || false,
          array: attr.array || false,
        };

        if (attr.type === "string") {
          payload.size = attr.size || 255;
        }
        if (attr.default !== undefined) {
          payload.default = attr.default;
        }

        await api(
          "POST",
          `/databases/${DATABASE_ID}/collections/${col.id}/attributes/${attr.type}`,
          {
            ...payload,
            ...(attr.elements && { elements: attr.elements }),
          }
        );

        logSuccess(`${col.name}: attribute "${attr.key}" created`);
        await sleep(300);
      } catch (e) {
        if (e.status === 409) {
          logSkip(`${col.name}: attribute "${attr.key}" already exists`);
        } else {
          logError(
            `${col.name}: attribute "${attr.key}" failed - ${e.message}`
          );
        }
      }
    }

    // Create indexes
    for (const idx of col.indexes || []) {
      try {
        await api(
          "POST",
          `/databases/${DATABASE_ID}/collections/${col.id}/indexes`,
          idx
        );
        logSuccess(`${col.name}: index "${idx.key}" created`);
        await sleep(300);
      } catch (e) {
        if (e.status === 409) {
          logSkip(`${col.name}: index "${idx.key}" already exists`);
        } else {
          logError(`${col.name}: index "${idx.key}" failed - ${e.message}`);
        }
      }
    }
  }
}

async function createRelationships() {
  logStep("Create Relationships");

  const relationships = [
    // Posts -> User (creator)
    {
      collectionId: POST_COLLECTION_ID,
      relatedCollectionId: USER_COLLECTION_ID,
      type: "manyToOne",
      key: "creator",
      twoWay: true,
      twoWayKey: "posts",
      onDelete: "cascade",
    },
    // Comments -> User (creator)
    {
      collectionId: COMMENTS_COLLECTION_ID,
      relatedCollectionId: USER_COLLECTION_ID,
      type: "manyToOne",
      key: "creator",
      twoWay: false,
      onDelete: "cascade",
    },
    // Comments -> Post
    {
      collectionId: COMMENTS_COLLECTION_ID,
      relatedCollectionId: POST_COLLECTION_ID,
      type: "manyToOne",
      key: "post",
      twoWay: true,
      twoWayKey: "comments",
      onDelete: "cascade",
    },
    // Likes -> User
    {
      collectionId: LIKES_COLLECTION_ID,
      relatedCollectionId: USER_COLLECTION_ID,
      type: "manyToOne",
      key: "user",
      twoWay: true,
      twoWayKey: "liked",
      onDelete: "cascade",
    },
    // Likes -> Post
    {
      collectionId: LIKES_COLLECTION_ID,
      relatedCollectionId: POST_COLLECTION_ID,
      type: "manyToOne",
      key: "post",
      twoWay: true,
      twoWayKey: "likes",
      onDelete: "cascade",
    },
    // Saves -> User
    {
      collectionId: SAVES_COLLECTION_ID,
      relatedCollectionId: USER_COLLECTION_ID,
      type: "manyToOne",
      key: "user",
      twoWay: true,
      twoWayKey: "save",
      onDelete: "cascade",
    },
    // Saves -> Post
    {
      collectionId: SAVES_COLLECTION_ID,
      relatedCollectionId: POST_COLLECTION_ID,
      type: "manyToOne",
      key: "post",
      twoWay: false,
      onDelete: "cascade",
    },
  ];

  for (const rel of relationships) {
    try {
      const payload = {
        relatedCollectionId: rel.relatedCollectionId,
        type: rel.type,
        twoWay: rel.twoWay,
        key: rel.key,
        onDelete: rel.onDelete,
      };
      if (rel.twoWay && rel.twoWayKey) {
        payload.twoWayKey = rel.twoWayKey;
      }

      await api(
        "POST",
        `/databases/${DATABASE_ID}/collections/${rel.collectionId}/attributes/relationship`,
        payload
      );
      logSuccess(
        `Relationship "${rel.key}" created (${rel.collectionId} -> ${rel.relatedCollectionId})`
      );
      await sleep(500);
    } catch (e) {
      if (e.status === 409) {
        logSkip(`Relationship "${rel.key}" already exists`);
      } else {
        logError(`Relationship "${rel.key}" failed - ${e.message}`);
      }
    }
  }
}

// ===================================================
// 5. MAIN EXECUTION
// ===================================================

async function main() {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║  🚀 All-In-One Database Setup (Complete Fresh Start)  ║");
  console.log("╚════════════════════════════════════════════════════════╝");
  console.log(`\nEndpoint: ${ENDPOINT}`);
  console.log(`Project ID: ${PROJECT_ID}`);
  console.log(`Database ID: ${DATABASE_ID}`);

  const startTime = Date.now();

  try {
    await createDatabase();
    await sleep(500);

    await createStorageBucket();
    await sleep(500);

    await createCollections();
    await sleep(500);

    await createRelationships();
    await sleep(500);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("\n");
    console.log("╔════════════════════════════════════════════════════════╗");
    console.log("║  ✅ DATABASE SETUP COMPLETE!                          ║");
    console.log("╚════════════════════════════════════════════════════════╝");
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ℹ️  Skipped: ${skipCount}`);
    console.log(`   ⏱️  Duration: ${duration}s`);

    console.log(`\n📋 Collections Created:`);
    console.log(`   • ${USER_COLLECTION_ID}`);
    console.log(`   • ${POST_COLLECTION_ID}`);
    console.log(`   • ${COMMENTS_COLLECTION_ID}`);
    console.log(`   • ${LIKES_COLLECTION_ID}`);
    console.log(`   • ${SAVES_COLLECTION_ID}`);
    console.log(`   • ${NOTIFICATIONS_COLLECTION_ID}`);

    console.log(`\n🎉 Your database is ready to use!`);
    console.log(`\n📌 Next Steps:`);
    console.log(`   1. pnpm dev`);
    console.log(`   2. Test: Like a post or comment`);
    console.log(`   3. Check notification bell (updates every 5-10 seconds)\n`);
  } catch (error) {
    console.error("\n");
    console.error("╔════════════════════════════════════════════════════════╗");
    console.error("║  ❌ SETUP FAILED                                       ║");
    console.error("╚════════════════════════════════════════════════════════╝");
    console.error(`\nError: ${error.message}`);
    console.error("\n💡 Troubleshooting:");
    console.error("   1. Check .env.local exists with correct credentials");
    console.error("   2. Verify VITE_APPWRITE_PROJECT_ID is correct");
    console.error("   3. Verify APPWRITE_API_KEY is correct");
    console.error("   4. Check internet connection to Appwrite");
    console.error("   5. Try again in a few seconds\n");
    process.exit(1);
  }
}

// Run the setup
main();
