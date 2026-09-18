// // app/api/user/dashboard/invest/route.js
// import { NextResponse } from 'next/server';
// import { getDashDataCollection } from '@/lib/mongodb';
// import { verifyToken, extractToken } from '@/lib/security';

// export async function POST(request) {
//   try {
//     const token = extractToken(request.headers.get('authorization'));
//     if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//     const decoded = verifyToken(token);
//     const userId = decoded.id || decoded.userId;

//     const { assetId, amount } = await request.json();
//     if (!assetId || !amount) {
//       return NextResponse.json({ error: 'Asset ID and amount required' }, { status: 400 });
//     }

//     const dashCollection = await getDashDataCollection();
//     const dashData = await dashCollection.findOne({ userId });

//     if (!dashData) {
//       return NextResponse.json({ error: 'Nothing here' }, { status: 404 });
//     }

//     // 💰 Deduct from total balance
//     const currentBalance = parseFloat(dashData.totalBalance?.amount) || 0;
//     const newBalance = currentBalance - parseFloat(amount);
    
//     // 🟢 Add to the investments array
//     const newInvestment = {
//       id: Date.now().toString(),
//       assetId,
//       amount: parseFloat(amount),
//       purchasePrice: 0, // Add logic to fetch asset price if you have it
//       date: new Date().toISOString(),
//     };

//     // Update the dashdata collection
//     await dashCollection.updateOne(
//       { userId },
//       { 
//         $set: { 
//           'totalBalance.amount': newBalance.toFixed(2),
//           investments: [...(dashData.investments || []), newInvestment], // Saves the card!
//           updatedAt: new Date()
//         }
//       }
//     );

//     return NextResponse.json({ success: true, data: { newBalance, newInvestment } });

//   } catch (error) {
//     console.error('error:', error);
//     return NextResponse.json({ error: 'asset not purchesed' }, { status: 500 });
//   }
// }

// app/api/user/dashboard/invest/route.js
//
// POST — invest in an asset.
// - Requires authentication
// - Validates amount is positive and <= available balance
// - Uses optimistic locking (pins the old balance string) to prevent races
// - Appends to investments array via $push (no array overwrite race)
// app/api/user/dashboard/invest/route.js
//
// POST — invest in an asset.
// - Requires authentication
// - Validates amount is positive and <= available balance
// - Uses optimistic locking (pins the old balance string) to prevent races
// - Appends to investments array via $push (no array overwrite race)

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

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { userId } = await requireAuth(request);

    const body = await readJson(request);

    // Accept any asset identifier — the client determines what it is.
    // We only sanitize (trim, lowercase, cap length) to keep the DB tidy.
    const assetId = assertString(body?.assetId, 'Asset ID', { max: 50 })
      .toLowerCase();
    const amount = assertNumber(body?.amount, 'Amount', {
      min: 0.01,
      max: 1_000_000,
    });

    const dashCollection = await getDashDataCollection();
    const dashData = await dashCollection.findOne({ userId });

    if (!dashData) {
      throw new ApiError('No dashboard data found', 404);
    }

    // Parse current balance from string
    const currentBalanceStr = String(dashData.totalBalance?.amount ?? '0');
    const currentBalance = parseFloat(currentBalanceStr);
    if (Number.isNaN(currentBalance)) {
      throw new ApiError('Invalid balance on record', 500);
    }

    // ✅ Server-side balance check — the client cannot bypass this
    if (amount > currentBalance) {
      throw new ApiError('Insufficient balance', 400);
    }

    const newBalance = currentBalance - amount;
    const newBalanceStr = newBalance.toFixed(2);

    const newInvestment = {
      id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      assetId,
      amount,
      purchasePrice: 0,
      date: new Date().toISOString(),
    };

    // ✅ Optimistic lock: only update if the balance string is still what we read.
    const result = await dashCollection.updateOne(
      {
        userId,
        'totalBalance.amount': currentBalanceStr,
      },
      {
        $set: {
          'totalBalance.amount': newBalanceStr,
          updatedAt: new Date(),
        },
        $push: {
          investments: newInvestment,
        },
      }
    );

    if (result.modifiedCount === 0) {
      throw new ApiError('Balance changed during request. Please try again.', 409);
    }

    return jsonOk({
      data: {
        newBalance: newBalanceStr,
        newInvestment,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }
    console.error('[invest] error:', error);
    return jsonError('Failed to complete investment', 500);
  }
}