// app/api/check-password-reset/route.js
//
// Called from the login page (and /forgot-password).
// Returns whether the user has an ACTIVE reset token — not just the boolean
// passwordResetEnabled flag, which on its own authorizes nothing anymore.

import { NextResponse } from 'next/server';
import { getUserByEmail, getUserByUsername } from '@/lib/db/users';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, identifier } = body;

    const searchIdentifier = identifier || email;

    if (!searchIdentifier) {
      return NextResponse.json(
        { success: false, error: 'Username or email is required' },
        { status: 400 }
      );
    }

    let user = await getUserByEmail(searchIdentifier);
    if (!user) {
      user = await getUserByUsername(searchIdentifier);
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found. Please check your username or email.' },
        { status: 404 }
      );
    }

    // A reset is only "available" if a token exists AND hasn't expired.
    // const hasValidToken =
    //   !!user.passwordResetTokenHash &&
    //   !!user.passwordResetTokenExpiresAt &&
    //   new Date(user.passwordResetTokenExpiresAt).getTime() > Date.now();

    // return NextResponse.json({
    //   success: true,
    //   data: {
    //     user: {
    //       email: user.email,
    //       username: user.username,
    //       firstName: user.firstName || '',
    //       lastName: user.lastName || '',
    //     },
    //     // Same field name so existing UI code doesn't need to change.
    //     passwordResetEnabled: hasValidToken,
    //     expiresAt: hasValidToken ? user.passwordResetTokenExpiresAt : null,
    //   },
    // });
    // A reset is only "available" if a token exists AND hasn't expired.
    const hasValidToken =
      !!user.passwordResetTokenHash &&
      !!user.passwordResetTokenExpiresAt &&
      new Date(user.passwordResetTokenExpiresAt).getTime() > Date.now();

    return NextResponse.json({
      success: true,
      data: {
        user: {
          email: user.email,
          username: user.username,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
        },
        passwordResetEnabled: hasValidToken,
        expiresAt: hasValidToken ? user.passwordResetTokenExpiresAt : null,
        // ✅ NEW: admin-set contact email shown on the "reset not enabled" modal
        loginBlockContactEmail: user.loginBlockContactEmail || null,
      },
    });
  } catch (error) {
    console.error('Error checking reset status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}