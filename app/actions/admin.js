// app/actions/admin.js
"use server";

import { MongoClient, ObjectId } from "mongodb";
import { headers } from "next/headers";
import crypto from "crypto";

const MONGODB_URI = process.env.MONGODB_URI;

// ---- HELPER: Verify admin on server action -------------------------------
async function verifyAdmin() {
  const headersList = await headers();
  const role = headersList.get("x-user-role");
  if (role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
}

// ---- 1. GET ALL USERS (For the Dropdown) ---------------------------------
export async function getAllUsers() {
  try {
    await verifyAdmin();

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("userRegistration");
    const collection = db.collection("users");

    const users = await collection
      .find(
        {},
        {
          projection: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            username: 1,
            email: 1,
            isActive: 1,
          },
        }
      )
      .sort({ createdAt: -1 })
      .toArray();

    await client.close();

    const serializedUsers = users.map((user) => ({
      ...user,
      _id: user._id.toString(),
    }));

    return { success: true, users: serializedUsers };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

// ---- 2. GET SPECIFIC USER'S DASHDATA -------------------------------------
export async function getUserDashData(userId) {
  try {
    await verifyAdmin();

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("userRegistration");
    const dashCollection = db.collection("dashdata");

    const dashData = await dashCollection.findOne({ userId });
    await client.close();

    if (!dashData) {
      return {
        success: true,
        data: {
          totalBalance: { amount: "0.00", change: "0.0%" },
          analysisBalance: { total: "0.00", stocks: "45%", crypto: "35%", etfs: "20%" },
          bills: [],
          recentTransactions: [],
          paymentMethods: [],
          preferences: {},
        },
      };
    }

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

// ---- 3. UPDATE USER'S DASHDATA (CRUD) ------------------------------------
export async function updateUserDashData(userId, updates) {
  try {
    await verifyAdmin();

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("userRegistration");
    const dashCollection = db.collection("dashdata");

    const { _id, ...updateData } = updates;

    const result = await dashCollection.updateOne(
      { userId },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    await client.close();
    return { success: true, result };
  } catch (error) {
    console.error("Error updating dashdata:", error);
    return { success: false, error: "Failed to update dashdata" };
  }
}

// ---- 4. ISSUE PASSWORD RESET TOKEN (new) ---------------------------------
//
// Generates a one-time reset code for the given user.
// - Stores the SHA-256 hash + a 15-minute expiry on the user doc
// - Sets passwordResetEnabled = true (still used as a UI flag, no longer the gate)
// - Returns the RAW token ONCE — it is never retrievable again
//
// The user enters the raw token on the login-page reset form; the server
// validates it against the stored hash.
export async function issuePasswordResetToken(userId) {
  try {
    await verifyAdmin();

    if (!userId || typeof userId !== "string") {
      return { success: false, error: "userId required" };
    }

    // 12 random bytes -> 24 hex chars. Enough entropy to be unguessable.
    const rawToken = crypto.randomBytes(12).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("userRegistration");
    const users = db.collection("users");

    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          passwordResetEnabled: true,
          passwordResetTokenHash: tokenHash,
          passwordResetTokenExpiresAt: expiresAt,
          updatedAt: new Date(),
        },
      }
    );

    await client.close();

    if (result.matchedCount === 0) {
      return { success: false, error: "User not found" };
    }

    return {
      success: true,
      token: rawToken,
      expiresAt: expiresAt.toISOString(),
      expiresInMinutes: 15,
    };
  } catch (error) {
    console.error("Error issuing reset token:", error);
    return { success: false, error: error.message || "Failed to issue token" };
  }
}
// ---- 5. GET USER LOGIN BLOCK SETTINGS ------------------------------------
export async function getUserLoginBlock(userId) {
  try {
    await verifyAdmin();

    if (!userId || typeof userId !== "string") {
      return { success: false, error: "userId required" };
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("userRegistration");
    const users = db.collection("users");

    const user = await users.findOne(
      { _id: new ObjectId(userId) },
      { projection: { loginBlockMessage: 1, loginBlockContactEmail: 1, _id: 0 } }
    );

    await client.close();

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return {
      success: true,
      data: {
        loginBlockMessage: user.loginBlockMessage || "",
        loginBlockContactEmail: user.loginBlockContactEmail || "",
      },
    };
  } catch (error) {
    console.error("Error fetching login block:", error);
    return { success: false, error: "Failed to fetch login block settings" };
  }
}

// ---- 6. UPDATE USER LOGIN BLOCK SETTINGS ---------------------------------
export async function updateUserLoginBlock(userId, data) {
  try {
    await verifyAdmin();

    if (!userId || typeof userId !== "string") {
      return { success: false, error: "userId required" };
    }

    const message = typeof data?.loginBlockMessage === "string"
      ? data.loginBlockMessage.trim().slice(0, 500)
      : "";
    const email = typeof data?.loginBlockContactEmail === "string"
      ? data.loginBlockContactEmail.trim().slice(0, 100)
      : "";

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("userRegistration");
    const users = db.collection("users");

    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          loginBlockMessage: message,
          loginBlockContactEmail: email,
          updatedAt: new Date(),
        },
      }
    );

    await client.close();

    if (result.matchedCount === 0) {
      return { success: false, error: "User not found" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating login block:", error);
    return { success: false, error: "Failed to update login block settings" };
  }
}