// lib/security.js
import { getLoginAttemptsCollection } from './mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'; // ✅ Add this

// ---- Constants ------------------------------------------------------------

const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
const LOCKOUT_DURATION = parseInt(process.env.LOCKOUT_DURATION || '900');
const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT || '1800');
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key';
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');

// ---- Security Config ----------------------------------------------------

export const securityConfig = {
  maxLoginAttempts: MAX_LOGIN_ATTEMPTS,
  lockoutDuration: LOCKOUT_DURATION,
  sessionTimeout: SESSION_TIMEOUT,
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
};

// ---- Password Functions (✅ NEW) ------------------------------------------

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
}

/**
 * Compare a plain password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if matches
 */
export async function comparePassword(password, hashedPassword) {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Error comparing password:', error);
    return false;
  }
}

// ---- JWT Token Functions ---------------------------------------------------
export const generateToken = (payload, options = {}) => {
  return jwt.sign(payload, JWT_SECRET, options);
};
/**
 * Generate a JWT token for a user
 * @param {Object} payload - User data to encode (should include id, email, username, firstName, lastName, role)
 * @param {number} [expiresIn] - Token expiration in seconds (default: 7 days)
 * @returns {string} JWT token
 */

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export function verifyToken(token) {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 * @param {string|null} authHeader - Authorization header value (e.g., "Bearer token")
 * @returns {string|null} Token or null if not found
 */
export function extractToken(authHeader) {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  return parts[1];
}

/**
 * Extract token from request cookies
 * @param {Request} request - Next.js request object
 * @returns {string|null} Token or null if not found
 */
export function extractTokenFromCookies(request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;
    
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    
    return cookies['token'] || cookies['auth-token'] || null;
  } catch (error) {
    console.error('Error extracting token from cookies:', error);
    return null;
  }
}

/**
 * Get user ID from request (using token)
 * @param {Request} request - Next.js request object
 * @returns {Promise<string|null>} User ID or null if not authenticated
 */
export async function getUserIdFromRequest(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    if (!token) return null;
    
    const decoded = verifyToken(token);
    if (!decoded) return null;
    
    return decoded.id || decoded.userId || decoded.sub || null;
  } catch (error) {
    console.error('Error getting user ID from request:', error);
    return null;
  }
}

/**
 * Check if user is admin from request
 * @param {Request} request - Next.js request object
 * @returns {Promise<boolean>} True if admin
 */
export async function isAdminFromRequest(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    if (!token) return false;
    
    const decoded = verifyToken(token);
    if (!decoded) return false;
    
    return decoded.role === 'admin' || decoded.isAdmin === true;
  } catch (error) {
    console.error('Error checking admin from request:', error);
    return false;
  }
}

// ---- Login Attempt Management ---------------------------------------------

/**
 * Get login attempts for a user
 * @param {string} email - User email
 * @returns {Promise<Object|null>} Login attempt record or null
 */
export async function getLoginAttempts(email) {
  try {
    const attemptsCollection = await getLoginAttemptsCollection();
    const attempts = await attemptsCollection.findOne({ email });
    return attempts;
  } catch (error) {
    console.error('Error getting login attempts:', error);
    return null;
  }
}

/**
 * Check if user is allowed to attempt login
 * @param {string} email - User email
 * @returns {Promise<Object>} Login attempt result
 */
export async function checkLoginAttempts(email) {
  try {
    const attempts = await getLoginAttempts(email);
    
    if (!attempts) {
      return {
        allowed: true,
        attempts: 0,
        remainingAttempts: MAX_LOGIN_ATTEMPTS,
      };
    }

    if (attempts.lockedUntil && new Date(attempts.lockedUntil) > new Date()) {
      const timeRemaining = Math.ceil(
        (new Date(attempts.lockedUntil).getTime() - Date.now()) / 1000 / 60
      );
      return {
        allowed: false,
        attempts: attempts.attempts,
        remainingAttempts: 0,
        lockedUntil: attempts.lockedUntil,
        message: `Account locked. Try again in ${timeRemaining} minutes.`,
      };
    }

    if (attempts.lockedUntil && new Date(attempts.lockedUntil) <= new Date()) {
      await resetLoginAttempts(email);
      return {
        allowed: true,
        attempts: 0,
        remainingAttempts: MAX_LOGIN_ATTEMPTS,
      };
    }

    const remainingAttempts = Math.max(0, MAX_LOGIN_ATTEMPTS - attempts.attempts);

    return {
      allowed: remainingAttempts > 0,
      attempts: attempts.attempts,
      remainingAttempts,
      lockedUntil: attempts.lockedUntil,
    };
  } catch (error) {
    console.error('Error checking login attempts:', error);
    return {
      allowed: true,
      attempts: 0,
      remainingAttempts: MAX_LOGIN_ATTEMPTS,
    };
  }
}

/**
 * Increment login attempts for a user
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
export async function incrementLoginAttempts(email) {
  try {
    const attemptsCollection = await getLoginAttemptsCollection();

    const currentAttempts = await attemptsCollection.findOne({ email });

    if (!currentAttempts) {
      await attemptsCollection.insertOne({
        email,
        attempts: 1,
        lastAttempt: new Date(),
        lockedUntil: null,
      });
      return;
    }

    const newAttempts = currentAttempts.attempts + 1;

    let lockedUntil = currentAttempts.lockedUntil || null;
    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      lockedUntil = new Date(Date.now() + LOCKOUT_DURATION * 1000);
    }

    await attemptsCollection.updateOne(
      { email },
      {
        $set: {
          attempts: newAttempts,
          lastAttempt: new Date(),
          lockedUntil,
        },
      }
    );
  } catch (error) {
    console.error('Error incrementing login attempts:', error);
  }
}

/**
 * Reset login attempts for a user (on successful login)
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
export async function resetLoginAttempts(email) {
  try {
    const attemptsCollection = await getLoginAttemptsCollection();
    await attemptsCollection.deleteOne({ email });
  } catch (error) {
    console.error('Error resetting login attempts:', error);
  }
}

/**
 * Check if account is locked
 * @param {string} email - User email
 * @returns {Promise<boolean>} true if locked
 */
export async function isAccountLocked(email) {
  try {
    const attempts = await getLoginAttempts(email);
    if (!attempts || !attempts.lockedUntil) return false;
    return new Date(attempts.lockedUntil) > new Date();
  } catch (error) {
    console.error('Error checking account lock:', error);
    return false;
  }
}

/**
 * Get remaining attempts before lockout
 * @param {string} email - User email
 * @returns {Promise<number>} remaining attempts
 */
export async function getRemainingAttempts(email) {
  try {
    const attempts = await getLoginAttempts(email);
    if (!attempts) return MAX_LOGIN_ATTEMPTS;
    if (attempts.lockedUntil && new Date(attempts.lockedUntil) > new Date()) {
      return 0;
    }
    return Math.max(0, MAX_LOGIN_ATTEMPTS - attempts.attempts);
  } catch (error) {
    console.error('Error getting remaining attempts:', error);
    return MAX_LOGIN_ATTEMPTS;
  }
}

// ---- Session Management ---------------------------------------------------

/**
 * Check if session is valid
 * @param {Date} lastActivity - Last activity timestamp
 * @returns {boolean} true if valid
 */
export function isSessionValid(lastActivity) {
  const now = Date.now();
  const lastActivityTime = new Date(lastActivity).getTime();
  const timeDifference = (now - lastActivityTime) / 1000;
  return timeDifference < SESSION_TIMEOUT;
}

/**
 * Get session timeout in minutes
 * @returns {number} session timeout in minutes
 */
export function getSessionTimeoutMinutes() {
  return Math.floor(SESSION_TIMEOUT / 60);
}

// ---- Security Utilities ---------------------------------------------------

/**
 * Generate a secure random token (Edge‑compatible)
 * @param {number} [length] - Token length (default: 32)
 * @returns {string} secure token
 */
export function generateSecureToken(length = 32) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Sanitize input data (prevent XSS)
 * @param {string} input - Input string to sanitize
 * @returns {string} sanitized string
 */
export function sanitizeInput(input) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} true if valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * ✅ NEW: Validate username format (3-20 characters, letters/numbers/underscores)
 * @param {string} username - Username to validate
 * @returns {boolean} true if valid
 */
export function isValidUsername(username) {
  if (!username || typeof username !== 'string') return false;
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} validation result with errors
 */
export function isStrongPassword(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ---- Export Constants ----------------------------------------------------

export {
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION,
  SESSION_TIMEOUT,
  JWT_SECRET,
  securityConfig,
};