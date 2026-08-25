// // lib/mongodb.js
// import { MongoClient } from 'mongodb';

// // ---- Validate Environment Variables ----------------------------------------

// if (!process.env.MONGODB_URI) {
//   throw new Error('Please define MONGODB_URI in .env.local');
// }

// if (!process.env.MONGODB_DB) {
//   throw new Error('Please define MONGODB_DB in .env.local');
// }

// // ---- Constants -------------------------------------------------------------

// const MONGODB_URI = process.env.MONGODB_URI;
// const MONGODB_DB = process.env.MONGODB_DB;

// // Collection names
// const USERS_COLLECTION = process.env.MONGODB_COLLECTION_USERS || 'users';
// const DASHDATA_COLLECTION = process.env.MONGODB_COLLECTION_DASHDATA || 'dashdata';
// const CHATS_COLLECTION = process.env.MONGODB_COLLECTION_CHATS || 'chats';

// // ---- MongoDB Connection ---------------------------------------------

// let client;
// let clientPromise;

// if (process.env.NODE_ENV === 'development') {
//   if (!global._mongoClientPromise) {
//     client = new MongoClient(MONGODB_URI);
//     global._mongoClientPromise = client.connect();
//   }
//   clientPromise = global._mongoClientPromise;
// } else {
//   client = new MongoClient(MONGODB_URI);
//   clientPromise = client.connect();
// }

// // ---- Database Connection Helper -----------------------------------------------

// /**
//  * Connect to the database
//  * @returns {Promise<{client: MongoClient, db: Db}>}
//  */
// export async function connectToDatabase() {
//   try {
//     const client = await clientPromise;
//     const db = client.db(MONGODB_DB);
//     return { client, db };
//   } catch (error) {
//     console.error('Failed to connect to database:', error);
//     throw new Error('Database connection failed');
//   }
// }

// // ---- Collection Getters ---------------------------------------------------

// /**
//  * Get a collection by name
//  * @param {string} collectionName - Name of the collection
//  * @returns {Promise<Collection>}
//  */
// export async function getCollection(collectionName) {
//   const { db } = await connectToDatabase();
//   return db.collection(collectionName);
// }

// /**
//  * Get the users collection
//  * @returns {Promise<Collection>}
//  */
// export async function getUsersCollection() {
//   return getCollection(USERS_COLLECTION);
// }

// /**
//  * Get the dashboard data collection
//  * @returns {Promise<Collection>}
//  */
// export async function getDashDataCollection() {
//   return getCollection(DASHDATA_COLLECTION);
// }

// /**
//  * Get the chats collection
//  * @returns {Promise<Collection>}
//  */
// export async function getChatsCollection() {
//   return getCollection(CHATS_COLLECTION);
// }

// // ---- Collection Name Getters ----------------------------------------------

// /**
//  * Get the users collection name
//  * @returns {string}
//  */
// export function getUsersCollectionName() {
//   return USERS_COLLECTION;
// }

// /**
//  * Get the dashboard data collection name
//  * @returns {string}
//  */
// export function getDashDataCollectionName() {
//   return DASHDATA_COLLECTION;
// }

// /**
//  * Get the chats collection name
//  * @returns {string}
//  */
// export function getChatsCollectionName() {
//   return CHATS_COLLECTION;
// }

// // ---- Database Utilities ---------------------------------------------------

// /**
//  * Check database connection health
//  * @returns {Promise<boolean>}
//  */
// export async function checkDatabaseHealth() {
//   try {
//     const { db } = await connectToDatabase();
//     await db.command({ ping: 1 });
//     return true;
//   } catch (error) {
//     console.error('Database health check failed:', error);
//     return false;
//   }
// }

// /**
//  * Get database statistics
//  * @returns {Promise<Object>}
//  */
// export async function getDatabaseStats() {
//   try {
//     const { db } = await connectToDatabase();
    
//     const usersCount = await db.collection(USERS_COLLECTION).countDocuments();
//     const dashdataCount = await db.collection(DASHDATA_COLLECTION).countDocuments();
//     const chatsCount = await db.collection(CHATS_COLLECTION).countDocuments();

//     return {
//       databaseName: MONGODB_DB,
//       collections: {
//         users: usersCount,
//         dashdata: dashdataCount,
//         chats: chatsCount,
//       },
//       isConnected: true,
//     };
//   } catch (error) {
//     console.error('Error getting database stats:', error);
//     return {
//       databaseName: MONGODB_DB,
//       collections: {
//         users: 0,
//         dashdata: 0,
//         chats: 0,
//       },
//       isConnected: false,
//     };
//   }
// }

// // ---- Export ----------------------------------------------------
// a
// export {
//   MONGODB_URI,
//   MONGODB_DB,
//   USERS_COLLECTION,
//   DASHDATA_COLLECTION,
//   CHATS_COLLECTION,
// };

// export default clientPromise;













// // lib/mongodb.js
// import { MongoClient } from 'mongodb';

// // ---- Validate Environment Variables ----------------------------------------

// if (!process.env.MONGODB_URI) {
//   throw new Error('Please define MONGODB_URI in .env.local');
// }

// if (!process.env.MONGODB_DB) {
//   throw new Error('Please define MONGODB_DB in .env.local');
// }

// // ---- Constants -------------------------------------------------------------

// const MONGODB_URI = process.env.MONGODB_URI;
// const MONGODB_DB = process.env.MONGODB_DB;

// // Collection names
// const USERS_COLLECTION = process.env.MONGODB_COLLECTION_USERS || 'users';
// const DASHDATA_COLLECTION = process.env.MONGODB_COLLECTION_DASHDATA || 'dashdata';
// const CHATS_COLLECTION = process.env.MONGODB_COLLECTION_CHATS || 'chats';
// // ✅ NEW: Added missing login attempts collection
// const LOGIN_ATTEMPTS_COLLECTION = process.env.MONGODB_COLLECTION_LOGIN_ATTEMPTS || 'login_attempts';

// // ---- MongoDB Connection ---------------------------------------------

// let client;
// let clientPromise;

// if (process.env.NODE_ENV === 'development') {
//   if (!global._mongoClientPromise) {
//     client = new MongoClient(MONGODB_URI);
//     global._mongoClientPromise = client.connect();
//   }
//   clientPromise = global._mongoClientPromise;
// } else {
//   client = new MongoClient(MONGODB_URI);
//   clientPromise = client.connect();
// }

// // ---- Database Connection Helper -----------------------------------------------

// /**
//  * Connect to the database
//  * @returns {Promise<{client: MongoClient, db: Db}>}
//  */
// export async function connectToDatabase() {
//   try {
//     const client = await clientPromise;
//     const db = client.db(MONGODB_DB);
//     return { client, db };
//   } catch (error) {
//     console.error('Failed to connect to database:', error);
//     throw new Error('Database connection failed');
//   }
// }

// // ---- Collection Getters ---------------------------------------------------

// /**
//  * Get a collection by name
//  * @param {string} collectionName - Name of the collection
//  * @returns {Promise<Collection>}
//  */
// export async function getCollection(collectionName) {
//   const { db } = await connectToDatabase();
//   return db.collection(collectionName);
// }

// /**
//  * Get the users collection
//  * @returns {Promise<Collection>}
//  */
// export async function getUsersCollection() {
//   return getCollection(USERS_COLLECTION);
// }

// /**
//  * Get the dashboard data collection
//  * @returns {Promise<Collection>}
//  */
// export async function getDashDataCollection() {
//   return getCollection(DASHDATA_COLLECTION);
// }

// /**
//  * Get the chats collection
//  * @returns {Promise<Collection>}
//  */
// export async function getChatsCollection() {
//   return getCollection(CHATS_COLLECTION);
// }

// // ✅ NEW: Get the login attempts collection (This fixes your build error)
// /**
//  * Get the login attempts collection
//  * @returns {Promise<Collection>}
//  */
// export async function getLoginAttemptsCollection() {
//   return getCollection(LOGIN_ATTEMPTS_COLLECTION);
// }

// // ---- Collection Name Getters ----------------------------------------------

// /**
//  * Get the users collection name
//  * @returns {string}
//  */
// export function getUsersCollectionName() {
//   return USERS_COLLECTION;
// }

// /**
//  * Get the dashboard data collection name
//  * @returns {string}
//  */
// export function getDashDataCollectionName() {
//   return DASHDATA_COLLECTION;
// }

// /**
//  * Get the chats collection name
//  * @returns {string}
//  */
// export function getChatsCollectionName() {
//   return CHATS_COLLECTION;
// }

// // ✅ NEW (Optional): Get the login attempts collection name
// /**
//  * Get the login attempts collection name
//  * @returns {string}
//  */
// export function getLoginAttemptsCollectionName() {
//   return LOGIN_ATTEMPTS_COLLECTION;
// }

// // ---- Database Utilities ---------------------------------------------------

// /**
//  * Check database connection health
//  * @returns {Promise<boolean>}
//  */
// export async function checkDatabaseHealth() {
//   try {
//     const { db } = await connectToDatabase();
//     await db.command({ ping: 1 });
//     return true;
//   } catch (error) {
//     console.error('Database health check failed:', error);
//     return false;
//   }
// }

// /**
//  * Get database statistics
//  * @returns {Promise<Object>}
//  */
// export async function getDatabaseStats() {
//   try {
//     const { db } = await connectToDatabase();
    
//     const usersCount = await db.collection(USERS_COLLECTION).countDocuments();
//     const dashdataCount = await db.collection(DASHDATA_COLLECTION).countDocuments();
//     const chatsCount = await db.collection(CHATS_COLLECTION).countDocuments();

//     return {
//       databaseName: MONGODB_DB,
//       collections: {
//         users: usersCount,
//         dashdata: dashdataCount,
//         chats: chatsCount,
//       },
//       isConnected: true,
//     };
//   } catch (error) {
//     console.error('Error getting database stats:', error);
//     return {
//       databaseName: MONGODB_DB,
//       collections: {
//         users: 0,
//         dashdata: 0,
//         chats: 0,
//       },
//       isConnected: false,
//     };
//   }
// }

// // ---- Export ----------------------------------------------------

// // ✅ FIXED: Removed the stray "a" character here.
// export {
//   MONGODB_URI,
//   MONGODB_DB,
//   USERS_COLLECTION,
//   DASHDATA_COLLECTION,
//   CHATS_COLLECTION,
//   LOGIN_ATTEMPTS_COLLECTION, // ✅ Added this to the export list
// };

// export default clientPromise;


// lib/mongodb.js
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error('Please define MONGODB_URI in environment variables');
  }
  if (!MONGODB_DB) {
    throw new Error('Please define MONGODB_DB in environment variables');
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function getCollection(collectionName) {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}

export async function getUsersCollection() {
  return getCollection(process.env.MONGODB_COLLECTION_USERS || 'users');
}

export async function getDashDataCollection() {
  return getCollection(process.env.MONGODB_COLLECTION_DASHDATA || 'dashdata');
}

export async function getChatsCollection() {
  return getCollection(process.env.MONGODB_COLLECTION_CHATS || 'chats');
}

export async function getLoginAttemptsCollection() {
  return getCollection(process.env.MONGODB_COLLECTION_LOGIN_ATTEMPTS || 'login_attempts');
}

export const USERS_COLLECTION = process.env.MONGODB_COLLECTION_USERS || 'users';
export const DASHDATA_COLLECTION = process.env.MONGODB_COLLECTION_DASHDATA || 'dashdata';
export const CHATS_COLLECTION = process.env.MONGODB_COLLECTION_CHATS || 'chats';
export const LOGIN_ATTEMPTS_COLLECTION = process.env.MONGODB_COLLECTION_LOGIN_ATTEMPTS || 'login_attempts';