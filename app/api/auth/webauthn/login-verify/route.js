// app/api/auth/webauthn/login-verify/route.js
//
// Step 2 of WebAuthn authentication.
//
// PUBLIC endpoint. Verifies the assertion the browser just produced
// against the stored public key, then issues the SAME auth artifacts as
// password login (JWT + cookie session) so downstream code doesn't need
// to know which method the user chose.

import { NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { ObjectId } from 'mongodb';
import { readJson, jsonOk, jsonError, ApiError } from '@/lib/api-helpers';
import {
  RP_ID,
  ORIGIN,
  readChallengeCookie,
  clearChallengeCookie,
  CHALLENGE_COOKIE_LOGIN,
} from '@/lib/webauthn';
import {
  getCredentialByCredentialId,
  updateCredentialCounter,
} from '@/lib/db/webauthnCredentials';
import { getUserById } from '@/lib/db/users';
import { generateToken } from '@/lib/security';
import { saveSession } from '@/lib/session';
import { createOrBumpNotification } from '@/lib/db/notifications';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const expectedChallenge = readChallengeCookie(
      request,
      CHALLENGE_COOKIE_LOGIN
    );
    if (!expectedChallenge) {
      throw new ApiError(
        'Login challenge expired or missing. Please try again.',
        400
      );
    }

    const body = await readJson(request);
    const assertion = body?.response;
    if (!assertion || typeof assertion !== 'object') {
      throw new ApiError('Authentication response missing', 400);
    }

    const credentialId = assertion?.id;
    if (!credentialId || typeof credentialId !== 'string') {
      throw new ApiError('Credential ID missing from response', 400);
    }

    // Look up the stored credential by its ID
    const stored = await getCredentialByCredentialId(credentialId);
    if (!stored) {
      const errRes = jsonError('Unknown credential. Please sign in with password.', 404);
      return clearChallengeCookie(errRes, CHALLENGE_COOKIE_LOGIN);
    }

    // Load the owning user
    let user;
    try {
      user = await getUserById(stored.userId);
    } catch {
      user = null;
    }
    if (!user) {
      const errRes = jsonError('Account not found', 404);
      return clearChallengeCookie(errRes, CHALLENGE_COOKIE_LOGIN);
    }

    // Inactive accounts can't log in, even with a valid passkey
    if (user.isActive === false) {
      const errRes = NextResponse.json(
        {
          success: false,
          reason: 'inactive',
          error: 'Account is deactivated',
          blockMessage: user.loginBlockMessage || null,
          contactEmail: user.loginBlockContactEmail || null,
        },
        { status: 403 }
      );
      return clearChallengeCookie(errRes, CHALLENGE_COOKIE_LOGIN);
    }

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: assertion,
        expectedChallenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
        requireUserVerification: false,
        credential: {
          id: stored.credentialId,
          publicKey: Buffer.from(stored.publicKey, 'base64url'),
          counter: Number(stored.counter) || 0,
        },
      });
    } catch (err) {
      console.warn('[webauthn/login-verify] verify failed:', err?.message);
      const errRes = jsonError('Verification failed', 401);
      return clearChallengeCookie(errRes, CHALLENGE_COOKIE_LOGIN);
    }

    if (!verification?.verified) {
      const errRes = jsonError('Authentication failed', 401);
      return clearChallengeCookie(errRes, CHALLENGE_COOKIE_LOGIN);
    }

    // Persist the new signature counter (replay protection)
       const newCounter =
      verification.authenticationInfo?.newCounter ??
      (Number(stored.counter) || 0);
    await updateCredentialCounter(credentialId, newCounter);

    // ── Issue the SAME auth artifacts as password login ────────────
    const token = generateToken({
      id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });

    let sessionId = null;
    try {
      sessionId = await saveSession({
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName || user.username,
        userAgent: request.headers.get('user-agent') || '',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      });
    } catch (sessionError) {
      console.warn('Session creation failed (non-critical):', sessionError.message);
    }

    const { password: _pw, ...userWithoutPassword } = user;
    const userResponse = {
      ...userWithoutPassword,
      id: user._id.toString(),
      _id: user._id.toString(),
      isAdmin: user.role === 'admin',
    };

    const successRes = NextResponse.json({
      success: true,
      method: 'webauthn',
      token,
      sessionId,
      user: userResponse,
    });

    if (sessionId) {
      const isSecure = process.env.NODE_ENV === 'production';
      successRes.cookies.set('sessionId', sessionId, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        path: '/',
        maxAge: 1800,
      });
    }

    // Non-blocking admin notification — matches password login behaviour
    try {
      await createOrBumpNotification({
        type: 'login',
        userId: user._id.toString(),
        username: user.displayName || user.username || 'Unknown',
        email: user.email || '',
        avatar: user.avatar || null,
        detail: `Signed in with biometrics (${stored.deviceLabel || 'unknown device'})`,
        metadata: {
          method: 'webauthn',
          credentialId,
          deviceLabel: stored.deviceLabel || null,
          ip:
            request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
            'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          at: new Date().toISOString(),
        },
      });
    } catch (notifErr) {
      console.warn('[webauthn/login-verify] notification failed:', notifErr?.message);
    }

    return clearChallengeCookie(successRes, CHALLENGE_COOKIE_LOGIN);
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }
    console.error('[webauthn/login-verify] error:', error);
    return jsonError('Login failed', 500);
  }
}