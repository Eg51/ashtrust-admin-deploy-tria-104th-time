'use server';

// app/actions/pin.js
//
// Server actions for the transaction PIN feature (Phase J).
//
// Design (locked in with user):
//   - 4-digit numeric PIN, bcrypt-hashed
//   - Required on every withdrawal
//   - 3 wrong attempts → account PIN is LOCKED
//   - No auto-clear. Only way out of the lock is an admin-issued reset code
//   - Reset code = 24-hex-char, SHA-256 hash stored, 15-min TTL, single-use
//     (mirrors the Phase E password-reset pattern)

import crypto from 'crypto';
import { getUserById, updateUser } from '@/lib/db/users';
import { hashPassword, comparePassword } from '@/lib/security';

const MAX_PIN_ATTEMPTS = 3;
const PIN_RESET_TTL_MS = 15 * 60 * 1000; // 15 minutes
// Matches the login-lockout "permanent" sentinel — cleared only by a successful reset.
const PERMANENT_LOCK_DATE = new Date('9999-12-31T23:59:59.999Z');

function isValidPin(pin) {
  return typeof pin === 'string' && /^\d{4}$/.test(pin);
}

// Both args are hex strings of the same length; compare byte-wise.
function timingSafeEqualHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  try {
    const bufA = Buffer.from(a, 'hex');
    const bufB = Buffer.from(b, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// ── Set or change the transaction PIN ────────────────────────────────
// Called when: user sets a PIN from Settings, or accepts the first-withdrawal
// prompt. Also used internally by consumePinResetToken (which hashes first).

export async function setTransactionPin(userId, pin) {
  try {
    if (!userId) return { success: false, error: 'Missing userId' };
    if (!isValidPin(pin)) {
      return { success: false, error: 'PIN must be exactly 4 digits' };
    }

    const pinHash = await hashPassword(pin);

    await updateUser(userId, {
      transactionPinHash: pinHash,
      pinAttempts: 0,
      pinLockUntil: null,
    });

    return { success: true };
  } catch (error) {
    console.error('[pin] setTransactionPin error:', error);
    return { success: false, error: 'Failed to set PIN' };
  }
}

// ── Verify a PIN (called by the withdrawal route) ────────────────────

export async function verifyTransactionPin(userId, pin) {
  try {
    if (!userId) return { success: false, reason: 'missing_user' };
    if (!isValidPin(pin)) return { success: false, reason: 'invalid_format' };

    const user = await getUserById(userId);
    if (!user) return { success: false, reason: 'user_not_found' };

    if (!user.transactionPinHash) {
      return { success: false, reason: 'no_pin' };
    }

    // Lock check — happens BEFORE the bcrypt compare, so a locked user
    // can't even try. Lock is permanent until an admin reset code is used.
    const now = new Date();
    if (user.pinLockUntil && new Date(user.pinLockUntil) > now) {
      return {
        success: false,
        reason: 'locked',
        lockedUntil: user.pinLockUntil,
      };
    }

    const match = await comparePassword(pin, user.transactionPinHash);

    if (match) {
      // Correct PIN — clear counters
      await updateUser(userId, {
        pinAttempts: 0,
        pinLockUntil: null,
      });
      return { success: true };
    }

    // Wrong PIN — increment
    const attempts = (user.pinAttempts || 0) + 1;
    const updates = { pinAttempts: attempts };

    if (attempts >= MAX_PIN_ATTEMPTS) {
      updates.pinLockUntil = PERMANENT_LOCK_DATE;
    }

    await updateUser(userId, updates);

    return {
      success: false,
      reason: 'wrong_pin',
      attempts,
      remaining: Math.max(0, MAX_PIN_ATTEMPTS - attempts),
      locked: attempts >= MAX_PIN_ATTEMPTS,
    };
  } catch (error) {
    console.error('[pin] verifyTransactionPin error:', error);
    return { success: false, reason: 'server_error' };
  }
}

// ── Get PIN status (used by Settings page + withdrawal flow) ─────────

export async function getPinStatus(userId) {
  try {
    if (!userId) return { success: false };

    const user = await getUserById(userId);
    if (!user) return { success: false };

    const now = new Date();
    const locked = !!(user.pinLockUntil && new Date(user.pinLockUntil) > now);

    return {
      success: true,
      hasPin: !!user.transactionPinHash,
      locked,
      lockedUntil: user.pinLockUntil || null,
      attempts: user.pinAttempts || 0,
    };
  } catch (error) {
    console.error('[pin] getPinStatus error:', error);
    return { success: false };
  }
}

// ── Admin: issue a one-time PIN reset code ───────────────────────────
// Returns the raw code to the admin (who sends it to the user out-of-band).
// Only the SHA-256 hash is stored on the user doc.

export async function issuePinResetToken(userId) {
  try {
    if (!userId) return { success: false, error: 'Missing userId' };

    const user = await getUserById(userId);
    if (!user) return { success: false, error: 'User not found' };

    // 24-hex-char code — same format as Phase E password reset
    const rawToken = crypto.randomBytes(12).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + PIN_RESET_TTL_MS);

    await updateUser(userId, {
      pinResetTokenHash: tokenHash,
      pinResetTokenExpiresAt: expiresAt,
    });

    return {
      success: true,
      token: rawToken,                    // shown to admin, never stored
      expiresAt: expiresAt.toISOString(),
    };
  } catch (error) {
    console.error('[pin] issuePinResetToken error:', error);
    return { success: false, error: 'Failed to issue reset code' };
  }
}

// ── User: consume reset code + set new PIN ───────────────────────────
// Called from /forgot-pin. Clears the lock, sets the new PIN, clears
// the reset token — all in one shot.

export async function consumePinResetToken(userId, code, newPin) {
  try {
    if (!userId) return { success: false, error: 'Missing userId' };
    if (typeof code !== 'string' || !code.trim()) {
      return { success: false, error: 'Reset code is required' };
    }
    if (!isValidPin(newPin)) {
      return { success: false, error: 'New PIN must be exactly 4 digits' };
    }

    const user = await getUserById(userId);
    if (!user) return { success: false, error: 'User not found' };

    if (!user.pinResetTokenHash || !user.pinResetTokenExpiresAt) {
      return { success: false, error: 'No active reset code. Ask admin for a new one.' };
    }

    if (new Date(user.pinResetTokenExpiresAt) < new Date()) {
      // Clear the stale token so a new one can be issued cleanly
      await updateUser(userId, {
        pinResetTokenHash: null,
        pinResetTokenExpiresAt: null,
      });
      return { success: false, error: 'Reset code expired. Ask admin for a new one.' };
    }

    // Timing-safe comparison of the SHA-256 hashes
    const codeHash = crypto.createHash('sha256').update(code.trim()).digest('hex');
    if (!timingSafeEqualHex(codeHash, user.pinResetTokenHash)) {
      return { success: false, error: 'Invalid reset code' };
    }

    // Success — set new PIN, clear lock + attempts + token
    const newPinHash = await hashPassword(newPin);

    await updateUser(userId, {
      transactionPinHash: newPinHash,
      pinAttempts: 0,
      pinLockUntil: null,
      pinResetTokenHash: null,
      pinResetTokenExpiresAt: null,
    });

    return { success: true };
  } catch (error) {
    console.error('[pin] consumePinResetToken error:', error);
    return { success: false, error: 'Failed to reset PIN' };
  }
}