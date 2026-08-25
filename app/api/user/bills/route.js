// app/api/user/bills/route.js
import { NextResponse } from 'next/server';
import { getUserDashboard, addBill, updateBillStatus } from '@/lib/db/dashdata';
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
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.id || decoded.userId;
    const dashboardData = await getUserDashboard(userId);

    return NextResponse.json({
      success: true,
      data: {
        bills: dashboardData?.bills || [],
        total: dashboardData?.bills?.length || 0,
      },
    });

  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const userId = decoded.id || decoded.userId;
    const body = await request.json();
    const { title, amount, dueDate, category, description } = body;

    if (!title || !amount || !dueDate || !category) {
      return NextResponse.json(
        { success: false, error: 'Title, amount, dueDate, and category are required' },
        { status: 400 }
      );
    }

    const result = await addBill(userId, {
      title,
      amount: parseFloat(amount),
      dueDate,
      category,
      description: description || '',
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to add bill' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bill added successfully',
    });

  } catch (error) {
    console.error('Error adding bill:', error);
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
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.id || decoded.userId;
    const { searchParams } = new URL(request.url);
    const billId = searchParams.get('id');
    const body = await request.json();
    const { status } = body;

    if (!billId) {
      return NextResponse.json(
        { success: false, error: 'Bill ID required' },
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