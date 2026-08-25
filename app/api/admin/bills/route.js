// app/api/admin/bills/route.js
import { NextResponse } from 'next/server';
import { getAllBills, updateBillStatus, deleteBill } from '@/lib/db/dashdata';
import { verifyToken, extractToken } from '@/lib/security';

export const runtime = 'nodejs';

export async function GET(request) {
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
    if (!decoded || (!decoded.isAdmin && decoded.role !== 'admin')) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const bills = await getAllBills(100);

    return NextResponse.json({
      success: true,
      data: bills,
    });

  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
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
    if (!decoded || (!decoded.isAdmin && decoded.role !== 'admin')) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { billId, userId, status } = body;

    if (!billId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Bill ID and User ID required' },
        { status: 400 }
      );
    }

    if (!status || !['paid', 'unpaid', 'overdue'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    const result = await updateBillStatus(userId, billId, status);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Bill not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bill updated successfully',
    });

  } catch (error) {
    console.error('Error updating bill:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
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
    if (!decoded || (!decoded.isAdmin && decoded.role !== 'admin')) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const billId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!billId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Bill ID and User ID required' },
        { status: 400 }
      );
    }

    const result = await deleteBill(userId, billId);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Bill not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bill deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting bill:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}