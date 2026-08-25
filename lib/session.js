// lib/session.js
import { getCollection } from './mongodb';
import { SESSION_TIMEOUT } from './security';

const SESSION_TIMEOUT_MS = SESSION_TIMEOUT * 1000;

/**
 * Check if session is valid based on last activity
 * @param {Date} lastActivity - Date of last activity
 * @returns {boolean} indicating if session is still valid
 */
export function isSessionValid(lastActivity) {
  const now = Date.now();
  const lastActivityTime = new Date(lastActivity).getTime();
  const timeDifference = now - lastActivityTime;
  return timeDifference < SESSION_TIMEOUT_MS;
}

/**
 * Get remaining session time in seconds
 * @param {Date} lastActivity - Date of last activity
 * @returns {number} seconds remaining
 */
export function getRemainingSessionTime(lastActivity) {
  const now = Date.now();
  const lastActivityTime = new Date(lastActivity).getTime();
  const timeDifference = now - lastActivityTime;
  const remaining = SESSION_TIMEOUT_MS - timeDifference;
  return Math.max(0, Math.floor(remaining / 1000));
}

/**
 * Get remaining session time in minutes
 * @param {Date} lastActivity - Date of last activity
 * @returns {number} minutes remaining
 */
export function getRemainingSessionMinutes(lastActivity) {
  const remainingSeconds = getRemainingSessionTime(lastActivity);
  return Math.floor(remainingSeconds / 60);
}

/**
 * Get session timeout in seconds
 * @returns {number} session timeout in seconds
 */
export function getSessionTimeoutSeconds() {
  return SESSION_TIMEOUT;
}

/**
 * Get session timeout in minutes
 * @returns {number} session timeout in minutes
 */
export function getSessionTimeoutMinutes() {
  return Math.floor(SESSION_TIMEOUT / 60);
}

/**
 * Generate a unique session ID (Edge‑compatible)
 * @returns {string} unique session ID
 */
export function generateSessionId() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Save a session to the database
 * 
 * @param {Object} sessionData - Session data to save
 * @param {string} sessionData.userId - User ID
 * @param {string} sessionData.email - User email
 * @param {string} sessionData.username - Username (unique handle)
 * @param {string} [sessionData.firstName] - User's first name
 * @param {string} [sessionData.lastName] - User's last name
 * @param {string} [sessionData.displayName] - User's preferred display name
 * @param {string} [sessionData.userAgent] - User agent string
 * @param {string} [sessionData.ipAddress] - IP address
 * @returns {Promise<string>} session ID
 */
export async function saveSession(sessionData) {
  try {
    const sessionsCollection = await getCollection('sessions');
    const sessionId = generateSessionId();
    
    const newSession = {
      ...sessionData,
      sessionId,
      lastActivity: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await sessionsCollection.insertOne(newSession);
    return sessionId;
  } catch (error) {
    console.error('Error saving session:', error);
    throw error;
  }
}

/**
 * Update session activity timestamp
 * @param {string} sessionId - Session ID to update
 * @returns {Promise<void>}
 */
export async function updateSessionActivity(sessionId) {
  try {
    const sessionsCollection = await getCollection('sessions');
    
    const result = await sessionsCollection.updateOne(
      { sessionId },
      {
        $set: {
          lastActivity: new Date(),
          updatedAt: new Date(),
        },
      }
    );
    
    if (result.matchedCount === 0) {
      console.warn(`Session ${sessionId} not found for update`);
    }
  } catch (error) {
    console.error('Error updating session activity:', error);
    throw error;
  }
}

/**
 * Get session by ID
 * @param {string} sessionId - Session ID to retrieve
 * @returns {Promise<Object|null>} session data or null
 */
export async function getSession(sessionId) {
  try {
    const sessionsCollection = await getCollection('sessions');
    const session = await sessionsCollection.findOne({ sessionId });
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Get session by user ID
 * @param {string} userId - User ID to retrieve sessions for
 * @returns {Promise<Array>} array of sessions
 */
export async function getUserSessions(userId) {
  try {
    const sessionsCollection = await getCollection('sessions');
    const sessions = await sessionsCollection
      .find({ userId })
      .sort({ lastActivity: -1 })
      .toArray();
    return sessions;
  } catch (error) {
    console.error('Error getting user sessions:', error);
    return [];
  }
}

/**
 * Validate a session
 * @param {string} sessionId - Session ID to validate
 * @returns {Promise<Object>} validation result
 */
export async function validateSession(sessionId) {
  try {
    const session = await getSession(sessionId);
    
    if (!session) {
      return {
        valid: false,
        message: 'Session not found',
      };
    }

    if (!isSessionValid(session.lastActivity)) {
      await deleteSession(sessionId);
      return {
        valid: false,
        message: 'Session expired',
      };
    }

    await updateSessionActivity(sessionId);

    return {
      valid: true,
      session,
    };
  } catch (error) {
    console.error('Error validating session:', error);
    return {
      valid: false,
      message: 'Error validating session',
    };
  }
}

/**
 * Delete a session
 * @param {string} sessionId - Session ID to delete
 * @returns {Promise<boolean>} true if deleted
 */
export async function deleteSession(sessionId) {
  try {
    const sessionsCollection = await getCollection('sessions');
    const result = await sessionsCollection.deleteOne({ sessionId });
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
}

/**
 * Delete all sessions for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} number of sessions deleted
 */
export async function deleteUserSessions(userId) {
  try {
    const sessionsCollection = await getCollection('sessions');
    const result = await sessionsCollection.deleteMany({ userId });
    return result.deletedCount || 0;
  } catch (error) {
    console.error('Error deleting user sessions:', error);
    throw error;
  }
}

/**
 * Clean up expired sessions
 * @param {number} [maxAge] - Maximum age in seconds (default: SESSION_TIMEOUT * 2)
 * @returns {Promise<number>} number of sessions cleaned up
 */
export async function cleanupExpiredSessions(maxAge = SESSION_TIMEOUT * 2) {
  try {
    const sessionsCollection = await getCollection('sessions');
    const cutoffTime = new Date(Date.now() - maxAge * 1000);
    const result = await sessionsCollection.deleteMany({
      lastActivity: { $lt: cutoffTime },
    });
    return result.deletedCount || 0;
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
    throw error;
  }
}

/**
 * Get active session count
 * @returns {Promise<number>} number of active sessions
 */
export async function getActiveSessionCount() {
  try {
    const sessionsCollection = await getCollection('sessions');
    return await sessionsCollection.countDocuments();
  } catch (error) {
    console.error('Error getting active session count:', error);
    return 0;
  }
}

/**
 * Get a user-friendly display name from a session object.
 * Prioritises displayName → username → firstName + lastName → email.
 * 
 * @param {Object} session - The session object (must contain user fields)
 * @returns {string} A display name for the user
 */
export function getSessionUserDisplay(session) {
  if (!session) return 'Guest';

  if (session.displayName) return session.displayName;
  if (session.username) return session.username;
  if (session.firstName && session.lastName) {
    return `${session.firstName} ${session.lastName}`.trim();
  }
  if (session.firstName) return session.firstName;
  if (session.email) return session.email.split('@')[0];
  return 'User';
}

// ---- Export Constants ----------------------------------------------------

export {
  SESSION_TIMEOUT,
  SESSION_TIMEOUT_MS,
};