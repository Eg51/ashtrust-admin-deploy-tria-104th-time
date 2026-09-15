// // app/api/admin/withdrawal/update-status/route.js
// import { NextResponse } from 'next/server';
// import { getDashDataCollection } from '@/lib/mongodb';
// import { verifyToken, extractToken } from '@/lib/security';

// export const runtime = 'nodejs';

// export async function POST(request) {
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

//     // ✅ Check if user is admin
//     if (decoded.role !== 'admin' && !decoded.isAdmin) {
//       return NextResponse.json(
//         { success: false, error: 'Admin access required' },
//         { status: 403 }
//       );
//     }

//     const body = await request.json();
//     const { reference, status } = body;

//     if (!reference || !status) {
//       return NextResponse.json(
//         { success: false, error: 'Reference and status are required' },
//         { status: 400 }
//       );
//     }

//     // ✅ Validate status
//     const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
//     if (!validStatuses.includes(status)) {
//       return NextResponse.json(
//         { success: false, error: 'Invalid status. Must be: pending, approved, rejected, or completed' },
//         { status: 400 }
//       );
//     }

//     const dashCollection = await getDashDataCollection();

//     // ✅ Update the withdrawal status in the user's withdrawalHistory
//     const result = await dashCollection.updateOne(
//       { 'withdrawalHistory.reference': reference },
//       {
//         $set: {
//           'withdrawalHistory.$.status': status,
//           'withdrawalHistory.$.updatedAt': new Date().toISOString()
//         }
//       }
//     );

//     if (result.matchedCount === 0) {
//       return NextResponse.json(
//         { success: false, error: 'Withdrawal record not found' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       message: `Withdrawal status updated to: ${status}`,
//       data: { reference, status }
//     });

//   } catch (error) {
//     console.error('🔴 Error updating withdrawal status:', error);
//     return NextResponse.json(
//       { success: false, error: 'Internal server error: ' + error.message },
//       { status: 500 }
//     );
//   }
// }
// app/api/admin/withdrawal/update-status/route.js
//
// POST — admin updates a withdrawal's status.
// Uses the escrow model:
//   - On rejection: refund the amount back to totalBalance.amount
//   - On approval/completion: no balance change (already deducted at request time)
//   - State machine: only 'pending' → other states. No double-processing.
//   - Uses optimistic locking (pins old balance string) on refund.

import {
  requireAdmin,
  readJson,
  jsonOk,
  jsonError,
  ApiError,
  assertString,
} from '@/lib/api-helpers';
import { getDashDataCollection } from '@/lib/mongodb';

export const runtime = 'nodejs';

const VALID_STATUSES = ['pending', 'approved', 'rejected', 'completed'];
const REFUND_STATUSES = new Set(['rejected']); // statuses that refund balance

export async function POST(request) {
  try {
    const { userId: adminId, user: admin } = await requireAdmin(request);

    const body = await readJson(request);
    const reference = assertString(body?.reference, 'Reference', { max: 100 });
    const status = assertString(body?.status, 'Status', { max: 20 });

    if (!VALID_STATUSES.includes(status)) {
      throw new ApiError(
        'Invalid status. Must be: pending, approved, rejected, or completed',
        400
      );
    }

    const dashCollection = await getDashDataCollection();

    // ---- 1. Load the dashdata doc that contains this reference -------------
    const dashData = await dashCollection.findOne({
      'withdrawalHistory.reference': reference,
    });

    if (!dashData) {
      throw new ApiError('Withdrawal record not found', 404);
    }

    const targetEntry = (dashData.withdrawalHistory || [])
      .find((h) => h.reference === reference);

    if (!targetEntry) {
      throw new ApiError('Withdrawal record not found', 404);
    }

    const currentStatus = targetEntry.status || 'pending';

    // ---- 2. State-machine guard: only allow pending → other ----------------
    if (currentStatus !== 'pending') {
      throw new ApiError(
        `Withdrawal is already '${currentStatus}' and cannot be changed`,
        409
      );
    }

    if (status === 'pending') {
      // Already pending; nothing to do.
      throw new ApiError('Withdrawal is already pending', 400);
    }

    // ---- 3. Decide if refund is needed ------------------------------------
    const shouldRefund =
      REFUND_STATUSES.has(status) && Number(targetEntry.amount) > 0;

    // ---- 4. Build the update ---------------------------------------------
    const historyFilter = {
      'withdrawalHistory.reference': reference,
      'withdrawalHistory.status': 'pending', // state-machine guard at DB level
    };

    const historyUpdate = {
      $set: {
        'withdrawalHistory.$.status': status,
        'withdrawalHistory.$.updatedAt': new Date().toISOString(),
        'withdrawalHistory.$.processedBy': adminId,
        'withdrawalHistory.$.processedAt': new Date().toISOString(),
        updatedAt: new Date(),
      },
    };

    if (shouldRefund) {
      // Refund with optimistic lock on the balance string
      const currentBalanceStr = String(dashData.totalBalance?.amount ?? '0');
      const currentBalance = parseFloat(currentBalanceStr);
      if (Number.isNaN(currentBalance)) {
        throw new ApiError('Invalid balance on record', 500);
      }

      const refundedBalance = currentBalance + Number(targetEntry.amount);
      const refundedBalanceStr = refundedBalance.toFixed(2);

      const result = await dashCollection.updateOne(
        {
          ...historyFilter,
          'totalBalance.amount': currentBalanceStr,
        },
        {
          ...historyUpdate,
          $set: {
            ...historyUpdate.$set,
            'totalBalance.amount': refundedBalanceStr,
          },
        }
      );

      if (result.modifiedCount === 0) {
        throw new ApiError('Balance changed during refund. Please retry.', 409);
      }

      return jsonOk({
        message: `Withdrawal ${status} and refunded`,
        data: { reference, status, refunded: Number(targetEntry.amount) },
      });
    }

    // ---- 5. Non-refund transition (approved / completed) ------------------
    const result = await dashCollection.updateOne(historyFilter, historyUpdate);

    if (result.modifiedCount === 0) {
      throw new ApiError('Failed to update status. It may have changed.', 409);
    }

    return jsonOk({
      message: `Withdrawal status updated to: ${status}`,
      data: { reference, status },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status);
    }
    console.error('[admin/withdrawal/update-status] error:', error);
    return jsonError('Internal server error', 500);
  }
}