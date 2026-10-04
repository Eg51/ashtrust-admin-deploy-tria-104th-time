// lib/db/webauthnCredentials.js
//
// CRUD layer for WebAuthn / passkey credentials.
//
// One document per (user, device). A user can register multiple
// credentials — MacBook, iPhone, YubiKey, etc. All attach to the same
// user account.
//
// We store ONLY the public key + credential metadata. The private key
// never leaves the user's device.

import { getCollection } from '../mongodb';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'webauthn_credentials';

async function getCredentialsCollection() {
  return getCollection(COLLECTION_NAME);
}

// ── Indexes ────────────────────────────────────────────────────────────
//
// Called once at first write. Idempotent — MongoDB ignores re-creating
// an existing index with the same spec.

let indexesEnsured = false;

export async function ensureCredentialIndexes() {
  if (indexesEnsured) return;
  try {
    const collection = await getCredentialsCollection();

    // credentialId must be globally unique — it's how we look up the
    // user during login, before we know who they are.
    await collection.createIndex({ credentialId: 1 }, { unique: true });

    // Fast listing for the Settings page.
    await collection.createIndex({ userId: 1, createdAt: -1 });

    indexesEnsured = true;
  } catch (error) {
    console.error('[webauthnCredentials] ensureIndexes error:', error);
  }
}

// ── Create ─────────────────────────────────────────────────────────────

/**
 * Save a newly-registered credential.
 *
 * @param {string} userId — the owning user's _id (as string)
 * @param {object} data
 * @param {string} data.credentialId — base64url-encoded credential ID
 * @param {string} data.publicKey — base64url-encoded public key
 * @param {number} data.counter — initial signature counter
 * @param {string[]} data.transports — ['internal','hybrid','usb','nfc','ble']
 * @param {string} [data.deviceLabel] — user-friendly name
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function saveCredential(userId, data) {
  try {
    await ensureCredentialIndexes();

    if (!userId || !data?.credentialId || !data?.publicKey) {
      return { success: false, error: 'Missing required fields' };
    }

    const collection = await getCredentialsCollection();

    const doc = {
      userId: String(userId),
      credentialId: String(data.credentialId),
      publicKey: String(data.publicKey),
      counter: Number(data.counter) || 0,
      transports: Array.isArray(data.transports) ? data.transports : [],
      deviceLabel:
        typeof data.deviceLabel === 'string'
          ? data.deviceLabel.slice(0, 100)
          : 'Unnamed device',
      createdAt: new Date(),
      lastUsedAt: null,
    };

    const result = await collection.insertOne(doc);

    return { success: true, id: result.insertedId.toString() };
  } catch (error) {
    // Unique index violation = credential already registered
    if (error?.code === 11000) {
      return { success: false, error: 'Credential already registered' };
    }
    console.error('[webauthnCredentials] saveCredential error:', error);
    return { success: false, error: 'Failed to save credential' };
  }
}

// ── Read ───────────────────────────────────────────────────────────────

/**
 * List all credentials for a user (for the Settings "Manage biometrics"
 * view).
 */
export async function getCredentialsByUserId(userId) {
  try {
    if (!userId) return [];
    const collection = await getCredentialsCollection();
    const rows = await collection
      .find({ userId: String(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    return rows.map((row) => ({
      id: row._id.toString(),
      credentialId: row.credentialId,
      deviceLabel: row.deviceLabel,
      transports: row.transports || [],
      createdAt: row.createdAt,
      lastUsedAt: row.lastUsedAt,
      // Never expose publicKey to the client — not needed and reduces
      // attack surface if the Settings endpoint ever leaks.
    }));
  } catch (error) {
    console.error('[webauthnCredentials] getByUserId error:', error);
    return [];
  }
}

/**
 * Look up a credential by its ID (base64url string).
 * Used during login — before we know which user is authenticating.
 *
 * @returns {Promise<object | null>} — full document (with publicKey)
 */
export async function getCredentialByCredentialId(credentialId) {
  try {
    if (!credentialId) return null;
    const collection = await getCredentialsCollection();
    return await collection.findOne({ credentialId: String(credentialId) });
  } catch (error) {
    console.error('[webauthnCredentials] getByCredentialId error:', error);
    return null;
  }
}

/**
 * Count how many credentials a user has.
 * Useful for "you already have 3 devices registered" UI hints.
 */
export async function countCredentialsForUser(userId) {
  try {
    if (!userId) return 0;
    const collection = await getCredentialsCollection();
    return await collection.countDocuments({ userId: String(userId) });
  } catch (error) {
    console.error('[webauthnCredentials] countForUser error:', error);
    return 0;
  }
}

// ── Update ─────────────────────────────────────────────────────────────

/**
 * Update a credential's signature counter after a successful login.
 * The counter is a replay-prevention mechanism — should increment on
 * each use, but some authenticators (iCloud Keychain) always return 0.
 * SimpleWebAuthn's verify step handles both cases; we just persist.
 */
export async function updateCredentialCounter(credentialId, newCounter) {
  try {
    if (!credentialId) return false;
    const collection = await getCredentialsCollection();
    const result = await collection.updateOne(
      { credentialId: String(credentialId) },
      {
        $set: {
          counter: Number(newCounter) || 0,
          lastUsedAt: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('[webauthnCredentials] updateCounter error:', error);
    return false;
  }
}

// ── Delete ─────────────────────────────────────────────────────────────

/**
 * Remove a credential.
 * Enforces userId match so one user can't delete another's credential
 * by guessing its id.
 */
export async function deleteCredential(credentialId, userId) {
  try {
    if (!credentialId || !userId) return false;
    const collection = await getCredentialsCollection();
    const result = await collection.deleteOne({
      credentialId: String(credentialId),
      userId: String(userId),
    });
    return result.deletedCount > 0;
  } catch (error) {
    console.error('[webauthnCredentials] deleteCredential error:', error);
    return false;
  }
}