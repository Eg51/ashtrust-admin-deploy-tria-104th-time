// app/api/auth/webauthn/register-options/route.js
//
// Step 1 of WebAuthn registration.
//
// The user is already logged in when they hit this endpoint (they're in
// Settings → Enable biometric). We generate a challenge + options,
// stash the challenge in an httpOnly cookie, and return the options to
// the browser. The browser then calls navigator.credentials.create()
// which triggers the OS biometric prompt (Face ID / Touch ID / Windows
// Hello / YubiKey — the OS decides).

import { NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { requireAuth, jsonError, ApiError } from '@/lib/api-helpers';
import {
  RP_NAME,
  RP_ID,
  setChallengeCookie,
  CHALLENGE_COOKIE_REGISTER,
} from '@/lib/webauthn';
import { getCredentialsByUserId } from '@/lib/db/webauthnCredentials';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { userId, user } = await requireAuth(request);

    // Existing credentials → tell the browser to exclude them, so a
    // user can't re-register the same device twice (the OS would
    // otherwise happily create a duplicate passkey).
    const existing = await getCredentialsByUserId(userId);
    const excludeCredentials = existing.map((c) => ({
      id: c.credentialId,
      transports: c.transports,
    }));

    // WebAuthn userID must be a Uint8Array of ≤64 bytes.
    // We encode the user's string _id — stable, unique, short.
    const userIDBytes = new TextEncoder().encode(String(userId));

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: userIDBytes,
      userName: user.email || user.username || String(userId),
      userDisplayName:
        user.displayName ||
        user.username ||
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        'User',
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        // 'preferred' lets the OS offer whatever it has: platform
        // (Touch ID, Face ID, Windows Hello) or cross-platform
        // (YubiKey, phone-as-key).
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    const response = NextResponse.json({
      success: true,
      options,
    });

    // Challenge is single-use, valid for 5 minutes, and stored in an
    // httpOnly cookie so the verify step can read it back without a DB
    // round trip.
    return setChallengeCookie(
      response,
      CHALLENGE_COOKIE_REGISTER,
      options.challenge
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }
    console.error('[webauthn/register-options] error:', error);
    return jsonError('cannot generate biometric sign in options at this time', 500);
  }
}