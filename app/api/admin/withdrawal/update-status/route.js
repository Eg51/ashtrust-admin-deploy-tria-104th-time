// app/api/admin/withdrawal/update-status/route.js
import { NextResponse } from 'next/server';
import { getDashDataCollection } from '@/lib/mongodb';
import { verifyToken, extractToken } from '@/lib/security';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // ✅ Check if user is admin
    if (decoded.role !== 'admin' && !decoded.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reference, status } = body;

    if (!reference || !status) {
      return NextResponse.json(
        { success: false, error: 'Reference and status are required' },
        { status: 400 }
      );
    }

    // ✅ Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be: pending, approved, rejected, or completed' },
        { status: 400 }
      );
    }

    const dashCollection = await getDashDataCollection();

    // ✅ Update the withdrawal status in the user's withdrawalHistory
    const result = await dashCollection.updateOne(
      { 'withdrawalHistory.reference': reference },
      {
        $set: {
          'withdrawalHistory.$.status': status,
          'withdrawalHistory.$.updatedAt': new Date().toISOString()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Withdrawal status updated to: ${status}`,
      data: { reference, status }
    });

  } catch (error) {
    console.error('🔴 Error updating withdrawal status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}