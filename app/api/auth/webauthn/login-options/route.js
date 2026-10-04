// app/api/auth/webauthn/login-options/route.js
//
// Step 1 of WebAuthn authentication.
//
// PUBLIC endpoint — no auth required (the user isn't logged in yet).
//
// Two modes:
//   - Discoverable (no identifier): browser/OS offers ANY passkey for
//     this RP ID. Best UX — user clicks the button, the OS figures out
//     which account and which device.
//   - Username-first (identifier provided): server looks up the user's
//     credentials and only offers those. Useful when the user has
//     already typed their email and we want to shortcut.
//
// Both paths stash the challenge in an httpOnly cookie for the verify
// step to read back.

import { NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { readJson, jsonError, ApiError } from '@/lib/api-helpers';
import {
  RP_ID,
  setChallengeCookie,
  CHALLENGE_COOKIE_LOGIN,
} from '@/lib/webauthn';
import { getUserByEmail, getUserByUsername } from '@/lib/db/users';
import { getCredentialsByUserId } from '@/lib/db/webauthnCredentials';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await readJson(request).catch(() => ({}));
    const identifier =
      typeof body?.identifier === 'string' ? body.identifier.trim() : '';

    let allowCredentials = [];

    // Username-first mode: look up the user, offer only their devices.
    if (identifier) {
      try {
        const [byEmail, byUsername] = await Promise.all([
          getUserByEmail(identifier),
          getUserByUsername(identifier),
        ]);
        const user = byEmail || byUsername;

        if (user) {
          const creds = await getCredentialsByUserId(user._id.toString());
          allowCredentials = creds.map((c) => ({
            id: c.credentialId,
            transports: c.transports || [],
          }));

          // User exists but has no credentials → tell the client clearly
          if (allowCredentials.length === 0) {
            return NextResponse.json(
              {
                success: false,
                error: 'No biometric login set up for this account',
                reason: 'no_credentials',
              },
              { status: 404 }
            );
          }
        }
        // If user not found → fall through to discoverable mode.
        // Deliberately not revealing "user doesn't exist" to avoid
        // username enumeration on a public endpoint.
      } catch (err) {
        console.warn('[webauthn/login-options] lookup failed:', err?.message);
        // Fall through to discoverable
      }
    }

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      // Empty array = discoverable credentials (the OS/browser will
      // present any passkey for this RP ID).
      allowCredentials,
      userVerification: 'preferred',
    });

    const response = NextResponse.json({
      success: true,
      options,
    });

    return setChallengeCookie(
      response,
      CHALLENGE_COOKIE_LOGIN,
      options.challenge
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }
    console.error('[webauthn/login-options] error:', error);
    return jsonError('Failed to generate login options', 500);
  }
}