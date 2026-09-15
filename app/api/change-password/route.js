// app/api/change-password/route.js
//
// Two paths:
//   A. Logged-in user changes own password — needs current password.
//   B. Password reset from the login page — needs an admin-issued reset code.
//
// The old behavior (flag alone authorizes a reset) is gone.

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  getUserById,
  getUserByEmail,
  getUserByUsername,
  updateUser,
} from '@/lib/db/users';
import {
  verifyToken,
  extractToken,
  comparePassword,
  hashPassword,
  isStrongPassword,
} from '@/lib/security';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, currentPassword, newPassword, identifier, resetToken } = body;

    // ---- 1. Validate new password ---------------------------------------
    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json(
        { success: false, error: 'New password is required' },
        { status: 400 }
      );
    }

    const strength = isStrongPassword(newPassword);
    if (!strength.valid) {
      return NextResponse.json(
        {
          success: false,
          error: strength.errors[0] || 'Password is not strong enough',
          details: strength.errors,
        },
        { status: 400 }
      );
    }

    // ---- 2. Identify user -----------------------------------------------
    let user = null;
    let isLoggedIn = false;

    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        user = await getUserById(decoded.id || decoded.userId);
        isLoggedIn = true;
      }
    }

    // ---- 3. Path A: logged-in user changes own password -----------------
    if (isLoggedIn && user) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Current password is required' },
          { status: 400 }
        );
      }

      const isPasswordValid = await comparePassword(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 401 }
        );
      }

      const hashed = await hashPassword(newPassword);
      const result = await updateUser(user._id.toString(), { password: hashed });
      if (!result) {
        return NextResponse.json(
          { success: false, error: 'Failed to update password' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully, please refresh this page',
      });
    }

    // ---- 4. Path B: reset via admin-issued token ------------------------
    const searchIdentifier = identifier || email;

    if (!searchIdentifier || !resetToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Reset code required. Ask an admin to issue one.',
        },
        { status: 403 }
      );
    }

    user = await getUserByEmail(searchIdentifier);
    if (!user) user = await getUserByUsername(searchIdentifier);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Must have an active unexpired token
    if (!user.passwordResetTokenHash || !user.passwordResetTokenExpiresAt) {
      return NextResponse.json(
        { success: false, error: 'No reset code issued. Contact an admin.' },
        { status: 403 }
      );
    }

    if (new Date(user.passwordResetTokenExpiresAt).getTime() < Date.now()) {
      // Expired — clear so it can't be reused
      await updateUser(user._id.toString(), {
        passwordResetTokenHash: null,
        passwordResetTokenExpiresAt: null,
        passwordResetEnabled: false,
      });
      return NextResponse.json(
        { success: false, error: 'Reset code has expired. Ask an admin to re-issue.' },
        { status: 403 }
      );
    }

    // Constant-time compare of SHA-256 hashes
    const providedHash = crypto.createHash('sha256').update(String(resetToken)).digest('hex');
    const expectedHash = String(user.passwordResetTokenHash);

    const providedBuf = Buffer.from(providedHash, 'hex');
    const expectedBuf = Buffer.from(expectedHash, 'hex');

    if (
      providedBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(providedBuf, expectedBuf)
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid reset code' },
        { status: 403 }
      );
    }

    // ---- 5. Token valid — set new password, invalidate token ------------
    const hashedNewPassword = await hashPassword(newPassword);

    const result = await updateUser(user._id.toString(), {
      password: hashedNewPassword,
      passwordResetEnabled: false,
      passwordResetTokenHash: null,
      passwordResetTokenExpiresAt: null,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}