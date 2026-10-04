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