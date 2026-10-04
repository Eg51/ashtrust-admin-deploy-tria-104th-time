// app/api/auth/webauthn/credentials/route.js
//
// Backing API for the Settings "Manage biometrics" card.
//
//   GET    → list the caller's registered credentials (public metadata only)
//   DELETE → remove one credential the caller owns
//
// The DELETE enforces userId match so one user can't remove another's
// device by guessing its credentialId.

import {
  requireAuth,
  readJson,
  jsonOk,
  jsonError,
  ApiError,
} from '@/lib/api-helpers';
import {
  getCredentialsByUserId,
  deleteCredential,
} from '@/lib/db/webauthnCredentials';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { userId } = await requireAuth(request);
    const credentials = await getCredentialsByUserId(userId);
    return jsonOk({ data: credentials });
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }
    console.error('[webauthn/credentials GET] error:', error);
    return jsonError('Failed to fetch credentials', 500);
  }
}

export async function DELETE(request) {
  try {
    const { userId } = await requireAuth(request);

    const body = await readJson(request);
    const credentialId = body?.credentialId;

    if (!credentialId || typeof credentialId !== 'string') {
      throw new ApiError('credentialId required', 400);
    }

    const removed = await deleteCredential(credentialId, userId);

    if (!removed) {
      throw new ApiError('Credential not found', 404);
    }

    return jsonOk({ message: 'Biometric device removed' });
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }
    console.error('[webauthn/credentials DELETE] error:', error);
    return jsonError('Failed to remove credential', 500);
  }
}