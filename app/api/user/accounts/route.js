// app/api/user/accounts/route.js
//
// GET  — return the user's saved account + crypto details
// POST — replace them with a validated, whitelisted, size-capped version
//
// Validation is enforced server-side. The client's request body is treated
// as untrusted: unknown keys are dropped, array length is capped, and every
// string field is trimmed and length-limited.

import {
  requireAuth,
  readJson,
  jsonOk,
  jsonError,
  ApiError,
} from '@/lib/api-helpers';
import { getDashDataCollection } from '@/lib/mongodb';

export const runtime = 'nodejs';

// ---- Limits ---------------------------------------------------------------
const MAX_ACCOUNTS = 2;
const MAX_BANK_NAME = 100;
const MAX_ACCOUNT_NAME = 100;
const MAX_ACCOUNT_NUMBER = 50;
const MAX_WALLET_ADDRESS = 200;
const MAX_NETWORK = 50;

const ALLOWED_NETWORKS = new Set([
  'ethereum', 'bsc', 'solana', 'bitcoin', 'polygon',
  'arbitrum', 'optimism', 'avalanche',
  '', // allow "no network selected"
]);

// ---- Helpers --------------------------------------------------------------

function cleanString(value, max) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function sanitizeAccount(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: raw.id === 'acc2' ? 'acc2' : 'acc1',
    bankName: cleanString(raw.bankName, MAX_BANK_NAME),
    accountName: cleanString(raw.accountName, MAX_ACCOUNT_NAME),
    accountNumber: cleanString(raw.accountNumber, MAX_ACCOUNT_NUMBER),
    isDefault: raw.isDefault === true,
  };
}

function sanitizeCrypto(raw) {
  if (!raw || typeof raw !== 'object') {
    return { walletAddress: '', network: '' };
  }
  const network = cleanString(raw.network, MAX_NETWORK).toLowerCase();
  return {
    walletAddress: cleanString(raw.walletAddress, MAX_WALLET_ADDRESS),
    network: ALLOWED_NETWORKS.has(network) ? network : '',
  };
}

// ---- GET -----------------------------------------------------------------

export async function GET(request) {
  try {
    const { userId } = await requireAuth(request);

    const dashCollection = await getDashDataCollection();
    const dashData = await dashCollection.findOne({ userId });

    if (!dashData || !dashData.accountDetails) {
      return jsonOk({ data: null, message: 'No account details found' });
    }

    return jsonOk({ data: dashData.accountDetails });
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }
    console.error('[accounts GET] error:', error);
    return jsonError('Internal server error', 500);
  }
}

// ---- POST ----------------------------------------------------------------

export async function POST(request) {
  try {
    const { userId } = await requireAuth(request);

    const body = await readJson(request);
    const rawAccounts = body?.accounts;
    const rawCrypto = body?.crypto;

    if (!Array.isArray(rawAccounts) || rawAccounts.length === 0) {
      throw new ApiError('At least one account is required', 400);
    }

    if (rawAccounts.length > MAX_ACCOUNTS) {
      throw new ApiError(`Maximum ${MAX_ACCOUNTS} accounts allowed`, 400);
    }

    // Sanitize each entry, drop non-objects, cap length
    const sanitized = rawAccounts
      .map(sanitizeAccount)
      .filter(Boolean)
      .slice(0, MAX_ACCOUNTS);

    if (sanitized.length === 0) {
      throw new ApiError('No valid accounts provided', 400);
    }

    // Account 1 must be fully filled
    const acc1 = sanitized.find((a) => a.id === 'acc1');
    if (!acc1 || !acc1.bankName || !acc1.accountName || !acc1.accountNumber) {
      throw new ApiError(
        'Account 1 must have Bank Name, Account Name, and Account Number',
        400
      );
    }

    // If Account 2 is present but only partially filled, drop it rather than
    // storing a broken half-record.
    const idx2 = sanitized.findIndex((a) => a.id === 'acc2');
    if (idx2 >= 0) {
      const a2 = sanitized[idx2];
      const hasAny = a2.bankName || a2.accountName || a2.accountNumber;
      const hasAll = a2.bankName && a2.accountName && a2.accountNumber;
      if (hasAny && !hasAll) sanitized.splice(idx2, 1);
    }

    // Ensure exactly one default
    const finalAccounts = sanitized.map((a) => ({ ...a, isDefault: false }));
    const preferredDefaultId =
      sanitized.find((a) => a.isDefault)?.id || finalAccounts[0].id;
    const defaultIdx = finalAccounts.findIndex(
      (a) => a.id === preferredDefaultId
    );
    if (defaultIdx >= 0) finalAccounts[defaultIdx].isDefault = true;

    const finalCrypto = sanitizeCrypto(rawCrypto);

    const accountDetails = {
      accounts: finalAccounts,
      crypto: finalCrypto,
      updatedAt: new Date().toISOString(),
    };

    const defaultAcc = finalAccounts.find((a) => a.isDefault) || finalAccounts[0];

    const dashCollection = await getDashDataCollection();

    await dashCollection.updateOne(
      { userId },
      {
        $set: {
          accountDetails,
          withdrawalDetails: {
            bankName: defaultAcc.bankName,
            accountName: defaultAcc.accountName,
            accountNumber: defaultAcc.accountNumber,
            accounts: finalAccounts,
            walletAddress: finalCrypto.walletAddress,
            network: finalCrypto.network,
            updatedAt: new Date().toISOString(),
          },
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return jsonOk({
      message: 'Account details saved successfully',
      data: accountDetails,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }
    console.error('[accounts POST] error:', error);
    return jsonError('Internal server error', 500);
  }
}