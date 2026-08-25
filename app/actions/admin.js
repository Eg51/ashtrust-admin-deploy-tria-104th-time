// app/actions/admin.js
"use server";

import { MongoClient, ObjectId } from "mongodb";
import { headers } from "next/headers";

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * @typedef {Object} TotalBalance
 * @property {string} amount
 * @property {string} change
 */

/**
 * @typedef {Object} AnalysisBalance
 * @property {string} total
 * @property {string} stocks
 * @property {string} crypto
 * @property {string} etfs
 */

/**
 * @typedef {Object} Bill
 * @property {string} [id]
 * @property {string} [name]
 * @property {string} [title]
 * @property {number|string} amount
 * @property {string} [dueDate]
 * @property {string} [status]
 * @property {string} [category]
 * @property {string} [description]
 */

/**
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {string} merchant
 * @property {string} type
 * @property {string} category
 * @property {string} date
 * @property {string} status
 * @property {string} amount
 * @property {boolean} isNegative
 */

/**
 * @typedef {Object} PaymentMethod
 * @property {string} id
 * @property {string} type
 * @property {string} last4
 * @property {string} brand
 * @property {boolean} isDefault
 */

/**
 * @typedef {Object} DashDataDocument
 * @property {ObjectId} _id
 * @property {string} userId
 * @property {TotalBalance} [totalBalance]
 * @property {AnalysisBalance} [analysisBalance]
 * @property {Bill[]} [bills]
 * @property {Transaction[]} [recentTransactions]
 * @property {PaymentMethod[]} [paymentMethods]
 * @property {Object.<string, any>} [preferences]
 * @property {Date} [updatedAt]
 */

// ---- HELPER: Verify admin on servter action ----
/**
 * @returns {Promise<void>}
 */
async function verifyAdmin() {
  const headersList = await headers();
  const role = headersList.get("x-user-role");
  if (role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
}

// ---- 1. GET ALL USERS (For the Dropdown) ----
/**
 * @returns {Promise<{success: boolean, users?: Array<any>, error?: string}>}
 */
export async function getAllUsers() {
  try {
    await verifyAdmin();

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("userRegistration");
    const collection = db.collection("users");

    const users = await collection.find(
      {}, 
      { 
        projection: { 
          _id: 1, 
          firstName: 1, 
          lastName: 1, 
          username: 1, 
          email: 1,
          isActive: 1
        } 
      }
    ).sort({ createdAt: -1 }).toArray();

    await client.close();

    // Serialize ObjectId to string to prevent hydration errors
    const serializedUsers = users.map(user => ({
      ...user,
      _id: user._id.toString()
    }));

    return { success: true, users: serializedUsers };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

// ---- 2. GET SPECIFIC USER'S DASHDATA ----
/**
 * @param {string} userId
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function getUserDashData(userId) {
  try {
    await verifyAdmin();

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("userRegistration");
    const dashCollection = db.collection("dashdata");

    const dashData = await dashCollection.findOne({ userId });
    await client.close();

    // If no data exists, return rich defaults with the new dashboard fields
    if (!dashData) {
      return { 
        success: true, 
        data: { 
          totalBalance: { amount: "0.00", change: "0.0%" }, 
          analysisBalance: { total: "0.00", stocks: "45%", crypto: "35%", etfs: "20%" }, 
          bills: [], 
          recentTransactions: [], 
          paymentMethods: [], 
          preferences: {} 
        } 
      };
    }

    // ✅ Safely serialize MongoDB ObjectId to a plain string to fix React hydration errors
    const sanitizedData = {
      ...dashData,
      _id: dashData._id.toString(), 
    };

    return { success: true, data: sanitizedData };
  } catch (error) {
    console.error("Error fetching dashdata:", error);
    return { success: false, error: "Failed to fetch dashdata" };
  }
}

// ---- 3. UPDATE USER'S DASHDATA (CRUD) ----
/**
 * @param {string} userId
 * @param {Partial<Omit<DashDataDocument, '_id' | 'userId'>>} updates
 * @returns {Promise<{success: boolean, result?: Object, error?: string}>}
 */
export async function updateUserDashData(userId, updates) {
  try {
    await verifyAdmin();

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("userRegistration");
    const dashCollection = db.collection("dashdata");

    // 🛑 CRITICAL: Destructure and remove '_id' so it doesn't crash MongoDB
    const { _id, ...updateData } = updates;

    const result = await dashCollection.updateOne(
      { userId },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date() 
        } 
      },
      { upsert: true } // Create document if it doesn't exist
    );

    await client.close();
    return { success: true, result };
  } catch (error) {
    console.error("Error updating dashdata:", error);
    return { success: false, error: "Failed to update dashdata" };
  }
}