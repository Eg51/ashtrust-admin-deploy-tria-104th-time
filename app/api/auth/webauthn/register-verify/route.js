// app/api/auth/webauthn/register-verify/route.js
//
// Step 2 of WebAuthn registration.
//
// The browser just completed navigator.credentials.create() and sends
// us the resulting attestation. We verify it against the challenge we
// issued in register-options, and if valid, persist the credential.

import { NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { requireAuth, readJson, jsonError, ApiError } from '@/lib/api-helpers';
import {
  RP_ID,
  ORIGIN,
  readChallengeCookie,
  clearChallengeCookie,
  CHALLENGE_COOKIE_REGISTER,
} from '@/lib/webauthn';
import { saveCredential } from '@/lib/db/webauthnCredentials';

export const runtime = 'nodejs';

/**
 * Turn a User-Agent string into something a user can recognize in a
 * "Manage devices" list. Best-effort — no external dependency.
 */
function describeUserAgent(ua) {
  if (!ua) return 'Unknown device';
  const s = String(ua);

  const browser =
    /Edg\//.test(s) ? 'Edge'
    : /Chrome\//.test(s) && !/Edg\//.test(s) ? 'Chrome'
    : /Firefox\//.test(s) ? 'Firefox'
    : /Safari\//.test(s) && !/Chrome\//.test(s) ? 'Safari'
    : 'Browser';

  const os =
    /Windows/.test(s) ? 'Windows'
    : /Macintosh|Mac OS X/.test(s) ? 'macOS'
    : /Android/.test(s) ? 'Android'
    : /iPhone|iPad|iPod/.test(s) ? 'iOS'
    : /Linux/.test(s) ? 'Linux'
    : 'Unknown OS';

  return `${browser} on ${os}`;
}

export async function POST(request) {
  try {
    const { userId } = await requireAuth(request);

    const expectedChallenge = readChallengeCookie(
      request,
      CHALLENGE_COOKIE_REGISTER
    );
    if (!expectedChallenge) {
      throw new ApiError(
        'Registration challenge expired or missing. Please try again.',
        400
      );
    }

    const body = await readJson(request);
    const attestation = body?.response;

    if (!attestation || typeof attestation !== 'object') {
      throw new ApiError('Registration response missing', 400);
    }

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: attestation,
        expectedChallenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
        requireUserVerification: false,
      });
    } catch (err) {
      console.warn('[webauthn/register-verify] verify failed:', err?.message);
      const errRes = jsonError('Verification failed', 400);
      return clearChallengeCookie(errRes, CHALLENGE_COOKIE_REGISTER);
    }

    if (!verification?.verified || !verification.registrationInfo) {
      const errRes = jsonError('Registration not verified', 400);
      return clearChallengeCookie(errRes, CHALLENGE_COOKIE_REGISTER);
    }

    // @simplewebauthn/server v10+ shape:
    //   verification.registrationInfo.credential = {
    //     id, publicKey: Uint8Array, counter, transports
    //   }
    const { credential } = verification.registrationInfo;

    if (!credential?.id || !credential?.publicKey) {
      const errRes = jsonError('Incomplete registration data', 400);
      return clearChallengeCookie(errRes, CHALLENGE_COOKIE_REGISTER);
    }

    const credentialId = String(credential.id);
    const publicKeyB64 = Buffer.from(credential.publicKey).toString('base64url');
    const counter = Number(credential.counter) || 0;
    const transports = Array.isArray(credential.transports)
      ? credential.transports
      : [];

    const deviceLabel = describeUserAgent(request.headers.get('user-agent'));

    const saved = await saveCredential(userId, {
      credentialId,
      publicKey: publicKeyB64,
      counter,
      transports,
      deviceLabel,
    });

    if (!saved.success) {
      const errRes = jsonError(
        saved.error || 'Failed to save credential',
        500
      );
      return clearChallengeCookie(errRes, CHALLENGE_COOKIE_REGISTER);
    }

    const successRes = NextResponse.json({
      success: true,
      message: 'Biometric login enabled',
      credentialId,
      deviceLabel,
    });

    return clearChallengeCookie(successRes, CHALLENGE_COOKIE_REGISTER);
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }
    console.error('[webauthn/register-verify] error:', error);
    return jsonError('Registration failed', 500);
  }
}