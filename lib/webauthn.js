// lib/webauthn.js
//
// WebAuthn / Passkey configuration and cookie helpers.
//
// Dev defaults work with zero setup. For production set these in
// .env.production:
//   WEBAUTHN_RP_ID=yourdomain.com
//   WEBAUTHN_ORIGIN=https://yourdomain.com
//   WEBAUTHN_RP_NAME=AshTrust Bank

// ── Config ───────────────────────────────────────────────────────────────

export const RP_NAME = process.env.WEBAUTHN_RP_NAME || 'AshTrust Bank';
export const RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost';
export const ORIGIN =
  process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';

// ── Challenge cookies ──────────────────────────────────────────────────
//
// WebAuthn requires a fresh, single-use challenge per ceremony. We store
// it in an httpOnly cookie so the server can read it back during the
// verify step without a DB round trip.
//
// Two namespaces so a user with both a Settings tab (register) and a
// Login tab (authenticate) open at once doesn't have the second
// ceremony clobber the first one's challenge.

export const CHALLENGE_COOKIE_REGISTER = 'webauthn_chal_register';
export const CHALLENGE_COOKIE_LOGIN = 'webauthn_chal_login';
export const CHALLENGE_TTL_SECONDS = 300; // 5 minutes

/**
 * Write the challenge into an httpOnly cookie on the outgoing response.
 * @param {Response} response — the NextResponse being returned
 * @param {string} cookieName — one of CHALLENGE_COOKIE_* constants
 * @param {string} challenge — base64url-encoded challenge
 */
export function setChallengeCookie(response, cookieName, challenge) {
  response.cookies.set(cookieName, challenge, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: CHALLENGE_TTL_SECONDS,
  });
  return response;
}

/**
 * Read the challenge from the request cookies.
 * @param {Request} request — a NextRequest (has .cookies)
 * @param {string} cookieName
 * @returns {string | null}
 */
export function readChallengeCookie(request, cookieName) {
  try {
    return request.cookies.get(cookieName)?.value || null;
  } catch {
    return null;
  }
}

/**
 * Clear a challenge cookie after successful verification.
 */
export function clearChallengeCookie(response, cookieName) {
  response.cookies.set(cookieName, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}

// ── Config sanity check ────────────────────────────────────────────────

/**
 * True when RP_ID and ORIGIN are set (they always have defaults, so this
 * is really a "not empty" check).
 */
export function isWebAuthnConfigured() {
  return Boolean(RP_ID && ORIGIN);
}