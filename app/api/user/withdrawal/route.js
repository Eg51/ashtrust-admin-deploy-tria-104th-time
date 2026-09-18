// // // app/api/user/withdrawal/route.js
// // import { NextResponse } from 'next/server';
// // import { getDashDataCollection } from '@/lib/mongodb';
// // import { verifyToken, extractToken } from '@/lib/security';

// // export const runtime = 'nodejs';

// // // ✅ GET: Fetch user's withdrawal details - UPDATED with accountDetails fallback
// // export async function GET(request) {
// //   try {
// //     const authHeader = request.headers.get('authorization');
// //     const token = extractToken(authHeader);

// //     if (!token) {
// //       return NextResponse.json(
// //         { success: false, error: 'Authentication required' },
// //         { status: 401 }
// //       );
// //     }

// //     const decoded = verifyToken(token);
// //     if (!decoded) {
// //       return NextResponse.json(
// //         { success: false, error: 'Invalid token' },
// //         { status: 401 }
// //       );
// //     }

// //     const userId = decoded.id || decoded.userId;
// //     console.log(`🔵 [GET] Fetching withdrawal details for user: ${userId}`);

// //     const dashCollection = await getDashDataCollection();
// //     const dashData = await dashCollection.findOne({ userId });

// //     console.log(`🔵 [GET] Dashboard data found:`, dashData ? 'YES' : 'NO');

// //     if (!dashData) {
// //       return NextResponse.json({
// //         success: true,
// //         data: null,
// //         message: 'No withdrawal details found'
// //       });
// //     }

// //     // ✅ FIRST: Try to get withdrawalDetails
// //     let withdrawalDetails = dashData.withdrawalDetails || null;

// //     // ✅ SECOND: If withdrawalDetails is empty, check accountDetails
// //     if (!withdrawalDetails && dashData.accountDetails) {
// //       console.log('🔵 [GET] No withdrawalDetails, using accountDetails as fallback');
// //       const accountDetails = dashData.accountDetails;
// //       const accounts = accountDetails.accounts || [];

// //       // ✅ FIXED: Removed TypeScript syntax (: any)
// //       const defaultAccount = accounts.find(function(a) { return a.isDefault; }) || accounts[0] || null;

// //       if (defaultAccount) {
// //         // ✅ Build withdrawalDetails from accountDetails
// //         withdrawalDetails = {
// //           bankName: defaultAccount.bankName || '',
// //           accountName: defaultAccount.accountName || '',
// //           accountNumber: defaultAccount.accountNumber || '',
// //           accounts: accounts,
// //           swiftCode: accountDetails.swiftCode || '',
// //           iban: accountDetails.iban || '',
// //           walletAddress: accountDetails.walletAddress || '',
// //           network: accountDetails.network || '',
// //         };
// //         console.log('🔵 [GET] Built withdrawalDetails from accountDetails:', withdrawalDetails);
// //       } else if (accounts.length > 0) {
// //         // Fallback: use first account even if no default
// //         withdrawalDetails = {
// //           bankName: accounts[0].bankName || '',
// //           accountName: accounts[0].accountName || '',
// //           accountNumber: accounts[0].accountNumber || '',
// //           accounts: accounts,
// //         };
// //         console.log('🔵 [GET] Built withdrawalDetails from first account:', withdrawalDetails);
// //       }
// //     }

// //     const withdrawalHistory = dashData.withdrawalHistory || [];

// //     console.log(`🔵 [GET] Final withdrawalDetails:`, withdrawalDetails);

// //     return NextResponse.json({
// //       success: true,
// //       data: {
// //         details: withdrawalDetails,
// //         history: withdrawalHistory
// //       }
// //     });

// //   } catch (error) {
// //     console.error('🔴 Error fetching withdrawal details:', error);
// //     return NextResponse.json(
// //       { success: false, error: 'Internal server error: ' + error.message },
// //       { status: 500 }
// //     );
// //   }
// // }

// // // ✅ POST: Save/Update user's withdrawal details (OVERWRITES previous)
// // export async function POST(request) {
// //   try {
// //     const authHeader = request.headers.get('authorization');
// //     const token = extractToken(authHeader);

// //     if (!token) {
// //       return NextResponse.json(
// //         { success: false, error: 'Authentication required' },
// //         { status: 401 }
// //       );
// //     }

// //     const decoded = verifyToken(token);
// //     if (!decoded) {
// //       return NextResponse.json(
// //         { success: false, error: 'Invalid token' },
// //         { status: 401 }
// //       );
// //     }

// //     const userId = decoded.id || decoded.userId;
// //     console.log(`🔵 [POST] Saving withdrawal for user: ${userId}`);

// //     // ✅ Get the request body
// //     const body = await request.json();
// //     console.log(`🔵 [POST] Request body:`, body);

// //     const {
// //       method,
// //       amount,
// //       bankName,
// //       accountName,
// //       accountNumber,
// //       userEmail,
// //       userName,
// //       swiftCode,
// //       iban,
// //       walletAddress,
// //       network
// //     } = body;

// //     // ✅ Validate required fields
// //     if (!amount || parseFloat(amount) <= 0) {
// //       return NextResponse.json(
// //         { success: false, error: 'Valid amount is required' },
// //         { status: 400 }
// //       );
// //     }

// //     if (!method) {
// //       return NextResponse.json(
// //         { success: false, error: 'Payment method is required' },
// //         { status: 400 }
// //       );
// //     }

// //     const dashCollection = await getDashDataCollection();

// //     // ✅ Get or create dashboard data
// //     let dashData = await dashCollection.findOne({ userId });

// //     if (!dashData) {
// //       console.log(`🔵 [POST] Creating new dashboard for user: ${userId}`);

// //       const defaultData = {
// //         userId,
// //         totalBalance: { amount: "0.00", change: "0.0%" },
// //         analysisBalance: { total: "0.00", stocks: "45%", crypto: "35%", etfs: "20%" },
// //         analysisSummary: "",
// //         analysisNote: 0,
// //         bills: [],
// //         recentTransactions: [],
// //         paymentMethods: [],
// //         withdrawalDetails: null,
// //         withdrawalHistory: [],
// //         createdAt: new Date(),
// //         updatedAt: new Date(),
// //       };

// //       const result = await dashCollection.insertOne(defaultData);
// //       dashData = { ...defaultData, _id: result.insertedId };
// //     }

// //     const withdrawalDetails = {
// //       method: method || 'bank',
// //       bankName: bankName || '',
// //       accountName: accountName || '',
// //       accountNumber: accountNumber || '',
// //       userEmail: userEmail,
// //       userName: userName,
// //       swiftCode: swiftCode || '',
// //       iban: iban || '',
// //       walletAddress: walletAddress || '',
// //       network: network || '',
// //       updatedAt: new Date().toISOString()
// //     };

// //     // console.log(`🔵 [POST] Withdrawal details to save:`, withdrawalDetails);

// //     // ✅ Generate unique transaction reference
// //     const generateReference = function() {
// //       const timestamp = Date.now().toString().slice(-6);
// //       const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
// //       return 'ASH REF:' + timestamp + random;
// //     };

// //     // ✅ Create withdrawal history entry
// //     const historyEntry = {
// //       id: 'wdr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
// //       reference: generateReference(),
// //       amount: parseFloat(amount),
// //       method: method || 'bank',
// //       status: 'pending',
// //       createdAt: new Date().toISOString(),
// //       details: withdrawalDetails
// //     };

// //     console.log(`🔵 [POST] History entry:`, historyEntry);

// //     // ✅ Update dashboard: OVERWRITE withdrawalDetails, ADD to history
// //     const updateResult = await dashCollection.updateOne(
// //       { userId },
// //       {
// //         $set: {
// //           'withdrawalDetails': withdrawalDetails,
// //           updatedAt: new Date()
// //         },
// //         $push: {
// //           withdrawalHistory: {
// //             $each: [historyEntry],
// //             $position: 0,
// //             $slice: 50
// //           }
// //         }
// //       }
// //     );

// //     // console.log(`🔵 [POST] Update result:`, updateResult);

// //     if (updateResult.modifiedCount === 0 && updateResult.matchedCount === 0) {
// //       return NextResponse.json(
// //         { success: false, error: 'Failed to save withdrawal details' },
// //         { status: 500 }
// //       );
// //     }

// //     // ✅ Fetch the updated data to return
// //     const updatedDashData = await dashCollection.findOne({ userId });

// //     return NextResponse.json({
// //       success: true,
// //       message: 'Withdrawal details saved successfully',
// //       data: {
// //         details: withdrawalDetails,
// //         history: historyEntry,
// //         dashboard: updatedDashData
// //       }
// //     });

// //   } catch (error) {
// //     console.error('🔴 Error saving withdrawal details:', error);
// //     return NextResponse.json(
// //       { success: false, error: 'Internal server error: ' + error.message },
// //       { status: 500 }
// //     );
// //   }
// // }

// // // ✅ DELETE: Clear user's withdrawal details
// // export async function DELETE(request) {
// //   try {
// //     const authHeader = request.headers.get('authorization');
// //     const token = extractToken(authHeader);

// //     if (!token) {
// //       return NextResponse.json(
// //         { success: false, error: 'Authentication required' },
// //         { status: 401 }
// //       );
// //     }

// //     const decoded = verifyToken(token);
// //     if (!decoded) {
// //       return NextResponse.json(
// //         { success: false, error: 'Invalid token' },
// //         { status: 401 }
// //       );
// //     }

// //     const userId = decoded.id || decoded.userId;
// //     const dashCollection = await getDashDataCollection();

// //     const result = await dashCollection.updateOne(
// //       { userId },
// //       {
// //         $set: {
// //           'withdrawalDetails': null,
// //           updatedAt: new Date()
// //         }
// //       }
// //     );

// //     return NextResponse.json({
// //       success: true,
// //       message: 'Withdrawal details cleared successfully'
// //     });

// //   } catch (error) {
// //     console.error('🔴 Error clearing withdrawal details:', error);
// //     return NextResponse.json(
// //       { success: false, error: 'Internal server error: ' + error.message },
// //       { status: 500 }
// //     );
// //   }
// // }

// // app/api/user/withdrawal/route.js
// //
// // GET    — return the user's withdrawal details + history
// // POST   — request a withdrawal (escrow: balance deducted immediately)
// // DELETE — clear the user's saved withdrawal details (does not touch history)
// //
// // Model: hybrid escrow.
// //   - On request: check balance, deduct it, record a pending withdrawal.
// //   - On approval (admin route): status changes, no balance change.
// //   - On rejection (admin route): amount is refunded.
// //   - Uses optimistic locking (pins the old balance string) to prevent races.

// import {
//   requireAuth,
//   readJson,
//   jsonOk,
//   jsonError,
//   ApiError,
//   assertNumber,
//   assertString,
// } from '@/lib/api-helpers';
// import { getDashDataCollection } from '@/lib/mongodb';

// export const runtime = 'nodejs';

// // ---- GET: fetch saved details + history ----------------------------------

// export async function GET(request) {
//   try {
//     const { userId } = await requireAuth(request);

//     const dashCollection = await getDashDataCollection();
//     const dashData = await dashCollection.findOne({ userId });

//     if (!dashData) {
//       return jsonOk({ data: null, message: 'No withdrawal details found' });
//     }

//     // Prefer withdrawalDetails; fall back to deriving from accountDetails
//     let withdrawalDetails = dashData.withdrawalDetails || null;

//     if (!withdrawalDetails && dashData.accountDetails) {
//       const accountDetails = dashData.accountDetails;
//       const accounts = Array.isArray(accountDetails.accounts) ? accountDetails.accounts : [];
//       const defaultAccount =
//         accounts.find((a) => a.isDefault) || accounts[0] || null;

//       if (defaultAccount) {
//         withdrawalDetails = {
//           bankName: defaultAccount.bankName || '',
//           accountName: defaultAccount.accountName || '',
//           accountNumber: defaultAccount.accountNumber || '',
//           accounts,
//           swiftCode: accountDetails.swiftCode || '',
//           iban: accountDetails.iban || '',
//           walletAddress: accountDetails.walletAddress || '',
//           network: accountDetails.network || '',
//         };
//       }
//     }

//     const history = Array.isArray(dashData.withdrawalHistory)
//       ? dashData.withdrawalHistory
//       : [];

//     return jsonOk({
//       data: {
//         details: withdrawalDetails,
//         history,
//       },
//     });
//   } catch (error) {
//     if (error instanceof ApiError) {
//       return jsonError(error.message, error.status);
//     }
//     console.error('[withdrawal GET] error:', error);
//     return jsonError('Internal server error', 500);
//   }
// }

// // ---- Helpers -------------------------------------------------------------

// // Only allow the fields we expect on withdrawalDetails. Anything else
// // (role, balance, arbitrary keys) is dropped.
// function sanitizeWithdrawalDetails(raw) {
//   if (!raw || typeof raw !== 'object') return {};
//   const clean = {};
//   const FIELDS = [
//     'method', 'bankName', 'accountName', 'accountNumber',
//     'swiftCode', 'iban', 'walletAddress', 'network',
//   ];
//   for (const f of FIELDS) {
//     if (typeof raw[f] === 'string') clean[f] = raw[f].trim().slice(0, 200);
//   }
//   return clean;
// }

// function generateReference() {
//   const timestamp = Date.now().toString().slice(-6);
//   const random = Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0');
//   return `ASH REF:${timestamp}${random}`;
// }

// // ---- POST: request a withdrawal (escrow) ---------------------------------

// export async function POST(request) {
//   try {
//     const { userId, user } = await requireAuth(request);

//     const body = await readJson(request);

//     const amount = assertNumber(body?.amount, 'Amount', {
//       min: 0.01,
//       max: 1_000_000,
//     });

//     const method = assertString(body?.method || 'bank', 'Payment method', {
//       max: 30,
//     });

//     // ✅ Identity comes from the DB user doc, not the request body.
//     //    This is what the admin panel will display.
//     const userEmail = user.email || 'unknown@example.com';
//     const userName =
//       user.displayName || user.username || user.firstName || 'Unknown User';

//     // Sanitize payment details (drops unknown fields, caps lengths)
//     const cleanedDetails = sanitizeWithdrawalDetails(body);

//     const dashCollection = await getDashDataCollection();

//     // Ensure a dashdata doc exists. Create one if missing.
//     let dashData = await dashCollection.findOne({ userId });
//     if (!dashData) {
//       const defaultData = {
//         userId,
//         totalBalance: { amount: '0.00', change: '0.0%' },
//         analysisBalance: {
//           total: '0.00', stocks: '45%', crypto: '35%', etfs: '20%',
//         },
//         analysisSummary: '',
//         analysisNote: 0,
//         bills: [],
//         recentTransactions: [],
//         paymentMethods: [],
//         investments: [],
//         withdrawalDetails: null,
//         withdrawalHistory: [],
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };
//       const insert = await dashCollection.insertOne(defaultData);
//       dashData = { ...defaultData, _id: insert.insertedId };
//     }

//     const currentBalanceStr = String(dashData.totalBalance?.amount ?? '0');
//     const currentBalance = parseFloat(currentBalanceStr);
//     if (Number.isNaN(currentBalance)) {
//       throw new ApiError('Invalid balance on record', 500);
//     }

//     // ✅ Server-side balance check — request blocked if insufficient
//     if (amount > currentBalance) {
//       throw new ApiError('Insufficient balance', 400);
//     }

//     const newBalance = currentBalance - amount;
//     const newBalanceStr = newBalance.toFixed(2);

//     const withdrawalDetails = {
//       method,
//       ...cleanedDetails,
//       userEmail,
//       userName,
//       updatedAt: new Date().toISOString(),
//     };

//     const historyEntry = {
//       id: `wdr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
//       reference: generateReference(),
//       amount,
//       method,
//       status: 'pending',
//       createdAt: new Date().toISOString(),
//       details: withdrawalDetails,
//     };

//     // ✅ Optimistic lock: pin the old balance string. If it changed under us,
//     //    modifiedCount is 0 and we bail with 409.
//     const result = await dashCollection.updateOne(
//       {
//         userId,
//         'totalBalance.amount': currentBalanceStr,
//       },
//       {
//         $set: {
//           'totalBalance.amount': newBalanceStr,
//           withdrawalDetails,
//           updatedAt: new Date(),
//         },
//         $push: {
//           withdrawalHistory: {
//             $each: [historyEntry],
//             $position: 0,
//             $slice: 100, // cap history at 100 entries
//           },
//         },
//       }
//     );

//     if (result.modifiedCount === 0) {
//       throw new ApiError('Balance changed during request. Please try again.', 409);
//     }

//     // Fetch updated doc for the response
//     const updated = await dashCollection.findOne({ userId });

//     return jsonOk({
//       message: 'Withdrawal requested',
//       data: {
//         details: withdrawalDetails,
//         history: historyEntry,
//         dashboard: updated,
//       },
//     });
//   } catch (error) {
//     if (error instanceof ApiError) {
//       return jsonError(error.message, error.status);
//     }
//     console.error('[withdrawal POST] error:', error);
//     return jsonError('Internal server error', 500);
//   }
// }

// // ---- DELETE: clear saved withdrawal details (history untouched) ----------

// export async function DELETE(request) {
//   try {
//     const { userId } = await requireAuth(request);

//     const dashCollection = await getDashDataCollection();

//     await dashCollection.updateOne(
//       { userId },
//       {
//         $set: {
//           withdrawalDetails: null,
//           updatedAt: new Date(),
//         },
//       }
//     );

//     return jsonOk({ message: 'Withdrawal details cleared successfully' });
//   } catch (error) {
//     if (error instanceof ApiError) {
//       return jsonError(error.message, error.status);
//     }
//     console.error('[withdrawal DELETE] error:', error);
//     return jsonError('Internal server error', 500);
//   }
// }

// app/api/user/withdrawal/route.js
//
// GET    — return the user's withdrawal details + history
// POST   — request a withdrawal (escrow: balance deducted immediately)
// DELETE — clear the user's saved withdrawal details (does not touch history)
//
// Model: hybrid escrow.
//   - On request: check balance, deduct it, record a pending withdrawal.
//   - On approval (admin route): status changes, no balance change.
//   - On rejection (admin route): amount is refunded.
//   - Uses optimistic locking (pins the old balance string) to prevent races.
//   - Fires an admin "withdrawal" notification on request (non-blocking).

import {
  requireAuth,
  readJson,
  jsonOk,
  jsonError,
  ApiError,
  assertNumber,
  assertString,
} from '@/lib/api-helpers';
import { getDashDataCollection } from '@/lib/mongodb';
import { createOrBumpNotification } from '@/lib/db/notifications';

export const runtime = 'nodejs';

// ---- GET: fetch saved details + history ----------------------------------

export async function GET(request) {
  try {
    const { userId } = await requireAuth(request);

    const dashCollection = await getDashDataCollection();
    const dashData = await dashCollection.findOne({ userId });

    if (!dashData) {
      return jsonOk({ data: null, message: 'No withdrawal details found' });
    }

    let withdrawalDetails = dashData.withdrawalDetails || null;

    if (!withdrawalDetails && dashData.accountDetails) {
      const accountDetails = dashData.accountDetails;
      const accounts = Array.isArray(accountDetails.accounts) ? accountDetails.accounts : [];
      const defaultAccount =
        accounts.find((a) => a.isDefault) || accounts[0] || null;

      if (defaultAccount) {
        withdrawalDetails = {
          bankName: defaultAccount.bankName || '',
          accountName: defaultAccount.accountName || '',
          accountNumber: defaultAccount.accountNumber || '',
          accounts,
          swiftCode: accountDetails.swiftCode || '',
          iban: accountDetails.iban || '',
          walletAddress: accountDetails.walletAddress || '',
          network: accountDetails.network || '',
        };
      }
    }

    const history = Array.isArray(dashData.withdrawalHistory)
      ? dashData.withdrawalHistory
      : [];

    return jsonOk({
      data: {
        details: withdrawalDetails,
        history,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }
    console.error('[withdrawal GET] error:', error);
    return jsonError('Internal server error', 500);
  }
}

// ---- Helpers -------------------------------------------------------------

function sanitizeWithdrawalDetails(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const clean = {};
  const FIELDS = [
    'method', 'bankName', 'accountName', 'accountNumber',
    'swiftCode', 'iban', 'walletAddress', 'network',
  ];
  for (const f of FIELDS) {
    if (typeof raw[f] === 'string') clean[f] = raw[f].trim().slice(0, 200);
  }
  return clean;
}

function generateReference() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0');
  return `ASH REF:${timestamp}${random}`;
}

// ---- POST: request a withdrawal (escrow) ---------------------------------

export async function POST(request) {
  try {
    const { userId, user } = await requireAuth(request);

    const body = await readJson(request);

    const amount = assertNumber(body?.amount, 'Amount', {
      min: 0.01,
      max: 1_000_000,
    });

    const method = assertString(body?.method || 'bank', 'Payment method', {
      max: 30,
    });

    const userEmail = user.email || 'unknown@example.com';
    const userName =
      user.displayName || user.username || user.firstName || 'Unknown User';

    const cleanedDetails = sanitizeWithdrawalDetails(body);

    const dashCollection = await getDashDataCollection();

    let dashData = await dashCollection.findOne({ userId });
    if (!dashData) {
      const defaultData = {
        userId,
        totalBalance: { amount: '0.00', change: '0.0%' },
        analysisBalance: {
          total: '0.00', stocks: '45%', crypto: '35%', etfs: '20%',
        },
        analysisSummary: '',
        analysisNote: 0,
        bills: [],
        recentTransactions: [],
        paymentMethods: [],
        investments: [],
        withdrawalDetails: null,
        withdrawalHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const insert = await dashCollection.insertOne(defaultData);
      dashData = { ...defaultData, _id: insert.insertedId };
    }

    const currentBalanceStr = String(dashData.totalBalance?.amount ?? '0');
    const currentBalance = parseFloat(currentBalanceStr);
    if (Number.isNaN(currentBalance)) {
      throw new ApiError('Invalid balance on record', 500);
    }

    if (amount > currentBalance) {
      throw new ApiError('Insufficient balance', 400);
    }

    const newBalance = currentBalance - amount;
    const newBalanceStr = newBalance.toFixed(2);

    const withdrawalDetails = {
      method,
      ...cleanedDetails,
      userEmail,
      userName,
      updatedAt: new Date().toISOString(),
    };

    const historyEntry = {
      id: `wdr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      reference: generateReference(),
      amount,
      method,
      status: 'pending',
      createdAt: new Date().toISOString(),
      details: withdrawalDetails,
    };

    const result = await dashCollection.updateOne(
      {
        userId,
        'totalBalance.amount': currentBalanceStr,
      },
      {
        $set: {
          'totalBalance.amount': newBalanceStr,
          withdrawalDetails,
          updatedAt: new Date(),
        },
        $push: {
          withdrawalHistory: {
            $each: [historyEntry],
            $position: 0,
            $slice: 100,
          },
        },
      }
    );

    if (result.modifiedCount === 0) {
      throw new ApiError('Balance changed during request. Please try again.', 409);
    }

    // ✅ Fire admin notification — non-blocking, withdrawal already recorded
    try {
      await createOrBumpNotification({
        type: 'withdrawal',
        userId,
        username: userName,
        email: userEmail,
        avatar: user.avatar || null,
        detail: `Requested $${amount.toFixed(2)} via ${method}`,
        metadata: {
          reference: historyEntry.reference,
          amount,
          method,
          newBalance: newBalanceStr,
          at: new Date().toISOString(),
        },
      });
    } catch (notifErr) {
      console.warn('[withdrawal] notification failed (non-critical):', notifErr?.message);
    }

    const updated = await dashCollection.findOne({ userId });

    return jsonOk({
      message: 'Withdrawal requested',
      data: {
        details: withdrawalDetails,
        history: historyEntry,
        dashboard: updated,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }
    console.error('[withdrawal POST] error:', error);
    return jsonError('Internal server error', 500);
  }
}

// ---- DELETE: clear saved withdrawal details (history untouched) ----------

export async function DELETE(request) {
  try {
    const { userId } = await requireAuth(request);

    const dashCollection = await getDashDataCollection();

    await dashCollection.updateOne(
      { userId },
      {
        $set: {
          withdrawalDetails: null,
          updatedAt: new Date(),
        },
      }
    );

    return jsonOk({ message: 'Withdrawal details cleared successfully' });
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }
    console.error('[withdrawal DELETE] error:', error);
    return jsonError('Internal server error', 500);
  }
}