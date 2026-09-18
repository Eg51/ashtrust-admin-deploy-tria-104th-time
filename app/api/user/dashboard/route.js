// // import { NextResponse } from 'next/server';
// // import { getUserDashboard, getUpcomingBills, getRecentPaidBills } from '@/lib/db/dashdata';
// // import { verifyToken, extractToken } from '@/lib/security';

// // export const runtime = 'nodejs';

// // export async function GET(request) {
// //   try {
// //     // ... [Keep your existing Auth Header and Decode logic here] ...
// //     const userId = decoded.id || decoded.userId;
// //     const dashboardData = await getUserDashboard(userId);
    
// //     if (!dashboardData) {
// //       return NextResponse.json(
// //         { success: false, error: 'Dashboard data not found' },
// //         { status: 404 }
// //       );
// //     }

// //     const upcomingBills = await getUpcomingBills(userId);
// //     const recentPaidBills = await getRecentPaidBills(userId, 5);

// //     // Get existing stats
// //     const totalBills = dashboardData.bills?.length || 0;
// //     const paidBills = dashboardData.bills?.filter(b => b.status === 'paid').length || 0;
// //     const unpaidBills = dashboardData.bills?.filter(b => b.status === 'unpaid').length || 0;
// //     const overdueBills = dashboardData.bills?.filter(b => b.status === 'overdue').length || 0;
// //     const totalSpent = dashboardData.bills
// //       ?.filter(b => b.status === 'paid')
// //       .reduce((sum, b) => sum + (b.amount || 0), 0) || 0;

// //     // 🟢 ADD THESE TWO LINES TO YOUR RETURN OBJECT:
// //     return NextResponse.json({
// //       success: true,
// //       data: {
// //         totalBalance: dashboardData.totalBalance || { amount: "0.00", change: "0.0%" },   // ✅ ADDED
// //         analysisBalance: dashboardData.analysisBalance || { total: "0.00", stocks: "45%", crypto: "35%", etfs: "20%" }, // ✅ ADDED
// //         totalBills,
// //         paidBills,
// //         unpaidBills,
// //         overdueBills,
// //         totalSpent,
// //         upcomingBills,
// //         recentTransactions: dashboardData.recentTransactions || [],
// //         paymentMethods: dashboardData.paymentMethods || [],
// //         preferences: dashboardData.preferences || {},
// //       },
// //     });

// //   } catch (error) {
// //     console.error('Error fetching user dashboard:', error);
// //     return NextResponse.json(
// //       { success: false, error: 'Internal server error' },
// //       { status: 500 }
// //     );
// //   }
// // }
// // app/api/user/dashboard/route.js
// import { NextResponse } from 'next/server';
// import { getUserDashboard, getUpcomingBills, getRecentPaidBills } from '@/lib/db/dashdata';
// import { verifyToken, extractToken } from '@/lib/security';

// export const runtime = 'nodejs';

// export async function GET(request) {
//   try {
//     const authHeader = request.headers.get('authorization');
//     const token = extractToken(authHeader);
    
//     if (!token) {
//       return NextResponse.json(
//         { success: false, error: 'Authentication required' },
//         { status: 401 }
//       );
//     }

//     const decoded = verifyToken(token);
    
//     if (!decoded) {
//       return NextResponse.json(
//         { success: false, error: 'Invalid token' },
//         { status: 401 }
//       );
//     }

//     const userId = decoded.id || decoded.userId;
//     const dashboardData = await getUserDashboard(userId);
    
//     if (!dashboardData) {
//       return NextResponse.json(
//         { success: false, error: 'Dashboard data not found' },
//         { status: 404 }
//       );
//     }

//     const upcomingBills = await getUpcomingBills(userId);
//     const recentPaidBills = await getRecentPaidBills(userId, 5);

//     const totalBills = dashboardData.bills?.length || 0;
//     const paidBills = dashboardData.bills?.filter(b => b.status === 'paid').length || 0;
//     const unpaidBills = dashboardData.bills?.filter(b => b.status === 'unpaid').length || 0;
//     const overdueBills = dashboardData.bills?.filter(b => b.status === 'overdue').length || 0;
//     const totalSpent = dashboardData.bills
//       ?.filter(b => b.status === 'paid')
//       .reduce((sum, b) => sum + (b.amount || 0), 0) || 0;

//     return NextResponse.json({
//       success: true,
//       data: {
//         totalBalance: dashboardData.totalBalance || { amount: "0.00", change: "0.0%" },
//         analysisBalance: dashboardData.analysisBalance || { total: "0.00", stocks: "45%", crypto: "35%", etfs: "20%" },
//         analysisNote: dashboardData.analysisNote ?? 0,        // ✅ NEW: number for Assets card
//         analysisSummary: dashboardData.analysisSummary || "", // ✅ NEW: optional text summary
//         totalBills,
//         paidBills,
//         unpaidBills,
//         overdueBills,
//         totalSpent,
//         upcomingBills,
//         recentTransactions: dashboardData.recentTransactions || [],
//         paymentMethods: dashboardData.paymentMethods || [],
//         preferences: dashboardData.preferences || {},
//         investments: dashboardData.investments || [],
//         bills: dashboardData.bills || [],
//       },
//     });

//   } catch (error) {
//     console.error('Error fetching user dashboard:', error);
//     return NextResponse.json(
//       { success: false, error: 'Server error, please contact support by mail' },
//       { status: 500 }
//     );
//   }
// }
// app/api/user/dashboard/invest/route.js
//
// POST — invest in an asset.
// - Requires authentication
// - Validates amount is positive and <= available balance
// - Uses optimistic locking (pins the old balance string) to prevent races
// - Appends to investments array via $push (no array overwrite race)
// - Fires an admin "purchase" notification (non-blocking)

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

export async function POST(request) {
  try {
    // ✅ requireAuth also returns the user doc — no extra DB round trip needed
    const { userId, user } = await requireAuth(request);

    const body = await readJson(request);

    // Accept any asset identifier — the client determines what it is.
    // Only sanitize (trim, lowercase, cap length) to keep the DB tidy.
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

    // ✅ Fire admin notification — non-blocking, purchase already succeeded
    try {
      await createOrBumpNotification({
        type: 'purchase',
        userId,
        username: user.displayName || user.username || 'Unknown',
        email: user.email || '',
        avatar: user.avatar || null,
        detail: `Bought $${amount.toFixed(2)} of ${assetId.toUpperCase()}`,
        metadata: {
          assetId,
          amount,
          newBalance: newBalanceStr,
          investmentId: newInvestment.id,
          at: new Date().toISOString(),
        },
      });
    } catch (notifErr) {
      console.warn('[invest] notification failed (non-critical):', notifErr?.message);
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